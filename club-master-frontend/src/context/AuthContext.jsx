import { createContext, useContext, useState, useEffect } from 'react';
import { apiPost } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [mesa, setMesa] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('club_master_token');
    const savedUser = localStorage.getItem('club_master_user');
    const savedMesa = localStorage.getItem('club_master_mesa');
    if (token && savedUser) setUser(JSON.parse(savedUser));
    if (savedMesa) setMesa(JSON.parse(savedMesa));
    setLoading(false);
  }, []);

  const persist = (token, userData) => {
    localStorage.setItem('club_master_token', token);
    localStorage.setItem('club_master_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (email, password) => {
    const data = await apiPost('/auth/login', { email, password });
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

  const selectMesa = (mesaData) => {
    localStorage.setItem('club_master_mesa', JSON.stringify(mesaData));
    setMesa(mesaData);
  };

  const logout = () => {
    localStorage.removeItem('club_master_token');
    localStorage.removeItem('club_master_user');
    localStorage.removeItem('club_master_mesa');
    setUser(null);
    setMesa(null);
  };

  return (
    <AuthContext.Provider value={{ user, mesa, loading, login, register, guestLogin, selectMesa, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
