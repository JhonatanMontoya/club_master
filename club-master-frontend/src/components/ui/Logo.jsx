import { motion } from 'framer-motion';
import { useSiteConfig } from '../../context/SiteConfigContext';
import { DEFAULT_SITE_CONFIG } from '../../utils/siteConfig';

const sizes = {
  sm: 'h-12',
  md: 'h-20',
  lg: 'h-32',
  xl: 'h-48 sm:h-56',
};

export default function Logo({ size = 'lg', className = '' }) {
  const { logoUrl, config } = useSiteConfig() || {};
  const src = logoUrl || DEFAULT_SITE_CONFIG.logo_url;
  const alt = `${config?.negocio || 'CLUB MASTER'} — ${config?.slogan || ''}`;

  return (
    <motion.div
      className={`flex justify-center ${className}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <img
        src={src}
        alt={alt}
        className={`${sizes[size]} w-auto max-w-full object-contain`}
        draggable={false}
      />
    </motion.div>
  );
}
