import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../../components/ui/Logo';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

const DEMO = {
  admin: { email: 'admin@clubmaster.com', password: 'admin123' },
  staff: { email: 'staff@clubmaster.com', password: 'staff123' },
  cliente: { email: 'cliente@clubmaster.com', password: 'cliente123' },
};

export default function Login() {
  const [params] = useSearchParams();
  const rolHint = params.get('rol') || 'cliente';
  const [email, setEmail] = useState(DEMO[rolHint]?.email || '');
  const [password, setPassword] = useState(DEMO[rolHint]?.password || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const user = await login(email, password);
      if (user.rol === 'admin') navigate('/admin');
      else if (user.rol === 'staff') navigate('/staff');
      else navigate('/mesa');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="w-full max-w-md">
        <Logo className="mb-8 text-center" />
        <h2 className="text-2xl font-bold text-white mb-6">Iniciar sesión</h2>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <div className="space-y-4">
          <Input label="Correo" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        <Button type="submit" className="w-full mt-6" loading={loading}>Iniciar sesión</Button>
        <p className="text-center text-gray-text text-sm mt-6">
          ¿No tienes cuenta? <Link to="/registro" className="text-gold hover:underline">Registrarse</Link>
        </p>
        <button type="button" onClick={() => navigate('/')} className="w-full text-gray-text text-sm mt-4 hover:text-white">← Volver</button>
      </motion.form>
    </div>
  );
}
