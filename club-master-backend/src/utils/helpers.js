import { query } from '../config/db.js';

export async function logAuditoria(usuarioId, accion, modulo, detalle, ip) {
  try {
    await query(
      'INSERT INTO auditoria_sistema (usuario_id, accion, modulo, detalle, ip) VALUES (?, ?, ?, ?, ?)',
      [usuarioId, accion, modulo, detalle, ip]
    );
  } catch (err) {
    console.error('Auditoría error:', err.message);
  }
}

export async function registrarHistorialPedido(pedidoId, estadoId, usuarioId, comentario) {
  await query(
    'INSERT INTO historial_pedido (pedido_id, estado_id, usuario_id, comentario) VALUES (?, ?, ?, ?)',
    [pedidoId, estadoId, usuarioId, comentario]
  );
}

export function formatCOP(value) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(value);
}
