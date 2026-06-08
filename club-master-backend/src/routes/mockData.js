export const MOCK_CATEGORIAS = [
  { id: 1, nombre: 'Licores', slug: 'licores', icono: 'wine', orden: 1, activa: 1 },
  { id: 2, nombre: 'Cervezas', slug: 'cervezas', icono: 'beer', orden: 2, activa: 1 },
  { id: 3, nombre: 'Cócteles', slug: 'cocteles', icono: 'cocktail', orden: 3, activa: 1 },
  { id: 4, nombre: 'Combos', slug: 'combos', icono: 'combo', orden: 4, activa: 1 },
  { id: 5, nombre: 'Snacks', slug: 'snacks', icono: 'snack', orden: 5, activa: 1 },
  { id: 6, nombre: 'Refrescos', slug: 'refrescos', icono: 'drink', orden: 6, activa: 1 },
];

const productImg = (id) => `/products/${id}.jpg`;

const P = (id, cat, nombre, descripcion, precio, opts = {}) => ({
  id,
  categoria_id: cat,
  nombre,
  descripcion,
  precio,
  precio_descuento: opts.descuento ?? null,
  descuento_activo: opts.descuento ? 1 : 0,
  imagen_url: productImg(id),
  destacado: opts.destacado ? 1 : 0,
  activo: 1,
});

export let MOCK_PRODUCTOS = [
  // ── Licores (1) ──
  P(1, 1, 'Whisky Buchanan\'s 12 Años', 'Whisky escocés blend premium 750ml', 195000, { destacado: true }),
  P(2, 1, 'Ron Medellín 3 Años', 'Ron colombiano añejo, notas suaves y dulces 750ml', 72000, { destacado: true, descuento: 65000 }),
  P(8, 1, 'Aguardiente Antioqueño', 'Aguardiente azul tradicional 750ml', 65000),
  P(9, 1, 'Aguardiente Nectar', 'Aguardiente con miel de panela 750ml', 62000),
  P(10, 1, 'Ron Bacardí Carta Blanca', 'Ron blanco cubano, ideal para cócteles 750ml', 88000),
  P(11, 1, 'Ron Zacapa 23', 'Ron guatemalteco añejo de alta gama 750ml', 220000, { destacado: true }),
  P(12, 1, 'Vodka Absolut', 'Vodka sueco premium 750ml', 120000),
  P(13, 1, 'Tequila José Cuervo Especial', 'Tequila reposado mexicano 750ml', 98000),
  P(14, 1, 'Gin Tanqueray London Dry', 'Gin inglés clásico con notas cítricas 750ml', 145000),
  P(15, 1, 'Johnnie Walker Red Label', 'Whisky escocés blend 750ml', 165000),
  P(16, 1, 'Old Parr 12 Años', 'Whisky escocés de malta añeja 750ml', 210000),

  // ── Cervezas (2) ──
  P(3, 2, 'Cerveza Artesanal IPA', 'IPA local con notas cítricas y amargor balanceado 330ml', 18000, { destacado: true }),
  P(17, 2, 'Poker 330ml', 'Lager colombiana, refrescante y suave', 8000),
  P(18, 2, 'Águila 330ml', 'Cerveza lager clásica colombiana', 7500),
  P(19, 2, 'Club Colombia Dorada', 'Cerveza premium dorada 330ml', 9000),
  P(20, 2, 'Corona Extra 330ml', 'Cerveza mexicana, ligera con limón', 12000, { destacado: true }),
  P(21, 2, 'Heineken 330ml', 'Lager holandesa importada', 11000),
  P(22, 2, 'Budweiser 330ml', 'American lager, suave y refrescante', 10000),
  P(23, 2, 'Stella Artois 330ml', 'Lager belga premium', 13000),
  P(24, 2, 'Six Pack Poker', 'Pack de 6 cervezas Poker 330ml', 42000),
  P(25, 2, 'Six Pack Águila', 'Pack de 6 cervezas Águila 330ml', 40000),
  P(26, 2, 'Cerveza Artesanal Stout', 'Stout oscura con notas a café y chocolate 330ml', 20000),

  // ── Cócteles (3) ──
  P(4, 3, 'Mojito Clásico', 'Ron blanco, menta fresca, lima, azúcar y soda', 28000, { destacado: true, descuento: 22400 }),
  P(5, 3, 'Margarita', 'Tequila, triple sec, jugo de lima y sal en el borde', 32000, { destacado: true }),
  P(27, 3, 'Piña Colada', 'Ron, crema de coco y jugo de piña natural', 30000),
  P(28, 3, 'Cuba Libre', 'Ron, Coca-Cola y lima fresca', 26000),
  P(29, 3, 'Old Fashioned', 'Whisky bourbon, bitter angostura y azúcar', 35000),
  P(30, 3, 'Gin Tonic', 'Gin premium con tónica y rodaja de lima', 29000),
  P(31, 3, 'Tequila Sunrise', 'Tequila, naranja y granadina en capas', 31000),
  P(32, 3, 'Aperol Spritz', 'Aperol, prosecco y soda con naranja', 34000),
  P(33, 3, 'Caipiriña', 'Cachaça, lima fresca y azúcar machacados', 27000),

  // ── Combos (4) ──
  P(6, 4, 'Combo Amigos', 'Botella de licor + 4 cervezas + nachos para compartir', 250000, { destacado: true }),
  P(34, 4, 'Combo Pareja', '2 cócteles a elección + tabla de quesos', 65000),
  P(35, 4, 'Combo VIP', 'Botella premium + 6 cervezas + alitas + tabla de quesos', 380000, { destacado: true }),
  P(36, 4, 'Combo After Party', 'Ron + aguardiente + 4 cervezas + snacks surtidos', 320000),
  P(37, 4, 'Combo Cumpleaños', 'Botella a elección + 8 cervezas + 2 snacks + decoración mesa', 450000),
  P(38, 4, 'Combo Cervecero', 'Six pack + alitas BBQ + nachos con queso', 95000, { descuento: 85000 }),

  // ── Snacks (5) ──
  P(7, 5, 'Alitas BBQ', '12 alitas de pollo bañadas en salsa BBQ casera', 35000, { destacado: true }),
  P(39, 5, 'Nachos con Queso', 'Nachos crujientes con dip de queso cheddar fundido', 22000),
  P(40, 5, 'Papas Rústicas', 'Papas cortadas a mano con salsa de la casa', 18000),
  P(41, 5, 'Empanadas x3', 'Tres empanadas de carne o pollo recién hechas', 15000),
  P(42, 5, 'Chorizos Santafereños', 'Chorizos a la parrilla con arepa y limón', 28000),
  P(43, 5, 'Mini Hamburguesas x3', 'Sliders de carne angus con queso y salsa especial', 32000),
  P(44, 5, 'Tabla de Quesos', 'Selección de quesos premium con uvas y crackers', 45000),
  P(45, 5, 'Palitos de Queso', '10 palitos de queso mozzarella empanizados', 16000),
  P(46, 5, 'Maní Salado', 'Porción generosa de maní tostado con sal marina', 8000),
  P(47, 5, 'Pizza Personal Pepperoni', 'Pizza individual con pepperoni y queso mozzarella', 28000),

  // ── Refrescos (6) ──
  P(48, 6, 'Agua Brisa 600ml', 'Agua purificada sin gas', 5000),
  P(49, 6, 'Agua con Gas', 'Agua mineral con gas 600ml', 6000),
  P(50, 6, 'Coca-Cola 400ml', 'Gaseosa cola bien fría', 7000, { destacado: true }),
  P(51, 6, 'Sprite 400ml', 'Gaseosa lima-limón refrescante', 7000),
  P(52, 6, 'Ginger Ale', 'Bebida de jengibre, ideal como mixer', 8000),
  P(53, 6, 'Red Bull 250ml', 'Bebida energizante', 15000),
  P(54, 6, 'Gatorade Azul 500ml', 'Bebida deportiva sabor frutos azules', 9000),
  P(55, 6, 'Gatorade Naranja 500ml', 'Bebida deportiva sabor naranja', 9000),
  P(56, 6, 'Jugo Natural Maracuyá', 'Jugo fresco de maracuyá sin azúcar añadida', 12000),
  P(57, 6, 'Limonada Natural', 'Limonada casera con hierbabuena', 10000),
  P(58, 6, 'Soda Postobón Manzana', 'Gaseosa sabor manzana 400ml', 6500),
  P(59, 6, 'Colombiana 400ml', 'Gaseosa sabor cola champagne', 6500),
].map((p) => enrichProductoRaw(p));

function enrichProductoRaw(p) {
  const cat = MOCK_CATEGORIAS.find((c) => c.id === p.categoria_id);
  return {
    ...p,
    imagen_url: p.imagen_url || productImg(p.id),
    categoria_slug: cat?.slug,
    categoria_nombre: cat?.nombre,
  };
}

export let MOCK_INVENTARIO = MOCK_PRODUCTOS.map((p, i) => ({
  id: i + 1,
  producto_id: p.id,
  producto_nombre: p.nombre,
  precio: p.precio,
  stock_actual: 15 + (i * 7) % 90,
  stock_minimo: p.categoria_id === 1 ? 8 : 5,
  unidad: 'unidad',
}));

export let MOCK_MOVIMIENTOS = [];

const COCTEL_IDS = [4, 5, 27, 28, 29, 30, 31, 32, 33];

export let MOCK_PROMOCIONES = [
  {
    id: 1,
    titulo: '2x1 en Cócteles',
    descripcion: 'Pide 2 cócteles y paga solo 1. Válido todos los días hasta las 10:00 p.m.',
    tipo: '2x1',
    hora_fin: '22:00',
    descuento_porcentaje: 50,
    imagen_url: '/products/4.jpg',
    fecha_inicio: '2026-06-01',
    fecha_fin: '2026-12-31',
    activa: 1,
    producto_ids: COCTEL_IDS,
  },
  {
    id: 2,
    titulo: 'Combo Fin de Semana',
    descripcion: '15% de descuento en combos los viernes y sábados',
    tipo: 'descuento',
    descuento_porcentaje: 15,
    imagen_url: '/products/6.jpg',
    fecha_inicio: '2026-06-01',
    fecha_fin: '2026-12-31',
    activa: 1,
    producto_ids: [6, 34, 35, 36, 37, 38],
  },
];

export let MOCK_RESERVAS = [
  { id: 1, mesa_id: 3, mesa_numero: 3, nombre_cliente: 'Carlos Ruiz', telefono: '3001234567', fecha_reserva: '2026-06-10T20:00:00', personas: 6, estado: 'confirmada', notas: 'Cumpleaños, mesa VIP' },
  { id: 2, mesa_id: 7, mesa_numero: 7, nombre_cliente: 'Ana Torres', telefono: '3109876543', fecha_reserva: '2026-06-12T21:30:00', personas: 4, estado: 'pendiente', notas: '' },
];

export let MOCK_USUARIOS = [
  { id: 1, nombre: 'Admin CLUB MASTER', email: 'admin@clubmaster.com', telefono: '3000000001', rol: 'admin', subrol: null, activo: 1, es_invitado: 0 },
  { id: 2, nombre: 'Staff Operativo', email: 'staff@clubmaster.com', telefono: '3000000002', rol: 'staff', subrol: 'mesero', activo: 1, es_invitado: 0 },
  { id: 3, nombre: 'Cliente Demo', email: 'cliente@clubmaster.com', telefono: '3000000003', rol: 'cliente', subrol: null, activo: 1, es_invitado: 0 },
  { id: 4, nombre: 'María Cocina', email: 'cocina@clubmaster.com', telefono: '3000000004', rol: 'staff', subrol: 'cocina', activo: 1, es_invitado: 0 },
  { id: 5, nombre: 'Pedro Bar', email: 'bar@clubmaster.com', telefono: '3000000005', rol: 'staff', subrol: 'bar', activo: 1, es_invitado: 0 },
];

export let MOCK_PEDIDOS = [
  { id: 1, mesa_id: 12, mesa_numero: 12, nombre_cliente: 'Juan Pérez', total: 91000, estado: 'en_preparacion', estado_color: '#F97316', notas: '', created_at: new Date().toISOString(), detalle: [{ cantidad: 2, nombre: 'Mojito Clásico', producto_id: 4, precio_unitario: 28000, subtotal: 56000 }, { cantidad: 1, nombre: 'Alitas BBQ', producto_id: 7, precio_unitario: 35000, subtotal: 35000 }] },
  { id: 2, mesa_id: 4, mesa_numero: 4, nombre_cliente: 'María López', total: 185000, estado: 'recibido', estado_color: '#3B82F6', notas: 'Sin hielo', created_at: new Date(Date.now() - 3600000).toISOString(), detalle: [{ cantidad: 1, nombre: 'Whisky Premium 750ml', producto_id: 1, precio_unitario: 185000, subtotal: 185000 }] },
  { id: 3, mesa_id: 9, mesa_numero: 9, nombre_cliente: 'Luis Gómez', total: 36000, estado: 'entregado', estado_color: '#A78BFA', notas: '', created_at: new Date(Date.now() - 7200000).toISOString(), detalle: [{ cantidad: 2, nombre: 'Cerveza Artesanal IPA', producto_id: 3, precio_unitario: 18000, subtotal: 36000 }] },
  { id: 4, mesa_id: 2, mesa_numero: 2, nombre_cliente: 'Sofía Díaz', total: 32000, estado: 'cancelado', estado_color: '#EF4444', notas: '', created_at: new Date(Date.now() - 10800000).toISOString(), detalle: [{ cantidad: 1, nombre: 'Margarita', producto_id: 5, precio_unitario: 32000, subtotal: 32000 }] },
  { id: 5, mesa_id: 7, mesa_numero: 7, nombre_cliente: 'Carlos Ruiz', total: 60400, estado: 'listo', estado_color: '#22C55E', notas: 'Mesa VIP', created_at: new Date(Date.now() - 1800000).toISOString(), detalle: [{ cantidad: 2, nombre: 'Mojito Clásico', producto_id: 4, precio_unitario: 22400, subtotal: 44800 }, { cantidad: 1, nombre: 'Cerveza Artesanal IPA', producto_id: 3, precio_unitario: 18000, subtotal: 18000 }] },
];

export let MOCK_PAGOS = [
  { id: 1, pedido_id: 3, mesa_numero: 9, nombre_cliente: 'Luis Gómez', metodo: 'QR', metodo_codigo: 'qr', monto: 56000, estado: 'completado', referencia: 'QR-20260608-001', created_at: new Date(Date.now() - 7000000).toISOString() },
  { id: 2, pedido_id: 1, mesa_numero: 12, nombre_cliente: 'Juan Pérez', metodo: 'Tarjeta', metodo_codigo: 'tarjeta', monto: 91000, estado: 'pendiente', referencia: null, created_at: new Date().toISOString() },
  { id: 3, pedido_id: 2, mesa_numero: 4, nombre_cliente: 'María López', metodo: 'Efectivo', metodo_codigo: 'efectivo', monto: 185000, estado: 'pendiente', referencia: null, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 4, pedido_id: 5, mesa_numero: 1, nombre_cliente: 'Andrés Vega', metodo: 'QR', metodo_codigo: 'qr', monto: 128000, estado: 'completado', referencia: 'QR-20260608-002', created_at: new Date(Date.now() - 86400000).toISOString() },
  { id: 5, pedido_id: 6, mesa_numero: 5, nombre_cliente: 'Laura Méndez', metodo: 'QR', metodo_codigo: 'qr', monto: 95000, estado: 'pendiente', referencia: null, created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 6, pedido_id: 7, mesa_numero: 8, nombre_cliente: 'Diego Ríos', metodo: 'Tarjeta', metodo_codigo: 'tarjeta', monto: 320000, estado: 'completado', referencia: 'TXN-88421', created_at: new Date(Date.now() - 172800000).toISOString() },
  { id: 7, pedido_id: 8, mesa_numero: 3, nombre_cliente: 'Camila Ortiz', metodo: 'Tarjeta', metodo_codigo: 'tarjeta', monto: 78000, estado: 'completado', referencia: 'TXN-88422', created_at: new Date(Date.now() - 259200000).toISOString() },
  { id: 8, pedido_id: 9, mesa_numero: 6, nombre_cliente: 'Felipe Castro', metodo: 'Efectivo', metodo_codigo: 'efectivo', monto: 145000, estado: 'completado', referencia: null, created_at: new Date(Date.now() - 43200000).toISOString() },
  { id: 9, pedido_id: 10, mesa_numero: 11, nombre_cliente: 'Valentina Ruiz', metodo: 'Efectivo', metodo_codigo: 'efectivo', monto: 67000, estado: 'pendiente', referencia: null, created_at: new Date(Date.now() - 900000).toISOString() },
  { id: 10, pedido_id: 11, mesa_numero: 7, nombre_cliente: 'Nicolás Peña', metodo: 'QR', metodo_codigo: 'qr', monto: 410000, estado: 'completado', referencia: 'QR-20260607-015', created_at: new Date(Date.now() - 345600000).toISOString() },
];

export let MOCK_MESA_SESIONES = [];

export let MOCK_MESAS = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  numero: i + 1,
  codigo_qr: `MESA-${String(i + 1).padStart(3, '0')}`,
  capacidad: i < 3 ? 6 : 4,
  zona: i < 3 ? 'VIP' : 'General',
  estado: [2, 4, 9, 12].includes(i + 1) ? 'ocupada' : 'disponible',
  activa: 1,
}));

export let MOCK_CONFIG = {
  negocio: 'CLUB MASTER',
  slogan: 'Gestiona, vende y brilla',
  logo_url: '/logo-club-master.png',
  moneda: 'COP',
  timezone: 'America/Bogota',
  iva: 0,
  colores: { primario: '#D4AF37', secundario: '#111111', fondo: '#000000', texto: '#FFFFFF' },
  fuente: 'Inter',
  telefono: '300 123 4567',
  direccion: 'Calle Principal #123',
  horario: 'Jue-Dom 8pm - 3am',
};

export function enrichProducto(p) {
  return enrichProductoRaw(p);
}

export function nextId(list) {
  return list.length ? Math.max(...list.map((x) => x.id)) + 1 : 1;
}
