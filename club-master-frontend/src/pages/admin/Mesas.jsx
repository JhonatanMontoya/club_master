import { useEffect, useMemo, useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiGrid, FiList, FiCopy } from 'react-icons/fi';
import { LuQrCode } from 'react-icons/lu';
import AdminModule from './AdminModule';
import DataTable from '../../components/admin/DataTable';
import Modal from '../../components/admin/Modal';
import Tabs from '../../components/admin/Tabs';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import { apiGet, apiPost, apiPut, apiPatch, apiDelete } from '../../services/api';
import MesaSesionesPanel from '../../components/mesas/MesaSesionesPanel';

const ESTADOS = [
  { id: 'disponible', label: 'Disponible', color: 'green' },
  { id: 'ocupada', label: 'Ocupada', color: 'gold' },
  { id: 'reservada', label: 'Reservada', color: 'blue' },
  { id: 'mantenimiento', label: 'Mantenimiento', color: 'red' },
];

const ZONAS = ['VIP', 'General', 'Terraza', 'Barra'];

const empty = { numero: '', codigo_qr: '', capacidad: 4, zona: 'General', estado: 'disponible' };

const estadoColor = (estado) => ESTADOS.find((e) => e.id === estado)?.color || 'gray';
const estadoLabel = (estado) => ESTADOS.find((e) => e.id === estado)?.label || estado;

const qrUrl = (codigo) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(codigo)}`;

export default function Mesas() {
  const [mesas, setMesas] = useState([]);
  const [vista, setVista] = useState('grid');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroZona, setFiltroZona] = useState('');
  const [modal, setModal] = useState(false);
  const [qrModal, setQrModal] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setMesas(await apiGet('/admin/mesas'));
  };

  useEffect(() => { load(); }, []);

  const filtradas = useMemo(() => mesas.filter((m) => {
    if (filtroEstado !== 'todos' && m.estado !== filtroEstado) return false;
    if (filtroZona && m.zona !== filtroZona) return false;
    return true;
  }), [mesas, filtroEstado, filtroZona]);

  const stats = useMemo(() => ({
    total: mesas.length,
    disponible: mesas.filter((m) => m.estado === 'disponible').length,
    ocupada: mesas.filter((m) => m.estado === 'ocupada').length,
    reservada: mesas.filter((m) => m.estado === 'reservada').length,
    mantenimiento: mesas.filter((m) => m.estado === 'mantenimiento').length,
  }), [mesas]);

  const openNew = () => {
    const nextNum = mesas.length ? Math.max(...mesas.map((m) => m.numero)) + 1 : 1;
    setEditing(null);
    setForm({ ...empty, numero: nextNum, codigo_qr: `MESA-${String(nextNum).padStart(3, '0')}` });
    setModal(true);
  };

  const openEdit = (m) => {
    setEditing(m);
    setForm({ numero: m.numero, codigo_qr: m.codigo_qr, capacidad: m.capacidad, zona: m.zona, estado: m.estado });
    setModal(true);
  };

  const save = async () => {
    const data = { ...form, numero: Number(form.numero), capacidad: Number(form.capacidad) };
    if (!data.codigo_qr) data.codigo_qr = `MESA-${String(data.numero).padStart(3, '0')}`;
    if (editing) await apiPut(`/admin/mesas/${editing.id}`, data);
    else await apiPost('/admin/mesas', data);
    setModal(false);
    load();
  };

  const remove = async (id) => {
    if (!confirm('¿Desactivar esta mesa?')) return;
    await apiDelete(`/admin/mesas/${id}`);
    load();
  };

  const cambiarEstado = async (id, estado) => {
    await apiPatch(`/admin/mesas/${id}/estado`, { estado });
    load();
  };

  const copiarCodigo = (codigo) => {
    navigator.clipboard.writeText(codigo);
  };

  const columns = [
    { key: 'numero', label: 'Mesa', render: (r) => <span className="text-gold font-bold text-lg">#{r.numero}</span> },
    { key: 'zona', label: 'Zona', render: (r) => <Badge>{r.zona}</Badge> },
    { key: 'capacidad', label: 'Capacidad', render: (r) => `${r.capacidad} personas` },
    { key: 'codigo_qr', label: 'Código QR', render: (r) => (
      <button onClick={() => setQrModal(r)} className="flex items-center gap-2 text-gray-text hover:text-gold text-xs">
        <LuQrCode /> {r.codigo_qr}
      </button>
    )},
    { key: 'estado', label: 'Estado', render: (r) => <Badge color={estadoColor(r.estado)}>{estadoLabel(r.estado)}</Badge> },
    { key: 'acciones', label: '', render: (r) => (
      <div className="flex gap-2">
        <button onClick={() => openEdit(r)} className="text-gold"><FiEdit2 /></button>
        <button onClick={() => setQrModal(r)} className="text-gray-text hover:text-white"><LuQrCode /></button>
        <button onClick={() => remove(r.id)} className="text-red-400"><FiTrash2 /></button>
      </div>
    )},
  ];

  return (
    <AdminModule title="Mesas" description="Configuración de mesas, zonas y códigos QR">
      <MesaSesionesPanel onUpdate={load} />

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: stats.total, color: 'text-white' },
          { label: 'Disponibles', value: stats.disponible, color: 'text-green-400' },
          { label: 'Ocupadas', value: stats.ocupada, color: 'text-gold' },
          { label: 'Reservadas', value: stats.reservada, color: 'text-blue-400' },
          { label: 'Mantenimiento', value: stats.mantenimiento, color: 'text-red-400' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="text-center !p-4">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-text">{label}</p>
          </Card>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-4 flex-wrap">
        <Tabs
          active={filtroEstado}
          onChange={setFiltroEstado}
          tabs={[
            { id: 'todos', label: 'Todas' },
            ...ESTADOS.map((e) => ({ id: e.id, label: e.label, count: mesas.filter((m) => m.estado === e.id).length })),
          ]}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={filtroZona}
          onChange={(e) => setFiltroZona(e.target.value)}
          className="bg-black-secondary border border-gold/20 rounded-xl px-4 py-3 text-white"
        >
          <option value="">Todas las zonas</option>
          {ZONAS.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>

        <div className="flex gap-2 ml-auto">
          <button onClick={() => setVista('grid')} className={`p-3 rounded-xl border ${vista === 'grid' ? 'border-gold text-gold' : 'border-gold/20 text-gray-text'}`}><FiGrid /></button>
          <button onClick={() => setVista('list')} className={`p-3 rounded-xl border ${vista === 'list' ? 'border-gold text-gold' : 'border-gold/20 text-gray-text'}`}><FiList /></button>
          <Button onClick={openNew}><FiPlus className="inline mr-2" />Nueva mesa</Button>
        </div>
      </div>

      {vista === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {filtradas.map((m) => (
            <div
              key={m.id}
              className={`glass-card rounded-2xl p-4 text-center border-2 transition-all cursor-pointer hover:border-gold/50 ${
                m.estado === 'disponible' ? 'border-green-500/30' :
                m.estado === 'ocupada' ? 'border-gold/50' :
                m.estado === 'reservada' ? 'border-blue-500/30' : 'border-red-500/30'
              }`}
              onClick={() => openEdit(m)}
            >
              <p className="text-3xl font-bold text-gold">#{m.numero}</p>
              <div className="mt-2"><Badge color={estadoColor(m.estado)}>{estadoLabel(m.estado)}</Badge></div>
              <p className="text-xs text-gray-text mt-2">{m.zona} · {m.capacidad} pax</p>
              <div className="flex justify-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setQrModal(m)} className="text-gray-text hover:text-gold p-1" title="Ver QR"><LuQrCode /></button>
                <button onClick={() => openEdit(m)} className="text-gray-text hover:text-gold p-1" title="Editar"><FiEdit2 /></button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <DataTable columns={columns} data={filtradas} emptyMessage="No hay mesas con estos filtros" />
      )}

      {/* Modal crear/editar */}
      <Modal open={modal} onClose={() => setModal(false)} title={editing ? `Editar mesa #${editing.numero}` : 'Nueva mesa'} wide>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Número de mesa" type="number" value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
          <Input label="Capacidad (personas)" type="number" value={form.capacidad} onChange={(e) => setForm({ ...form, capacidad: e.target.value })} />
          <div>
            <label className="block text-gray-text text-sm mb-2">Zona</label>
            <select className="w-full bg-black-secondary border border-gold/20 rounded-xl px-4 py-3 text-white" value={form.zona} onChange={(e) => setForm({ ...form, zona: e.target.value })}>
              {ZONAS.map((z) => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-gray-text text-sm mb-2">Estado</label>
            <select className="w-full bg-black-secondary border border-gold/20 rounded-xl px-4 py-3 text-white" value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}>
              {ESTADOS.map((e) => <option key={e.id} value={e.id}>{e.label}</option>)}
            </select>
          </div>
          <Input label="Código QR" value={form.codigo_qr} onChange={(e) => setForm({ ...form, codigo_qr: e.target.value })} className="sm:col-span-2" placeholder="MESA-001" />
        </div>

        {editing && (
          <div className="mt-4">
            <p className="text-sm text-gray-text mb-2">Cambio rápido de estado</p>
            <div className="flex flex-wrap gap-2">
              {ESTADOS.map((e) => (
                <Button key={e.id} variant={form.estado === e.id ? 'primary' : 'outline'} className="!py-2 !px-3 text-xs" onClick={() => { setForm({ ...form, estado: e.id }); cambiarEstado(editing.id, e.id); }}>
                  {e.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <Button onClick={save} className="flex-1">{editing ? 'Guardar cambios' : 'Crear mesa'}</Button>
          <Button variant="ghost" onClick={() => setModal(false)}>Cancelar</Button>
        </div>
      </Modal>

      {/* Modal QR */}
      <Modal open={!!qrModal} onClose={() => setQrModal(null)} title={`QR — Mesa #${qrModal?.numero}`}>
        {qrModal && (
          <div className="text-center">
            <img src={qrUrl(qrModal.codigo_qr)} alt={`QR ${qrModal.codigo_qr}`} className="mx-auto rounded-xl border border-gold/20" />
            <p className="text-gold font-mono mt-4 text-lg">{qrModal.codigo_qr}</p>
            <p className="text-gray-text text-sm mt-1">{qrModal.zona} · {qrModal.capacidad} personas</p>
            <Button variant="outline" className="mt-4" onClick={() => copiarCodigo(qrModal.codigo_qr)}>
              <FiCopy className="inline mr-2" />Copiar código
            </Button>
          </div>
        )}
      </Modal>
    </AdminModule>
  );
}
