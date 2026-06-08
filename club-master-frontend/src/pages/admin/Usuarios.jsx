import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2 } from 'react-icons/fi';
import AdminModule from './AdminModule';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { apiGet, apiPost, apiPut } from '../../services/api';

const empty = { nombre: '', email: '', telefono: '', rol: 'cliente', activo: 1 };

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const data = await apiGet('/admin/usuarios');
    setUsuarios(data.filter((u) => u.rol === 'cliente'));
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (editing) await apiPut(`/admin/usuarios/${editing.id}`, form);
    else await apiPost('/admin/usuarios', form);
    setModal(false);
    load();
  };

  const columns = [
    { key: 'nombre', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'telefono', label: 'Teléfono' },
    { key: 'estado', label: 'Estado', render: (r) => <Badge color={r.activo ? 'green' : 'red'}>{r.activo ? 'Activo' : 'Inactivo'}</Badge> },
    { key: 'acciones', label: '', render: (r) => (
      <button onClick={() => { setEditing(r); setForm(r); setModal(true); }} className="text-gold"><FiEdit2 /></button>
    )},
  ];

  return (
    <AdminModule title="Usuarios" description="Clientes registrados en la plataforma">
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditing(null); setForm(empty); setModal(true); }}><FiPlus className="inline mr-2" />Nuevo usuario</Button>
      </div>
      <DataTable columns={columns} data={usuarios} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar usuario' : 'Nuevo usuario'}>
        <div className="space-y-4">
          <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Input label="Teléfono" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
          {editing && (
            <label className="flex items-center gap-2 text-sm text-gray-text">
              <input type="checkbox" checked={!!form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked ? 1 : 0 })} />
              Usuario activo
            </label>
          )}
          <Button onClick={save} className="w-full">Guardar</Button>
        </div>
      </Modal>
    </AdminModule>
  );
}
