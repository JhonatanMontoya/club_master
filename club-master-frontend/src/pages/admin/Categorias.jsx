import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AdminModule from './AdminModule';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { apiGet, apiPost, apiPut, apiDelete } from '../../services/api';

const empty = { nombre: '', slug: '', icono: '', orden: 0 };

export default function Categorias() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const [c, p] = await Promise.all([apiGet('/admin/categorias'), apiGet('/admin/productos')]);
    setCategorias(c.filter((x) => x.activa));
    setProductos(p.filter((x) => x.activo));
  };

  useEffect(() => { load(); }, []);

  const filteredProducts = selected
    ? productos.filter((p) => p.categoria_id === selected)
    : productos;

  const save = async () => {
    const slug = form.slug || form.nombre.toLowerCase().replace(/\s+/g, '-');
    const data = { ...form, slug, orden: Number(form.orden) };
    if (editing) await apiPut(`/admin/categorias/${editing.id}`, data);
    else await apiPost('/admin/categorias', data);
    setModal(false);
    load();
  };

  const columns = [
    { key: 'nombre', label: 'Categoría', render: (r) => (
      <button onClick={() => setSelected(selected === r.id ? null : r.id)} className={`text-left ${selected === r.id ? 'text-gold' : 'text-white'}`}>
        {r.nombre}
      </button>
    )},
    { key: 'slug', label: 'Slug' },
    { key: 'productos_count', label: 'Productos', render: (r) => <Badge>{r.productos_count} items</Badge> },
    { key: 'orden', label: 'Orden' },
    { key: 'acciones', label: '', render: (r) => (
      <div className="flex gap-2">
        <button onClick={() => { setEditing(r); setForm(r); setModal(true); }} className="text-gold"><FiEdit2 /></button>
        <button onClick={async () => { await apiDelete(`/admin/categorias/${r.id}`); load(); }} className="text-red-400"><FiTrash2 /></button>
      </div>
    )},
  ];

  return (
    <AdminModule title="Categorías" description="Organiza productos por categoría">
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditing(null); setForm(empty); setModal(true); }}><FiPlus className="inline mr-2" />Nueva categoría</Button>
      </div>
      <DataTable columns={columns} data={categorias} />

      <div className="mt-8">
        <h3 className="text-lg font-semibold text-white mb-4">
          {selected ? `Productos en "${categorias.find((c) => c.id === selected)?.nombre}"` : 'Todos los productos por categoría'}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filteredProducts.map((p) => (
            <div key={p.id} className="glass-card rounded-xl p-3">
              {p.imagen_url && <img src={p.imagen_url} alt="" className="w-full h-24 object-cover rounded-lg mb-2" />}
              <p className="text-white text-sm font-medium truncate">{p.nombre}</p>
              <p className="text-xs text-gray-text">{p.categoria_nombre}</p>
            </div>
          ))}
        </div>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar categoría' : 'Nueva categoría'}>
        <div className="space-y-4">
          <Input label="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
          <Input label="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generado si vacío" />
          <Input label="Icono" value={form.icono} onChange={(e) => setForm({ ...form, icono: e.target.value })} />
          <Input label="Orden" type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: e.target.value })} />
          <Button onClick={save} className="w-full">Guardar</Button>
        </div>
      </Modal>
    </AdminModule>
  );
}
