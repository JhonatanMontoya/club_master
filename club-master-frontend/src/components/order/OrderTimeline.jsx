import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';

const ESTADOS = [
  { key: 'recibido', label: 'Recibido' },
  { key: 'en_preparacion', label: 'En preparación' },
  { key: 'listo', label: 'Listo' },
  { key: 'en_camino', label: 'En camino' },
  { key: 'entregado', label: 'Entregado' },
];

export default function OrderTimeline({ current = 'recibido' }) {
  const currentIdx = ESTADOS.findIndex((e) => e.key === current);

  return (
    <div className="space-y-0">
      {ESTADOS.map((estado, idx) => {
        const done = idx <= currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={estado.key} className="flex gap-4">
            <div className="flex flex-col items-center">
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                  done ? 'gold-gradient border-gold text-black' : 'border-gold/30 text-gray-text'
                }`}
                animate={active ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: active ? Infinity : 0, duration: 1.5 }}
              >
                {done ? <FiCheck /> : <span className="text-xs">{idx + 1}</span>}
              </motion.div>
              {idx < ESTADOS.length - 1 && (
                <div className={`w-0.5 h-12 ${done ? 'bg-gold' : 'bg-gold/20'}`} />
              )}
            </div>
            <div className="pb-8 pt-2">
              <p className={`font-medium ${active ? 'text-gold' : done ? 'text-white' : 'text-gray-text'}`}>
                {estado.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
