import { useEffect, useState } from 'react';
import { FiDollarSign, FiShoppingBag, FiTrendingUp, FiXCircle, FiPercent } from 'react-icons/fi';
import AdminModule from './AdminModule';
import Tabs from '../../components/admin/Tabs';
import MetricCard from '../../components/admin/MetricCard';
import { apiGet } from '../../services/api';
import { formatCOP } from '../../utils/format';

const CHART_COLORS = ['#D4AF37', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800', '#00BCD4', '#E91E63'];
const CATEGORIA_COLORS = ['#D4AF37', '#4CAF50', '#2196F3', '#9C27B0', '#FF9800'];
const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32', '#6B7280', '#6B7280'];

const PERIODO_LABEL = { dia: 'Hoy', semana: 'Esta semana', mes: 'Este mes', ano: 'Este año' };

export default function Reportes() {
  const [periodo, setPeriodo] = useState('mes');
  const [data, setData] = useState(null);

  useEffect(() => {
    apiGet(`/admin/reportes?periodo=${periodo}`).then(setData);
  }, [periodo]);

  if (!data) return <AdminModule title="Reportes" description="Cargando..." />;

  const { resumen, ventasPorDia, topProductos, porCategoria } = data;
  const maxVenta = Math.max(...ventasPorDia.map((d) => d.ventas), 1);
  const maxCategoria = Math.max(...porCategoria.map((c) => c.ventas), 1);
  const totalCategoria = porCategoria.reduce((s, c) => s + c.ventas, 0);
  const tasaExito = resumen.pedidos
    ? Math.round(((resumen.pedidos - resumen.cancelados) / resumen.pedidos) * 100)
    : 0;

  return (
    <AdminModule title="Reportes" description="Análisis de ventas y rendimiento">
      <Tabs
        active={periodo}
        onChange={setPeriodo}
        tabs={[
          { id: 'dia', label: 'Diario' },
          { id: 'semana', label: 'Semanal' },
          { id: 'mes', label: 'Mensual' },
          { id: 'ano', label: 'Anual' },
        ]}
      />

      <p className="text-gray-text text-sm mt-4">{PERIODO_LABEL[periodo]}</p>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
        <MetricCard
          label="Ventas totales"
          value={formatCOP(resumen.ventas)}
          sub="Ingresos del período"
          icon={FiDollarSign}
          color="#4CAF50"
          delay={0}
        />
        <MetricCard
          label="Pedidos"
          value={resumen.pedidos}
          sub="Órdenes procesadas"
          icon={FiShoppingBag}
          color="#2196F3"
          delay={0.05}
        />
        <MetricCard
          label="Ticket promedio"
          value={formatCOP(resumen.ticket_promedio)}
          sub="Por pedido"
          icon={FiTrendingUp}
          color="#D4AF37"
          delay={0.1}
        />
        <MetricCard
          label="Cancelados"
          value={resumen.cancelados}
          sub="Pedidos cancelados"
          icon={FiXCircle}
          color="#ef4444"
          delay={0.15}
        />
        <MetricCard
          label="Tasa de éxito"
          value={`${tasaExito}%`}
          sub="Pedidos completados"
          icon={FiPercent}
          color="#9C27B0"
          delay={0.2}
        />
      </div>

      {/* Leyenda de colores */}
      <div className="flex flex-wrap gap-4 mt-6 p-4 rounded-xl border border-gold/10 bg-black-secondary/50">
        {[
          { color: '#4CAF50', label: 'Ventas' },
          { color: '#2196F3', label: 'Pedidos' },
          { color: '#D4AF37', label: 'Ticket' },
          { color: '#ef4444', label: 'Cancelados' },
          { color: '#9C27B0', label: 'Éxito' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-2 text-xs text-gray-text">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
            {label}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        {/* Gráfico barras multicolor */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-1">Ventas por día</h3>
          <p className="text-xs text-gray-text mb-4">Cada barra representa un día del período</p>
          <div className="flex items-end gap-2 h-44">
            {ventasPorDia.map((d, i) => {
              const color = CHART_COLORS[i % CHART_COLORS.length];
              const pct = (d.ventas / maxVenta) * 100;
              return (
                <div key={d.fecha} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-gray-text opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatCOP(d.ventas)}
                  </span>
                  <div
                    className="w-full rounded-t transition-all duration-500"
                    style={{
                      height: `${Math.max(pct, 6)}%`,
                      background: `linear-gradient(180deg, ${color} 0%, ${color}88 100%)`,
                      boxShadow: `0 0 12px ${color}44`,
                    }}
                    title={`${d.fecha}: ${formatCOP(d.ventas)}`}
                  />
                  <span className="text-[10px] text-gray-text">{d.fecha.slice(5)}</span>
                </div>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-gold/10">
            {ventasPorDia.map((d, i) => (
              <div key={d.fecha} className="flex items-center gap-1.5 text-[10px] text-gray-text">
                <span className="w-2 h-2 rounded-sm" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {d.fecha.slice(5)}: {d.pedidos} ped.
              </div>
            ))}
          </div>
        </div>

        {/* Top productos con ranking de colores */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-1">Top productos</h3>
          <p className="text-xs text-gray-text mb-4">Ranking por ventas</p>
          <div className="space-y-4">
            {topProductos.map((p, i) => {
              const color = RANK_COLORS[i] || '#6B7280';
              const maxTop = topProductos[0]?.total || 1;
              return (
                <div key={i}>
                  <div className="flex items-center gap-3 mb-1.5">
                    <span
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ background: `${color}33`, color }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-white text-sm flex-1 truncate">{p.nombre}</span>
                    <span className="text-sm font-semibold" style={{ color }}>{formatCOP(p.total)}</span>
                  </div>
                  <div className="h-2 bg-black rounded-full overflow-hidden ml-10">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(p.total / maxTop) * 100}%`,
                        background: `linear-gradient(90deg, ${color}, ${color}99)`,
                      }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-text ml-10 mt-0.5">{p.cantidad} unidades vendidas</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ventas por categoría — barras de colores + mini donut */}
        <div className="glass-card rounded-2xl p-6 lg:col-span-2">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <h3 className="text-white font-semibold mb-1">Ventas por categoría</h3>
              <p className="text-xs text-gray-text mb-4">Distribución del ingreso por tipo de producto</p>
              <div className="space-y-4">
                {porCategoria.map((c, i) => {
                  const color = CATEGORIA_COLORS[i % CATEGORIA_COLORS.length];
                  const pct = totalCategoria ? Math.round((c.ventas / totalCategoria) * 100) : 0;
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ background: color }} />
                          <span className="text-white">{c.categoria}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold" style={{ color }}>{formatCOP(c.ventas)}</span>
                          <span className="text-gray-text text-xs ml-2">({pct}%)</span>
                        </div>
                      </div>
                      <div className="h-3 bg-black rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(c.ventas / maxCategoria) * 100}%`,
                            background: `linear-gradient(90deg, ${color}, ${color}66)`,
                            boxShadow: `0 0 8px ${color}44`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Donut visual con segmentos de color */}
            <div className="flex flex-col items-center justify-center lg:w-48 shrink-0">
              <div
                className="w-36 h-36 rounded-full relative"
                style={{
                  background: `conic-gradient(${porCategoria.map((c, i) => {
                    const start = porCategoria.slice(0, i).reduce((s, x) => s + x.ventas, 0);
                    const pctStart = (start / totalCategoria) * 100;
                    const pctEnd = ((start + c.ventas) / totalCategoria) * 100;
                    const color = CATEGORIA_COLORS[i % CATEGORIA_COLORS.length];
                    return `${color} ${pctStart}% ${pctEnd}%`;
                  }).join(', ')})`,
                }}
              >
                <div className="absolute inset-4 bg-black-secondary rounded-full flex flex-col items-center justify-center">
                  <span className="text-xs text-gray-text">Total</span>
                  <span className="text-gold font-bold text-sm">{formatCOP(totalCategoria)}</span>
                </div>
              </div>
              <div className="mt-4 space-y-1.5 w-full">
                {porCategoria.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CATEGORIA_COLORS[i % CATEGORIA_COLORS.length] }} />
                    <span className="text-gray-text truncate flex-1">{c.categoria}</span>
                    <span className="text-white">{Math.round((c.ventas / totalCategoria) * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminModule>
  );
}
