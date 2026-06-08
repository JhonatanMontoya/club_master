import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import Card from '../ui/Card';
import { formatCOP } from '../../utils/format';
import { getProductImageUrl } from '../../utils/productImage';

export default function ProductCard({ producto, onAdd, index = 0 }) {
  const [imgSrc, setImgSrc] = useState(() => getProductImageUrl(producto));

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card hover className="overflow-hidden p-0">
        <div className="relative h-40 overflow-hidden bg-black-secondary">
          <img
            src={imgSrc}
            alt={producto.nombre}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgSrc('/products/default.svg')}
          />
          {producto.destacado && (
            <span className="absolute top-3 left-3 gold-gradient text-black text-xs font-bold px-2 py-1 rounded-full">
              Destacado
            </span>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-white">{producto.nombre}</h3>
          <p className="text-gray-text text-sm mt-1 line-clamp-2">{producto.descripcion}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-gold font-bold">{formatCOP(producto.precio)}</span>
            <button
              onClick={() => onAdd(producto)}
              className="w-9 h-9 rounded-full gold-gradient flex items-center justify-center text-black hover:opacity-90"
            >
              <FiPlus />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
