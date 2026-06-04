import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiGrid, FiPackage, FiLayers, FiBox, FiTag, FiCalendar,
  FiGrid as FiTable, FiUsers, FiUserCheck, FiShoppingBag,
  FiCreditCard, FiBarChart2, FiSettings, FiMenu, FiX, FiLogOut,
} from 'react-icons/fi';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin', icon: FiGrid, label: 'Dashboard', end: true },
  { to: '/admin/productos', icon: FiPackage, label: 'Productos' },
  { to: '/admin/categorias', icon: FiLayers, label: 'Categorías' },
  { to: '/admin/inventario', icon: FiBox, label: 'Inventario' },
  { to: '/admin/promociones', icon: FiTag, label: 'Promociones' },
  { to: '/admin/reservas', icon: FiCalendar, label: 'Reservas' },
  { to: '/admin/mesas', icon: FiTable, label: 'Mesas' },
  { to: '/admin/usuarios', icon: FiUsers, label: 'Usuarios' },
  { to: '/admin/staff', icon: FiUserCheck, label: 'Staff' },
  { to: '/admin/pedidos', icon: FiShoppingBag, label: 'Pedidos' },
  { to: '/admin/pagos', icon: FiCreditCard, label: 'Pagos' },
  { to: '/admin/reportes', icon: FiBarChart2, label: 'Reportes' },
  { to: '/admin/configuracion', icon: FiSettings, label: 'Configuración' },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const Sidebar = () => (
    <aside className="w-64 bg-black-secondary border-r border-gold/10 flex flex-col h-full">
      <div className="p-6 border-b border-gold/10">
        <Logo size="sm" />
        <p className="text-gray-text text-xs mt-2">Panel Administrador</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                isActive ? 'gold-gradient text-black font-semibold' : 'text-gray-text hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="text-lg" />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-gold/10">
        <p className="text-gray-text text-xs truncate">{user?.nombre}</p>
        <button onClick={handleLogout} className="flex items-center gap-2 text-gray-text hover:text-gold text-sm mt-2">
          <FiLogOut /> Cerrar sesión
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-black flex">
      <div className="hidden lg:block fixed h-full"><Sidebar /></div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lg:hidden fixed inset-0 z-50 bg-black/80" onClick={() => setOpen(false)}>
            <motion.div initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} className="h-full" onClick={(e) => e.stopPropagation()}>
              <Sidebar />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex-1 lg:ml-64">
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur border-b border-gold/10 px-6 py-4 flex items-center justify-between">
          <button className="lg:hidden text-gold" onClick={() => setOpen(true)}><FiMenu className="text-2xl" /></button>
          <h1 className="text-lg font-semibold text-white hidden lg:block">CLUB MASTER Admin</h1>
          <div className="flex items-center gap-3">
            <span className="text-gray-text text-sm">{user?.email}</span>
            <div className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-black font-bold text-sm">
              {user?.nombre?.[0]}
            </div>
          </div>
        </header>
        <main className="p-6"><Outlet /></main>
      </div>
    </div>
  );
}
