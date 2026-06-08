-- CLUB MASTER - Datos iniciales de demostración

INSERT INTO roles (nombre, descripcion) VALUES
('cliente', 'Usuario final que realiza pedidos'),
('staff', 'Personal operativo del local'),
('admin', 'Administrador del sistema');

INSERT INTO estados_pedido (nombre, orden, color) VALUES
('pendiente_aprobacion', 0, '#EAB308'),
('recibido', 1, '#D4AF37'),
('en_preparacion', 2, '#F4C542'),
('listo', 3, '#4CAF50'),
('en_camino', 4, '#2196F3'),
('entregado', 5, '#FFFFFF'),
('cancelado', 6, '#EF4444');

INSERT INTO metodos_pago (nombre, codigo) VALUES
('QR', 'qr'),
('Tarjeta', 'tarjeta'),
('Efectivo', 'efectivo'),
('Pago al final', 'pago_final');

INSERT INTO mesas (numero, codigo_qr, capacidad, zona, estado) VALUES
(1, 'MESA-001', 4, 'VIP', 'disponible'),
(2, 'MESA-002', 4, 'General', 'ocupada'),
(3, 'MESA-003', 6, 'Terraza', 'disponible'),
(4, 'MESA-004', 2, 'Barra', 'ocupada'),
(5, 'MESA-005', 8, 'VIP', 'disponible'),
(6, 'MESA-006', 4, 'General', 'disponible'),
(7, 'MESA-007', 4, 'General', 'reservada'),
(8, 'MESA-008', 6, 'Terraza', 'disponible'),
(9, 'MESA-009', 4, 'General', 'ocupada'),
(10, 'MESA-010', 4, 'General', 'disponible'),
(11, 'MESA-011', 2, 'Barra', 'disponible'),
(12, 'MESA-012', 4, 'VIP', 'ocupada');

INSERT INTO categorias (nombre, slug, icono, orden) VALUES
('Licores', 'licores', 'wine', 1),
('Cervezas', 'cervezas', 'beer', 2),
('Cócteles', 'cocteles', 'cocktail', 3),
('Combos', 'combos', 'combo', 4),
('Snacks', 'snacks', 'snack', 5),
('Refrescos', 'refrescos', 'drink', 6);

INSERT INTO productos (categoria_id, nombre, descripcion, precio, imagen_url, destacado) VALUES
(1, 'Whisky Buchanan''s 12 Años', 'Whisky escocés blend premium 750ml', 195000, '/products/1.jpg', 1),
(1, 'Ron Medellín 3 Años', 'Ron colombiano añejo 750ml', 72000, '/products/2.jpg', 1),
(1, 'Aguardiente Antioqueño', 'Aguardiente azul tradicional 750ml', 65000, '/products/3.jpg', 0),
(1, 'Aguardiente Nectar', 'Aguardiente con miel de panela 750ml', 62000, '/products/4.jpg', 0),
(1, 'Ron Bacardí Carta Blanca', 'Ron blanco cubano 750ml', 88000, '/products/5.jpg', 0),
(1, 'Ron Zacapa 23', 'Ron guatemalteco añejo 750ml', 220000, '/products/6.jpg', 1),
(1, 'Vodka Absolut', 'Vodka sueco premium 750ml', 120000, '/products/7.jpg', 0),
(1, 'Tequila José Cuervo', 'Tequila reposado mexicano 750ml', 98000, '/products/8.jpg', 0),
(1, 'Gin Tanqueray', 'Gin inglés London Dry 750ml', 145000, '/products/9.jpg', 0),
(2, 'Cerveza Artesanal IPA', 'IPA local 330ml', 18000, '/products/10.jpg', 1),
(2, 'Poker 330ml', 'Lager colombiana', 8000, '/products/11.jpg', 0),
(2, 'Águila 330ml', 'Cerveza lager clásica', 7500, '/products/12.jpg', 0),
(2, 'Club Colombia Dorada', 'Cerveza premium 330ml', 9000, '/products/13.jpg', 0),
(2, 'Corona Extra 330ml', 'Cerveza mexicana', 12000, '/products/14.jpg', 1),
(2, 'Heineken 330ml', 'Lager holandesa', 11000, '/products/15.jpg', 0),
(2, 'Six Pack Poker', 'Pack 6 unidades', 42000, '/products/16.jpg', 0),
(3, 'Mojito Clásico', 'Ron, menta, lima y soda', 28000, '/products/17.jpg', 1),
(3, 'Margarita', 'Tequila, triple sec y lima', 32000, '/products/18.jpg', 1),
(3, 'Piña Colada', 'Ron, coco y piña', 30000, '/products/19.jpg', 0),
(3, 'Cuba Libre', 'Ron y Coca-Cola', 26000, '/products/20.jpg', 0),
(4, 'Combo Amigos', 'Botella + 4 cervezas + nachos', 250000, '/products/21.jpg', 1),
(4, 'Combo Pareja', '2 cócteles + tabla quesos', 65000, '/products/22.jpg', 0),
(4, 'Combo VIP', 'Botella premium + 6 cervezas + snacks', 380000, '/products/23.jpg', 1),
(5, 'Alitas BBQ', '12 alitas salsa BBQ', 35000, '/products/24.jpg', 1),
(5, 'Nachos con Queso', 'Nachos con dip cheddar', 22000, '/products/25.jpg', 0),
(5, 'Tabla de Quesos', 'Selección premium', 45000, '/products/26.jpg', 0),
(6, 'Agua Brisa 600ml', 'Agua sin gas', 5000, '/products/27.jpg', 0),
(6, 'Coca-Cola 400ml', 'Gaseosa cola', 7000, '/products/28.jpg', 1),
(6, 'Gatorade Azul 500ml', 'Bebida deportiva', 9000, '/products/29.jpg', 0),
(6, 'Limonada Natural', 'Limonada con hierbabuena', 10000, '/products/30.jpg', 0);

INSERT INTO promociones (titulo, descripcion, tipo, descuento_porcentaje, imagen_url, fecha_inicio, fecha_fin, activa) VALUES
('2x1 en Cócteles', 'Pide 2 cócteles y paga solo 1. Válido todos los días hasta las 10:00 p.m.', '2x1', 50, '/products/17.jpg', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 180 DAY), 1),
('Combo Fin de Semana', '15% de descuento en combos los viernes y sábados', 'descuento', 15, '/products/21.jpg', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 1);

INSERT INTO configuracion (id, data) VALUES (1, JSON_OBJECT(
  'negocio', 'CLUB MASTER',
  'slogan', 'Gestiona, vende y brilla',
  'logo_url', '/logo-club-master.png',
  'moneda', 'COP',
  'timezone', 'America/Bogota',
  'iva', 0,
  'colores', JSON_OBJECT('primario', '#D4AF37', 'secundario', '#111111', 'fondo', '#000000', 'texto', '#FFFFFF'),
  'fuente', 'Inter',
  'telefono', '300 123 4567',
  'direccion', 'Calle Principal #123',
  'horario', 'Jue-Dom 8pm - 3am'
));

INSERT INTO detalle_promocion (promocion_id, producto_id, cantidad) VALUES
(1, 17, 1), (1, 18, 1), (1, 19, 1), (1, 20, 1),
(2, 21, 1), (2, 22, 1), (2, 23, 1);

INSERT INTO inventario (producto_id, stock_actual, stock_minimo)
SELECT id, 30 + (id * 3) % 70, IF(categoria_id = 1, 8, 5) FROM productos;

INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES
('Distribuidora Premium S.A.', 'Carlos Méndez', '3001234567', 'carlos@premium.com'),
('Cervezas del Valle', 'Ana Torres', '3109876543', 'ana@valle.com');

-- Usuarios se crean en migrate.js con bcrypt (admin123, staff123, cliente123)
