import { useEffect, useState } from 'react';
import { FiSmartphone, FiCreditCard, FiDollarSign, FiClock } from 'react-icons/fi';
import AdminModule from './AdminModule';
import DataTable from '../../components/admin/DataTable';
import Tabs from '../../components/admin/Tabs';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { apiGet, apiPatch } from '../../services/api';
import { formatCOP } from '../../utils/format';

const METODO_ICON = { qr: FiSmartphone, tarjeta: FiCreditCard, efectivo: FiDollarSign };
const METODO_COLOR = { qr: 'blue', tarjeta: 'gold', efectivo: 'green' };

export default function Pagos() {
  const [tab, setTab] = useState('todos');
  const [pagos, setPagos] = useState([]);
  const [resumen, setResumen] = useState(null);

  const load = async () => {
    const data = await apiGet('/admin/pagos?resumen=1');
    setPagos(data.pagos);
    setResumen(data.resumen);
  };

  useEffect(() => { load(); }, []);

  const filtered = pagos.filter((p) => {
    if (tab === 'todos') return true;
    if (tab === 'pendiente') return p.estado === 'pendiente';
    return p.metodo_codigo === tab;
  });

  const confirmar = async (id) => {
    await apiPatch(`/admin/pagos/${id}`, { estado: 'completado' });
    load();
  };

  const columns = [
    { key: 'id', label: '#', render: (r) => <span className="text-gold">#{r.id}</span> },
    { key: 'pedido', label: 'Pedido', render: (r) => `Pedido #${r.pedido_id}` },
    { key: 'mesa', label: 'Mesa', render: (r) => `Mesa ${r.mesa_numero}` },
    { key: 'cliente', label: 'Cliente', render: (r) => r.nombre_cliente },
    { key: 'metodo', label: 'Método', render: (r) => {
      const Icon = METODO_ICON[r.metodo_codigo];
      return (
        <div className="flex items-center gap-2">
          {Icon && <Icon className="text-gold" />}
          <Badge color={METODO_COLOR[r.metodo_codigo] || 'gold'}>{r.metodo}</Badge>
        </div>
      );
    }},
    { key: 'referencia', label: 'Referencia', render: (r) => (
      <span className="text-gray-text text-xs">{r.referencia || '—'}</span>
    )},
    { key: 'monto', label: 'Monto', render: (r) => <span className="text-gold font-semibold">{formatCOP(r.monto)}</span> },
    { key: 'estado', label: 'Estado', render: (r) => (
      <Badge color={r.estado === 'completado' ? 'green' : r.estado === 'pendiente' ? 'gold' : 'red'}>
        {r.estado === 'completado' ? 'Pagado' : r.estado === 'pendiente' ? 'Pendiente' : r.estado}
      </Badge>
    )},
    { key: 'fecha', label: 'Fecha', render: (r) => new Date(r.created_at).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' }) },
    { key: 'acciones', label: '', render: (r) => (
      r.estado === 'pendiente' ? (
        <Button variant="outline" className="!py-1 !px-3 text-xs" onClick={() => confirmar(r.id)}>Confirmar</Button>
      ) : null
    )},
  ];

  const metodoCards = [
    { id: 'qr', label: 'Pagos QR', icon: FiSmartphone, data: resumen?.qr, color: 'text-blue-400' },
    { id: 'tarjeta', label: 'Pagos Tarjeta', icon: FiCreditCard, data: resumen?.tarjeta, color: 'text-gold' },
    { id: 'efectivo', label: 'Pagos Efectivo', icon: FiDollarSign, data: resumen?.efectivo, color: 'text-green-400' },
  ];

  return (
    <AdminModule title="Pagos" description="QR, tarjeta, efectivo y pagos pendientes">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {metodoCards.map(({ id, label, icon: Icon, data, color }) => (
          <Card key={id} className={`cursor-pointer transition-all ${tab === id ? 'ring-2 ring-gold' : ''}`} onClick={() => setTab(id)}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-text text-sm">{label}</p>
                <p className={`text-xl font-bold mt-1 ${color}`}>{formatCOP(data?.total || 0)}</p>
                <p className="text-xs text-gray-text mt-1">{data?.count || 0} pagados · {data?.pendientes || 0} pendientes</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                <Icon className={color} />
              </div>
            </div>
          </Card>
        ))}
        <Card className={`cursor-pointer transition-all ${tab === 'pendiente' ? 'ring-2 ring-gold' : ''}`} onClick={() => setTab('pendiente')}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-text text-sm">Pendientes de pago</p>
              <p className="text-xl font-bold text-gold mt-1">{formatCOP(resumen?.pendiente_total || 0)}</p>
              <p className="text-xs text-gray-text mt-1">{resumen?.pendientes_count || 0} transacciones por cobrar</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
              <FiClock className="text-gold" />
            </div>
          </div>
        </Card>
      </div>

      <Tabs
        active={tab}
        onChange={setTab}
        tabs={[
          { id: 'todos', label: 'Todos', count: pagos.length },
          { id: 'qr', label: 'QR', count: pagos.filter((p) => p.metodo_codigo === 'qr').length },
          { id: 'tarjeta', label: 'Tarjeta', count: pagos.filter((p) => p.metodo_codigo === 'tarjeta').length },
          { id: 'efectivo', label: 'Efectivo', count: pagos.filter((p) => p.metodo_codigo === 'efectivo').length },
          { id: 'pendiente', label: 'Pendientes', count: pagos.filter((p) => p.estado === 'pendiente').length },
        ]}
      />

      <div className="mt-6">
        <DataTable
          columns={columns}
          data={filtered}
          emptyMessage={tab === 'pendiente' ? 'No hay pagos pendientes' : 'No hay pagos en esta categoría'}
        />
      </div>
    </AdminModule>
  );
}
