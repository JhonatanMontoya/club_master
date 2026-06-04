import { query } from '../config/db.js';
import { registrarHistorialPedido, logAuditoria } from '../utils/helpers.js';

export async function createPedido(req, res) {
  try {
    const { mesa_id, items, notas, nombre_cliente } = req.body;
    if (!mesa_id || !items?.length) {
      return res.status(400).json({ message: 'Mesa e items requeridos' });
    }

    const estados = await query("SELECT id FROM estados_pedido WHERE nombre = 'recibido'");
    const estadoId = estados[0]?.id || 1;

    let subtotal = 0;
    const detalles = [];

    for (const item of items) {
      const prods = await query('SELECT id, precio, nombre FROM productos WHERE id = ? AND activo = 1', [item.producto_id]);
      if (!prods.length) continue;
      const prod = prods[0];
      const qty = item.cantidad || 1;
      const lineSubtotal = prod.precio * qty;
      subtotal += lineSubtotal;
      detalles.push({ producto_id: prod.id, cantidad: qty, precio_unitario: prod.precio, subtotal: lineSubtotal, nombre: prod.nombre });
    }

    const result = await query(
      'INSERT INTO pedidos (usuario_id, mesa_id, estado_id, subtotal, total, notas, nombre_cliente) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user?.id || null, mesa_id, estadoId, subtotal, subtotal, notas || null, nombre_cliente || req.user?.nombre]
    );

    const pedidoId = result.insertId;

    for (const d of detalles) {
      await query(
        'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [pedidoId, d.producto_id, d.cantidad, d.precio_unitario, d.subtotal]
      );
    }

    await registrarHistorialPedido(pedidoId, estadoId, req.user?.id, 'Pedido creado');
    await query("UPDATE mesas SET estado = 'ocupada' WHERE id = ?", [mesa_id]);

    res.status(201).json({ id: pedidoId, total: subtotal, message: 'Pedido creado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getPedidos(req, res) {
  try {
    const { estado, mesa_id } = req.query;
    let sql = `SELECT p.*, e.nombre AS estado, e.color AS estado_color, m.numero AS mesa_numero,
               u.nombre AS cliente_nombre
               FROM pedidos p
               JOIN estados_pedido e ON e.id = p.estado_id
               JOIN mesas m ON m.id = p.mesa_id
               LEFT JOIN usuarios u ON u.id = p.usuario_id WHERE 1=1`;
    const params = [];

    if (estado) { sql += ' AND e.nombre = ?'; params.push(estado); }
    if (mesa_id) { sql += ' AND p.mesa_id = ?'; params.push(mesa_id); }

    sql += ' ORDER BY p.created_at DESC LIMIT 100';
    const pedidos = await query(sql, params);
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getPedidoById(req, res) {
  try {
    const pedidos = await query(
      `SELECT p.*, e.nombre AS estado, e.color AS estado_color, m.numero AS mesa_numero
       FROM pedidos p JOIN estados_pedido e ON e.id = p.estado_id
       JOIN mesas m ON m.id = p.mesa_id WHERE p.id = ?`,
      [req.params.id]
    );
    if (!pedidos.length) return res.status(404).json({ message: 'Pedido no encontrado' });

    const detalle = await query(
      `SELECT dp.*, pr.nombre AS producto_nombre, pr.imagen_url
       FROM detalle_pedido dp JOIN productos pr ON pr.id = dp.producto_id
       WHERE dp.pedido_id = ?`,
      [req.params.id]
    );

    const historial = await query(
      `SELECT h.*, e.nombre AS estado FROM historial_pedido h
       JOIN estados_pedido e ON e.id = h.estado_id
       WHERE h.pedido_id = ? ORDER BY h.created_at`,
      [req.params.id]
    );

    res.json({ ...pedidos[0], detalle, historial });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updatePedidoEstado(req, res) {
  try {
    const { estado } = req.body;
    const estados = await query('SELECT id FROM estados_pedido WHERE nombre = ?', [estado]);
    if (!estados.length) return res.status(400).json({ message: 'Estado inválido' });

    const estadoId = estados[0].id;
    await query('UPDATE pedidos SET estado_id = ? WHERE id = ?', [estadoId, req.params.id]);
    await registrarHistorialPedido(req.params.id, estadoId, req.user?.id, `Estado: ${estado}`);
    await logAuditoria(req.user?.id, 'UPDATE_ESTADO', 'pedidos', `Pedido ${req.params.id} -> ${estado}`, req.ip);

    res.json({ message: 'Estado actualizado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getEstadosPedido(_req, res) {
  try {
    const estados = await query('SELECT * FROM estados_pedido ORDER BY orden');
    res.json(estados);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getPedidosStaff(_req, res) {
  try {
    const pedidos = await query(
      `SELECT p.id, p.total, p.created_at, p.nombre_cliente, m.numero AS mesa_numero,
              e.nombre AS estado, e.color AS estado_color,
              (SELECT COUNT(*) FROM detalle_pedido WHERE pedido_id = p.id) AS items_count
       FROM pedidos p
       JOIN mesas m ON m.id = p.mesa_id
       JOIN estados_pedido e ON e.id = p.estado_id
       WHERE e.nombre NOT IN ('entregado')
       ORDER BY p.created_at ASC`
    );

    for (const pedido of pedidos) {
      pedido.detalle = await query(
        `SELECT dp.cantidad, pr.nombre FROM detalle_pedido dp
         JOIN productos pr ON pr.id = dp.producto_id WHERE dp.pedido_id = ?`,
        [pedido.id]
      );
    }

    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
