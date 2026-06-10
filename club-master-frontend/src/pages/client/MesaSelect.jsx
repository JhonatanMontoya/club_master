import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHash, FiGrid, FiRefreshCw } from 'react-icons/fi';
import { LuQrCode } from 'react-icons/lu';
import Logo from '../../components/ui/Logo';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useAuth } from '../../context/AuthContext';
import { apiGet, getMesaByCodigo } from '../../services/api';

function mesaSeleccionable(m) {
  if (!m) return false;
  if (m.sesion?.estado === 'activa' || m.sesion?.estado === 'pendiente') return false;
  return true;
}

export default function MesaSelect() {
  const [tab, setTab] = useState('lista');
  const [codigo, setCodigo] = useState('');
  const [mesas, setMesas] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [loadingMesas, setLoadingMesas] = useState(true);
  const [loading, setLoading] = useState(false);
  const { requestMesaSession, mesaSesion } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (mesaSesion && ['pendiente', 'activa'].includes(mesaSesion.estado)) {
      navigate('/cliente', { replace: true });
    }
  }, [mesaSesion, navigate]);

  const loadMesas = useCallback(async () => {
    setLoadingMesas(true);
    setLoadError('');
    try {
      const data = await apiGet('/mesas');
      if (!Array.isArray(data)) {
        throw new Error('Respuesta inválida del servidor');
      }
      setMesas(data);
    } catch (e) {
      setMesas([]);
      const msg = e.response?.data?.message || e.message;
      if (msg?.includes('max_user_connections')) {
        setLoadError('El servidor está ocupado. Espera unos segundos y pulsa Reintentar.');
      } else if (!e.response) {
        setLoadError('No se pudo conectar con el servidor. Verifica que el backend esté activo.');
      } else {
        setLoadError(msg || 'No se pudieron cargar las mesas');
      }
    } finally {
      setLoadingMesas(false);
    }
  }, []);

  useEffect(() => {
    loadMesas();
  }, [loadMesas]);

  const disponibles = mesas.filter(mesaSeleccionable);

  const buscarCodigo = async () => {
    if (!codigo.trim()) {
      setError('Ingresa un código de mesa');
      return;
    }
    setError('');
    try {
      const mesa = await getMesaByCodigo(codigo.trim());
      if (!mesaSeleccionable(mesa)) {
        setError('Esta mesa ya tiene un cliente registrado. Elige otra.');
        setSelected(null);
        return;
      }
      setSelected(mesa);
    } catch {
      setError('Mesa no encontrada');
      setSelected(null);
    }
  };

  const elegirMesa = (m) => {
    if (!mesaSeleccionable(m)) {
      setError('Esta mesa no está disponible en este momento.');
      return;
    }
    setError('');
    setSelected(m);
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
          { id: 'lista', icon: FiGrid, label: 'Seleccionar' },
          { id: 'codigo', icon: FiHash, label: 'Código' },
          { id: 'qr', icon: LuQrCode, label: 'QR' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
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
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-text text-sm">
              {loadingMesas ? 'Cargando mesas…' : `${disponibles.length} disponible(s) de ${mesas.length}`}
            </p>
            <button
              type="button"
              onClick={loadMesas}
              disabled={loadingMesas}
              className="flex items-center gap-1 text-gold text-sm hover:underline disabled:opacity-50"
            >
              <FiRefreshCw className={loadingMesas ? 'animate-spin' : ''} />
              Reintentar
            </button>
          </div>

          {loadError && (
            <Card className="mb-4 border border-red-500/40">
              <p className="text-red-400 text-sm">{loadError}</p>
              <Button variant="outline" className="w-full mt-3" onClick={loadMesas}>Reintentar</Button>
            </Card>
          )}

          {loadingMesas && (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-2 border-gold border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loadingMesas && !loadError && mesas.length === 0 && (
            <Card className="text-center py-8">
              <p className="text-gray-text">No hay mesas registradas en el sistema.</p>
            </Card>
          )}

          {!loadingMesas && mesas.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {mesas.map((m) => {
                const libre = mesaSeleccionable(m);
                return (
                  <button
                    key={m.id}
                    type="button"
                    disabled={!libre}
                    onClick={() => elegirMesa(m)}
                    className={`p-4 rounded-xl border text-center transition-all ${
                      selected?.id === m.id ? 'border-gold gold-gradient text-black' :
                      !libre ? 'border-red-500/30 text-red-400/60 cursor-not-allowed opacity-60' :
                      m.estado === 'disponible' ? 'border-green-500/40 text-white hover:border-gold' :
                      'border-gold/20 text-white hover:border-gold'
                    }`}
                  >
                    <span className="text-2xl font-bold">{m.numero}</span>
                    <p className="text-xs mt-1 opacity-70">
                      {!libre ? 'no disponible' : m.estado === 'disponible' ? 'disponible' : m.estado}
                    </p>
                    {m.zona && <p className="text-[10px] opacity-50">{m.zona}</p>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {error && tab === 'lista' && <p className="text-red-400 text-sm mt-4">{error}</p>}

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
