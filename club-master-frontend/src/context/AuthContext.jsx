import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiGet, apiPost, apiPatch } from '../services/api';

const AuthContext = createContext(null);

const SESION_KEY = 'club_master_mesa_sesion';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [mesa, setMesa] = useState(null);
  const [mesaSesion, setMesaSesion] = useState(null);
  const [loading, setLoading] = useState(true);

  const persistSesion = (sesion) => {
    if (sesion) {
      localStorage.setItem(SESION_KEY, JSON.stringify(sesion));
      setMesaSesion(sesion);
    } else {
      localStorage.removeItem(SESION_KEY);
      setMesaSesion(null);
    }
  };

  const selectMesa = (mesaData) => {
    if (mesaData) {
      localStorage.setItem('club_master_mesa', JSON.stringify(mesaData));
      setMesa(mesaData);
    } else {
      localStorage.removeItem('club_master_mesa');
      setMesa(null);
    }
  };

  const clearMesaSession = useCallback(() => {
    persistSesion(null);
    selectMesa(null);
  }, []);

  const refreshMesaSesion = useCallback(async () => {
    if (!user || user.rol !== 'cliente') return null;
    try {
      const sesion = await apiGet('/mesas/sesiones/mi');
      if (!sesion) {
        clearMesaSession();
        return null;
      }
      persistSesion(sesion);
      if (sesion.mesa && ['pendiente', 'activa'].includes(sesion.estado)) {
        selectMesa(sesion.mesa);
      }
      return sesion;
    } catch {
      return null;
    }
  }, [user, clearMesaSession]);

  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('club_master_token');
      const savedMesa = localStorage.getItem('club_master_mesa');
      const savedSesion = localStorage.getItem(SESION_KEY);

      if (token) {
        try {
          const me = await apiGet('/auth/me');
          setUser(me);
          localStorage.setItem('club_master_user', JSON.stringify(me));
          if (me.rol !== 'cliente') {
            localStorage.removeItem('club_master_mesa');
            localStorage.removeItem(SESION_KEY);
            setMesa(null);
            setMesaSesion(null);
          } else {
            if (savedSesion) setMesaSesion(JSON.parse(savedSesion));
            if (savedMesa) setMesa(JSON.parse(savedMesa));
          }
        } catch {
          localStorage.removeItem('club_master_token');
          localStorage.removeItem('club_master_user');
          localStorage.removeItem('club_master_mesa');
          localStorage.removeItem(SESION_KEY);
          setUser(null);
        }
      } else {
        localStorage.removeItem('club_master_user');
      }
      setLoading(false);
    }
    initAuth();
  }, []);

  useEffect(() => {
    if (!loading && user?.rol === 'cliente') {
      refreshMesaSesion();
    }
  }, [loading, user, refreshMesaSesion]);

  const persist = (token, userData) => {
    localStorage.setItem('club_master_token', token);
    localStorage.setItem('club_master_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    const data = await apiPost('/auth/login', { email, password });
    if (data.user.rol !== 'cliente') {
      localStorage.removeItem('club_master_mesa');
      localStorage.removeItem(SESION_KEY);
      setMesa(null);
      setMesaSesion(null);
    }
    persist(data.token, data.user);
    return data.user;
  };

  const register = async (form) => {
    const data = await apiPost('/auth/register', form);
    persist(data.token, data.user);
    return data.user;
  };

  const guestLogin = async (nombre) => {
    const data = await apiPost('/auth/guest', { nombre });
    persist(data.token, data.user);
    return data.user;
  };

  const requestMesaSession = async (mesaData) => {
    const sesion = await apiPost('/mesas/sesiones', { mesa_id: mesaData.id });
    persistSesion(sesion);
    selectMesa(sesion.mesa || mesaData);
    return sesion;
  };

  const activateMesaFromSesion = (sesion) => {
    if (sesion?.mesa) selectMesa(sesion.mesa);
    persistSesion(sesion);
  };

  const cancelMesaSesion = async () => {
    if (mesaSesion?.id) {
      try {
        await apiPatch(`/mesas/sesiones/${mesaSesion.id}/cerrar`);
      } catch {
        /* sesión ya cerrada */
      }
    }
    clearMesaSession();
  };

  const logout = async () => {
    if (mesaSesion?.id && ['pendiente', 'activa'].includes(mesaSesion.estado)) {
      try {
        await apiPatch(`/mesas/sesiones/${mesaSesion.id}/cerrar`);
      } catch {
        /* ignore */
      }
    }
    localStorage.removeItem('club_master_token');
    localStorage.removeItem('club_master_user');
    localStorage.removeItem('club_master_mesa');
    localStorage.removeItem(SESION_KEY);
    setUser(null);
    setMesa(null);
    setMesaSesion(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      mesa,
      mesaSesion,
      loading,
      login,
      register,
      guestLogin,
      selectMesa,
      requestMesaSession,
      activateMesaFromSesion,
      refreshMesaSesion,
      clearMesaSession,
      cancelMesaSesion,
      logout,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
