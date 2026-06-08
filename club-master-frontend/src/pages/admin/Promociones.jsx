import { useEffect, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import AdminModule from './AdminModule';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { apiGet, apiPost, apiPut, apiDelete } from '../../services/api';

const empty = { titulo: '', descripcion: '', descuento_porcentaje: '', fecha_inicio: '', fecha_fin: '', imagen_url: '', producto_ids: [] };

export default function Promociones() {
  const [promos, setPromos] = useState([]);
  const [productos, setProductos] = useState([]);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const [pr, p] = await Promise.all([apiGet('/admin/promociones'), apiGet('/admin/productos')]);
    setPromos(pr.filter((x) => x.activa));
    setProductos(p.filter((x) => x.activo));
  };

  useEffect(() => { load(); }, []);

  const toggleProducto = (id) => {
    const ids = form.producto_ids.includes(id) ? form.producto_ids.filter((x) => x !== id) : [...form.producto_ids, id];
    setForm({ ...form, producto_ids: ids });
  };

  const save = async () => {
    const data = { ...form, descuento_porcentaje: Number(form.descuento_porcentaje) };
    if (editing) await apiPut(`/admin/promociones/${editing.id}`, data);
    else await apiPost('/admin/promociones', data);
    setModal(false);
    load();
  };

  const columns = [
    { key: 'titulo', label: 'Promoción', render: (r) => (
      <div className="flex items-center gap-3">
        {r.imagen_url && <img src={r.imagen_url} alt="" className="w-10 h-10 rounded-lg object-cover" />}
        <div><p className="font-medium">{r.titulo}</p><p className="text-xs text-gray-text">{r.descripcion}</p></div>
      </div>
    )},
    { key: 'descuento', label: 'Beneficio', render: (r) => (
      <Badge color="gold">{r.tipo === '2x1' ? '2x1' : `${r.descuento_porcentaje}%`}</Badge>
    )},
    { key: 'vigencia', label: 'Vigencia', render: (r) => `${r.fecha_inicio} → ${r.fecha_fin}` },
    { key: 'productos', label: 'Productos', render: (r) => `${r.producto_ids?.length || 0} items` },
    { key: 'acciones', label: '', render: (r) => (
      <div className="flex gap-2">
        <button onClick={() => { setEditing(r); setForm({ ...r, producto_ids: r.producto_ids || [] }); setModal(true); }} className="text-gold"><FiEdit2 /></button>
        <button onClick={async () => { await apiDelete(`/admin/promociones/${r.id}`); load(); }} className="text-red-400"><FiTrash2 /></button>
      </div>
    )},
  ];

  return (
    <AdminModule title="Promociones" description="Ofertas, descuentos y combos especiales">
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setEditing(null); setForm(empty); setModal(true); }}><FiPlus className="inline mr-2" />Nueva promoción</Button>
      </div>
      <DataTable columns={columns} data={promos} />

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Editar promoción' : 'Nueva promoción'} wide>
        <div className="space-y-4">
          <Input label="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          <div>
            <label className="block text-gray-text text-sm mb-2">Descripción</label>
            <textarea className="w-full bg-black border border-gold/20 rounded-xl px-4 py-3 text-white" rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input label="Descuento %" type="number" value={form.descuento_porcentaje} onChange={(e) => setForm({ ...form, descuento_porcentaje: e.target.value })} />
            <Input label="Inicio" type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} />
            <Input label="Fin" type="date" value={form.fecha_fin} onChange={(e) => setForm({ ...form, fecha_fin: e.target.value })} />
          </div>
          <Input label="Imagen URL" value={form.imagen_url} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} />
          <div>
            <p className="text-sm text-gray-text mb-2">Productos incluidos</p>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
              {productos.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm text-white cursor-pointer">
                  <input type="checkbox" checked={form.producto_ids.includes(p.id)} onChange={() => toggleProducto(p.id)} />
                  {p.nombre}
                </label>
              ))}
            </div>
          </div>
          <Button onClick={save} className="w-full">Guardar promoción</Button>
        </div>
      </Modal>
    </AdminModule>
  );
}
