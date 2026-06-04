import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [activePedido, setActivePedido] = useState(null);

  const addItem = (producto) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === producto.id);
      if (existing) {
        return prev.map((i) => i.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const removeItem = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const updateQty = (id, cantidad) => {
    if (cantidad <= 0) return removeItem(id);
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, cantidad } : i));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const itemCount = items.reduce((s, i) => s + i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, total, itemCount, activePedido, setActivePedido }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
