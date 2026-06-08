import { useEffect, useState } from 'react';
import AdminModule from './AdminModule';
import DataTable from '../../components/admin/DataTable';
import Tabs from '../../components/admin/Tabs';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { apiGet, apiPatch } from '../../services/api';
import { formatCOP, formatTime } from '../../utils/format';
import PedidosAprobacionPanel from '../../components/pedidos/PedidosAprobacionPanel';

const ESTADO_LABEL = {
  pendiente_aprobacion: 'Por aprobar',
  recibido: 'Recibido', en_preparacion: 'En preparación', listo: 'Listo',
  en_camino: 'En camino', entregado: 'Entregado', cancelado: 'Cancelado',
};

export default function Pedidos() {
  const [tab, setTab] = useState('activos');
  const [pedidos, setPedidos] = useState([]);

  const load = async () => {
    setPedidos(await apiGet(`/admin/pedidos?estado=${tab}`));
  };

  useEffect(() => { load(); }, [tab]);

  const cancelar = async (id) => {
    if (!confirm('¿Cancelar este pedido?')) return;
    await apiPatch(`/admin/pedidos/${id}/estado`, { estado: 'cancelado' });
    load();
  };

  const completar = async (id) => {
    await apiPatch(`/admin/pedidos/${id}/estado`, { estado: 'entregado' });
    load();
  };

  const columns = [
    { key: 'id', label: '#', render: (r) => <span className="text-gold">#{r.id}</span> },
    { key: 'mesa', label: 'Mesa', render: (r) => `Mesa ${r.mesa_numero}` },
    { key: 'cliente', label: 'Cliente', render: (r) => r.nombre_cliente },
    { key: 'detalle', label: 'Items', render: (r) => (
      <div className="text-xs text-gray-text">
        {r.detalle?.map((d, i) => <span key={i}>{d.cantidad}x {d.nombre}<br /></span>)}
      </div>
    )},
    { key: 'total', label: 'Total', render: (r) => formatCOP(r.total) },
    { key: 'estado', label: 'Estado', render: (r) => (
      <Badge color={r.estado === 'cancelado' ? 'red' : r.estado === 'entregado' ? 'green' : 'gold'}>
        {ESTADO_LABEL[r.estado] || r.estado}
      </Badge>
    )},
    { key: 'hora', label: 'Hora', render: (r) => formatTime(r.created_at) },
    { key: 'acciones', label: '', render: (r) => (
      <div className="flex gap-2">
        {tab === 'activos' && (
          <>
            <Button variant="outline" className="!py-1 !px-2 text-xs" onClick={() => completar(r.id)}>Entregar</Button>
            <Button variant="danger" className="!py-1 !px-2 text-xs" onClick={() => cancelar(r.id)}>Cancelar</Button>
          </>
        )}
      </div>
    )},
  ];

  return (
    <AdminModule title="Pedidos" description="Pedidos entrantes, entregados y cancelados">
      <PedidosAprobacionPanel onUpdate={load} pollMs={3000} />

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'activos', label: 'En curso' },
          { id: 'entregados', label: 'Entregados' },
          { id: 'cancelados', label: 'Cancelados' },
        ]}
      />
      <div className="mt-6">
        <DataTable columns={columns} data={pedidos} emptyMessage="No hay pedidos en esta categoría" />
      </div>
    </AdminModule>
  );
}
