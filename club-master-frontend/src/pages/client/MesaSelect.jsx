import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHash, FiGrid } from 'react-icons/fi';
import { LuQrCode } from 'react-icons/lu';
import Logo from '../../components/ui/Logo';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { apiGet, getMesaByCodigo } from '../../services/api';

export default function MesaSelect() {
  const [tab, setTab] = useState('codigo');
  const [codigo, setCodigo] = useState('');
  const [mesas, setMesas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { requestMesaSession, mesaSesion } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (mesaSesion && ['pendiente', 'activa'].includes(mesaSesion.estado)) {
      navigate('/cliente', { replace: true });
    }
  }, [mesaSesion, navigate]);

  const loadMesas = async () => {
    const data = await apiGet('/mesas');
    setMesas(data);
    setTab('lista');
  };

  const buscarCodigo = async () => {
    try {
      const mesa = await getMesaByCodigo(codigo);
      setSelected(mesa);
      setError('');
    } catch {
      setError('Mesa no encontrada');
    }
  };

  const confirmar = async () => {
    if (!selected) return;
    setError('');
    setLoading(true);
    try {
      await requestMesaSession(selected);
      navigate('/cliente');
    } catch (e) {
      setError(e.response?.data?.message || 'No se pudo registrar la mesa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black px-6 py-12">
      <Logo className="mb-8" />
      <h2 className="text-2xl font-bold text-white mb-2">Selecciona tu mesa</h2>
      <p className="text-gray-text text-sm mb-6">
        Podrás ver el menú de inmediato. Al confirmar tu pedido, el mesero lo aprobará.
      </p>
      {mesaSesion && ['pendiente', 'activa'].includes(mesaSesion.estado) && (
        <Card className="mb-6 border border-gold/30">
          <p className="text-gold text-sm">Mesa #{mesaSesion.mesa_numero} registrada.</p>
          <Button className="w-full mt-3" onClick={() => navigate('/cliente')}>Ir al menú</Button>
        </Card>
      )}

      <div className="flex gap-2 mb-6">
        {[
          { id: 'qr', icon: LuQrCode, label: 'Escanear QR' },
          { id: 'codigo', icon: FiHash, label: 'Código' },
          { id: 'lista', icon: FiGrid, label: 'Seleccionar' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => id === 'lista' ? loadMesas() : setTab(id)}
            className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border text-sm ${
              tab === id ? 'border-gold bg-gold/10 text-gold' : 'border-gold/20 text-gray-text'
            }`}
          >
            <Icon className="text-xl" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'qr' && (
        <Card className="text-center py-12">
          <LuQrCode className="text-6xl text-gold mx-auto mb-4" />
          <p className="text-gray-text">Escanea el código QR de tu mesa</p>
          <p className="text-gray-text text-sm mt-2">(Simulación: usa código MESA-012)</p>
          <Input className="mt-4" placeholder="MESA-012" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          <Button className="mt-4" onClick={buscarCodigo}>Buscar</Button>
        </Card>
      )}

      {tab === 'codigo' && (
        <Card>
          <Input label="Código de mesa" placeholder="Ej: 12 o MESA-012" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
          <Button className="mt-4 w-full" onClick={buscarCodigo}>Buscar mesa</Button>
        </Card>
      )}

      {tab === 'lista' && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {mesas.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              className={`p-4 rounded-xl border text-center transition-all ${
                selected?.id === m.id ? 'border-gold gold-gradient text-black' :
                m.sesion?.estado === 'pendiente' ? 'border-amber-500/40 text-amber-300' :
                m.sesion?.estado === 'activa' ? 'border-red-500/40 text-red-400' :
                m.estado === 'ocupada' ? 'border-red-500/30 text-red-400' : 'border-gold/20 text-white hover:border-gold'
              }`}
            >
              <span className="text-2xl font-bold">{m.numero}</span>
              <p className="text-xs mt-1 opacity-70">
                {m.sesion?.estado === 'pendiente' ? 'pendiente' : m.sesion?.estado === 'activa' ? 'en uso' : m.estado}
              </p>
            </button>
          ))}
        </div>
      )}

      {selected && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
          <Card className="text-center gold-glow">
            <p className="text-gray-text">Estás en la mesa</p>
            <p className="text-4xl font-bold text-gold mt-2">#{selected.numero}</p>
            <p className="text-gray-text text-sm mt-1">Zona: {selected.zona}</p>
          </Card>
          <Button className="w-full mt-4" onClick={confirmar} disabled={loading}>
            {loading ? 'Registrando…' : 'Entrar al menú'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
