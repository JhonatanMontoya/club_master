import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2 } from 'react-icons/fi';
import AdminModule from './AdminModule';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { apiGet, apiPost, apiPut } from '../../services/api';

const SUBROLES = [
  { id: 'mesero', label: 'Mesero', desc: 'Atiende mesas y toma pedidos' },
  { id: 'cocina', label: 'Cocina', desc: 'Prepara alimentos y bebidas' },
  { id: 'bar', label: 'Bar', desc: 'Prepara cócteles y bebidas' },
  { id: 'caja', label: 'Caja', desc: 'Gestiona pagos y cierre' },
  { id: 'supervisor', label: 'Supervisor', desc: 'Supervisa operaciones' },
];

const empty = { nombre: '', email: '', telefono: '', subrol: 'mesero', activo: 1 };

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setStaff(await apiGet('/admin/staff'));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing) await apiPut(`/admin/staff/${editing.id}`, form);
    else await apiPost('/admin/staff', form);
    setModal(false);
    load();
  };

  const subrolLabel = (id) => SUBROLES.find((s) => s.id === id)?.label || id;

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'subrol', label: 'Rol operativo', render: (r) => <Badge color="gold">{subrolLabel(r.subrol)}</Badge> },
    { key: 'estado', label: 'Estado', render: (r) => <Badge color={r.activo ? 'green' : 'red'}>{r.activo ? 'Activo' : 'Inactivo'}</Badge> },
    { key: 'acciones', label: '', render: (r) => (
      <button onClick={() => { setEditing(r); setForm(r); setModal(true); }} className="text-gold"><FiEdit2 /></button>
    )},
  ];

  return (
    <AdminModule title="Staff" description="Personal operativo y permisos por área">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {SUBROLES.map((s) => (
          <div key={s.id} className="glass-card rounded-xl p-3 text-center">
            <p className="text-gold font-semibold text-sm">{s.label}</p>
            <p className="text-2xl font-bold text-white">{staff.filter((x) => x.subrol === s.id).length}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditing(null); setForm(empty); setModal(true); }}><FiPlus className="inline mr-2" />Agregar staff</Button>
      </div>
      <DataTable columns={columns} data={staff} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar staff' : 'Nuevo miembro del staff'} wide>
        <div className="space-y-4">
          <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          <div>
            <label className="block text-gray-text text-sm mb-2">Rol / Permisos</label>
            <div className="space-y-2">
              {SUBROLES.map((s) => (
                <label key={s.id} className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${form.subrol === s.id ? 'border-gold bg-gold/10' : 'border-gold/20'}`}>
                  <input type="radio" name="subrol" value={s.id} checked={form.subrol === s.id} onChange={() => setForm({ ...form, subrol: s.id })} className="mt-1" />
                  <div><p className="text-white font-medium">{s.label}</p><p className="text-xs text-gray-text">{s.desc}</p></div>
                </label>
              ))}
            </div>
          </div>
          {editing && (
            <label className="flex items-center gap-2 text-sm text-gray-text">
              <input type="checkbox" checked={!!form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked ? 1 : 0 })} />
              Activo
            </label>
          )}
          <Button onClick={save} className="w-full">Guardar</Button>
        </div>
      </Modal>
    </AdminModule>
  );
}
