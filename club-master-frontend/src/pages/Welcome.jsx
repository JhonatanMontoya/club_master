import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.08)_0%,_transparent_70%)]" />
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center z-10 max-w-md">
        <Logo size="xl" className="mb-8 justify-center" />
        <p className="text-gray-text text-lg mb-12 leading-relaxed">
          Pide desde tu mesa sin filas ni esperas
        </p>
        <div className="space-y-4 w-full">
          <Button className="w-full" onClick={() => navigate('/login')}>Iniciar sesión</Button>
          <Button variant="outline" className="w-full" onClick={() => navigate('/registro')}>Registrarse</Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate('/invitado')}>Continuar como invitado</Button>
        </div>
        <div className="mt-12 flex gap-4 justify-center text-xs text-gray-text">
          <button onClick={() => navigate('/login?rol=staff')} className="hover:text-gold">Staff</button>
          <span>·</span>
          <button onClick={() => navigate('/login?rol=admin')} className="hover:text-gold">Admin</button>
        </div>
      </motion.div>
    </div>
  );
}
