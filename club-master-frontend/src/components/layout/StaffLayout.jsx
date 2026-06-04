import { Outlet, useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import Logo from '../ui/Logo';
import { useAuth } from '../../context/AuthContext';

export default function StaffLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gold/10 px-6 py-4 flex items-center justify-between">
        <Logo size="sm" />
        <div className="flex items-center gap-4">
          <span className="text-gray-text text-sm">Staff: {user?.nombre}</span>
          <button onClick={() => { logout(); navigate('/'); }} className="text-gray-text hover:text-gold">
            <FiLogOut className="text-xl" />
          </button>
        </div>
      </header>
      <main><Outlet /></main>
    </div>
  );
}
