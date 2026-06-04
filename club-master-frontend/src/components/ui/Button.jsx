import { motion } from 'framer-motion';

const variants = {
  primary: 'gold-gradient text-black font-semibold hover:opacity-90',
  secondary: 'bg-black-secondary border border-gold/40 text-gold hover:border-gold',
  ghost: 'bg-transparent text-gray-text hover:text-white',
  danger: 'bg-red-900/50 border border-red-500/50 text-red-300',
  outline: 'border-2 border-gold text-gold hover:bg-gold/10',
};

export default function Button({
  children, variant = 'primary', className = '', loading = false, disabled, ...props
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={`px-6 py-3 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? 'Cargando...' : children}
    </motion.button>
  );
}
