import { query } from '../config/db.js';

export async function getCategorias(_req, res) {
  try {
    const categorias = await query(
      'SELECT * FROM categorias WHERE activa = 1 ORDER BY orden'
    );
    res.json(categorias);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getProductos(req, res) {
  try {
    const { categoria, destacado } = req.query;
    let sql = `SELECT p.*, c.nombre AS categoria_nombre, c.slug AS categoria_slug
               FROM productos p JOIN categorias c ON c.id = p.categoria_id WHERE p.activo = 1`;
    const params = [];

    if (categoria) {
      sql += ' AND c.slug = ?';
      params.push(categoria);
    }
    if (destacado === '1') {
      sql += ' AND p.destacado = 1';
    }
    sql += ' ORDER BY p.destacado DESC, p.nombre';

    const productos = await query(sql, params);
    res.json(productos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getProductoById(req, res) {
  try {
    const productos = await query(
      `SELECT p.*, c.nombre AS categoria_nombre FROM productos p
       JOIN categorias c ON c.id = p.categoria_id WHERE p.id = ?`,
      [req.params.id]
    );
    if (!productos.length) return res.status(404).json({ message: 'Producto no encontrado' });
    res.json(productos[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createProducto(req, res) {
  try {
    const { categoria_id, nombre, descripcion, precio, imagen_url, destacado } = req.body;
    const result = await query(
      'INSERT INTO productos (categoria_id, nombre, descripcion, precio, imagen_url, destacado) VALUES (?, ?, ?, ?, ?, ?)',
      [categoria_id, nombre, descripcion, precio, imagen_url, destacado ? 1 : 0]
    );
    await query(
      'INSERT INTO inventario (producto_id, stock_actual, stock_minimo) VALUES (?, 0, 5)',
      [result.insertId]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateProducto(req, res) {
  try {
    const { categoria_id, nombre, descripcion, precio, imagen_url, destacado, activo } = req.body;
    await query(
      `UPDATE productos SET categoria_id=?, nombre=?, descripcion=?, precio=?, imagen_url=?, destacado=?, activo=? WHERE id=?`,
      [categoria_id, nombre, descripcion, precio, imagen_url, destacado ? 1 : 0, activo ?? 1, req.params.id]
    );
    res.json({ message: 'Producto actualizado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteProducto(req, res) {
  try {
    await query('UPDATE productos SET activo = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Producto desactivado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createCategoria(req, res) {
  try {
    const { nombre, slug, icono, orden } = req.body;
    const result = await query(
      'INSERT INTO categorias (nombre, slug, icono, orden) VALUES (?, ?, ?, ?)',
      [nombre, slug, icono, orden || 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateCategoria(req, res) {
  try {
    const { nombre, slug, icono, orden, activa } = req.body;
    await query(
      'UPDATE categorias SET nombre=?, slug=?, icono=?, orden=?, activa=? WHERE id=?',
      [nombre, slug, icono, orden, activa ?? 1, req.params.id]
    );
    res.json({ message: 'Categoría actualizada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
