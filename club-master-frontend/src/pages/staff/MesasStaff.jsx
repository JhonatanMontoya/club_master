import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiGet } from '../../services/api';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import MesaSesionesPanel from '../../components/mesas/MesaSesionesPanel';
import PedidosAprobacionPanel from '../../components/pedidos/PedidosAprobacionPanel';

const ESTADO_STYLE = {
  disponible: { color: 'green', label: 'Disponible' },
  ocupada: { color: 'gold', label: 'Ocupada' },
  reservada: { color: 'blue', label: 'Reservada' },
  mantenimiento: { color: 'red', label: 'Mantenimiento' },
};

export default function MesasStaff() {
  const [mesas, setMesas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    apiGet('/mesas').then(setMesas);
    const i = setInterval(() => apiGet('/mesas').then(setMesas), 10000);
    return () => clearInterval(i);
  }, []);

  const stats = {
    disponible: mesas.filter((m) => m.estado === 'disponible').length,
    ocupada: mesas.filter((m) => m.estado === 'ocupada').length,
    reservada: mesas.filter((m) => m.estado === 'reservada').length,
  };

  const crearPedido = (mesaId) => {
    navigate('/staff/nuevo-pedido', { state: { mesaId } });
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-xl font-bold text-white mb-2">Estado de mesas</h2>
      <p className="text-gray-text text-sm mb-6">Vista rápida para el mesero</p>

      <PedidosAprobacionPanel pollMs={3000} />
      <MesaSesionesPanel onUpdate={() => apiGet('/mesas').then(setMesas)} />

      <div className="grid grid-cols-3 gap-4 mb-8 max-w-lg">
        <Card className="text-center !p-4">
          <p className="text-2xl font-bold text-green-400">{stats.disponible}</p>
          <p className="text-xs text-gray-text">Disponibles</p>
        </Card>
        <Card className="text-center !p-4">
          <p className="text-2xl font-bold text-gold">{stats.ocupada}</p>
          <p className="text-xs text-gray-text">Ocupadas</p>
        </Card>
        <Card className="text-center !p-4">
          <p className="text-2xl font-bold text-blue-400">{stats.reservada}</p>
          <p className="text-xs text-gray-text">Reservadas</p>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {mesas.map((m) => {
          const st = ESTADO_STYLE[m.estado] || ESTADO_STYLE.disponible;
          return (
            <div
              key={m.id}
              className={`glass-card rounded-2xl p-4 text-center border-2 ${
                m.estado === 'disponible' ? 'border-green-500/30' :
                m.estado === 'ocupada' ? 'border-gold/50' :
                m.estado === 'reservada' ? 'border-blue-500/30' : 'border-red-500/30'
              }`}
            >
              <p className="text-3xl font-bold text-gold">#{m.numero}</p>
              <div className="mt-2"><Badge color={st.color}>{st.label}</Badge></div>
              <p className="text-xs text-gray-text mt-2">{m.zona} · {m.capacidad} pax</p>
              {m.sesion && (
                <p className="text-xs text-amber-300 mt-1 truncate">{m.sesion.nombre_cliente}</p>
              )}
              {m.estado === 'disponible' && !m.sesion && (
                <Button variant="outline" className="w-full mt-3 !py-2 text-xs" onClick={() => crearPedido(m.id)}>
                  Nuevo pedido
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
