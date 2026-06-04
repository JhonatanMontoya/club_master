import { Outlet, useNavigate } from 'react-router-dom';
import { FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCOP } from '../../utils/format';

export default function ClientLayout() {
  const { itemCount, total } = useCart();
  const { mesa } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black pb-24">
      <Outlet />
      {itemCount > 0 && (
        <button
          onClick={() => navigate('/cliente/carrito')}
          className="fixed bottom-6 right-6 left-6 md:left-auto md:w-80 gold-gradient rounded-2xl p-4 flex items-center justify-between shadow-2xl z-50"
        >
          <div className="flex items-center gap-3 text-black">
            <FiShoppingCart className="text-xl" />
            <span className="font-semibold">{itemCount} items</span>
          </div>
          <span className="font-bold text-black">{formatCOP(total)}</span>
        </button>
      )}
      {mesa && (
        <div className="fixed top-4 right-4 glass-card px-4 py-2 rounded-full text-sm z-40">
          Mesa <span className="text-gold font-bold">#{mesa.numero}</span>
        </div>
      )}
    </div>
  );
}
