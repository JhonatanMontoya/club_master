import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiUser } from 'react-icons/fi';
import { apiGet, apiPatch } from '../../services/api';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { formatCOP, formatTime } from '../../utils/format';

const ACCIONES = [
  { estado: 'en_preparacion', label: 'En preparación' },
  { estado: 'listo', label: 'Listo' },
  { estado: 'entregado', label: 'Entregado' },
];

export default function StaffDashboard() {
  const [pedidos, setPedidos] = useState([]);
  const [selected, setSelected] = useState(null);

  const load = () => apiGet('/pedidos/staff').then(setPedidos);
  useEffect(() => { load(); const i = setInterval(load, 10000); return () => clearInterval(i); }, []);

  const cambiarEstado = async (id, estado) => {
    await apiPatch(`/pedidos/${id}/estado`, { estado });
    load();
    if (selected?.id === id) setSelected({ ...selected, estado });
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-80px)]">
      <div className="lg:w-1/2 p-6 border-r border-gold/10 overflow-y-auto">
        <h2 className="text-xl font-bold text-white mb-4">Pedidos en tiempo real</h2>
        <div className="space-y-3">
          {pedidos.map((p, i) => (
            <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card hover onClick={() => setSelected(p)} className={`cursor-pointer ${selected?.id === p.id ? 'border-gold' : ''}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-gold font-bold">Mesa #{p.mesa_numero}</span>
                    <p className="text-white font-medium mt-1">{p.nombre_cliente}</p>
                    <p className="text-gray-text text-sm flex items-center gap-1 mt-1"><FiClock /> {formatTime(p.created_at)}</p>
                  </div>
                  <Badge color={p.estado_color}>{p.estado?.replace('_', ' ')}</Badge>
                </div>
                <p className="text-gold font-bold mt-2">{formatCOP(p.total)}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="lg:w-1/2 p-6">
        {selected ? (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Detalle del pedido #{selected.id}</h2>
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <FiUser className="text-gold" />
                <div>
                  <p className="text-white font-medium">{selected.nombre_cliente}</p>
                  <p className="text-gray-text text-sm">Mesa #{selected.mesa_numero}</p>
                </div>
              </div>
              <div className="space-y-2 border-t border-gold/10 pt-4">
                {selected.detalle?.map((d, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-gray-text">{d.cantidad}x {d.nombre}</span>
                  </div>
                ))}
              </div>
              <p className="text-gold font-bold text-lg mt-4">{formatCOP(selected.total)}</p>
            </Card>
            <div className="flex flex-wrap gap-3 mt-6">
              {ACCIONES.map((a) => (
                <Button key={a.estado} variant="secondary" onClick={() => cambiarEstado(selected.id, a.estado)}>
                  {a.label}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-text">Selecciona un pedido</div>
        )}
      </div>
    </div>
  );
}
