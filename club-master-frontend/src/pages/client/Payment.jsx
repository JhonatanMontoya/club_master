import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiDollarSign, FiSmartphone, FiClock } from 'react-icons/fi';
import { apiGet, apiPost } from '../../services/api';
import { useCart } from '../../context/CartContext';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { formatCOP } from '../../utils/format';

const ICONS = { qr: FiSmartphone, tarjeta: FiCreditCard, efectivo: FiDollarSign, pago_final: FiClock };

export default function Payment() {
  const [metodos, setMetodos] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { activePedido } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (!activePedido?.id) {
      navigate('/cliente', { replace: true });
      return;
    }
    apiGet('/pagos/metodos').then(setMetodos).catch(() => setError('No se pudieron cargar los métodos de pago'));
  }, [activePedido?.id, navigate]);

  const confirmar = async () => {
    if (!activePedido?.id || !selected) return;
    setLoading(true);
    setError('');
    try {
      await apiPost('/pagos', {
        pedido_id: activePedido.id,
        metodo_pago_id: selected,
        monto: activePedido.total,
      });
      navigate('/cliente/seguimiento');
    } catch (err) {
      setError(err.response?.data?.message || 'No se pudo registrar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Pago</h1>
      <p className="text-gray-text mb-2">Pedido #{activePedido?.id || '---'}</p>
      {activePedido?.total != null && (
        <p className="text-gold font-bold text-xl mb-8">{formatCOP(activePedido.total)}</p>
      )}
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
      {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
      <Button className="w-full mt-8" disabled={!selected} loading={loading} onClick={confirmar}>
        Confirmar pago
      </Button>
    </div>
  );
}
