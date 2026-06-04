-- CLUB MASTER - Datos iniciales de demostración

INSERT INTO roles (nombre, descripcion) VALUES
('cliente', 'Usuario final que realiza pedidos'),
('staff', 'Personal operativo del local'),
('admin', 'Administrador del sistema');

INSERT INTO estados_pedido (nombre, orden, color) VALUES
('recibido', 1, '#D4AF37'),
('en_preparacion', 2, '#F4C542'),
('listo', 3, '#4CAF50'),
('en_camino', 4, '#2196F3'),
('entregado', 5, '#FFFFFF');

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
('Snacks', 'snacks', 'snack', 5);

INSERT INTO productos (categoria_id, nombre, descripcion, precio, imagen_url, destacado) VALUES
(1, 'Whisky Premium 750ml', 'Whisky añejo importado', 185000, 'https://images.unsplash.com/photo-1527281400683-1aae7261f267?w=400', 1),
(1, 'Ron Añejo', 'Ron premium caribeño', 95000, 'https://images.unsplash.com/photo-1569529465841-df964c2270a8?w=400', 1),
(1, 'Vodka Absolut', 'Vodka premium sueco', 120000, 'https://images.unsplash.com/photo-1618885472179-5e4740f08856?w=400', 0),
(2, 'Cerveza Artesanal IPA', 'Cerveza artesanal local', 18000, 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400', 1),
(2, 'Cerveza Importada', 'Lager importada 330ml', 15000, 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400', 0),
(2, 'Six Pack Cerveza', 'Pack de 6 unidades', 75000, 'https://images.unsplash.com/photo-1571613314887-6f3d2f7f5f0b?w=400', 0),
(3, 'Mojito Clásico', 'Ron, menta, lima y soda', 28000, 'https://images.unsplash.com/photo-1551538827-9c037cb64129?w=400', 1),
(3, 'Margarita', 'Tequila, triple sec y lima', 32000, 'https://images.unsplash.com/photo-1556855810-ac404aa91e71?w=400', 1),
(3, 'Old Fashioned', 'Whisky, bitter y azúcar', 35000, 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400', 0),
(4, 'Combo Amigos', 'Botella + 4 cervezas + snacks', 250000, 'https://images.unsplash.com/photo-1514362545857-3bc16a4b7d9e?w=400', 1),
(4, 'Combo Pareja', '2 cócteles + snack', 65000, 'https://images.unsplash.com/photo-1476127397705-61c16964a582?w=400', 0),
(5, 'Nachos con Queso', 'Nachos crujientes con dip', 22000, 'https://images.unsplash.com/photo-1513456852971-3fab5fa2f623?w=400', 0),
(5, 'Alitas BBQ', '12 alitas con salsa BBQ', 35000, 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400', 1),
(5, 'Tabla de Quesos', 'Selección premium de quesos', 45000, 'https://images.unsplash.com/photo-1452195100506-9c860d0c4a27?w=400', 0);

INSERT INTO promociones (titulo, descripcion, descuento_porcentaje, imagen_url, fecha_inicio, fecha_fin, activa) VALUES
('Happy Hour VIP', '20% en cócteles de 6pm a 8pm', 20, 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 1),
('Combo Noche', 'Botella + mixer gratis los viernes', 15, 'https://images.unsplash.com/photo-1514362545857-3bc16a4b7d9e?w=800', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 60 DAY), 1);

INSERT INTO detalle_promocion (promocion_id, producto_id, cantidad) VALUES
(1, 7, 1), (1, 8, 1), (1, 9, 1),
(2, 1, 1), (2, 10, 1);

INSERT INTO inventario (producto_id, stock_actual, stock_minimo) VALUES
(1, 25, 5), (2, 40, 10), (3, 30, 5), (4, 100, 20), (5, 80, 15),
(6, 50, 10), (7, 200, 30), (8, 200, 30), (9, 150, 25), (10, 15, 3),
(11, 20, 5), (12, 60, 10), (13, 45, 8), (14, 30, 5);

INSERT INTO proveedores (nombre, contacto, telefono, email) VALUES
('Distribuidora Premium S.A.', 'Carlos Méndez', '3001234567', 'carlos@premium.com'),
('Cervezas del Valle', 'Ana Torres', '3109876543', 'ana@valle.com');

-- Usuarios se crean en migrate.js con bcrypt (admin123, staff123, cliente123)
