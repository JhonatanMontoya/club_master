import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiUser, FiPlus, FiMinus, FiTrash2, FiChevronDown, FiShoppingBag } from 'react-icons/fi';
import {
  staffGetPedidos, staffUpdateEstado, staffAddItem, staffUpdateItemQty, staffRemoveItem,
} from '../../services/api';
import { apiGet } from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import OrderStatusBadge from '../../components/staff/OrderStatusBadge';
import { ORDER_STATUS, STAFF_FILTERS, getOrderStatus } from '../../utils/orderStatus';
import { formatCOP, formatTime } from '../../utils/format';
import PedidosAprobacionPanel from '../../components/pedidos/PedidosAprobacionPanel';

const ACCIONES_ESTADO = ['recibido', 'en_preparacion', 'listo', 'entregado'];

function parseError(e) {
  return e.response?.data?.message || e.message || 'No se pudo completar la acción';
}

function resumenPedido(detalle = []) {
  if (!detalle.length) return 'Sin productos';
  return detalle.map((d) => `${d.cantidad}x ${d.nombre}`).join(' · ');
}

export default function StaffDashboard() {
  const [filtro, setFiltro] = useState('activos');
  const [pedidos, setPedidos] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [productos, setProductos] = useState([]);
  const [addProductId, setAddProductId] = useState('');
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);

  const expanded = pedidos.find((p) => p.id === expandedId) || null;

  const load = async () => {
    try {
      const list = await staffGetPedidos(filtro);
      setPedidos(Array.isArray(list) ? list : []);
      setLoadError('');
    } catch (e) {
      setPedidos([]);
      setLoadError(parseError(e));
    }
  };

  useEffect(() => {
    apiGet('/productos').then(setProductos);
  }, []);

  useEffect(() => {
    load();
    const i = setInterval(load, 8000);
    return () => clearInterval(i);
  }, [filtro]);

  const togglePedido = (p) => {
    setExpandedId((prev) => (prev === p.id ? null : p.id));
    setAddProductId('');
  };

  const refreshExpanded = async (id) => {
    const list = await staffGetPedidos(filtro);
    setPedidos(list);
    const found = list.find((p) => p.id === id);
    if (found) setExpandedId(found.id);
  };

  const cambiarEstado = async (id, estado) => {
    setBusy(true);
    setActionError('');
    try {
      await staffUpdateEstado(id, estado);
      await refreshExpanded(id);
      await load();
    } catch (e) {
      setActionError(parseError(e));
    } finally {
      setBusy(false);
    }
  };

  const agregarProducto = async () => {
    if (!expanded || !addProductId) return;
    setBusy(true);
    setActionError('');
    try {
      await staffAddItem(expanded.id, Number(addProductId), 1);
      setAddProductId('');
      await refreshExpanded(expanded.id);
    } catch (e) {
      setActionError(parseError(e));
    } finally {
      setBusy(false);
    }
  };

  const cambiarCantidad = async (productoId, cantidad) => {
    if (!expanded) return;
    setBusy(true);
    setActionError('');
    try {
      await staffUpdateItemQty(expanded.id, productoId, cantidad);
      await refreshExpanded(expanded.id);
    } catch (e) {
      setActionError(parseError(e));
    } finally {
      setBusy(false);
    }
  };

  const eliminarItem = async (productoId) => {
    if (!expanded) return;
    setBusy(true);
    setActionError('');
    try {
      await staffRemoveItem(expanded.id, productoId);
      await refreshExpanded(expanded.id);
    } catch (e) {
      setActionError(parseError(e));
    } finally {
      setBusy(false);
    }
  };

  const cancelarPedido = async () => {
    if (!expanded || !confirm('¿Cancelar este pedido?')) return;
    await cambiarEstado(expanded.id, 'cancelado');
    setExpandedId(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-3xl mx-auto">
      <PedidosAprobacionPanel onUpdate={() => load()} pollMs={3000} />

      <h2 className="text-xl font-bold text-white mb-1">Pedidos de clientes</h2>
      <p className="text-gray-text text-sm mb-4">Toca un pedido para ver qué pidió y editarlo</p>

      <div className="flex flex-wrap gap-2 mb-4 p-3 rounded-xl bg-black-secondary/80 border border-gold/10">
        {Object.entries(ORDER_STATUS).filter(([k]) => k !== 'cancelado').map(([key, s]) => (
          <div key={key} className="flex items-center gap-1.5 text-[10px] text-gray-text">
            <span className="w-3 h-3 rounded-full" style={{ background: s.color }} />
            {s.label}
          </div>
        ))}
      </div>

      {loadError && (
        <Card className="mb-4 !p-4 border border-red-500/40">
          <p className="text-red-400 text-sm">{loadError}</p>
          <Button variant="outline" className="mt-2 !py-2 text-sm" onClick={load}>Reintentar</Button>
        </Card>
      )}

      {actionError && (
        <p className="text-red-400 text-sm mb-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">{actionError}</p>
      )}

      <div className="flex gap-2 flex-wrap mb-6">
        {STAFF_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => { setFiltro(f.id); setExpandedId(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs transition-all ${
              filtro === f.id ? 'text-black font-semibold' : 'text-gray-text border border-gold/20'
            }`}
            style={filtro === f.id ? { background: getOrderStatus(f.id === 'activos' ? 'recibido' : f.id).color } : {}}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {pedidos.length === 0 && (
          <p className="text-gray-text text-center py-12">No hay pedidos en esta categoría</p>
        )}

        {pedidos.map((p, i) => {
          const st = getOrderStatus(p.estado);
          const isOpen = expandedId === p.id;

          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="rounded-2xl overflow-hidden border"
              style={{ borderColor: st.border, background: isOpen ? st.bg : 'rgba(17,17,17,0.6)' }}
            >
              {/* Cabecera — clic para desplegar */}
              <button
                type="button"
                onClick={() => togglePedido(p)}
                className="w-full p-4 text-left border-l-4 transition-all"
                style={{ borderLeftColor: st.color }}
              >
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold" style={{ color: st.color }}>Mesa #{p.mesa_numero}</span>
                      <OrderStatusBadge estado={p.estado} />
                    </div>
                    <p className="text-white font-medium mt-1 flex items-center gap-2">
                      <FiUser className="text-gold shrink-0" size={14} />
                      {p.nombre_cliente}
                    </p>
                    <p className="text-gray-text text-xs flex items-center gap-1 mt-1">
                      <FiClock size={12} /> {formatTime(p.created_at)}
                    </p>
                    {!isOpen && (
                      <p className="text-gray-text text-xs mt-2 line-clamp-2">
                        <FiShoppingBag className="inline mr-1" size={12} />
                        {resumenPedido(p.detalle)}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-lg" style={{ color: st.color }}>{formatCOP(p.total)}</p>
                    <p className="text-gray-text text-xs">{p.detalle?.length || 0} productos</p>
                    <FiChevronDown
                      className={`mt-2 ml-auto text-gray-text transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </div>
                </div>
              </button>

              {/* Detalle desplegable */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 border-t border-gold/10">
                      {p.notas && (
                        <p className="text-sm text-gray-text mt-3 p-2 rounded-lg bg-black/40">📝 {p.notas}</p>
                      )}

                      <h3 className="text-white font-semibold text-sm mt-4 mb-3 flex items-center gap-2">
                        <FiShoppingBag className="text-gold" />
                        Lo que pidió el cliente
                      </h3>

                      {!p.detalle?.length ? (
                        <p className="text-gray-text text-sm py-4 text-center">Este pedido no tiene productos aún</p>
                      ) : (
                        <div className="space-y-2">
                          {p.detalle.map((d) => (
                            <div
                              key={d.producto_id}
                              className="flex items-center gap-3 p-3 rounded-xl bg-black/50 border border-gold/10"
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium">{d.nombre}</p>
                                <p className="text-xs text-gray-text">{formatCOP(d.precio_unitario)} c/u</p>
                                {d.agregado_por_staff && (
                                  <span className="text-[10px] text-blue-400 mt-0.5 inline-block">+ Añadido por mesero</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => cambiarCantidad(d.producto_id, d.cantidad - 1)}
                                  className="w-8 h-8 rounded-lg border border-gold/30 text-gold flex items-center justify-center hover:bg-gold/10"
                                >
                                  <FiMinus size={14} />
                                </button>
                                <span className="text-white w-6 text-center font-medium text-sm">{d.cantidad}</span>
                                <button
                                  type="button"
                                  onClick={() => cambiarCantidad(d.producto_id, d.cantidad + 1)}
                                  className="w-8 h-8 rounded-lg border border-gold/30 text-gold flex items-center justify-center hover:bg-gold/10"
                                >
                                  <FiPlus size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => eliminarItem(d.producto_id)}
                                  className="w-8 h-8 rounded-lg text-red-400 flex items-center justify-center hover:bg-red-400/10"
                                >
                                  <FiTrash2 size={14} />
                                </button>
                              </div>
                              <span className="text-gold text-sm font-semibold w-20 text-right shrink-0">
                                {formatCOP(d.subtotal || (d.precio_unitario || 0) * d.cantidad)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Agregar producto — mesero */}
                      <div className="mt-5 p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
                        <h4 className="text-blue-400 text-sm font-semibold mb-1">Agregar al pedido (mesero)</h4>
                        <p className="text-gray-text text-xs mb-3">El cliente no necesita hacer nada — tú puedes añadir productos aquí</p>
                        <div className="flex gap-2">
                          <select
                            value={addProductId}
                            onChange={(e) => setAddProductId(e.target.value)}
                            className="flex-1 bg-black border border-gold/20 rounded-xl px-3 py-2.5 text-white text-sm"
                          >
                            <option value="">Elegir producto...</option>
                            {productos.map((prod) => (
                              <option key={prod.id} value={prod.id}>
                                {prod.nombre} — {formatCOP(prod.precio)}
                              </option>
                            ))}
                          </select>
                          <Button onClick={agregarProducto} disabled={!addProductId} className="!px-4 shrink-0">
                            <FiPlus className="inline mr-1" /> Agregar
                          </Button>
                        </div>
                      </div>

                      <p className="text-gold font-bold text-xl text-right mt-4">
                        Total: {formatCOP(p.total)}
                      </p>

                      <div className="mt-5">
                        <p className="text-sm text-gray-text mb-2">Estado del pedido</p>
                        <div className="grid grid-cols-2 gap-2">
                          {ACCIONES_ESTADO.map((estado) => {
                            const s = getOrderStatus(estado);
                            const active = p.estado === estado;
                            return (
                              <button
                                key={estado}
                                type="button"
                                onClick={() => cambiarEstado(p.id, estado)}
                                disabled={busy}
                                className="py-2.5 px-3 rounded-xl text-xs font-medium border-2 transition-all disabled:opacity-50"
                                style={{
                                  background: active ? s.color : s.bg,
                                  borderColor: s.border,
                                  color: active ? '#000' : s.color,
                                }}
                              >
                                {s.label}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <Button variant="danger" className="w-full mt-4" onClick={cancelarPedido}>
                        Cancelar pedido
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
