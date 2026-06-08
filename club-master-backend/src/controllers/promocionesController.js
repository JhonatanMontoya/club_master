import { query } from '../config/db.js';

async function enrichPromocion(promo) {
  const detalles = await query('SELECT producto_id FROM detalle_promocion WHERE promocion_id = ?', [promo.id]);
  return { ...promo, producto_ids: detalles.map((d) => d.producto_id) };
}

export async function getPromocionesPublicas(_req, res) {
  try {
    const promos = await query(
      `SELECT * FROM promociones WHERE activa = 1
       AND (fecha_inicio IS NULL OR fecha_inicio <= CURDATE())
       AND (fecha_fin IS NULL OR fecha_fin >= CURDATE())
       ORDER BY created_at DESC`
    );
    const enriched = await Promise.all(promos.map(enrichPromocion));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
