import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, roles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (roles.length && !roles.includes(user.rol)) {
    if (user.rol === 'admin') return <Navigate to="/admin" replace />;
    if (user.rol === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/cliente" replace />;
  }

  return children;
}
