import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProductImageUrl } from '../../utils/productImage';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createPedido } from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { formatCOP } from '../../utils/format';

export default function Cart() {
  const { items, updateQty, removeItem, total, clearCart, setActivePedido } = useCart();
  const { mesa, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const confirmar = async () => {
    setLoading(true);
    try {
      const pedido = await createPedido({
        mesa_id: mesa?.id,
        nombre_cliente: user?.nombre,
        items: items.map((i) => ({ producto_id: i.id, cantidad: i.cantidad })),
      });
      setActivePedido({ id: pedido.id, estado: pedido.estado, total: pedido.total ?? total });
      clearCart();
      if (pedido.estado === 'pendiente_aprobacion') {
        navigate('/cliente/espera-pedido');
      } else {
        navigate('/cliente/pago');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'No se pudo crear el pedido. Registra tu mesa primero.');
    } finally {
      setLoading(false);
    }
  };

  if (!items.length) {
    return (
      <div className="px-4 py-12 text-center">
        <p className="text-gray-text">Tu carrito está vacío</p>
        <Button className="mt-4" onClick={() => navigate('/cliente')}>Ver menú</Button>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 max-w-lg mx-auto pb-32">
      <h1 className="text-2xl font-bold text-white mb-6">Carrito</h1>
      <div className="space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="flex gap-4 items-center">
            <img src={getProductImageUrl(item)} alt="" className="w-16 h-16 rounded-xl object-cover bg-black-secondary" />
            <div className="flex-1">
              <h3 className="font-medium text-white">{item.nombre}</h3>
              <p className="text-gold font-bold">{formatCOP(item.precio)}</p>
              <div className="flex items-center gap-3 mt-2">
                <button onClick={() => updateQty(item.id, item.cantidad - 1)} className="text-gray-text hover:text-white"><FiMinus /></button>
                <span className="text-white font-medium">{item.cantidad}</span>
                <button onClick={() => updateQty(item.id, item.cantidad + 1)} className="text-gray-text hover:text-white"><FiPlus /></button>
              </div>
            </div>
            <button onClick={() => removeItem(item.id)} className="text-red-400"><FiTrash2 /></button>
          </Card>
        ))}
      </div>
      <Card className="mt-6 flex justify-between items-center">
        <span className="text-gray-text">Total</span>
        <span className="text-2xl font-bold text-gold">{formatCOP(total)}</span>
      </Card>
      <Button className="w-full mt-4" loading={loading} onClick={confirmar}>Confirmar pedido</Button>
    </div>
  );
}
