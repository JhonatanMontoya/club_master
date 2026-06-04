import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiDollarSign, FiSmartphone, FiClock } from 'react-icons/fi';
import { apiGet } from '../../services/api';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const ICONS = { qr: FiSmartphone, tarjeta: FiCreditCard, efectivo: FiDollarSign, pago_final: FiClock };

export default function Payment() {
  const [metodos, setMetodos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const { activePedido } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    apiGet('/pagos/metodos').then(setMetodos);
  }, []);

  const confirmar = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/cliente/seguimiento');
    }, 1000);
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Pago</h1>
      <p className="text-gray-text mb-8">Pedido #{activePedido?.id || '---'}</p>
      <div className="space-y-3">
        {metodos.map((m) => {
          const Icon = ICONS[m.codigo] || FiCreditCard;
          return (
            <Card
              key={m.id}
              hover
              onClick={() => setSelected(m.id)}
              className={`flex items-center gap-4 cursor-pointer ${selected === m.id ? 'border-gold gold-glow' : ''}`}
            >
              <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center">
                <Icon className="text-gold text-xl" />
              </div>
              <span className="text-white font-medium">{m.nombre}</span>
            </Card>
          );
        })}
      </div>
      <Button className="w-full mt-8" disabled={!selected} loading={loading} onClick={confirmar}>
        Confirmar pago
      </Button>
    </div>
  );
}
