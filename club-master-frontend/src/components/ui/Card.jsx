import { motion } from 'framer-motion';

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <motion.div
      className={`glass-card rounded-2xl p-5 ${hover ? 'hover:border-gold/40 transition-colors cursor-pointer' : ''} ${className}`}
      whileHover={hover ? { y: -2 } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
}
