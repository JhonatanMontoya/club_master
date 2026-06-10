import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiRefreshCw } from 'react-icons/fi';
import { getPedido } from '../../services/api';
import { useCart } from '../../context/CartContext';
import OrderTimeline from '../../components/order/OrderTimeline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

export default function Tracking() {
  const { activePedido } = useCart();
  const [estado, setEstado] = useState('recibido');
  const [pedidoId, setPedidoId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!activePedido?.id) {
      navigate('/cliente', { replace: true });
      return undefined;
    }
    setPedidoId(activePedido.id);

    const poll = async () => {
      try {
        const p = await getPedido(activePedido.id);
        if (p?.estado && p.estado !== 'pendiente_aprobacion' && p.estado !== 'cancelado') {
          setEstado(p.estado);
        }
      } catch {
        /* reintenta en el siguiente intervalo */
      }
    };

    poll();
    const i = setInterval(poll, 4000);
    return () => clearInterval(i);
  }, [activePedido?.id, navigate]);

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Seguimiento</h1>
      <p className="text-gray-text mb-2">Pedido #{pedidoId || '---'}</p>
      <p className="text-gray-text text-sm mb-8 flex items-center gap-2">
        <FiRefreshCw className="animate-spin text-gold" /> Actualizando en tiempo real
      </p>
      <Card>
        <OrderTimeline current={estado} />
      </Card>
      {estado === 'entregado' && (
        <div className="text-center mt-6">
          <p className="text-gold font-bold text-lg mb-4">¡Pedido entregado!</p>
          <Button onClick={() => navigate('/cliente')}>Volver al menú</Button>
        </div>
      )}
    </div>
  );
}
