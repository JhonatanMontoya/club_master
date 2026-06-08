import { query } from '../config/db.js';

export async function getDashboard(_req, res) {
  try {
    const [ventasHoy] = await query(
      `SELECT COALESCE(SUM(total), 0) AS total FROM pedidos WHERE DATE(created_at) = CURDATE()`
    );
    const [pedidosHoy] = await query(
      `SELECT COUNT(*) AS total FROM pedidos WHERE DATE(created_at) = CURDATE()`
    );
    const [mesasOcupadas] = await query(
      `SELECT COUNT(*) AS total FROM mesas WHERE estado = 'ocupada' AND activa = 1`
    );
    const [clientes] = await query(
      `SELECT COUNT(*) AS total FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE r.nombre = 'cliente'`
    );

    const ventasMensuales = await query(
      `SELECT DATE_FORMAT(created_at, '%Y-%m') AS mes, SUM(total) AS total
       FROM pedidos WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
       GROUP BY mes ORDER BY mes`
    );

    const productosTop = await query(
      `SELECT pr.nombre, SUM(dp.cantidad) AS cantidad, SUM(dp.subtotal) AS total
       FROM detalle_pedido dp JOIN productos pr ON pr.id = dp.producto_id
       GROUP BY pr.id ORDER BY cantidad DESC LIMIT 5`
    );

    const metodosPago = await query(
      `SELECT mp.nombre, COUNT(*) AS cantidad, SUM(pg.monto) AS total
       FROM pagos pg JOIN metodos_pago mp ON mp.id = pg.metodo_pago_id
       GROUP BY mp.id`
    );

    res.json({
      stats: {
        ventasHoy: ventasHoy.total,
        pedidosHoy: pedidosHoy.total,
        mesasOcupadas: mesasOcupadas.total,
        clientes: clientes.total,
      },
      ventasMensuales,
      productosTop,
      metodosPago,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getPromociones(_req, res) {
  try {
    const promos = await query('SELECT * FROM promociones WHERE activa = 1 ORDER BY created_at DESC');
    res.json(promos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getInventario(_req, res) {
  try {
    const inventario = await query(
      `SELECT i.*, p.nombre AS producto_nombre, p.precio
       FROM inventario i JOIN productos p ON p.id = i.producto_id ORDER BY p.nombre`
    );
    res.json(inventario);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getReservas(_req, res) {
  try {
    const reservas = await query(
      `SELECT r.*, m.numero AS mesa_numero FROM reservas r
       JOIN mesas m ON m.id = r.mesa_id ORDER BY r.fecha_reserva DESC`
    );
    res.json(reservas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getUsuarios(_req, res) {
  try {
    const usuarios = await query(
      `SELECT u.id, u.nombre, u.email, u.telefono, u.activo, u.es_invitado, r.nombre AS rol
       FROM usuarios u JOIN roles r ON r.id = u.rol_id ORDER BY u.created_at DESC`
    );
    res.json(usuarios);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getReportes(req, res) {
  try {
    const periodo = req.query.periodo || 'mes';
    const intervals = { dia: 1, semana: 7, mes: 30, ano: 365 };
    const days = intervals[periodo] || 30;

    const [resumenRow] = await query(
      `SELECT COALESCE(SUM(total), 0) AS ventas, COUNT(*) AS pedidos
       FROM pedidos WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
      [days]
    );
    const [canceladosRow] = await query(
      `SELECT COUNT(*) AS cancelados FROM pedidos p
       JOIN estados_pedido e ON e.id = p.estado_id
       WHERE e.nombre = 'cancelado' AND p.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)`,
      [days]
    );
    const pedidos = Number(resumenRow.pedidos) || 0;
    const ventas = Number(resumenRow.ventas) || 0;

    const ventasPorDia = await query(
      `SELECT DATE(created_at) AS fecha, COUNT(*) AS pedidos, SUM(total) AS ventas
       FROM pedidos WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY fecha ORDER BY fecha`,
      [Math.min(days, 30)]
    );

    const topProductos = await query(
      `SELECT pr.nombre, SUM(dp.cantidad) AS cantidad, SUM(dp.subtotal) AS total
       FROM detalle_pedido dp JOIN productos pr ON pr.id = dp.producto_id
       JOIN pedidos p ON p.id = dp.pedido_id
       WHERE p.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY pr.id ORDER BY cantidad DESC LIMIT 5`,
      [days]
    );

    const porCategoria = await query(
      `SELECT c.nombre AS categoria, SUM(dp.subtotal) AS ventas
       FROM detalle_pedido dp JOIN productos pr ON pr.id = dp.producto_id
       JOIN categorias c ON c.id = pr.categoria_id
       JOIN pedidos p ON p.id = dp.pedido_id
       WHERE p.created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
       GROUP BY c.id ORDER BY ventas DESC`,
      [days]
    );

    res.json({
      periodo,
      resumen: {
        ventas,
        pedidos,
        ticket_promedio: pedidos ? Math.round(ventas / pedidos) : 0,
        cancelados: canceladosRow.cancelados,
      },
      ventasPorDia,
      topProductos,
      porCategoria,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getConfig(_req, res) {
  try {
    const rows = await query('SELECT data FROM configuracion WHERE id = 1');
    if (rows.length) {
      const data = typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data;
      return res.json(data);
    }
    res.json({
      negocio: 'CLUB MASTER',
      moneda: 'COP',
      timezone: 'America/Bogota',
      iva: 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function putConfig(req, res) {
  try {
    const rows = await query('SELECT data FROM configuracion WHERE id = 1');
    let current = rows.length
      ? (typeof rows[0].data === 'string' ? JSON.parse(rows[0].data) : rows[0].data)
      : {};
    if (req.body.colores) {
      current = { ...current, ...req.body, colores: { ...current.colores, ...req.body.colores } };
    } else {
      current = { ...current, ...req.body };
    }
    await query(
      'INSERT INTO configuracion (id, data) VALUES (1, ?) ON DUPLICATE KEY UPDATE data = VALUES(data)',
      [JSON.stringify(current)]
    );
    res.json(current);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
