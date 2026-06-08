import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';
import { apiGet, staffCreatePedido } from '../../services/api';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import { formatCOP } from '../../utils/format';

export default function NuevoPedido() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mesas, setMesas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mesaId, setMesaId] = useState('');
  const [cliente, setCliente] = useState('');
  const [notas, setNotas] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([apiGet('/mesas'), apiGet('/productos')]).then(([m, p]) => {
      setMesas(m);
      setProductos(p);
      const pre = location.state?.mesaId;
      setMesaId(pre ? String(pre) : String(m[0]?.id || ''));
    });
  }, []);

  const addItem = (productoId) => {
    const id = Number(productoId);
    const existing = items.find((i) => i.producto_id === id);
    if (existing) {
      setItems(items.map((i) => i.producto_id === id ? { ...i, cantidad: i.cantidad + 1 } : i));
    } else {
      setItems([...items, { producto_id: id, cantidad: 1 }]);
    }
  };

  const updateQty = (productoId, cantidad) => {
    if (cantidad <= 0) setItems(items.filter((i) => i.producto_id !== productoId));
    else setItems(items.map((i) => i.producto_id === productoId ? { ...i, cantidad } : i));
  };

  const total = items.reduce((s, i) => {
    const p = productos.find((pr) => pr.id === i.producto_id);
    const precio = p?.descuento_activo && p?.precio_descuento ? p.precio_descuento : p?.precio || 0;
    return s + precio * i.cantidad;
  }, 0);

  const enviar = async () => {
    if (!mesaId || !items.length) return;
    setLoading(true);
    try {
      await staffCreatePedido({
        mesa_id: Number(mesaId),
        nombre_cliente: cliente || 'Cliente',
        notas,
        items,
      });
      navigate('/staff');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold text-white mb-6">Crear nuevo pedido</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-white font-semibold mb-4">Datos del pedido</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-gray-text text-sm mb-2">Mesa</label>
              <select
                value={mesaId}
                onChange={(e) => setMesaId(e.target.value)}
                className="w-full bg-black border border-gold/20 rounded-xl px-4 py-3 text-white"
              >
                {mesas.map((m) => (
                  <option key={m.id} value={m.id}>
                    Mesa {m.numero} — {m.zona} ({m.estado})
                  </option>
                ))}
              </select>
            </div>
            <Input label="Nombre del cliente" value={cliente} onChange={(e) => setCliente(e.target.value)} placeholder="Opcional" />
            <div>
              <label className="block text-gray-text text-sm mb-2">Notas</label>
              <textarea
                className="w-full bg-black border border-gold/20 rounded-xl px-4 py-3 text-white"
                rows={2}
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Sin hielo, alergias, etc."
              />
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-white font-semibold mb-4">Agregar productos</h3>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {productos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => addItem(p.id)}
                className="w-full flex justify-between items-center p-3 rounded-xl border border-gold/10 hover:border-gold/40 hover:bg-white/5 text-left transition-all"
              >
                <span className="text-white text-sm">{p.nombre}</span>
                <span className="text-gold text-sm">{formatCOP(p.precio)}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      {items.length > 0 && (
        <Card className="mt-6">
          <h3 className="text-white font-semibold mb-4">Resumen del pedido</h3>
          <div className="space-y-2">
            {items.map((i) => {
              const p = productos.find((pr) => pr.id === i.producto_id);
              const precio = p?.descuento_activo && p?.precio_descuento ? p.precio_descuento : p?.precio || 0;
              return (
                <div key={i.producto_id} className="flex items-center gap-3 p-3 rounded-xl bg-black/40">
                  <span className="text-white flex-1 text-sm">{p?.nombre}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(i.producto_id, i.cantidad - 1)} className="text-gold"><FiMinus /></button>
                    <span className="text-white w-6 text-center">{i.cantidad}</span>
                    <button onClick={() => updateQty(i.producto_id, i.cantidad + 1)} className="text-gold"><FiPlus /></button>
                    <button onClick={() => updateQty(i.producto_id, 0)} className="text-red-400 ml-2"><FiTrash2 /></button>
                  </div>
                  <span className="text-gold text-sm w-24 text-right">{formatCOP(precio * i.cantidad)}</span>
                </div>
              );
            })}
          </div>
          <p className="text-gold font-bold text-xl text-right mt-4">{formatCOP(total)}</p>
          <Button className="w-full mt-4" onClick={enviar} loading={loading} disabled={!items.length}>
            Confirmar pedido
          </Button>
        </Card>
      )}
    </div>
  );
}
