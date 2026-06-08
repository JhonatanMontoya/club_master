import { query } from '../config/db.js';

export async function fetchDetallePedido(pedidoId) {
  const rows = await query(
    `SELECT dp.producto_id, dp.cantidad, dp.precio_unitario, dp.subtotal,
            pr.nombre AS producto_nombre, pr.imagen_url
     FROM detalle_pedido dp
     JOIN productos pr ON pr.id = dp.producto_id
     WHERE dp.pedido_id = ?`,
    [pedidoId]
  );
  return rows.map((r) => ({
    producto_id: r.producto_id,
    nombre: r.producto_nombre,
    cantidad: r.cantidad,
    precio_unitario: Number(r.precio_unitario),
    subtotal: Number(r.subtotal),
    imagen_url: r.imagen_url,
  }));
}

export async function recalcPedidoTotales(pedidoId) {
  const [tot] = await query(
    'SELECT COALESCE(SUM(subtotal), 0) AS total FROM detalle_pedido WHERE pedido_id = ?',
    [pedidoId]
  );
  const total = Number(tot.total);
  await query('UPDATE pedidos SET subtotal = ?, total = ? WHERE id = ?', [total, total, pedidoId]);
  return total;
}

export async function getEstadoId(nombre) {
  const rows = await query('SELECT id FROM estados_pedido WHERE nombre = ?', [nombre]);
  return rows[0]?.id;
}

export async function loadPedidoCompleto(pedidoId) {
  const pedidos = await query(
    `SELECT p.*, e.nombre AS estado, e.color AS estado_color, m.numero AS mesa_numero
     FROM pedidos p
     JOIN estados_pedido e ON e.id = p.estado_id
     JOIN mesas m ON m.id = p.mesa_id
     WHERE p.id = ?`,
    [pedidoId]
  );
  if (!pedidos.length) return null;
  const pedido = pedidos[0];
  pedido.detalle = await fetchDetallePedido(pedidoId);
  pedido.total = Number(pedido.total);
  pedido.subtotal = Number(pedido.subtotal);
  return pedido;
}

export async function confirmarSesionMesaPorPedido(mesaId, staffNombre) {
  const sesiones = await query(
    `SELECT id, estado FROM mesa_sesiones
     WHERE mesa_id = ? AND estado IN ('pendiente', 'activa')
     ORDER BY created_at DESC LIMIT 1`,
    [mesaId]
  );
  if (sesiones.length && sesiones[0].estado === 'pendiente') {
    await query(
      `UPDATE mesa_sesiones SET estado = 'activa', confirmado_por = ?, confirmado_at = NOW()
       WHERE id = ?`,
      [staffNombre, sesiones[0].id]
    );
  }
  await query("UPDATE mesas SET estado = 'ocupada' WHERE id = ?", [mesaId]);
}

export function precioProducto(prod) {
  if (!prod) return 0;
  if (prod.descuento_activo && prod.precio_descuento) return Number(prod.precio_descuento);
  return Number(prod.precio);
}
