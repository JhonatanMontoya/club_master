import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FiLogOut, FiClipboard, FiPlusCircle, FiGrid } from 'react-icons/fi';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';

const nav = [
  { to: '/staff', label: 'Pedidos', icon: FiClipboard, end: true },
  { to: '/staff/nuevo-pedido', label: 'Nuevo pedido', icon: FiPlusCircle },
  { to: '/staff/mesas', label: 'Mesas', icon: FiGrid },
];

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gold/10 px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <Logo size="sm" />
          <div className="flex items-center gap-4">
            <span className="text-gray-text text-sm hidden sm:inline">Mesero: {user?.nombre}</span>
            <button onClick={() => { logout(); navigate('/'); }} className="text-gray-text hover:text-gold" title="Cerrar sesión">
              <FiLogOut className="text-xl" />
            </button>
          </div>
        </div>
        <nav className="flex gap-2 overflow-x-auto">
          {nav.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-sm whitespace-nowrap transition-all ${
                  isActive ? 'gold-gradient text-black font-semibold' : 'text-gray-text hover:text-white border border-gold/20'
                }`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main><Outlet /></main>
    </div>
  );
}
