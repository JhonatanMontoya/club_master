import { useCallback, useEffect, useState } from 'react';
import { FiLogOut, FiUser } from 'react-icons/fi';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { apiGet, apiPatch } from '../../services/api';

export default function MesaSesionesPanel({ onUpdate }) {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await apiGet('/mesas/sesiones');
      setSesiones(data);
      onUpdate?.(data);
    } finally {
      setLoading(false);
    }
  }, [onUpdate]);

  useEffect(() => {
    load();
    const i = setInterval(load, 8000);
    return () => clearInterval(i);
  }, [load]);

  const cerrar = async (id, nombre) => {
    if (!window.confirm(`¿Cerrar la sesión de ${nombre} y liberar la mesa?`)) return;
    await apiPatch(`/mesas/sesiones/${id}/cerrar`);
    load();
  };

  const activas = sesiones.filter((s) => s.estado === 'activa');
  const enMesa = sesiones.filter((s) => s.estado === 'pendiente');

  if (loading || (!activas.length && !enMesa.length)) return null;

  return (
    <div className="space-y-4 mb-8">
      {enMesa.length > 0 && (
        <Card className="!p-4 border border-gold/20">
          <div className="flex items-center gap-2 mb-3">
            <FiUser className="text-gold" />
            <h3 className="font-semibold text-white text-sm">Clientes en mesa (navegando menú)</h3>
            <Badge color="gold">{enMesa.length}</Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            {enMesa.map((s) => (
              <span key={s.id} className="text-xs bg-black-secondary px-3 py-1.5 rounded-full text-gray-text">
                {s.nombre_cliente} · Mesa #{s.mesa_numero}
              </span>
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
                  <FiLogOut className="inline mr-1" /> Cerrar sesión
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
