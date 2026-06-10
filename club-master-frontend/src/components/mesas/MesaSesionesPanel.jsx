import { useCallback, useEffect, useState } from 'react';
import { FiCheck, FiLogOut, FiUser } from 'react-icons/fi';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { apiGet, apiPatch } from '../../services/api';

function parseError(e) {
  return e.response?.data?.message || e.message || 'Error de conexión';
}

export default function MesaSesionesPanel({ onUpdate }) {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const data = await apiGet('/mesas/sesiones');
      setSesiones(Array.isArray(data) ? data : []);
      onUpdate?.(data);
    } catch (e) {
      setError(parseError(e));
      setSesiones([]);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  useEffect(() => {
    load();
    const i = setInterval(load, 8000);
    return () => clearInterval(i);
  }, [load]);

  const confirmar = async (id) => {
    setActionError('');
    try {
      await apiPatch(`/mesas/sesiones/${id}/confirmar`, {});
      await load();
    } catch (e) {
      setActionError(parseError(e));
    }
  };

  const cerrar = async (id, nombre) => {
    if (!window.confirm(`¿Cerrar la sesión de ${nombre} y liberar la mesa?`)) return;
    setActionError('');
    try {
      await apiPatch(`/mesas/sesiones/${id}/cerrar`, {});
      await load();
    } catch (e) {
      setActionError(parseError(e));
    }
  };

  const activas = sesiones.filter((s) => s.estado === 'activa');
  const enMesa = sesiones.filter((s) => s.estado === 'pendiente');

  if (loading) {
    return (
      <Card className="mb-6 !p-4">
        <p className="text-gray-text text-sm">Cargando sesiones de mesa…</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mb-8">
      {error && (
        <Card className="!p-4 border border-red-500/40">
          <p className="text-red-400 text-sm">{error}</p>
          <Button variant="outline" className="mt-2 !py-2 text-sm" onClick={load}>Reintentar</Button>
        </Card>
      )}

      {actionError && (
        <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2">{actionError}</p>
      )}

      {!error && !activas.length && !enMesa.length && (
        <Card className="!p-4 border border-gold/10">
          <p className="text-gray-text text-sm">No hay clientes con sesión activa en mesas.</p>
        </Card>
      )}

      {enMesa.length > 0 && (
        <Card className="!p-4 border border-gold/20">
          <div className="flex items-center gap-2 mb-3">
            <FiUser className="text-gold" />
            <h3 className="font-semibold text-white text-sm">Clientes en mesa (navegando menú)</h3>
            <Badge color="gold">{enMesa.length}</Badge>
          </div>
          <div className="space-y-3">
            {enMesa.map((s) => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/50 rounded-xl p-3 border border-gold/20">
                <div>
                  <p className="text-white font-medium text-sm">{s.nombre_cliente}</p>
                  <p className="text-gold text-xs">Mesa #{s.mesa_numero}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button className="!py-2 !px-3 text-xs" onClick={() => confirmar(s.id)}>
                    <FiCheck className="inline mr-1" /> Confirmar
                  </Button>
                  <Button variant="outline" className="!py-2 !px-3 text-xs" onClick={() => cerrar(s.id, s.nombre_cliente)}>
                    <FiLogOut className="inline mr-1" /> Liberar mesa
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activas.length > 0 && (
        <Card className="!p-4">
          <div className="flex items-center gap-2 mb-4">
            <FiUser className="text-green-400" />
            <h3 className="font-semibold text-white">Sesiones activas</h3>
            <Badge color="green">{activas.length}</Badge>
          </div>
          <div className="space-y-3">
            {activas.map((s) => (
              <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-black/50 rounded-xl p-4 border border-green-500/20">
                <div>
                  <p className="text-white font-medium">{s.nombre_cliente}</p>
                  <p className="text-gold text-sm">Mesa #{s.mesa_numero}</p>
                </div>
                <Button variant="outline" className="!py-2 !px-4 text-sm" onClick={() => cerrar(s.id, s.nombre_cliente)}>
                  <FiLogOut className="inline mr-1" /> Liberar mesa
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
