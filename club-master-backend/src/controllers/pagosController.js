import { query } from '../config/db.js';

export async function getMetodosPago(_req, res) {
  try {
    const metodos = await query('SELECT * FROM metodos_pago WHERE activo = 1');
    res.json(metodos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createPago(req, res) {
  try {
    const { pedido_id, metodo_pago_id, monto, referencia } = req.body;
    const result = await query(
      'INSERT INTO pagos (pedido_id, metodo_pago_id, monto, estado, referencia) VALUES (?, ?, ?, ?, ?)',
      [pedido_id, metodo_pago_id, monto, 'completado', referencia || null]
    );
    res.status(201).json({ id: result.insertId, message: 'Pago registrado' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getPagos(_req, res) {
  try {
    const pagos = await query(
      `SELECT pg.*, mp.nombre AS metodo, p.total AS pedido_total, m.numero AS mesa_numero
       FROM pagos pg JOIN metodos_pago mp ON mp.id = pg.metodo_pago_id
       JOIN pedidos p ON p.id = pg.pedido_id
       JOIN mesas m ON m.id = p.mesa_id
       ORDER BY pg.created_at DESC LIMIT 100`
    );
    res.json(pagos);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
