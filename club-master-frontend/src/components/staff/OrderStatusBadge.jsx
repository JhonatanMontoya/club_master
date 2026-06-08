import { getOrderStatus } from '../../utils/orderStatus';

export default function OrderStatusBadge({ estado }) {
  const s = getOrderStatus(estado);
  return (
    <span
      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
    >
      {s.label}
    </span>
  );
}
