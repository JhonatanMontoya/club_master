import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiClock, FiRefreshCw } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { getPedido } from '../../services/api';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { formatCOP } from '../../utils/format';

export default function PedidoEspera() {
  const { activePedido, setActivePedido } = useCart();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [rechazado, setRechazado] = useState(false);

  useEffect(() => {
    if (!activePedido?.id) {
      navigate('/cliente', { replace: true });
      return undefined;
    }

    const poll = async () => {
      const p = await getPedido(activePedido.id);
      setPedido(p);
      if (p.estado === 'recibido') {
        setActivePedido({ id: p.id, estado: p.estado });
        navigate('/cliente/pago', { replace: true });
      } else if (p.estado === 'cancelado') {
        setRechazado(true);
        setActivePedido(null);
      }
    };

    poll();
    const i = setInterval(poll, 3000);
    return () => clearInterval(i);
  }, [activePedido?.id, navigate, setActivePedido]);

  if (rechazado) {
    return (
      <div className="px-4 py-12 max-w-md mx-auto text-center">
        <Card>
          <p className="text-red-400 font-medium mb-2">Pedido no aprobado</p>
          <p className="text-gray-text text-sm mb-6">
            El personal no pudo confirmar tu pedido. Verifica que estás en la mesa correcta e intenta de nuevo.
          </p>
          <Button className="w-full" onClick={() => navigate('/cliente')}>Volver al menú</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="px-4 py-12 max-w-md mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="text-center">
          <div className="w-16 h-16 rounded-full gold-gradient flex items-center justify-center mx-auto mb-4">
            <FiClock className="text-2xl text-black animate-pulse" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Esperando aprobación</h2>
          <p className="text-gray-text text-sm mb-4">
            Tu pedido fue enviado al mesero. Podrás pagar cuando lo aprueben.
          </p>
          {pedido && (
            <div className="bg-black-secondary rounded-xl p-4 mb-4 text-left">
              <p className="text-gray-text text-xs mb-2">Pedido #{pedido.id} · Mesa {pedido.mesa_numero}</p>
              <ul className="text-sm text-white space-y-1 mb-3">
                {pedido.detalle?.map((d, i) => (
                  <li key={i}>{d.cantidad}x {d.nombre}</li>
                ))}
              </ul>
              <p className="text-gold font-bold text-right">{formatCOP(pedido.total)}</p>
            </div>
          )}
          <p className="text-gray-text text-xs flex items-center justify-center gap-2">
            <FiRefreshCw className="animate-spin" /> El mesero está revisando tu pedido…
          </p>
        </Card>
        <Button variant="outline" className="w-full mt-4" onClick={() => navigate('/cliente')}>
          Seguir viendo el menú
        </Button>
      </motion.div>
    </div>
  );
}
