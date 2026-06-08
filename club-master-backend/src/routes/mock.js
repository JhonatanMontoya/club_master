import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/jwt.js';
import {
  MOCK_CATEGORIAS, MOCK_PRODUCTOS, MOCK_INVENTARIO, MOCK_MOVIMIENTOS,
  MOCK_PROMOCIONES, MOCK_RESERVAS, MOCK_USUARIOS, MOCK_PEDIDOS, MOCK_PAGOS,
  MOCK_CONFIG, MOCK_MESAS, MOCK_MESA_SESIONES, enrichProducto, nextId,
} from './mockData.js';

export const mockRouter = Router();

const MOCK_USERS_AUTH = [
  { id: 1, nombre: 'Admin CLUB MASTER', email: 'admin@clubmaster.com', password: 'admin123', rol: 'admin' },
  { id: 2, nombre: 'Staff Operativo', email: 'staff@clubmaster.com', password: 'staff123', rol: 'staff' },
  { id: 3, nombre: 'Cliente Demo', email: 'cliente@clubmaster.com', password: 'cliente123', rol: 'cliente' },
];

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

function signMock(user) {
  return jwt.sign({ id: user.id, email: user.email, rol: user.rol, nombre: user.nombre }, JWT_SECRET, { expiresIn: '7d' });
}

function getMockUser(req) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return null;
    return jwt.verify(header.split(' ')[1], JWT_SECRET);
  } catch {
    return null;
  }
}

function sesionActivaEnMesa(mesaId) {
  return MOCK_MESA_SESIONES.find((s) => s.mesa_id === mesaId && ['pendiente', 'activa'].includes(s.estado));
}

function liberarMesaSiCorresponde(mesaId, sesionId) {
  const mesa = MOCK_MESAS.find((m) => m.id === mesaId);
  if (!mesa) return;
  const otra = MOCK_MESA_SESIONES.find(
    (s) => s.mesa_id === mesaId && s.id !== sesionId && ['pendiente', 'activa'].includes(s.estado)
  );
  if (!otra) mesa.estado = 'disponible';
}

function enrichMesa(m) {
  const sesion = sesionActivaEnMesa(m.id);
  return {
    ...m,
    sesion: sesion
      ? { id: sesion.id, nombre_cliente: sesion.nombre_cliente, estado: sesion.estado, created_at: sesion.created_at }
      : null,
  };
}

// ─── Auth ───
mockRouter.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = MOCK_USERS_AUTH.find((u) => u.email === email && u.password === password);
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

// ─── Public catalog ───
mockRouter.get('/categorias', (_req, res) => res.json(MOCK_CATEGORIAS.filter((c) => c.activa)));
mockRouter.get('/productos', (req, res) => {
  let list = MOCK_PRODUCTOS.filter((p) => p.activo);
  if (req.query.categoria) list = list.filter((p) => p.categoria_slug === req.query.categoria);
  if (req.query.destacado === '1') list = list.filter((p) => p.destacado);
  res.json(list);
});
mockRouter.get('/mesas', (_req, res) => res.json(MOCK_MESAS.filter((m) => m.activa).map(enrichMesa)));
mockRouter.get('/mesas/codigo/:codigo', (req, res) => {
  const mesa = MOCK_MESAS.find((m) => m.activa && (m.codigo_qr === req.params.codigo || String(m.numero) === req.params.codigo));
  if (!mesa) return res.status(404).json({ message: 'Mesa no encontrada' });
  res.json(enrichMesa(mesa));
});

// ─── Sesiones de mesa (confirmación staff/admin) ───
mockRouter.get('/mesas/sesiones', (req, res) => {
  const user = getMockUser(req);
  if (!user || !['staff', 'admin'].includes(user.rol)) {
    return res.status(403).json({ message: 'Solo staff o admin' });
  }
  const list = MOCK_MESA_SESIONES
    .filter((s) => ['pendiente', 'activa'].includes(s.estado))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(list);
});

mockRouter.get('/mesas/sesiones/mi', (req, res) => {
  const user = getMockUser(req);
  if (!user) return res.status(401).json({ message: 'No autenticado' });
  const sesion = MOCK_MESA_SESIONES.find(
    (s) => s.usuario_id === user.id && ['pendiente', 'activa'].includes(s.estado)
  );
  if (!sesion) return res.json(null);
  const mesa = MOCK_MESAS.find((m) => m.id === sesion.mesa_id);
  res.json({ ...sesion, mesa: mesa ? enrichMesa(mesa) : null });
});

mockRouter.post('/mesas/sesiones', (req, res) => {
  const user = getMockUser(req);
  if (!user) return res.status(401).json({ message: 'No autenticado' });
  const mesaId = Number(req.body.mesa_id);
  const mesa = MOCK_MESAS.find((m) => m.activa && m.id === mesaId);
  if (!mesa) return res.status(404).json({ message: 'Mesa no encontrada' });

  const conflicto = MOCK_MESA_SESIONES.find(
    (s) => s.mesa_id === mesaId && ['pendiente', 'activa'].includes(s.estado) && s.usuario_id !== user.id
  );
  if (conflicto) {
    return res.status(409).json({ message: 'Esta mesa ya tiene un cliente registrado. Pide al mesero que confirme tu ubicación.' });
  }

  const existente = MOCK_MESA_SESIONES.find(
    (s) => s.usuario_id === user.id && ['pendiente', 'activa'].includes(s.estado)
  );
  if (existente) {
    const mesaExistente = MOCK_MESAS.find((m) => m.id === existente.mesa_id);
    return res.json({ ...existente, mesa: mesaExistente ? enrichMesa(mesaExistente) : null });
  }

  const sesion = {
    id: nextId(MOCK_MESA_SESIONES),
    mesa_id: mesaId,
    mesa_numero: mesa.numero,
    mesa_zona: mesa.zona,
    usuario_id: user.id,
    nombre_cliente: user.nombre,
    estado: 'pendiente',
    created_at: new Date().toISOString(),
    confirmado_at: null,
    confirmado_por: null,
    cerrado_at: null,
    cerrado_por: null,
  };
  MOCK_MESA_SESIONES.push(sesion);
  res.status(201).json({ ...sesion, mesa: enrichMesa(mesa) });
});

mockRouter.patch('/mesas/sesiones/:id/confirmar', (req, res) => {
  const user = getMockUser(req);
  if (!user || !['staff', 'admin'].includes(user.rol)) {
    return res.status(403).json({ message: 'Solo staff o admin' });
  }
  const sesion = MOCK_MESA_SESIONES.find((s) => s.id === Number(req.params.id));
  if (!sesion) return res.status(404).json({ message: 'Sesión no encontrada' });
  if (sesion.estado !== 'pendiente') return res.status(400).json({ message: 'La sesión ya fue procesada' });

  const otra = MOCK_MESA_SESIONES.find(
    (s) => s.mesa_id === sesion.mesa_id && s.id !== sesion.id && s.estado === 'activa'
  );
  if (otra) return res.status(409).json({ message: 'Ya hay un cliente activo en esta mesa' });

  sesion.estado = 'activa';
  sesion.confirmado_at = new Date().toISOString();
  sesion.confirmado_por = user.nombre;
  const mesa = MOCK_MESAS.find((m) => m.id === sesion.mesa_id);
  if (mesa) mesa.estado = 'ocupada';
  res.json(sesion);
});

mockRouter.patch('/mesas/sesiones/:id/rechazar', (req, res) => {
  const user = getMockUser(req);
  if (!user || !['staff', 'admin'].includes(user.rol)) {
    return res.status(403).json({ message: 'Solo staff o admin' });
  }
  const sesion = MOCK_MESA_SESIONES.find((s) => s.id === Number(req.params.id));
  if (!sesion) return res.status(404).json({ message: 'Sesión no encontrada' });
  if (sesion.estado !== 'pendiente') return res.status(400).json({ message: 'La sesión ya fue procesada' });

  sesion.estado = 'rechazada';
  sesion.cerrado_at = new Date().toISOString();
  sesion.cerrado_por = user.nombre;
  liberarMesaSiCorresponde(sesion.mesa_id, sesion.id);
  res.json(sesion);
});

mockRouter.patch('/mesas/sesiones/:id/cerrar', (req, res) => {
  const user = getMockUser(req);
  if (!user) return res.status(401).json({ message: 'No autenticado' });

  const sesion = MOCK_MESA_SESIONES.find((s) => s.id === Number(req.params.id));
  if (!sesion) return res.status(404).json({ message: 'Sesión no encontrada' });
  if (!['pendiente', 'activa'].includes(sesion.estado)) {
    return res.status(400).json({ message: 'La sesión ya está cerrada' });
  }

  const esStaff = ['staff', 'admin'].includes(user.rol);
  const esDueño = user.rol === 'cliente' && sesion.usuario_id === user.id;
  if (!esStaff && !esDueño) return res.status(403).json({ message: 'No autorizado' });

  sesion.estado = 'cerrada';
  sesion.cerrado_at = new Date().toISOString();
  sesion.cerrado_por = user.nombre;
  liberarMesaSiCorresponde(sesion.mesa_id, sesion.id);
  res.json(sesion);
});
mockRouter.get('/promociones', (_req, res) => res.json(MOCK_PROMOCIONES.filter((p) => p.activa)));
mockRouter.get('/estados-pedido', (_req, res) => res.json(MOCK_ESTADOS));
mockRouter.get('/metodos-pago', (_req, res) => res.json(MOCK_METODOS));

// ─── Pedidos ───
const ESTADO_COLORS = {
  pendiente_aprobacion: '#EAB308',
  recibido: '#3B82F6',
  en_preparacion: '#F97316',
  listo: '#22C55E',
  entregado: '#A78BFA',
  cancelado: '#EF4444',
};

function confirmarSesionMesaPorPedido(mesaId, staffNombre) {
  const sesion = MOCK_MESA_SESIONES.find(
    (s) => s.mesa_id === mesaId && ['pendiente', 'activa'].includes(s.estado)
  );
  if (sesion && sesion.estado === 'pendiente') {
    sesion.estado = 'activa';
    sesion.confirmado_at = new Date().toISOString();
    sesion.confirmado_por = staffNombre;
  }
  const mesa = MOCK_MESAS.find((m) => m.id === mesaId);
  if (mesa) mesa.estado = 'ocupada';
}

function precioProducto(p) {
  if (!p) return 0;
  return p.descuento_activo && p.precio_descuento ? p.precio_descuento : p.precio;
}

function buildDetalle(items = [], agregadoPorStaff = false) {
  return items.map((i) => {
    const p = MOCK_PRODUCTOS.find((pr) => pr.id === i.producto_id);
    const precio = precioProducto(p);
    const cantidad = i.cantidad || 1;
    return {
      producto_id: i.producto_id,
      nombre: p?.nombre || 'Producto',
      cantidad,
      precio_unitario: precio,
      subtotal: precio * cantidad,
      agregado_por_staff: agregadoPorStaff,
    };
  });
}

function recalcPedido(pedido) {
  pedido.detalle = pedido.detalle || [];
  pedido.detalle.forEach((d) => {
    d.subtotal = (d.precio_unitario || 0) * (d.cantidad || 1);
  });
  pedido.total = pedido.detalle.reduce((s, d) => s + (d.subtotal || 0), 0);
  return pedido;
}

function syncEstado(pedido, estado) {
  pedido.estado = estado;
  pedido.estado_color = ESTADO_COLORS[estado] || '#D4AF37';
}

mockRouter.get('/pedidos/staff', (req, res) => {
  let list = [...MOCK_PEDIDOS];
  const filtro = req.query.filtro || 'activos';
  if (filtro === 'activos') list = list.filter((p) => !['entregado', 'cancelado'].includes(p.estado));
  else if (filtro === 'pendiente_aprobacion') list = list.filter((p) => p.estado === 'pendiente_aprobacion');
  else if (filtro !== 'todos') list = list.filter((p) => p.estado === filtro);
  res.json(list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
});

mockRouter.get('/pedidos/pendientes-aprobacion', (req, res) => {
  const user = getMockUser(req);
  if (!user || !['staff', 'admin'].includes(user.rol)) {
    return res.status(403).json({ message: 'Solo staff o admin' });
  }
  const list = MOCK_PEDIDOS
    .filter((p) => p.estado === 'pendiente_aprobacion')
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  res.json(list);
});

mockRouter.get('/pedidos/:id', (req, res) => {
  const pedido = MOCK_PEDIDOS.find((p) => p.id === Number(req.params.id));
  if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
  res.json(pedido);
});

mockRouter.patch('/pedidos/:id/estado', (req, res) => {
  const pedido = MOCK_PEDIDOS.find((p) => p.id === Number(req.params.id));
  if (!pedido) return res.status(404).json({ message: 'No encontrado' });
  syncEstado(pedido, req.body.estado);
  if (req.body.estado === 'entregado') {
    const mesa = MOCK_MESAS.find((m) => m.id === pedido.mesa_id);
    if (mesa) mesa.estado = 'disponible';
  }
  res.json(pedido);
});

mockRouter.put('/pedidos/:id', (req, res) => {
  const pedido = MOCK_PEDIDOS.find((p) => p.id === Number(req.params.id));
  if (!pedido) return res.status(404).json({ message: 'No encontrado' });
  if (req.body.detalle) pedido.detalle = req.body.detalle;
  if (req.body.nombre_cliente != null) pedido.nombre_cliente = req.body.nombre_cliente;
  if (req.body.notas != null) pedido.notas = req.body.notas;
  recalcPedido(pedido);
  res.json(pedido);
});

mockRouter.post('/pedidos/:id/items', (req, res) => {
  const pedido = MOCK_PEDIDOS.find((p) => p.id === Number(req.params.id));
  if (!pedido) return res.status(404).json({ message: 'No encontrado' });
  const { producto_id, cantidad = 1 } = req.body;
  const p = MOCK_PRODUCTOS.find((pr) => pr.id === producto_id);
  if (!p) return res.status(404).json({ message: 'Producto no encontrado' });
  const existing = pedido.detalle.find((d) => d.producto_id === producto_id);
  if (existing) {
    existing.cantidad += cantidad;
    existing.precio_unitario = precioProducto(p);
    existing.agregado_por_staff = true;
  } else {
    const precio = precioProducto(p);
    pedido.detalle.push({
      producto_id, nombre: p.nombre, cantidad, precio_unitario: precio,
      subtotal: precio * cantidad, agregado_por_staff: true,
    });
  }
  recalcPedido(pedido);
  res.json(pedido);
});

mockRouter.delete('/pedidos/:id/items/:productoId', (req, res) => {
  const pedido = MOCK_PEDIDOS.find((p) => p.id === Number(req.params.id));
  if (!pedido) return res.status(404).json({ message: 'No encontrado' });
  pedido.detalle = pedido.detalle.filter((d) => d.producto_id !== Number(req.params.productoId));
  recalcPedido(pedido);
  res.json(pedido);
});

mockRouter.patch('/pedidos/:id/items/:productoId', (req, res) => {
  const pedido = MOCK_PEDIDOS.find((p) => p.id === Number(req.params.id));
  if (!pedido) return res.status(404).json({ message: 'No encontrado' });
  const item = pedido.detalle.find((d) => d.producto_id === Number(req.params.productoId));
  if (!item) return res.status(404).json({ message: 'Item no encontrado' });
  if (req.body.cantidad <= 0) {
    pedido.detalle = pedido.detalle.filter((d) => d.producto_id !== Number(req.params.productoId));
  } else {
    item.cantidad = req.body.cantidad;
  }
  recalcPedido(pedido);
  res.json(pedido);
});

mockRouter.post('/pedidos', (req, res) => {
  const user = getMockUser(req);
  const mesa = MOCK_MESAS.find((m) => m.id === Number(req.body.mesa_id) || m.numero === Number(req.body.mesa_id));
  const esCliente = user?.rol === 'cliente';

  if (esCliente && mesa) {
    const sesion = MOCK_MESA_SESIONES.find(
      (s) => s.usuario_id === user.id && ['pendiente', 'activa'].includes(s.estado) && s.mesa_id === mesa.id
    );
    if (!sesion) {
      return res.status(403).json({ message: 'Debes registrar tu mesa antes de pedir.' });
    }
  }

  const detalle = buildDetalle(req.body.items || []);
  const estadoInicial = esCliente ? 'pendiente_aprobacion' : 'recibido';
  const pedido = {
    id: nextId(MOCK_PEDIDOS),
    mesa_id: mesa?.id || Number(req.body.mesa_id),
    mesa_numero: mesa?.numero || req.body.mesa_id,
    usuario_id: user?.id || null,
    nombre_cliente: req.body.nombre_cliente || user?.nombre || 'Cliente',
    notas: req.body.notas || '',
    detalle,
    total: 0,
    estado: estadoInicial,
    estado_color: ESTADO_COLORS[estadoInicial],
    created_at: new Date().toISOString(),
    aprobado_por: null,
    aprobado_at: null,
  };
  recalcPedido(pedido);
  MOCK_PEDIDOS.push(pedido);
  if (!esCliente && mesa) mesa.estado = 'ocupada';
  res.status(201).json(pedido);
});

mockRouter.patch('/pedidos/:id/aprobar', (req, res) => {
  const user = getMockUser(req);
  if (!user || !['staff', 'admin'].includes(user.rol)) {
    return res.status(403).json({ message: 'Solo staff o admin' });
  }
  const pedido = MOCK_PEDIDOS.find((p) => p.id === Number(req.params.id));
  if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
  if (pedido.estado !== 'pendiente_aprobacion') {
    return res.status(400).json({ message: 'El pedido ya fue procesado' });
  }
  syncEstado(pedido, 'recibido');
  pedido.aprobado_por = user.nombre;
  pedido.aprobado_at = new Date().toISOString();
  confirmarSesionMesaPorPedido(pedido.mesa_id, user.nombre);
  res.json(pedido);
});

mockRouter.patch('/pedidos/:id/rechazar', (req, res) => {
  const user = getMockUser(req);
  if (!user || !['staff', 'admin'].includes(user.rol)) {
    return res.status(403).json({ message: 'Solo staff o admin' });
  }
  const pedido = MOCK_PEDIDOS.find((p) => p.id === Number(req.params.id));
  if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
  if (pedido.estado !== 'pendiente_aprobacion') {
    return res.status(400).json({ message: 'El pedido ya fue procesado' });
  }
  syncEstado(pedido, 'cancelado');
  pedido.rechazado_por = user.nombre;
  pedido.rechazado_at = new Date().toISOString();
  res.json(pedido);
});

// ─── Admin Dashboard ───
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
    ],
    metodosPago: [
      { nombre: 'QR', cantidad: 120, total: 8500000 },
      { nombre: 'Tarjeta', cantidad: 85, total: 6200000 },
    ],
  });
});

// ─── Admin Productos ───
mockRouter.get('/admin/productos', (_req, res) => res.json(MOCK_PRODUCTOS.map(enrichProducto)));
mockRouter.post('/admin/productos', (req, res) => {
  const id = nextId(MOCK_PRODUCTOS);
  const p = enrichProducto({ id, activo: 1, destacado: 0, descuento_activo: 0, precio_descuento: null, ...req.body });
  MOCK_PRODUCTOS.push(p);
  MOCK_INVENTARIO.push({ id: nextId(MOCK_INVENTARIO), producto_id: id, producto_nombre: p.nombre, precio: p.precio, stock_actual: 0, stock_minimo: 5, unidad: 'unidad' });
  res.status(201).json(p);
});
mockRouter.put('/admin/productos/:id', (req, res) => {
  const idx = MOCK_PRODUCTOS.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'No encontrado' });
  MOCK_PRODUCTOS[idx] = enrichProducto({ ...MOCK_PRODUCTOS[idx], ...req.body });
  const inv = MOCK_INVENTARIO.find((i) => i.producto_id === Number(req.params.id));
  if (inv) { inv.producto_nombre = MOCK_PRODUCTOS[idx].nombre; inv.precio = MOCK_PRODUCTOS[idx].precio; }
  res.json(MOCK_PRODUCTOS[idx]);
});
mockRouter.delete('/admin/productos/:id', (req, res) => {
  const p = MOCK_PRODUCTOS.find((x) => x.id === Number(req.params.id));
  if (p) p.activo = 0;
  res.json({ message: 'Producto desactivado' });
});

// ─── Admin Categorías ───
mockRouter.get('/admin/categorias', (_req, res) => {
  res.json(MOCK_CATEGORIAS.map((c) => ({
    ...c,
    productos_count: MOCK_PRODUCTOS.filter((p) => p.categoria_id === c.id && p.activo).length,
  })));
});
mockRouter.post('/admin/categorias', (req, res) => {
  const cat = { id: nextId(MOCK_CATEGORIAS), activa: 1, orden: MOCK_CATEGORIAS.length + 1, ...req.body };
  MOCK_CATEGORIAS.push(cat);
  res.status(201).json(cat);
});
mockRouter.put('/admin/categorias/:id', (req, res) => {
  const idx = MOCK_CATEGORIAS.findIndex((c) => c.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'No encontrado' });
  MOCK_CATEGORIAS[idx] = { ...MOCK_CATEGORIAS[idx], ...req.body };
  MOCK_PRODUCTOS.forEach((p) => { if (p.categoria_id === MOCK_CATEGORIAS[idx].id) enrichProducto(p); });
  res.json(MOCK_CATEGORIAS[idx]);
});
mockRouter.delete('/admin/categorias/:id', (req, res) => {
  const c = MOCK_CATEGORIAS.find((x) => x.id === Number(req.params.id));
  if (c) c.activa = 0;
  res.json({ message: 'Categoría desactivada' });
});

// ─── Admin Inventario ───
mockRouter.get('/admin/inventario', (_req, res) => res.json(MOCK_INVENTARIO));
mockRouter.patch('/admin/inventario/:id', (req, res) => {
  const inv = MOCK_INVENTARIO.find((i) => i.id === Number(req.params.id));
  if (!inv) return res.status(404).json({ message: 'No encontrado' });
  Object.assign(inv, req.body);
  res.json(inv);
});
mockRouter.post('/admin/inventario/movimiento', (req, res) => {
  const { inventario_id, tipo, cantidad, motivo } = req.body;
  const inv = MOCK_INVENTARIO.find((i) => i.id === inventario_id);
  if (!inv) return res.status(404).json({ message: 'Inventario no encontrado' });
  if (tipo === 'entrada') inv.stock_actual += cantidad;
  else if (tipo === 'salida') inv.stock_actual = Math.max(0, inv.stock_actual - cantidad);
  else inv.stock_actual = cantidad;
  const mov = { id: nextId(MOCK_MOVIMIENTOS), inventario_id, tipo, cantidad, motivo, created_at: new Date().toISOString() };
  MOCK_MOVIMIENTOS.unshift(mov);
  res.json({ inventario: inv, movimiento: mov });
});
mockRouter.get('/admin/inventario/movimientos', (_req, res) => res.json(MOCK_MOVIMIENTOS.slice(0, 50)));

// ─── Admin Promociones ───
mockRouter.get('/admin/promociones', (_req, res) => res.json(MOCK_PROMOCIONES));
mockRouter.post('/admin/promociones', (req, res) => {
  const promo = { id: nextId(MOCK_PROMOCIONES), activa: 1, producto_ids: [], ...req.body };
  MOCK_PROMOCIONES.push(promo);
  res.status(201).json(promo);
});
mockRouter.put('/admin/promociones/:id', (req, res) => {
  const idx = MOCK_PROMOCIONES.findIndex((p) => p.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'No encontrado' });
  MOCK_PROMOCIONES[idx] = { ...MOCK_PROMOCIONES[idx], ...req.body };
  res.json(MOCK_PROMOCIONES[idx]);
});
mockRouter.delete('/admin/promociones/:id', (req, res) => {
  const p = MOCK_PROMOCIONES.find((x) => x.id === Number(req.params.id));
  if (p) p.activa = 0;
  res.json({ message: 'Promoción desactivada' });
});

// ─── Admin Reservas ───
mockRouter.get('/admin/reservas', (_req, res) => res.json(MOCK_RESERVAS));
mockRouter.post('/admin/reservas', (req, res) => {
  const mesa = MOCK_MESAS.find((m) => m.id === req.body.mesa_id);
  const r = { id: nextId(MOCK_RESERVAS), mesa_numero: mesa?.numero, estado: 'pendiente', ...req.body };
  MOCK_RESERVAS.push(r);
  if (mesa) mesa.estado = 'reservada';
  res.status(201).json(r);
});
mockRouter.put('/admin/reservas/:id', (req, res) => {
  const idx = MOCK_RESERVAS.findIndex((r) => r.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'No encontrado' });
  MOCK_RESERVAS[idx] = { ...MOCK_RESERVAS[idx], ...req.body };
  res.json(MOCK_RESERVAS[idx]);
});
mockRouter.delete('/admin/reservas/:id', (req, res) => {
  const idx = MOCK_RESERVAS.findIndex((r) => r.id === Number(req.params.id));
  if (idx !== -1) MOCK_RESERVAS.splice(idx, 1);
  res.json({ message: 'Reserva eliminada' });
});

// ─── Admin Usuarios ───
mockRouter.get('/admin/usuarios', (req, res) => {
  let list = [...MOCK_USUARIOS];
  if (req.query.rol) list = list.filter((u) => u.rol === req.query.rol);
  res.json(list);
});
mockRouter.post('/admin/usuarios', (req, res) => {
  const u = { id: nextId(MOCK_USUARIOS), activo: 1, es_invitado: 0, subrol: null, ...req.body };
  MOCK_USUARIOS.push(u);
  res.status(201).json(u);
});
mockRouter.put('/admin/usuarios/:id', (req, res) => {
  const idx = MOCK_USUARIOS.findIndex((u) => u.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'No encontrado' });
  MOCK_USUARIOS[idx] = { ...MOCK_USUARIOS[idx], ...req.body };
  res.json(MOCK_USUARIOS[idx]);
});

// ─── Admin Staff ───
mockRouter.get('/admin/staff', (_req, res) => {
  res.json(MOCK_USUARIOS.filter((u) => u.rol === 'staff'));
});
mockRouter.post('/admin/staff', (req, res) => {
  const u = { id: nextId(MOCK_USUARIOS), rol: 'staff', activo: 1, es_invitado: 0, ...req.body };
  MOCK_USUARIOS.push(u);
  res.status(201).json(u);
});
mockRouter.put('/admin/staff/:id', (req, res) => {
  const idx = MOCK_USUARIOS.findIndex((u) => u.id === Number(req.params.id) && u.rol === 'staff');
  if (idx === -1) return res.status(404).json({ message: 'No encontrado' });
  MOCK_USUARIOS[idx] = { ...MOCK_USUARIOS[idx], ...req.body };
  res.json(MOCK_USUARIOS[idx]);
});

// ─── Admin Pedidos ───
mockRouter.get('/admin/pedidos', (req, res) => {
  let list = [...MOCK_PEDIDOS];
  if (req.query.estado === 'activos') list = list.filter((p) => !['entregado', 'cancelado'].includes(p.estado));
  else if (req.query.estado === 'entregados') list = list.filter((p) => p.estado === 'entregado');
  else if (req.query.estado === 'cancelados') list = list.filter((p) => p.estado === 'cancelado');
  res.json(list);
});
mockRouter.patch('/admin/pedidos/:id/estado', (req, res) => {
  const pedido = MOCK_PEDIDOS.find((p) => p.id === Number(req.params.id));
  if (!pedido) return res.status(404).json({ message: 'No encontrado' });
  pedido.estado = req.body.estado;
  if (req.body.estado === 'cancelado') pedido.estado_color = '#ef4444';
  res.json(pedido);
});

// ─── Admin Pagos ───
mockRouter.get('/admin/pagos', (req, res) => {
  let list = [...MOCK_PAGOS];
  if (req.query.estado) list = list.filter((p) => p.estado === req.query.estado);
  if (req.query.metodo) list = list.filter((p) => p.metodo_codigo === req.query.metodo || p.metodo.toLowerCase() === req.query.metodo.toLowerCase());
  if (req.query.resumen === '1') {
    const sum = (arr) => arr.reduce((s, p) => s + p.monto, 0);
    const byMetodo = (codigo) => MOCK_PAGOS.filter((p) => p.metodo_codigo === codigo);
    return res.json({
      pagos: list,
      resumen: {
        qr: { total: sum(byMetodo('qr').filter((p) => p.estado === 'completado')), count: byMetodo('qr').filter((p) => p.estado === 'completado').length, pendientes: byMetodo('qr').filter((p) => p.estado === 'pendiente').length },
        tarjeta: { total: sum(byMetodo('tarjeta').filter((p) => p.estado === 'completado')), count: byMetodo('tarjeta').filter((p) => p.estado === 'completado').length, pendientes: byMetodo('tarjeta').filter((p) => p.estado === 'pendiente').length },
        efectivo: { total: sum(byMetodo('efectivo').filter((p) => p.estado === 'completado')), count: byMetodo('efectivo').filter((p) => p.estado === 'completado').length, pendientes: byMetodo('efectivo').filter((p) => p.estado === 'pendiente').length },
        pendiente_total: sum(MOCK_PAGOS.filter((p) => p.estado === 'pendiente')),
        pendientes_count: MOCK_PAGOS.filter((p) => p.estado === 'pendiente').length,
      },
    });
  }
  res.json(list);
});
mockRouter.patch('/admin/pagos/:id', (req, res) => {
  const pago = MOCK_PAGOS.find((p) => p.id === Number(req.params.id));
  if (!pago) return res.status(404).json({ message: 'No encontrado' });
  Object.assign(pago, req.body);
  res.json(pago);
});

// ─── Admin Reportes ───
mockRouter.get('/admin/reportes', (req, res) => {
  const periodo = req.query.periodo || 'mes';
  const base = {
    dia: { ventas: 2450000, pedidos: 38, ticket_promedio: 64473, cancelados: 3 },
    semana: { ventas: 15800000, pedidos: 245, ticket_promedio: 64489, cancelados: 12 },
    mes: { ventas: 68000000, pedidos: 1050, ticket_promedio: 64761, cancelados: 45 },
    ano: { ventas: 780000000, pedidos: 12400, ticket_promedio: 62903, cancelados: 520 },
  };
  const datos = base[periodo] || base.mes;
  res.json({
    periodo,
    resumen: datos,
    ventasPorDia: Array.from({ length: periodo === 'dia' ? 1 : 7 }, (_, i) => ({
      fecha: new Date(Date.now() - i * 86400000).toISOString().split('T')[0],
      ventas: Math.round(datos.ventas / (periodo === 'dia' ? 1 : 7)),
      pedidos: Math.round(datos.pedidos / (periodo === 'dia' ? 1 : 7)),
    })).reverse(),
    topProductos: [
      { nombre: 'Mojito Clásico', cantidad: 145, total: 4060000 },
      { nombre: 'Cerveza Artesanal IPA', cantidad: 230, total: 4140000 },
      { nombre: 'Combo Amigos', cantidad: 42, total: 10500000 },
    ],
    porCategoria: MOCK_CATEGORIAS.map((c) => ({
      categoria: c.nombre,
      ventas: Math.round(Math.random() * 5000000 + 1000000),
    })),
  });
});

// ─── Admin Config ───
mockRouter.get('/admin/config', (_req, res) => res.json(MOCK_CONFIG));
mockRouter.put('/admin/config', (req, res) => {
  Object.assign(MOCK_CONFIG, req.body);
  if (req.body.colores) MOCK_CONFIG.colores = { ...MOCK_CONFIG.colores, ...req.body.colores };
  res.json(MOCK_CONFIG);
});

// ─── Admin Mesas ───
mockRouter.get('/admin/mesas', (req, res) => {
  let list = MOCK_MESAS.filter((m) => m.activa);
  if (req.query.zona) list = list.filter((m) => m.zona === req.query.zona);
  if (req.query.estado) list = list.filter((m) => m.estado === req.query.estado);
  res.json(list.map(enrichMesa));
});
mockRouter.post('/admin/mesas', (req, res) => {
  const { numero, codigo_qr, capacidad, zona, estado } = req.body;
  const mesa = {
    id: nextId(MOCK_MESAS),
    numero: Number(numero),
    codigo_qr: codigo_qr || `MESA-${String(numero).padStart(3, '0')}`,
    capacidad: Number(capacidad) || 4,
    zona: zona || 'General',
    estado: estado || 'disponible',
    activa: 1,
  };
  MOCK_MESAS.push(mesa);
  res.status(201).json(mesa);
});
mockRouter.put('/admin/mesas/:id', (req, res) => {
  const idx = MOCK_MESAS.findIndex((m) => m.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ message: 'No encontrado' });
  MOCK_MESAS[idx] = { ...MOCK_MESAS[idx], ...req.body, numero: Number(req.body.numero ?? MOCK_MESAS[idx].numero), capacidad: Number(req.body.capacidad ?? MOCK_MESAS[idx].capacidad) };
  res.json(MOCK_MESAS[idx]);
});
mockRouter.patch('/admin/mesas/:id/estado', (req, res) => {
  const mesa = MOCK_MESAS.find((m) => m.id === Number(req.params.id));
  if (!mesa) return res.status(404).json({ message: 'No encontrado' });
  mesa.estado = req.body.estado;
  res.json(mesa);
});
mockRouter.delete('/admin/mesas/:id', (req, res) => {
  const mesa = MOCK_MESAS.find((m) => m.id === Number(req.params.id));
  if (mesa) mesa.activa = 0;
  res.json({ message: 'Mesa desactivada' });
});
