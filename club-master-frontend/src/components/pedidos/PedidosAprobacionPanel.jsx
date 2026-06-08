import { useCallback, useEffect, useState } from 'react';
import { FiAlertCircle, FiCheck, FiX } from 'react-icons/fi';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { apiGet, aprobarPedido, rechazarPedido } from '../../services/api';
import { formatCOP, formatTime } from '../../utils/format';

export default function PedidosAprobacionPanel({ onUpdate, pollMs = 4000 }) {
  const [pendientes, setPendientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiGet('/pedidos/pendientes-aprobacion');
      setPendientes(data);
      onUpdate?.(data);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  useEffect(() => {
    load();
    const i = setInterval(load, pollMs);
    return () => clearInterval(i);
  }, [load, pollMs]);

  const aprobar = async (id) => {
    await aprobarPedido(id);
    load();
  };

  const rechazar = async (id) => {
    if (!window.confirm('¿Rechazar este pedido del cliente?')) return;
    await rechazarPedido(id);
    load();
  };

  if (loading) {
    return (
      <Card className="mb-6 !p-4 border border-amber-500/30">
        <p className="text-gray-text text-sm">Buscando pedidos por aprobar…</p>
      </Card>
    );
  }

  if (!pendientes.length) return null;

  return (
    <Card className="mb-6 !p-4 border-2 border-amber-500/50 shadow-[0_0_24px_rgba(234,179,8,0.15)]">
      <div className="flex items-center gap-2 mb-4">
        <FiAlertCircle className="text-amber-400 text-xl" />
        <h3 className="font-semibold text-white">Pedidos por aprobar</h3>
        <Badge color="gold">{pendientes.length}</Badge>
      </div>
      <p className="text-gray-text text-sm mb-4">
        Un cliente solicitó un pedido. Confirma que la mesa es correcta antes de enviarlo a cocina/bar.
      </p>
      <div className="space-y-3">
        {pendientes.map((p) => (
          <div
            key={p.id}
            className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-black/60 rounded-xl p-4 border border-amber-500/20"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-gold font-bold">#{p.id}</span>
                <span className="text-white font-medium">{p.nombre_cliente}</span>
                <Badge color="gold">Mesa {p.mesa_numero}</Badge>
                <span className="text-gray-text text-xs">{formatTime(p.created_at)}</span>
              </div>
              <p className="text-gray-text text-sm line-clamp-2">
                {p.detalle?.map((d) => `${d.cantidad}x ${d.nombre}`).join(' · ')}
              </p>
              <p className="text-gold font-bold mt-2">{formatCOP(p.total)}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button className="!py-2 !px-4 text-sm" onClick={() => aprobar(p.id)}>
                <FiCheck className="inline mr-1" /> Aprobar pedido
              </Button>
              <Button
                variant="outline"
                className="!py-2 !px-4 text-sm !border-red-500/40 !text-red-400"
                onClick={() => rechazar(p.id)}
              >
                <FiX className="inline mr-1" /> Rechazar
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
