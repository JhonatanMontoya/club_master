import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderTimeline from '../../components/order/OrderTimeline';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const ESTADOS = ['recibido', 'en_preparacion', 'listo', 'en_camino', 'entregado'];

export default function Tracking() {
  const [estado, setEstado] = useState('recibido');
  const navigate = useNavigate();

  const simular = () => {
    const idx = ESTADOS.indexOf(estado);
    if (idx < ESTADOS.length - 1) setEstado(ESTADOS[idx + 1]);
  };

  return (
    <div className="px-4 py-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Seguimiento</h1>
      <p className="text-gray-text mb-8">Tu pedido está en camino</p>
      <Card>
        <OrderTimeline current={estado} />
      </Card>
      {estado !== 'entregado' && (
        <Button variant="secondary" className="w-full mt-4" onClick={simular}>
          Simular avance (demo)
        </Button>
      )}
      {estado === 'entregado' && (
        <div className="text-center mt-6">
          <p className="text-gold font-bold text-lg mb-4">¡Pedido entregado!</p>
          <Button onClick={() => navigate('/cliente')}>Volver al menú</Button>
        </div>
      )}
    </div>
  );
}
