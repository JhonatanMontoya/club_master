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
  const isDisabled = disabled || loading;

  return (
    <motion.button
      whileHover={isDisabled ? undefined : { scale: 1.05 }}
      whileTap={isDisabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`px-6 py-3 rounded-xl transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${variants[variant]} ${className}`}
      disabled={isDisabled}
      {...props}
    >
      {loading ? 'Cargando...' : children}
    </motion.button>
  );
}
