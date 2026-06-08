import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { apiGet, getPromociones } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { getProductImageUrl } from '../../utils/productImage';

const CAT_ICONS = { licores: '🥃', cervezas: '🍺', cocteles: '🍹', combos: '🎉', snacks: '🍟', refrescos: '🥤' };

export default function ClientHome() {
  const { user, mesa } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [promos, setPromos] = useState([]);
  const [catActiva, setCatActiva] = useState(null);

  useEffect(() => {
    apiGet('/productos/categorias').then(setCategorias);
    apiGet('/productos', { params: { destacado: '1' } }).then(setProductos);
    getPromociones().then(setPromos);
  }, []);

  const filtrar = async (slug) => {
    setCatActiva(slug);
    const data = await apiGet('/productos', { params: { categoria: slug } });
    setProductos(data);
  };

  const abrirPromo = (promo) => {
    if (promo.tipo === '2x1') {
      filtrar('cocteles');
      return;
    }
    navigate('/cliente/productos');
  };

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <p className="text-gray-text text-sm">Bienvenido</p>
        <h1 className="text-2xl font-bold text-white">{user?.nombre}</h1>
        <p className="text-gold text-sm">CLUB MASTER · Mesa #{mesa?.numero}</p>
      </div>

      {promos.length > 0 && (
        <div className="space-y-3 mb-6">
          {promos.map((promo, idx) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="relative rounded-2xl overflow-hidden h-36 cursor-pointer border border-gold/20"
              onClick={() => abrirPromo(promo)}
            >
              <img src={getProductImageUrl({ imagen_url: promo.imagen_url })} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/70 to-transparent flex items-center p-6">
                <div className="flex items-center gap-4">
                  {promo.tipo === '2x1' ? (
                    <span className="flex-shrink-0 w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center text-black font-black text-xl shadow-lg">
                      2x1
                    </span>
                  ) : (
                    <span className="flex-shrink-0 w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center text-black font-black text-lg shadow-lg">
                      -{promo.descuento_porcentaje}%
                    </span>
                  )}
                  <div>
                    <span className="text-gold text-xs font-bold tracking-wide">
                      {idx === 0 ? 'PROMOCIÓN DESTACADA' : 'TAMBIÉN DISPONIBLE'}
                    </span>
                    <h3 className="text-white font-bold text-lg">{promo.titulo}</h3>
                    <p className="text-gray-text text-sm line-clamp-2">{promo.descripcion}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        <button
          onClick={() => { setCatActiva(null); apiGet('/productos', { params: { destacado: '1' } }).then(setProductos); }}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm ${!catActiva ? 'gold-gradient text-black' : 'bg-black-secondary text-gray-text'}`}
        >
          Destacados
        </button>
        {categorias.map((c) => (
          <button
            key={c.slug}
            onClick={() => filtrar(c.slug)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm flex items-center gap-2 ${
              catActiva === c.slug ? 'gold-gradient text-black' : 'bg-black-secondary text-gray-text'
            }`}
          >
            <span>{CAT_ICONS[c.slug]}</span> {c.nombre}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          {catActiva ? categorias.find((c) => c.slug === catActiva)?.nombre : 'Productos destacados'}
        </h2>
        <button onClick={() => navigate('/cliente/productos')} className="text-gold text-sm flex items-center gap-1">
          <FiSearch /> Ver todos
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {productos.map((p, i) => (
          <ProductCard key={p.id} producto={p} onAdd={addItem} index={i} />
        ))}
      </div>
    </div>
  );
}
