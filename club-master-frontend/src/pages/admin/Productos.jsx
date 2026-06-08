import { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import AdminModule from './AdminModule';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { apiGet, apiPost, apiPut, apiDelete } from '../../services/api';
import { formatCOP } from '../../utils/format';

const empty = { nombre: '', descripcion: '', precio: '', precio_descuento: '', descuento_activo: false, imagen_url: '', categoria_id: '', destacado: false };

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);
  const [busqueda, setBusqueda] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('');

  const load = async () => {
    const [p, c] = await Promise.all([apiGet('/admin/productos'), apiGet('/admin/categorias')]);
    setProductos(p);
    setCategorias(c);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm({ ...empty, categoria_id: categorias[0]?.id || '' }); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...p, precio: p.precio, precio_descuento: p.precio_descuento || '', descuento_activo: !!p.descuento_activo, destacado: !!p.destacado });
    setModal(true);
  };

  const save = async () => {
    const data = {
      ...form,
      categoria_id: Number(form.categoria_id),
      precio: Number(form.precio),
      precio_descuento: form.precio_descuento ? Number(form.precio_descuento) : null,
      descuento_activo: form.descuento_activo ? 1 : 0,
      destacado: form.destacado ? 1 : 0,
    };
    if (editing) await apiPut(`/admin/productos/${editing.id}`, data);
    else await apiPost('/admin/productos', data);
    setModal(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm('¿Desactivar este producto?')) return;
    await apiDelete(`/admin/productos/${id}`);
    load();
  };

  const f = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const productosFiltrados = useMemo(() => {
    return productos
      .filter((p) => p.activo)
      .filter((p) => {
        if (categoriaFiltro && String(p.categoria_id) !== categoriaFiltro) return false;
        if (!busqueda.trim()) return true;
        const q = busqueda.toLowerCase().trim();
        return (
          p.nombre?.toLowerCase().includes(q) ||
          p.descripcion?.toLowerCase().includes(q) ||
          p.categoria_nombre?.toLowerCase().includes(q)
        );
      });
  }, [productos, busqueda, categoriaFiltro]);

  const columns = [
    { key: 'img', label: '', render: (r) => r.imagen_url ? <img src={r.imagen_url} alt="" className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 rounded-lg bg-black border border-gold/20" /> },
    { key: 'nombre', label: 'Producto', render: (r) => <div><p className="font-medium">{r.nombre}</p><p className="text-xs text-gray-text">{r.categoria_nombre}</p></div> },
    { key: 'precio', label: 'Precio', render: (r) => (
      <div>
        {r.descuento_activo && r.precio_descuento ? (
          <><span className="line-through text-gray-text text-xs">{formatCOP(r.precio)}</span><br /><span className="text-gold">{formatCOP(r.precio_descuento)}</span></>
        ) : formatCOP(r.precio)}
      </div>
    )},
    { key: 'estado', label: 'Estado', render: (r) => <Badge color={r.activo ? 'green' : 'red'}>{r.activo ? 'Activo' : 'Inactivo'}</Badge> },
    { key: 'acciones', label: '', render: (r) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(r)} className="text-gold hover:text-white"><FiEdit2 /></button>
        <button onClick={() => remove(r.id)} className="text-red-400 hover:text-red-300"><FiTrash2 /></button>
      </div>
    )},
  ];

  return (
    <AdminModule title="Productos" description="Gestión del menú, precios e imágenes">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-text" />
          <input
            type="text"
            placeholder="Buscar por nombre o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-black-secondary border border-gold/20 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-text/50 focus:outline-none focus:border-gold"
          />
        </div>
        <select
          value={categoriaFiltro}
          onChange={(e) => setCategoriaFiltro(e.target.value)}
          className="bg-black-secondary border border-gold/20 rounded-xl px-4 py-3 text-white min-w-[180px]"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
        <Button onClick={openNew} className="shrink-0"><FiPlus className="inline mr-2" />Nuevo producto</Button>
      </div>

      <p className="text-gray-text text-sm mb-4">
        {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} encontrado{productosFiltrados.length !== 1 ? 's' : ''}
        {(busqueda || categoriaFiltro) && (
          <button
            type="button"
            onClick={() => { setBusqueda(''); setCategoriaFiltro(''); }}
            className="ml-3 text-gold hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </p>

      <DataTable
        columns={columns}
        data={productosFiltrados}
        emptyMessage={busqueda || categoriaFiltro ? 'No hay productos que coincidan con los filtros' : 'Sin productos'}
      />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar producto' : 'Nuevo producto'} wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nombre" value={form.nombre} onChange={(e) => f('nombre', e.target.value)} className="sm:col-span-2" />
          <div className="sm:col-span-2">
            <label className="block text-gray-text text-sm mb-2">Descripción</label>
            <textarea className="w-full bg-black border border-gold/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-gold" rows={3} value={form.descripcion} onChange={(e) => f('descripcion', e.target.value)} />
          </div>
          <div>
            <label className="block text-gray-text text-sm mb-2">Categoría</label>
            <select className="w-full bg-black-secondary border border-gold/20 rounded-xl px-4 py-3 text-white" value={form.categoria_id} onChange={(e) => f('categoria_id', e.target.value)}>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <Input label="Precio" type="number" value={form.precio} onChange={(e) => f('precio', e.target.value)} />
          <Input label="Precio con descuento" type="number" value={form.precio_descuento} onChange={(e) => f('precio_descuento', e.target.value)} />
          <Input label="URL de imagen" value={form.imagen_url} onChange={(e) => f('imagen_url', e.target.value)} className="sm:col-span-2" />
          {form.imagen_url && <img src={form.imagen_url} alt="preview" className="sm:col-span-2 h-32 object-cover rounded-xl" />}
          <label className="flex items-center gap-2 text-sm text-gray-text"><input type="checkbox" checked={form.descuento_activo} onChange={(e) => f('descuento_activo', e.target.checked)} /> Activar descuento</label>
          <label className="flex items-center gap-2 text-sm text-gray-text"><input type="checkbox" checked={form.destacado} onChange={(e) => f('destacado', e.target.checked)} /> Destacado</label>
        </div>
        <div className="flex gap-3 mt-6">
          <Button onClick={save} className="flex-1">{editing ? 'Guardar' : 'Crear'}</Button>
          <Button variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
        </div>
      </Modal>
    </AdminModule>
  );
}
