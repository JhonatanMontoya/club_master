import { query } from '../config/db.js';
import { registrarHistorialPedido, logAuditoria } from '../utils/helpers.js';
import {
  fetchDetallePedido, recalcPedidoTotales, getEstadoId,
  loadPedidoCompleto, confirmarSesionMesaPorPedido, precioProducto,
} from '../utils/pedidos.js';

export async function createPedido(req, res) {
  try {
    const { mesa_id, items, notas, nombre_cliente } = req.body;
    if (!mesa_id || !items?.length) {
      return res.status(400).json({ message: 'Mesa e items requeridos' });
    }

    const esCliente = req.user?.rol === 'cliente';

    if (esCliente) {
      const sesiones = await query(
        `SELECT id FROM mesa_sesiones
         WHERE usuario_id = ? AND mesa_id = ? AND estado IN ('pendiente', 'activa')`,
        [req.user.id, mesa_id]
      );
      if (!sesiones.length) {
        return res.status(403).json({ message: 'Debes registrar tu mesa antes de pedir.' });
      }
    }

    const estadoNombre = esCliente ? 'pendiente_aprobacion' : 'recibido';
    const estadoId = await getEstadoId(estadoNombre);
    if (!estadoId) return res.status(500).json({ message: 'Estado de pedido no configurado' });

    let subtotal = 0;
    const detalles = [];

    for (const item of items) {
      const prods = await query(
        'SELECT id, precio, precio_descuento, descuento_activo, nombre FROM productos WHERE id = ? AND activo = 1',
        [item.producto_id]
      );
      if (!prods.length) continue;
      const prod = prods[0];
      const qty = item.cantidad || 1;
      const precio = precioProducto(prod);
      const lineSubtotal = precio * qty;
      subtotal += lineSubtotal;
      detalles.push({ producto_id: prod.id, cantidad: qty, precio_unitario: precio, subtotal: lineSubtotal, nombre: prod.nombre });
    }

    if (!detalles.length) {
      return res.status(400).json({ message: 'No hay productos válidos en el pedido' });
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

    if (!esCliente) {
      await query("UPDATE mesas SET estado = 'ocupada' WHERE id = ?", [mesa_id]);
    }

    const pedido = await loadPedidoCompleto(pedidoId);
    res.status(201).json(pedido);
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
    const pedido = await loadPedidoCompleto(req.params.id);
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });

    const historial = await query(
      `SELECT h.*, e.nombre AS estado FROM historial_pedido h
       JOIN estados_pedido e ON e.id = h.estado_id
       WHERE h.pedido_id = ? ORDER BY h.created_at`,
      [req.params.id]
    );

    res.json({ ...pedido, historial });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updatePedidoEstado(req, res) {
  try {
    const { estado } = req.body;
    const estadoId = await getEstadoId(estado);
    if (!estadoId) return res.status(400).json({ message: 'Estado inválido' });

    const pedidos = await query('SELECT mesa_id FROM pedidos WHERE id = ?', [req.params.id]);
    if (!pedidos.length) return res.status(404).json({ message: 'Pedido no encontrado' });

    await query('UPDATE pedidos SET estado_id = ? WHERE id = ?', [estadoId, req.params.id]);
    await registrarHistorialPedido(req.params.id, estadoId, req.user?.id, `Estado: ${estado}`);
    await logAuditoria(req.user?.id, 'UPDATE_ESTADO', 'pedidos', `Pedido ${req.params.id} -> ${estado}`, req.ip);

    if (estado === 'entregado' || estado === 'cancelado') {
      const mesaId = pedidos[0].mesa_id;
      const activos = await query(
        `SELECT p.id FROM pedidos p
         JOIN estados_pedido e ON e.id = p.estado_id
         WHERE p.mesa_id = ? AND e.nombre NOT IN ('entregado', 'cancelado') AND p.id != ?`,
        [mesaId, req.params.id]
      );
      if (!activos.length) {
        const sesiones = await query(
          `SELECT id FROM mesa_sesiones WHERE mesa_id = ? AND estado IN ('pendiente', 'activa')`,
          [mesaId]
        );
        if (!sesiones.length) {
          await query("UPDATE mesas SET estado = 'disponible' WHERE id = ?", [mesaId]);
        }
      }
    }

    const pedido = await loadPedidoCompleto(req.params.id);
    res.json(pedido);
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

export async function getPedidosStaff(req, res) {
  try {
    const filtro = req.query.filtro || 'activos';
    let sql = `SELECT p.id, p.total, p.created_at, p.nombre_cliente, p.notas, p.mesa_id,
                      m.numero AS mesa_numero, e.nombre AS estado, e.color AS estado_color
               FROM pedidos p
               JOIN mesas m ON m.id = p.mesa_id
               JOIN estados_pedido e ON e.id = p.estado_id WHERE 1=1`;
    const params = [];

    if (filtro === 'activos') {
      sql += " AND e.nombre NOT IN ('entregado', 'cancelado')";
    } else if (filtro === 'pendiente_aprobacion') {
      sql += " AND e.nombre = 'pendiente_aprobacion'";
    } else if (filtro !== 'todos') {
      sql += ' AND e.nombre = ?';
      params.push(filtro);
    }

    sql += ' ORDER BY p.created_at DESC LIMIT 100';
    const pedidos = await query(sql, params);

    for (const pedido of pedidos) {
      pedido.detalle = await fetchDetallePedido(pedido.id);
      pedido.total = Number(pedido.total);
    }

    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getPedidosPendientesAprobacion(_req, res) {
  try {
    const pedidos = await query(
      `SELECT p.id, p.total, p.created_at, p.nombre_cliente, p.notas, p.mesa_id,
              m.numero AS mesa_numero, e.nombre AS estado, e.color AS estado_color
       FROM pedidos p
       JOIN mesas m ON m.id = p.mesa_id
       JOIN estados_pedido e ON e.id = p.estado_id
       WHERE e.nombre = 'pendiente_aprobacion'
       ORDER BY p.created_at ASC`
    );

    for (const pedido of pedidos) {
      pedido.detalle = await fetchDetallePedido(pedido.id);
      pedido.total = Number(pedido.total);
    }

    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function aprobarPedido(req, res) {
  try {
    const pedido = await loadPedidoCompleto(req.params.id);
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
    if (pedido.estado !== 'pendiente_aprobacion') {
      return res.status(400).json({ message: 'El pedido ya fue procesado' });
    }

    const estadoId = await getEstadoId('recibido');
    await query('UPDATE pedidos SET estado_id = ? WHERE id = ?', [estadoId, req.params.id]);
    await registrarHistorialPedido(req.params.id, estadoId, req.user?.id, `Aprobado por ${req.user.nombre}`);
    await confirmarSesionMesaPorPedido(pedido.mesa_id, req.user.nombre);

    const actualizado = await loadPedidoCompleto(req.params.id);
    actualizado.aprobado_por = req.user.nombre;
    actualizado.aprobado_at = new Date().toISOString();
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function rechazarPedido(req, res) {
  try {
    const pedido = await loadPedidoCompleto(req.params.id);
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
    if (pedido.estado !== 'pendiente_aprobacion') {
      return res.status(400).json({ message: 'El pedido ya fue procesado' });
    }

    const estadoId = await getEstadoId('cancelado');
    await query('UPDATE pedidos SET estado_id = ? WHERE id = ?', [estadoId, req.params.id]);
    await registrarHistorialPedido(req.params.id, estadoId, req.user?.id, `Rechazado por ${req.user.nombre}`);

    const actualizado = await loadPedidoCompleto(req.params.id);
    actualizado.rechazado_por = req.user.nombre;
    actualizado.rechazado_at = new Date().toISOString();
    res.json(actualizado);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function addPedidoItem(req, res) {
  try {
    const { producto_id, cantidad = 1 } = req.body;
    const prods = await query(
      'SELECT id, nombre, precio, precio_descuento, descuento_activo FROM productos WHERE id = ? AND activo = 1',
      [producto_id]
    );
    if (!prods.length) return res.status(404).json({ message: 'Producto no encontrado' });

    const prod = prods[0];
    const precio = precioProducto(prod);
    const existing = await query(
      'SELECT id, cantidad FROM detalle_pedido WHERE pedido_id = ? AND producto_id = ?',
      [req.params.id, producto_id]
    );

    if (existing.length) {
      const newQty = existing[0].cantidad + cantidad;
      await query(
        'UPDATE detalle_pedido SET cantidad = ?, precio_unitario = ?, subtotal = ? WHERE id = ?',
        [newQty, precio, precio * newQty, existing[0].id]
      );
    } else {
      await query(
        'INSERT INTO detalle_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal) VALUES (?, ?, ?, ?, ?)',
        [req.params.id, producto_id, cantidad, precio, precio * cantidad]
      );
    }

    await recalcPedidoTotales(req.params.id);
    const pedido = await loadPedidoCompleto(req.params.id);
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updatePedidoItem(req, res) {
  try {
    const productoId = req.params.productoId;
    const { cantidad } = req.body;

    if (cantidad <= 0) {
      await query('DELETE FROM detalle_pedido WHERE pedido_id = ? AND producto_id = ?', [req.params.id, productoId]);
    } else {
      const prods = await query(
        'SELECT precio, precio_descuento, descuento_activo FROM productos WHERE id = ?',
        [productoId]
      );
      const precio = precioProducto(prods[0]);
      const updated = await query(
        'UPDATE detalle_pedido SET cantidad = ?, precio_unitario = ?, subtotal = ? WHERE pedido_id = ? AND producto_id = ?',
        [cantidad, precio, precio * cantidad, req.params.id, productoId]
      );
      if (!updated.affectedRows) {
        return res.status(404).json({ message: 'Item no encontrado' });
      }
    }

    await recalcPedidoTotales(req.params.id);
    const pedido = await loadPedidoCompleto(req.params.id);
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function removePedidoItem(req, res) {
  try {
    await query('DELETE FROM detalle_pedido WHERE pedido_id = ? AND producto_id = ?', [req.params.id, req.params.productoId]);
    await recalcPedidoTotales(req.params.id);
    const pedido = await loadPedidoCompleto(req.params.id);
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
