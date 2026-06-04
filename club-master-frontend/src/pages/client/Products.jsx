import { useEffect, useState } from 'react';
import { apiGet } from '../../services/api';
import { useCart } from '../../context/CartContext';
import ProductCard from '../../components/product/ProductCard';

export default function Products() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    apiGet('/productos').then(setProductos);
    apiGet('/productos/categorias').then(setCategorias);
  }, []);

  const filtrar = async (slug) => {
    setFiltro(slug);
    const data = slug ? await apiGet('/productos', { params: { categoria: slug } }) : await apiGet('/productos');
    setProductos(data);
  };

  return (
    <div className="px-4 py-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Menú</h1>
      <div className="flex gap-2 overflow-x-auto mb-6">
        <button onClick={() => filtrar('')} className={`px-4 py-2 rounded-full text-sm ${!filtro ? 'gold-gradient text-black' : 'bg-black-secondary text-gray-text'}`}>Todos</button>
        {categorias.map((c) => (
          <button key={c.slug} onClick={() => filtrar(c.slug)} className={`px-4 py-2 rounded-full text-sm flex-shrink-0 ${filtro === c.slug ? 'gold-gradient text-black' : 'bg-black-secondary text-gray-text'}`}>{c.nombre}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {productos.map((p, i) => <ProductCard key={p.id} producto={p} onAdd={addItem} index={i} />)}
      </div>
    </div>
  );
}
