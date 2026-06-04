import { useEffect, useState } from 'react';
import { FiDollarSign, FiShoppingBag, FiGrid, FiUsers } from 'react-icons/fi';
import { apiGet } from '../../services/api';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import { formatCOP } from '../../utils/format';

export default function AdminDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    apiGet('/admin/dashboard').then(setData);
  }, []);

  if (!data) return <div className="text-gray-text">Cargando dashboard...</div>;

  const { stats, ventasMensuales, productosTop, metodosPago } = data;
  const maxVenta = Math.max(...ventasMensuales.map((v) => v.total), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-text">Resumen del negocio</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard icon={FiDollarSign} label="Ventas hoy" value={formatCOP(stats.ventasHoy)} trend="+12% vs ayer" delay={0} />
        <StatCard icon={FiShoppingBag} label="Pedidos hoy" value={stats.pedidosHoy} trend="+5 nuevos" delay={0.1} />
        <StatCard icon={FiGrid} label="Mesas ocupadas" value={stats.mesasOcupadas} delay={0.2} />
        <StatCard icon={FiUsers} label="Clientes" value={stats.clientes} delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-white font-semibold mb-4">Ventas mensuales</h3>
          <div className="flex items-end gap-2 h-48">
            {ventasMensuales.map((v) => (
              <div key={v.mes} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full gold-gradient rounded-t-lg min-h-[4px]"
                  style={{ height: `${(v.total / maxVenta) * 100}%` }}
                />
                <span className="text-gray-text text-xs">{v.mes?.slice(5)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-white font-semibold mb-4">Productos más vendidos</h3>
          <div className="space-y-3">
            {productosTop.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-gray-text text-sm">{p.nombre}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-black-secondary rounded-full overflow-hidden">
                    <div className="h-full gold-gradient rounded-full" style={{ width: `${(p.cantidad / productosTop[0].cantidad) * 100}%` }} />
                  </div>
                  <span className="text-gold text-sm font-medium">{p.cantidad}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-white font-semibold mb-4">Métodos de pago</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {metodosPago.map((m) => (
            <div key={m.nombre} className="bg-black-secondary rounded-xl p-4 text-center">
              <p className="text-gray-text text-sm">{m.nombre}</p>
              <p className="text-gold font-bold text-lg mt-1">{formatCOP(m.total)}</p>
              <p className="text-gray-text text-xs">{m.cantidad} transacciones</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
