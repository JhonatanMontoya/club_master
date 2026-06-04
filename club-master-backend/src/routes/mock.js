import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';

export const mockRouter = Router();

const MOCK_USERS = [
  { id: 1, nombre: 'Admin CLUB MASTER', email: 'admin@clubmaster.com', password: 'admin123', rol: 'admin' },
  { id: 2, nombre: 'Staff Operativo', email: 'staff@clubmaster.com', password: 'staff123', rol: 'staff' },
  { id: 3, nombre: 'Cliente Demo', email: 'cliente@clubmaster.com', password: 'cliente123', rol: 'cliente' },
];

const MOCK_CATEGORIAS = [
  { id: 1, nombre: 'Licores', slug: 'licores', icono: 'wine' },
  { id: 2, nombre: 'Cervezas', slug: 'cervezas', icono: 'beer' },
  { id: 3, nombre: 'Cócteles', slug: 'cocteles', icono: 'cocktail' },
  { id: 4, nombre: 'Combos', slug: 'combos', icono: 'combo' },
  { id: 5, nombre: 'Snacks', slug: 'snacks', icono: 'snack' },
];

const MOCK_PRODUCTOS = [
  { id: 1, categoria_id: 1, categoria_slug: 'licores', nombre: 'Whisky Premium 750ml', descripcion: 'Whisky añejo importado', precio: 185000, imagen_url: 'https://images.unsplash.com/photo-1527281400683-1aae7261f267?w=400', destacado: 1 },
  { id: 2, categoria_id: 1, categoria_slug: 'licores', nombre: 'Ron Añejo', descripcion: 'Ron premium caribeño', precio: 95000, imagen_url: 'https://images.unsplash.com/photo-1569529465841-df964c2270a8?w=400', destacado: 1 },
  { id: 3, categoria_id: 2, categoria_slug: 'cervezas', nombre: 'Cerveza Artesanal IPA', descripcion: 'Cerveza artesanal local', precio: 18000, imagen_url: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', destacado: 1 },
  { id: 4, categoria_id: 3, categoria_slug: 'cocteles', nombre: 'Mojito Clásico', descripcion: 'Ron, menta, lima y soda', precio: 28000, imagen_url: 'https://images.unsplash.com/photo-1551538827-9c037cb64129?w=400', destacado: 1 },
  { id: 5, categoria_id: 3, categoria_slug: 'cocteles', nombre: 'Margarita', descripcion: 'Tequila, triple sec y lima', precio: 32000, imagen_url: 'https://images.unsplash.com/photo-1556855810-ac404aa91e71?w=400', destacado: 1 },
  { id: 6, categoria_id: 4, categoria_slug: 'combos', nombre: 'Combo Amigos', descripcion: 'Botella + 4 cervezas + snacks', precio: 250000, imagen_url: 'https://images.unsplash.com/photo-1514362545857-3bc16a4b7d9e?w=400', destacado: 1 },
  { id: 7, categoria_id: 5, categoria_slug: 'snacks', nombre: 'Alitas BBQ', descripcion: '12 alitas con salsa BBQ', precio: 35000, imagen_url: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400', destacado: 1 },
];

const MOCK_MESAS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  numero: i + 1,
  codigo_qr: `MESA-${String(i + 1).padStart(3, '0')}`,
  capacidad: 4,
  zona: i < 3 ? 'VIP' : 'General',
  estado: [2, 4, 9, 12].includes(i + 1) ? 'ocupada' : 'disponible',
}));

const MOCK_ESTADOS = [
  { id: 1, nombre: 'recibido', orden: 1, color: '#D4AF37' },
  { id: 2, nombre: 'en_preparacion', orden: 2, color: '#F4C542' },
  { id: 3, nombre: 'listo', orden: 3, color: '#4CAF50' },
  { id: 4, nombre: 'en_camino', orden: 4, color: '#2196F3' },
  { id: 5, nombre: 'entregado', orden: 5, color: '#FFFFFF' },
];

const MOCK_METODOS = [
  { id: 1, nombre: 'QR', codigo: 'qr' },
  { id: 2, nombre: 'Tarjeta', codigo: 'tarjeta' },
  { id: 3, nombre: 'Efectivo', codigo: 'efectivo' },
  { id: 4, nombre: 'Pago al final', codigo: 'pago_final' },
];

let mockPedidos = [
  { id: 1, mesa_numero: 12, nombre_cliente: 'Juan Pérez', total: 213000, estado: 'en_preparacion', estado_color: '#F4C542', created_at: new Date().toISOString(), detalle: [{ cantidad: 2, nombre: 'Mojito Clásico' }, { cantidad: 1, nombre: 'Alitas BBQ' }] },
  { id: 2, mesa_numero: 4, nombre_cliente: 'María López', total: 185000, estado: 'recibido', estado_color: '#D4AF37', created_at: new Date().toISOString(), detalle: [{ cantidad: 1, nombre: 'Whisky Premium 750ml' }] },
];

function signMock(user) {
  return jwt.sign({ id: user.id, email: user.email, rol: user.rol, nombre: user.nombre }, JWT_SECRET, { expiresIn: '7d' });
}

mockRouter.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = MOCK_USERS.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ message: 'Credenciales inválidas' });
  const { password: _, ...safe } = user;
  res.json({ token: signMock(user), user: safe });
});

mockRouter.post('/auth/register', (req, res) => {
  const { nombre, email, telefono } = req.body;
  const user = { id: Date.now(), nombre, email, telefono, rol: 'cliente' };
  res.status(201).json({ token: signMock(user), user });
});

mockRouter.post('/auth/guest', (req, res) => {
  const user = { id: Date.now(), nombre: req.body.nombre, email: null, rol: 'cliente' };
  res.status(201).json({ token: signMock(user), user });
});

mockRouter.get('/categorias', (_req, res) => res.json(MOCK_CATEGORIAS));
mockRouter.get('/productos', (req, res) => {
  let list = [...MOCK_PRODUCTOS];
  if (req.query.categoria) list = list.filter((p) => p.categoria_slug === req.query.categoria);
  if (req.query.destacado === '1') list = list.filter((p) => p.destacado);
  res.json(list);
});
mockRouter.get('/mesas', (_req, res) => res.json(MOCK_MESAS));
mockRouter.get('/mesas/codigo/:codigo', (req, res) => {
  const mesa = MOCK_MESAS.find((m) => m.codigo_qr === req.params.codigo || String(m.numero) === req.params.codigo);
  if (!mesa) return res.status(404).json({ message: 'Mesa no encontrada' });
  res.json(mesa);
});
mockRouter.get('/promociones', (_req, res) => res.json([
  { id: 1, titulo: 'Happy Hour VIP', descripcion: '20% en cócteles de 6pm a 8pm', descuento_porcentaje: 20, imagen_url: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800' },
]));
mockRouter.get('/estados-pedido', (_req, res) => res.json(MOCK_ESTADOS));
mockRouter.get('/metodos-pago', (_req, res) => res.json(MOCK_METODOS));
mockRouter.get('/pedidos/staff', (_req, res) => res.json(mockPedidos));
mockRouter.patch('/pedidos/:id/estado', (req, res) => {
  const pedido = mockPedidos.find((p) => p.id === Number(req.params.id));
  if (pedido) pedido.estado = req.body.estado;
  res.json({ message: 'Estado actualizado' });
});
mockRouter.post('/pedidos', (req, res) => {
  const id = mockPedidos.length + 1;
  const total = req.body.items?.reduce((s, i) => {
    const p = MOCK_PRODUCTOS.find((pr) => pr.id === i.producto_id);
    return s + (p?.precio || 0) * (i.cantidad || 1);
  }, 0) || 0;
  const pedido = { id, mesa_numero: req.body.mesa_id, nombre_cliente: req.body.nombre_cliente || 'Cliente', total, estado: 'recibido', estado_color: '#D4AF37', created_at: new Date().toISOString(), detalle: [] };
  mockPedidos.push(pedido);
  res.status(201).json({ id, total });
});
mockRouter.get('/admin/dashboard', (_req, res) => {
  res.json({
    stats: { ventasHoy: 2450000, pedidosHoy: 38, mesasOcupadas: 4, clientes: 156 },
    ventasMensuales: [
      { mes: '2026-01', total: 12000000 }, { mes: '2026-02', total: 14500000 },
      { mes: '2026-03', total: 13200000 }, { mes: '2026-04', total: 16800000 },
      { mes: '2026-05', total: 18900000 }, { mes: '2026-06', total: 2100000 },
    ],
    productosTop: [
      { nombre: 'Mojito Clásico', cantidad: 145, total: 4060000 },
      { nombre: 'Cerveza Artesanal IPA', cantidad: 230, total: 4140000 },
      { nombre: 'Combo Amigos', cantidad: 42, total: 10500000 },
      { nombre: 'Whisky Premium 750ml', cantidad: 28, total: 5180000 },
      { nombre: 'Alitas BBQ', cantidad: 89, total: 3115000 },
    ],
    metodosPago: [
      { nombre: 'QR', cantidad: 120, total: 8500000 },
      { nombre: 'Tarjeta', cantidad: 85, total: 6200000 },
      { nombre: 'Efectivo', cantidad: 45, total: 2800000 },
      { nombre: 'Pago al final', cantidad: 30, total: 1900000 },
    ],
  });
});
