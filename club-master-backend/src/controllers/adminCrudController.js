import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { enrichMesaWithSesion } from './mesaSesionesController.js';
import { loadPedidoCompleto, getEstadoId } from '../utils/pedidos.js';

async function enrichPromocion(promo) {
  const detalles = await query('SELECT producto_id FROM detalle_promocion WHERE promocion_id = ?', [promo.id]);
  return { ...promo, producto_ids: detalles.map((d) => d.producto_id) };
}

async function syncPromocionProductos(promocionId, productoIds = []) {
  await query('DELETE FROM detalle_promocion WHERE promocion_id = ?', [promocionId]);
  for (const pid of productoIds) {
    await query('INSERT INTO detalle_promocion (promocion_id, producto_id) VALUES (?, ?)', [promocionId, pid]);
  }
}

// ─── Productos ───
export async function getAdminProductos(_req, res) {
  try {
    const productos = await query(
      `SELECT p.*, c.nombre AS categoria_nombre, c.slug AS categoria_slug
       FROM productos p JOIN categorias c ON c.id = p.categoria_id
       ORDER BY p.nombre`
    );
    res.json(productos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createAdminProducto(req, res) {
  try {
    const { categoria_id, nombre, descripcion, precio, imagen_url, destacado, precio_descuento, descuento_activo } = req.body;
    const result = await query(
      `INSERT INTO productos (categoria_id, nombre, descripcion, precio, imagen_url, destacado, precio_descuento, descuento_activo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [categoria_id, nombre, descripcion, precio, imagen_url, destacado ? 1 : 0, precio_descuento || null, descuento_activo ? 1 : 0]
    );
    await query('INSERT INTO inventario (producto_id, stock_actual, stock_minimo) VALUES (?, 0, 5)', [result.insertId]);
    const rows = await query(
      `SELECT p.*, c.nombre AS categoria_nombre, c.slug AS categoria_slug FROM productos p
       JOIN categorias c ON c.id = p.categoria_id WHERE p.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateAdminProducto(req, res) {
  try {
    const { categoria_id, nombre, descripcion, precio, imagen_url, destacado, activo, precio_descuento, descuento_activo } = req.body;
    await query(
      `UPDATE productos SET categoria_id=?, nombre=?, descripcion=?, precio=?, imagen_url=?,
       destacado=?, activo=?, precio_descuento=?, descuento_activo=? WHERE id=?`,
      [categoria_id, nombre, descripcion, precio, imagen_url, destacado ? 1 : 0, activo ?? 1,
        precio_descuento || null, descuento_activo ? 1 : 0, req.params.id]
    );
    const rows = await query(
      `SELECT p.*, c.nombre AS categoria_nombre, c.slug AS categoria_slug FROM productos p
       JOIN categorias c ON c.id = p.categoria_id WHERE p.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteAdminProducto(req, res) {
  try {
    await query('UPDATE productos SET activo = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Producto desactivado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── Categorías ───
export async function getAdminCategorias(_req, res) {
  try {
    const categorias = await query('SELECT * FROM categorias ORDER BY orden');
    const counts = await query(
      'SELECT categoria_id, COUNT(*) AS cnt FROM productos WHERE activo = 1 GROUP BY categoria_id'
    );
    const countMap = Object.fromEntries(counts.map((c) => [c.categoria_id, c.cnt]));
    res.json(categorias.map((c) => ({ ...c, productos_count: countMap[c.id] || 0 })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createAdminCategoria(req, res) {
  try {
    const { nombre, slug, icono, orden } = req.body;
    const result = await query(
      'INSERT INTO categorias (nombre, slug, icono, orden) VALUES (?, ?, ?, ?)',
      [nombre, slug, icono, orden || 0]
    );
    const rows = await query('SELECT * FROM categorias WHERE id = ?', [result.insertId]);
    res.status(201).json({ ...rows[0], productos_count: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateAdminCategoria(req, res) {
  try {
    const { nombre, slug, icono, orden, activa } = req.body;
    await query(
      'UPDATE categorias SET nombre=?, slug=?, icono=?, orden=?, activa=? WHERE id=?',
      [nombre, slug, icono, orden, activa ?? 1, req.params.id]
    );
    const rows = await query('SELECT * FROM categorias WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    const [cnt] = await query('SELECT COUNT(*) AS cnt FROM productos WHERE categoria_id = ? AND activo = 1', [req.params.id]);
    res.json({ ...rows[0], productos_count: cnt.cnt });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteAdminCategoria(req, res) {
  try {
    await query('UPDATE categorias SET activa = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Categoría desactivada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── Inventario ───
export async function patchInventario(req, res) {
  try {
    const { stock_actual, stock_minimo, unidad } = req.body;
    const fields = [];
    const params = [];
    if (stock_actual != null) { fields.push('stock_actual = ?'); params.push(stock_actual); }
    if (stock_minimo != null) { fields.push('stock_minimo = ?'); params.push(stock_minimo); }
    if (unidad != null) { fields.push('unidad = ?'); params.push(unidad); }
    if (!fields.length) return res.status(400).json({ message: 'Sin cambios' });
    params.push(req.params.id);
    await query(`UPDATE inventario SET ${fields.join(', ')} WHERE id = ?`, params);
    const rows = await query(
      `SELECT i.*, p.nombre AS producto_nombre, p.precio FROM inventario i
       JOIN productos p ON p.id = i.producto_id WHERE i.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function inventarioMovimiento(req, res) {
  try {
    const { inventario_id, tipo, cantidad, motivo } = req.body;
    const invRows = await query('SELECT * FROM inventario WHERE id = ?', [inventario_id]);
    if (!invRows.length) return res.status(404).json({ message: 'Inventario no encontrado' });

    const inv = invRows[0];
    let nuevoStock = inv.stock_actual;
    if (tipo === 'entrada') nuevoStock += cantidad;
    else if (tipo === 'salida') nuevoStock = Math.max(0, inv.stock_actual - cantidad);
    else nuevoStock = cantidad;

    await query('UPDATE inventario SET stock_actual = ? WHERE id = ?', [nuevoStock, inventario_id]);
    const movResult = await query(
      'INSERT INTO movimientos_inventario (inventario_id, tipo, cantidad, motivo, usuario_id) VALUES (?, ?, ?, ?, ?)',
      [inventario_id, tipo, cantidad, motivo, req.user?.id]
    );

    const invUpdated = await query(
      `SELECT i.*, p.nombre AS producto_nombre, p.precio FROM inventario i
       JOIN productos p ON p.id = i.producto_id WHERE i.id = ?`,
      [inventario_id]
    );
    const mov = await query('SELECT * FROM movimientos_inventario WHERE id = ?', [movResult.insertId]);
    res.json({ inventario: invUpdated[0], movimiento: mov[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getInventarioMovimientos(_req, res) {
  try {
    const movs = await query(
      `SELECT m.*, i.producto_id, p.nombre AS producto_nombre
       FROM movimientos_inventario m
       JOIN inventario i ON i.id = m.inventario_id
       JOIN productos p ON p.id = i.producto_id
       ORDER BY m.created_at DESC LIMIT 50`
    );
    res.json(movs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── Promociones ───
export async function getAdminPromocionesAll(_req, res) {
  try {
    const promos = await query('SELECT * FROM promociones ORDER BY created_at DESC');
    const enriched = await Promise.all(promos.map(enrichPromocion));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createAdminPromocion(req, res) {
  try {
    const { titulo, descripcion, tipo, descuento_porcentaje, imagen_url, fecha_inicio, fecha_fin, producto_ids } = req.body;
    const result = await query(
      `INSERT INTO promociones (titulo, descripcion, tipo, descuento_porcentaje, imagen_url, fecha_inicio, fecha_fin, activa)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [titulo, descripcion, tipo || 'descuento', descuento_porcentaje || 0, imagen_url, fecha_inicio, fecha_fin]
    );
    await syncPromocionProductos(result.insertId, producto_ids || []);
    const rows = await query('SELECT * FROM promociones WHERE id = ?', [result.insertId]);
    res.status(201).json(await enrichPromocion(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateAdminPromocion(req, res) {
  try {
    const { titulo, descripcion, tipo, descuento_porcentaje, imagen_url, fecha_inicio, fecha_fin, activa, producto_ids } = req.body;
    await query(
      `UPDATE promociones SET titulo=?, descripcion=?, tipo=?, descuento_porcentaje=?, imagen_url=?,
       fecha_inicio=?, fecha_fin=?, activa=? WHERE id=?`,
      [titulo, descripcion, tipo, descuento_porcentaje, imagen_url, fecha_inicio, fecha_fin, activa ?? 1, req.params.id]
    );
    if (producto_ids) await syncPromocionProductos(req.params.id, producto_ids);
    const rows = await query('SELECT * FROM promociones WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(await enrichPromocion(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteAdminPromocion(req, res) {
  try {
    await query('UPDATE promociones SET activa = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Promoción desactivada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── Reservas ───
export async function createAdminReserva(req, res) {
  try {
    const { mesa_id, nombre_cliente, telefono, fecha_reserva, personas, notas } = req.body;
    const result = await query(
      `INSERT INTO reservas (mesa_id, nombre_cliente, telefono, fecha_reserva, personas, notas, estado)
       VALUES (?, ?, ?, ?, ?, ?, 'pendiente')`,
      [mesa_id, nombre_cliente, telefono, fecha_reserva, personas || 2, notas]
    );
    await query("UPDATE mesas SET estado = 'reservada' WHERE id = ?", [mesa_id]);
    const rows = await query(
      `SELECT r.*, m.numero AS mesa_numero FROM reservas r JOIN mesas m ON m.id = r.mesa_id WHERE r.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateAdminReserva(req, res) {
  try {
    const fields = ['mesa_id', 'nombre_cliente', 'telefono', 'fecha_reserva', 'personas', 'notas', 'estado'];
    const sets = [];
    const params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) { sets.push(`${f} = ?`); params.push(req.body[f]); }
    }
    if (!sets.length) return res.status(400).json({ message: 'Sin cambios' });
    params.push(req.params.id);
    await query(`UPDATE reservas SET ${sets.join(', ')} WHERE id = ?`, params);
    const rows = await query(
      `SELECT r.*, m.numero AS mesa_numero FROM reservas r JOIN mesas m ON m.id = r.mesa_id WHERE r.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteAdminReserva(req, res) {
  try {
    const rows = await query('SELECT mesa_id FROM reservas WHERE id = ?', [req.params.id]);
    await query('DELETE FROM reservas WHERE id = ?', [req.params.id]);
    if (rows.length) {
      await query("UPDATE mesas SET estado = 'disponible' WHERE id = ? AND estado = 'reservada'", [rows[0].mesa_id]);
    }
    res.json({ message: 'Reserva eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── Usuarios y Staff ───
export async function createAdminUsuario(req, res) {
  try {
    const { nombre, email, telefono, password, rol } = req.body;
    const roles = await query('SELECT id FROM roles WHERE nombre = ?', [rol || 'cliente']);
    const hash = await bcrypt.hash(password || 'cliente123', 10);
    const result = await query(
      'INSERT INTO usuarios (rol_id, nombre, email, telefono, password_hash) VALUES (?, ?, ?, ?, ?)',
      [roles[0]?.id || 1, nombre, email, telefono, hash]
    );
    const rows = await query(
      `SELECT u.id, u.nombre, u.email, u.telefono, u.activo, r.nombre AS rol FROM usuarios u
       JOIN roles r ON r.id = u.rol_id WHERE u.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateAdminUsuario(req, res) {
  try {
    const { nombre, email, telefono, activo, rol } = req.body;
    const params = [nombre, email, telefono, activo ?? 1];
    let sql = 'UPDATE usuarios SET nombre=?, email=?, telefono=?, activo=?';
    if (rol) {
      const roles = await query('SELECT id FROM roles WHERE nombre = ?', [rol]);
      sql += ', rol_id=?';
      params.push(roles[0]?.id);
    }
    sql += ' WHERE id=?';
    params.push(req.params.id);
    await query(sql, params);
    const rows = await query(
      `SELECT u.id, u.nombre, u.email, u.telefono, u.activo, r.nombre AS rol FROM usuarios u
       JOIN roles r ON r.id = u.rol_id WHERE u.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getAdminStaff(_req, res) {
  try {
    const staff = await query(
      `SELECT u.id, u.nombre, u.email, u.telefono, u.subrol, u.activo FROM usuarios u
       JOIN roles r ON r.id = u.rol_id WHERE r.nombre = 'staff' ORDER BY u.nombre`
    );
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createAdminStaff(req, res) {
  try {
    const { nombre, email, telefono, subrol, password } = req.body;
    const roles = await query("SELECT id FROM roles WHERE nombre = 'staff'");
    const hash = await bcrypt.hash(password || 'staff123', 10);
    const result = await query(
      'INSERT INTO usuarios (rol_id, nombre, email, telefono, subrol, password_hash) VALUES (?, ?, ?, ?, ?, ?)',
      [roles[0].id, nombre, email, telefono, subrol || 'mesero', hash]
    );
    const rows = await query(
      `SELECT u.id, u.nombre, u.email, u.telefono, u.subrol, u.activo FROM usuarios u WHERE u.id = ?`,
      [result.insertId]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateAdminStaff(req, res) {
  try {
    const { nombre, email, telefono, subrol, activo } = req.body;
    await query(
      'UPDATE usuarios SET nombre=?, email=?, telefono=?, subrol=?, activo=? WHERE id=?',
      [nombre, email, telefono, subrol, activo ?? 1, req.params.id]
    );
    const rows = await query(
      `SELECT u.id, u.nombre, u.email, u.telefono, u.subrol, u.activo FROM usuarios u
       JOIN roles r ON r.id = u.rol_id WHERE u.id = ? AND r.nombre = 'staff'`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── Pedidos admin ───
export async function getAdminPedidos(req, res) {
  try {
    const { estado } = req.query;
    let sql = `SELECT p.id, p.total, p.created_at, p.nombre_cliente, m.numero AS mesa_numero,
                      e.nombre AS estado, e.color AS estado_color
               FROM pedidos p JOIN mesas m ON m.id = p.mesa_id
               JOIN estados_pedido e ON e.id = p.estado_id WHERE 1=1`;
    const params = [];
    if (estado === 'activos') sql += " AND e.nombre NOT IN ('entregado', 'cancelado')";
    else if (estado === 'entregados') sql += " AND e.nombre = 'entregado'";
    else if (estado === 'cancelados') sql += " AND e.nombre = 'cancelado'";
    sql += ' ORDER BY p.created_at DESC LIMIT 200';
    const pedidos = await query(sql, params);
    for (const p of pedidos) {
      p.total = Number(p.total);
    }
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function adminUpdatePedidoEstado(req, res) {
  try {
    const estadoId = await getEstadoId(req.body.estado);
    if (!estadoId) return res.status(400).json({ message: 'Estado inválido' });
    await query('UPDATE pedidos SET estado_id = ? WHERE id = ?', [estadoId, req.params.id]);
    const pedido = await loadPedidoCompleto(req.params.id);
    if (!pedido) return res.status(404).json({ message: 'No encontrado' });
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── Pagos admin ───
export async function getAdminPagos(req, res) {
  try {
    let sql = `SELECT pg.*, mp.nombre AS metodo, mp.codigo AS metodo_codigo,
                      p.total AS pedido_total, m.numero AS mesa_numero
               FROM pagos pg JOIN metodos_pago mp ON mp.id = pg.metodo_pago_id
               JOIN pedidos p ON p.id = pg.pedido_id
               JOIN mesas m ON m.id = p.mesa_id WHERE 1=1`;
    const params = [];
    if (req.query.estado) { sql += ' AND pg.estado = ?'; params.push(req.query.estado); }
    if (req.query.metodo) { sql += ' AND mp.codigo = ?'; params.push(req.query.metodo); }
    sql += ' ORDER BY pg.created_at DESC LIMIT 200';
    const pagos = await query(sql, params);

    if (req.query.resumen === '1') {
      const all = await query(
        `SELECT pg.monto, pg.estado, mp.codigo AS metodo_codigo FROM pagos pg
         JOIN metodos_pago mp ON mp.id = pg.metodo_pago_id`
      );
      const sum = (arr) => arr.reduce((s, p) => s + Number(p.monto), 0);
      const byMetodo = (codigo) => all.filter((p) => p.metodo_codigo === codigo);
      const resumenMetodo = (codigo) => {
        const list = byMetodo(codigo);
        const completados = list.filter((p) => p.estado === 'completado');
        const pendientes = list.filter((p) => p.estado === 'pendiente');
        return { total: sum(completados), count: completados.length, pendientes: pendientes.length };
      };
      return res.json({
        pagos,
        resumen: {
          qr: resumenMetodo('qr'),
          tarjeta: resumenMetodo('tarjeta'),
          efectivo: resumenMetodo('efectivo'),
          pendiente_total: sum(all.filter((p) => p.estado === 'pendiente')),
          pendientes_count: all.filter((p) => p.estado === 'pendiente').length,
        },
      });
    }
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function patchAdminPago(req, res) {
  try {
    const { estado, referencia } = req.body;
    const fields = [];
    const params = [];
    if (estado) { fields.push('estado = ?'); params.push(estado); }
    if (referencia !== undefined) { fields.push('referencia = ?'); params.push(referencia); }
    if (!fields.length) return res.status(400).json({ message: 'Sin cambios' });
    params.push(req.params.id);
    await query(`UPDATE pagos SET ${fields.join(', ')} WHERE id = ?`, params);
    const rows = await query(
      `SELECT pg.*, mp.nombre AS metodo, mp.codigo AS metodo_codigo FROM pagos pg
       JOIN metodos_pago mp ON mp.id = pg.metodo_pago_id WHERE pg.id = ?`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ─── Mesas admin ───
export async function getAdminMesas(req, res) {
  try {
    let sql = 'SELECT * FROM mesas WHERE activa = 1';
    const params = [];
    if (req.query.zona) { sql += ' AND zona = ?'; params.push(req.query.zona); }
    if (req.query.estado) { sql += ' AND estado = ?'; params.push(req.query.estado); }
    sql += ' ORDER BY numero';
    const mesas = await query(sql, params);
    const enriched = await Promise.all(mesas.map(enrichMesaWithSesion));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createAdminMesa(req, res) {
  try {
    const { numero, codigo_qr, capacidad, zona, estado } = req.body;
    const result = await query(
      'INSERT INTO mesas (numero, codigo_qr, capacidad, zona, estado) VALUES (?, ?, ?, ?, ?)',
      [numero, codigo_qr || `MESA-${String(numero).padStart(3, '0')}`, capacidad || 4, zona || 'General', estado || 'disponible']
    );
    const rows = await query('SELECT * FROM mesas WHERE id = ?', [result.insertId]);
    res.status(201).json(await enrichMesaWithSesion(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateAdminMesa(req, res) {
  try {
    const { numero, codigo_qr, capacidad, zona, estado } = req.body;
    await query(
      'UPDATE mesas SET numero=?, codigo_qr=?, capacidad=?, zona=?, estado=? WHERE id=?',
      [numero, codigo_qr, capacidad, zona, estado, req.params.id]
    );
    const rows = await query('SELECT * FROM mesas WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(await enrichMesaWithSesion(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function patchAdminMesaEstado(req, res) {
  try {
    await query('UPDATE mesas SET estado = ? WHERE id = ?', [req.body.estado, req.params.id]);
    const rows = await query('SELECT * FROM mesas WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ message: 'No encontrado' });
    res.json(await enrichMesaWithSesion(rows[0]));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteAdminMesa(req, res) {
  try {
    await query('UPDATE mesas SET activa = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Mesa desactivada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
