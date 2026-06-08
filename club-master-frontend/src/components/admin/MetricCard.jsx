import { motion } from 'framer-motion';

export default function MetricCard({ label, value, sub, icon: Icon, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-2xl p-5 border relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${color}18 0%, ${color}08 100%)`,
        borderColor: `${color}44`,
      }}
    >
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-30" style={{ background: color }} />
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-sm font-medium" style={{ color }}>{label}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-text mt-1">{sub}</p>}
        </div>
        {Icon && (
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${color}33` }}>
            <Icon className="text-xl" style={{ color }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}
