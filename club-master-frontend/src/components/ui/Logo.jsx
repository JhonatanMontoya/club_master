import { motion } from 'framer-motion';

const sizes = {
  sm: 'h-12',
  md: 'h-20',
  lg: 'h-32',
  xl: 'h-48 sm:h-56',
};

export default function Logo({ size = 'lg', className = '' }) {
  return (
    <motion.div
      className={`flex justify-center ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <img
        src="/logo-club-master.png"
        alt="CLUB MASTER — Gestiona, vende y brilla"
        className={`${sizes[size]} w-auto max-w-full object-contain`}
        draggable={false}
      />
    </motion.div>
  );
}
