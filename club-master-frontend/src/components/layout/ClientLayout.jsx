import { Outlet, useNavigate } from 'react-router-dom';
import { FiLogOut, FiShoppingCart } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCOP } from '../../utils/format';

export default function ClientLayout() {
  const { itemCount, total, clearCart, setActivePedido } = useCart();
  const { user, mesa, logout } = useAuth();
  const navigate = useNavigate();

  const salirDelLocal = async () => {
    const ok = window.confirm(
      '¿Deseas cerrar sesión y salir del establecimiento?\n\nSe vaciará tu carrito y deberás escanear el QR de la mesa nuevamente.'
    );
    if (!ok) return;
    clearCart();
    setActivePedido(null);
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black pb-24 pt-14">
      <header className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between gap-3 px-4 py-3 bg-black/90 backdrop-blur-md border-b border-gold/10">
        <button
          type="button"
          onClick={salirDelLocal}
          className="flex items-center gap-2 text-gray-text hover:text-gold text-sm transition-colors"
          title="Cerrar sesión y salir del local"
        >
          <FiLogOut className="text-lg flex-shrink-0" />
          <span className="hidden sm:inline">Salir del local</span>
        </button>
        <p className="text-gray-text text-xs sm:text-sm truncate max-w-[40%] text-center">
          {user?.nombre}
        </p>
        {mesa && (
          <div className="glass-card px-3 py-1.5 rounded-full text-sm flex-shrink-0">
            Mesa <span className="text-gold font-bold">#{mesa.numero}</span>
          </div>
        )}
      </header>

      <Outlet />

      {itemCount > 0 && (
        <button
          type="button"
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
    </div>
  );
}
