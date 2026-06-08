import { query } from '../config/db.js';

export async function getMesas(req, res) {
  try {
    const mesas = await query(
      'SELECT id, numero, codigo_qr, capacidad, zona, estado FROM mesas WHERE activa = 1 ORDER BY numero'
    );
    res.json(mesas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getMesaByCodigo(req, res) {
  try {
    const { codigo } = req.params;
    const mesas = await query(
      'SELECT id, numero, codigo_qr, capacidad, zona, estado FROM mesas WHERE codigo_qr = ? OR numero = ?',
      [codigo, codigo]
    );
    if (!mesas.length) return res.status(404).json({ message: 'Mesa no encontrada' });
    res.json(mesas[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateMesaEstado(req, res) {
  try {
    const { id } = req.params;
    const { estado } = req.body;
    await query('UPDATE mesas SET estado = ? WHERE id = ?', [estado, id]);
    res.json({ message: 'Estado actualizado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createMesa(req, res) {
  try {
    const { numero, codigo_qr, capacidad, zona } = req.body;
    const result = await query(
      'INSERT INTO mesas (numero, codigo_qr, capacidad, zona) VALUES (?, ?, ?, ?)',
      [numero, codigo_qr || `MESA-${String(numero).padStart(3, '0')}`, capacidad || 4, zona || 'General']
    );
    res.status(201).json({ id: result.insertId, message: 'Mesa creada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateMesa(req, res) {
  try {
    const { numero, codigo_qr, capacidad, zona, estado } = req.body;
    await query(
      'UPDATE mesas SET numero=?, codigo_qr=?, capacidad=?, zona=?, estado=? WHERE id=?',
      [numero, codigo_qr, capacidad, zona, estado, req.params.id]
    );
    res.json({ message: 'Mesa actualizada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteMesa(req, res) {
  try {
    await query('UPDATE mesas SET activa = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Mesa desactivada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
