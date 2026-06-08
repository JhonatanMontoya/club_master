import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AdminModule from './AdminModule';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { apiGet, apiPost, apiPut, apiDelete } from '../../services/api';

const empty = { mesa_id: '', nombre_cliente: '', telefono: '', fecha_reserva: '', personas: 2, notas: '', estado: 'pendiente' };
const ESTADO_COLOR = { pendiente: 'gold', confirmada: 'green', cancelada: 'red', completada: 'gray' };

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const [r, m] = await Promise.all([apiGet('/admin/reservas'), apiGet('/admin/mesas')]);
    setReservas(r);
    setMesas(m);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const data = { ...form, mesa_id: Number(form.mesa_id), personas: Number(form.personas) };
    if (editing) await apiPut(`/admin/reservas/${editing.id}`, data);
    else await apiPost('/admin/reservas', data);
    setModal(false);
    load();
  };

  const columns = [
    { key: 'mesa', label: 'Mesa', render: (r) => <span className="text-gold font-bold">#{r.mesa_numero}</span> },
    { key: 'cliente', label: 'Cliente', render: (r) => <div><p>{r.nombre_cliente}</p><p className="text-xs text-gray-text">{r.telefono}</p></div> },
    { key: 'fecha', label: 'Fecha/Hora', render: (r) => new Date(r.fecha_reserva).toLocaleString('es-CO') },
    { key: 'personas', label: 'Personas', render: (r) => `${r.personas} pax` },
    { key: 'estado', label: 'Estado', render: (r) => <Badge color={ESTADO_COLOR[r.estado]}>{r.estado}</Badge> },
    { key: 'notas', label: 'Notas', render: (r) => <span className="text-gray-text text-xs">{r.notas || '—'}</span> },
    { key: 'acciones', label: '', render: (r) => (
      <div className="flex gap-2">
        <button onClick={() => { setEditing(r); setForm({ ...r, fecha_reserva: r.fecha_reserva?.slice(0, 16) }); setModal(true); }} className="text-gold"><FiEdit2 /></button>
        <button onClick={async () => { await apiDelete(`/admin/reservas/${r.id}`); load(); }} className="text-red-400"><FiTrash2 /></button>
      </div>
    )},
  ];

  return (
    <AdminModule title="Reservas" description="Gestión de mesas reservadas">
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditing(null); setForm({ ...empty, mesa_id: mesas[0]?.id || '' }); setModal(true); }}><FiPlus className="inline mr-2" />Nueva reserva</Button>
      </div>
      <DataTable columns={columns} data={reservas} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar reserva' : 'Nueva reserva'} wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-gray-text text-sm mb-2">Mesa</label>
            <select className="w-full bg-black-secondary border border-gold/20 rounded-xl px-4 py-3 text-white" value={form.mesa_id} onChange={(e) => setForm({ ...form, mesa_id: e.target.value })}>
              {mesas.map((m) => <option key={m.id} value={m.id}>Mesa {m.numero} — {m.zona} ({m.estado})</option>)}
            </select>
          </div>
          <Input label="Personas" type="number" value={form.personas} onChange={(e) => setForm({ ...form, personas: e.target.value })} />
          <Input label="Nombre del cliente" value={form.nombre_cliente} onChange={(e) => setForm({ ...form, nombre_cliente: e.target.value })} />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <Input label="Fecha y hora" type="datetime-local" value={form.fecha_reserva} onChange={(e) => setForm({ ...form, fecha_reserva: e.target.value })} className="sm:col-span-2" />
          {editing && (
            <div className="sm:col-span-2">
              <label className="block text-gray-text text-sm mb-2">Estado</label>
              <select className="w-full bg-black-secondary border border-gold/20 rounded-xl px-4 py-3 text-white" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
                {['pendiente', 'confirmada', 'cancelada', 'completada'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}
          <div className="sm:col-span-2">
            <label className="block text-gray-text text-sm mb-2">Notas</label>
            <textarea className="w-full bg-black border border-gold/20 rounded-xl px-4 py-3 text-white" rows={2} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
          </div>
        </div>
        <Button onClick={save} className="w-full mt-4">Guardar reserva</Button>
      </Modal>
    </AdminModule>
  );
}
