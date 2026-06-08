import { useEffect, useState } from 'react';
import AdminModule from './AdminModule';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { apiGet, apiPost } from '../../services/api';

export default function Inventario() {
  const [inventario, setInventario] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [modal, setModal] = useState(false);
  const [item, setItem] = useState(null);
  const [mov, setMov] = useState({ tipo: 'entrada', cantidad: '', motivo: '' });

  const load = async () => {
    const [inv, movs] = await Promise.all([
      apiGet('/admin/inventario'),
      apiGet('/admin/inventario/movimientos'),
    ]);
    setInventario(inv);
    setMovimientos(movs);
  };

  useEffect(() => { load(); }, []);

  const openMov = (i) => { setItem(i); setMov({ tipo: 'entrada', cantidad: '', motivo: '' }); setModal(true); };

  const registrar = async () => {
    await apiPost('/admin/inventario/movimiento', {
      inventario_id: item.id, tipo: mov.tipo, cantidad: Number(mov.cantidad), motivo: mov.motivo,
    });
    setModal(false);
    load();
  };

  const bajoStock = inventario.filter((i) => i.stock_actual <= i.stock_minimo).length;

  const columns = [
    { key: 'producto', label: 'Producto', render: (r) => r.producto_nombre },
    { key: 'stock', label: 'Stock', render: (r) => (
      <span className={r.stock_actual <= r.stock_minimo ? 'text-red-400 font-bold' : 'text-white'}>{r.stock_actual} {r.unidad}</span>
    )},
    { key: 'minimo', label: 'Mínimo', render: (r) => r.stock_minimo },
    { key: 'estado', label: 'Estado', render: (r) => (
      <Badge color={r.stock_actual <= r.stock_minimo ? 'red' : 'green'}>
        {r.stock_actual <= r.stock_minimo ? 'Bajo stock' : 'OK'}
      </Badge>
    )},
    { key: 'acciones', label: '', render: (r) => (
      <Button variant="outline" className="!py-1 !px-3 text-xs" onClick={() => openMov(r)}>Movimiento</Button>
    )},
  ];

  return (
    <AdminModule title="Inventario" description="Control de stock y movimientos">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-gold">{inventario.length}</p>
          <p className="text-xs text-gray-text">Productos en inventario</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{bajoStock}</p>
          <p className="text-xs text-gray-text">Bajo stock mínimo</p>
        </div>
        <div className="glass-card rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{inventario.reduce((s, i) => s + i.stock_actual, 0)}</p>
          <p className="text-xs text-gray-text">Unidades totales</p>
        </div>
      </div>

      <DataTable columns={columns} data={inventario} />

      <h3 className="text-lg font-semibold text-white mt-8 mb-4">Últimos movimientos</h3>
      <DataTable
        columns={[
          { key: 'tipo', label: 'Tipo', render: (r) => <Badge color={r.tipo === 'entrada' ? 'green' : r.tipo === 'salida' ? 'red' : 'gold'}>{r.tipo}</Badge> },
          { key: 'cantidad', label: 'Cantidad' },
          { key: 'motivo', label: 'Motivo' },
          { key: 'fecha', label: 'Fecha', render: (r) => new Date(r.created_at).toLocaleString('es-CO') },
        ]}
        data={movimientos}
        emptyMessage="Sin movimientos registrados"
      />

      <Modal open={modal} onClose={() => setModal(false)} title={`Movimiento — ${item?.producto_nombre}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-text text-sm mb-2">Tipo</label>
            <select className="w-full bg-black-secondary border border-gold/20 rounded-xl px-4 py-3 text-white" value={mov.tipo} onChange={(e) => setMov({ ...mov, tipo: e.target.value })}>
              <option value="entrada">Entrada (compra/recepción)</option>
              <option value="salida">Salida (venta/merma)</option>
              <option value="ajuste">Ajuste (inventario físico)</option>
            </select>
          </div>
          <Input label="Cantidad" type="number" value={mov.cantidad} onChange={(e) => setMov({ ...mov, cantidad: e.target.value })} />
          <Input label="Motivo" value={mov.motivo} onChange={(e) => setMov({ ...mov, motivo: e.target.value })} />
          <p className="text-sm text-gray-text">Stock actual: <span className="text-white">{item?.stock_actual}</span></p>
          <Button onClick={registrar} className="w-full">Registrar movimiento</Button>
        </div>
      </Modal>
    </AdminModule>
  );
}
