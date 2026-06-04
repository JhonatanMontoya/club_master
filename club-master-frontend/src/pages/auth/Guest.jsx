import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../../components/ui/Logo';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function Guest() {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);
  const { guestLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await guestLogin(nombre);
      navigate('/mesa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleSubmit} className="w-full max-w-md text-center">
        <Logo className="mb-8" />
        <h2 className="text-2xl font-bold text-white mb-2">Continuar como invitado</h2>
        <p className="text-gray-text mb-8">Ingresa tu nombre para continuar</p>
        <Input label="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        <Button type="submit" className="w-full mt-6" loading={loading}>Continuar</Button>
        <button type="button" onClick={() => navigate('/')} className="text-gray-text text-sm mt-4 hover:text-white">← Volver</button>
      </motion.form>
    </div>
  );
}
