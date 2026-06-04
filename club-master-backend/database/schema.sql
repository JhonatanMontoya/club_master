-- CLUB MASTER - Esquema completo MySQL
-- Ejecutar: mysql -u user -p database < database/schema.sql

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS auditoria_sistema;
DROP TABLE IF EXISTS historial_pedido;
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS detalle_pedido;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS detalle_promocion;
DROP TABLE IF EXISTS promociones;
DROP TABLE IF EXISTS movimientos_inventario;
DROP TABLE IF EXISTS inventario;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS categorias;
DROP TABLE IF EXISTS reservas;
DROP TABLE IF EXISTS mesas;
DROP TABLE IF EXISTS proveedores;
DROP TABLE IF EXISTS metodos_pago;
DROP TABLE IF EXISTS estados_pedido;
DROP TABLE IF EXISTS usuarios;
DROP TABLE IF EXISTS roles;

SET FOREIGN_KEY_CHECKS = 1;

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  rol_id INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(150) UNIQUE,
  telefono VARCHAR(20),
  password_hash VARCHAR(255),
  activo TINYINT(1) DEFAULT 1,
  es_invitado TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE mesas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero INT NOT NULL UNIQUE,
  codigo_qr VARCHAR(100) UNIQUE,
  capacidad INT DEFAULT 4,
  zona VARCHAR(50),
  estado ENUM('disponible', 'ocupada', 'reservada', 'mantenimiento') DEFAULT 'disponible',
  activa TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reservas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  mesa_id INT NOT NULL,
  usuario_id INT,
  nombre_cliente VARCHAR(120) NOT NULL,
  telefono VARCHAR(20),
  fecha_reserva DATETIME NOT NULL,
  personas INT DEFAULT 2,
  estado ENUM('pendiente', 'confirmada', 'cancelada', 'completada') DEFAULT 'pendiente',
  notas TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mesa_id) REFERENCES mesas(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(80) NOT NULL,
  slug VARCHAR(80) NOT NULL UNIQUE,
  icono VARCHAR(50),
  orden INT DEFAULT 0,
  activa TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  categoria_id INT NOT NULL,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(12, 2) NOT NULL,
  imagen_url VARCHAR(500),
  destacado TINYINT(1) DEFAULT 0,
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id)
);

CREATE TABLE promociones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descripcion TEXT,
  descuento_porcentaje DECIMAL(5, 2) DEFAULT 0,
  imagen_url VARCHAR(500),
  fecha_inicio DATE,
  fecha_fin DATE,
  activa TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE detalle_promocion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  promocion_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT DEFAULT 1,
  FOREIGN KEY (promocion_id) REFERENCES promociones(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  contacto VARCHAR(120),
  telefono VARCHAR(20),
  email VARCHAR(150),
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL UNIQUE,
  stock_actual INT DEFAULT 0,
  stock_minimo INT DEFAULT 5,
  unidad VARCHAR(30) DEFAULT 'unidad',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE movimientos_inventario (
  id INT AUTO_INCREMENT PRIMARY KEY,
  inventario_id INT NOT NULL,
  tipo ENUM('entrada', 'salida', 'ajuste') NOT NULL,
  cantidad INT NOT NULL,
  motivo VARCHAR(255),
  usuario_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (inventario_id) REFERENCES inventario(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE estados_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  orden INT NOT NULL,
  color VARCHAR(20) DEFAULT '#D4AF37'
);

CREATE TABLE metodos_pago (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  codigo VARCHAR(30) NOT NULL UNIQUE,
  activo TINYINT(1) DEFAULT 1
);

CREATE TABLE pedidos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  mesa_id INT NOT NULL,
  estado_id INT NOT NULL,
  subtotal DECIMAL(12, 2) DEFAULT 0,
  total DECIMAL(12, 2) DEFAULT 0,
  notas TEXT,
  nombre_cliente VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (mesa_id) REFERENCES mesas(id),
  FOREIGN KEY (estado_id) REFERENCES estados_pedido(id)
);

CREATE TABLE detalle_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE pagos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  metodo_pago_id INT NOT NULL,
  monto DECIMAL(12, 2) NOT NULL,
  estado ENUM('pendiente', 'completado', 'fallido', 'reembolsado') DEFAULT 'pendiente',
  referencia VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
  FOREIGN KEY (metodo_pago_id) REFERENCES metodos_pago(id)
);

CREATE TABLE historial_pedido (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pedido_id INT NOT NULL,
  estado_id INT NOT NULL,
  usuario_id INT,
  comentario VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
  FOREIGN KEY (estado_id) REFERENCES estados_pedido(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE auditoria_sistema (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  accion VARCHAR(100) NOT NULL,
  modulo VARCHAR(80),
  detalle TEXT,
  ip VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE INDEX idx_pedidos_estado ON pedidos(estado_id);
CREATE INDEX idx_pedidos_mesa ON pedidos(mesa_id);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_usuarios_rol ON usuarios(rol_id);
