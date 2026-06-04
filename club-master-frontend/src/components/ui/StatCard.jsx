import { motion } from 'framer-motion';
import Card from './Card';

export default function StatCard({ icon: Icon, label, value, trend, delay = 0 }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="gold-glow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-gray-text text-sm">{label}</p>
            <p className="text-2xl font-bold text-white mt-1">{value}</p>
            {trend && <p className="text-gold text-xs mt-1">{trend}</p>}
          </div>
          {Icon && (
            <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center">
              <Icon className="text-black text-xl" />
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
