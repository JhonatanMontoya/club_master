import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function MesaSessionGuard({ children }) {
  const { mesa, mesaSesion, loading, refreshMesaSesion, clearMesaSession } = useAuth();

  useEffect(() => {
    if (loading || !mesaSesion) return undefined;
    const poll = async () => {
      const sesion = await refreshMesaSesion();
      if (!sesion || ['cerrada', 'rechazada'].includes(sesion.estado)) {
        clearMesaSession();
      }
    };
    const i = setInterval(poll, 10000);
    return () => clearInterval(i);
  }, [loading, mesaSesion, refreshMesaSesion, clearMesaSession]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!mesaSesion || !mesa) {
    return <Navigate to="/mesa" replace />;
  }

  if (['cerrada', 'rechazada'].includes(mesaSesion.estado)) {
    return <Navigate to="/mesa" replace />;
  }

  return children;
}
