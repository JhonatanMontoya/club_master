export const ORDER_STATUS = {
  pendiente_aprobacion: {
    label: 'Por aprobar',
    color: '#EAB308',
    bg: 'rgba(234, 179, 8, 0.15)',
    border: 'rgba(234, 179, 8, 0.5)',
  },
  recibido: {
    label: 'Recibido',
    color: '#3B82F6',
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.5)',
  },
  en_preparacion: {
    label: 'En preparación',
    color: '#F97316',
    bg: 'rgba(249, 115, 22, 0.15)',
    border: 'rgba(249, 115, 22, 0.5)',
  },
  listo: {
    label: 'Listo',
    color: '#22C55E',
    bg: 'rgba(34, 197, 94, 0.15)',
    border: 'rgba(34, 197, 94, 0.5)',
  },
  entregado: {
    label: 'Entregado',
    color: '#A78BFA',
    bg: 'rgba(167, 139, 250, 0.15)',
    border: 'rgba(167, 139, 250, 0.5)',
  },
  cancelado: {
    label: 'Cancelado',
    color: '#EF4444',
    bg: 'rgba(239, 68, 68, 0.15)',
    border: 'rgba(239, 68, 68, 0.5)',
  },
};

export function getOrderStatus(estado) {
  return ORDER_STATUS[estado] || ORDER_STATUS.recibido;
}

export const STAFF_FILTERS = [
  { id: 'pendiente_aprobacion', label: 'Por aprobar' },
  { id: 'activos', label: 'Activos' },
  { id: 'recibido', label: 'Recibidos' },
  { id: 'en_preparacion', label: 'En preparación' },
  { id: 'listo', label: 'Listos' },
  { id: 'entregado', label: 'Entregados' },
  { id: 'todos', label: 'Todos' },
];
