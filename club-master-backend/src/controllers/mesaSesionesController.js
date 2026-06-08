import { query } from '../config/db.js';

async function sesionActivaEnMesa(mesaId) {
  const rows = await query(
    `SELECT id, nombre_cliente, estado, created_at FROM mesa_sesiones
     WHERE mesa_id = ? AND estado IN ('pendiente', 'activa')
     ORDER BY created_at DESC LIMIT 1`,
    [mesaId]
  );
  return rows[0] || null;
}

async function liberarMesaSiCorresponde(mesaId, sesionId) {
  const otras = await query(
    `SELECT id FROM mesa_sesiones
     WHERE mesa_id = ? AND id != ? AND estado IN ('pendiente', 'activa')`,
    [mesaId, sesionId]
  );
  if (!otras.length) {
    await query("UPDATE mesas SET estado = 'disponible' WHERE id = ?", [mesaId]);
  }
}

function formatSesion(row) {
  return {
    id: row.id,
    mesa_id: row.mesa_id,
    mesa_numero: row.mesa_numero,
    mesa_zona: row.mesa_zona,
    usuario_id: row.usuario_id,
    nombre_cliente: row.nombre_cliente,
    estado: row.estado,
    created_at: row.created_at,
    confirmado_at: row.confirmado_at,
    confirmado_por: row.confirmado_por,
    cerrado_at: row.cerrado_at,
    cerrado_por: row.cerrado_por,
  };
}

export async function getSesiones(req, res) {
  try {
    const rows = await query(
      `SELECT s.*, m.numero AS mesa_numero, m.zona AS mesa_zona
       FROM mesa_sesiones s
       JOIN mesas m ON m.id = s.mesa_id
       WHERE s.estado IN ('pendiente', 'activa')
       ORDER BY s.created_at DESC`
    );
    res.json(rows.map(formatSesion));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getMiSesion(req, res) {
  try {
    const rows = await query(
      `SELECT s.*, m.numero AS mesa_numero, m.zona AS mesa_zona, m.id AS mesa_id_ref,
              m.codigo_qr, m.capacidad, m.zona, m.estado AS mesa_estado
       FROM mesa_sesiones s
       JOIN mesas m ON m.id = s.mesa_id
       WHERE s.usuario_id = ? AND s.estado IN ('pendiente', 'activa')
       ORDER BY s.created_at DESC LIMIT 1`,
      [req.user.id]
    );
    if (!rows.length) return res.json(null);

    const row = rows[0];
    const sesion = formatSesion(row);
    const sesionMesa = await sesionActivaEnMesa(row.mesa_id);
    sesion.mesa = {
      id: row.mesa_id,
      numero: row.mesa_numero,
      codigo_qr: row.codigo_qr,
      capacidad: row.capacidad,
      zona: row.zona,
      estado: row.mesa_estado,
      sesion: sesionMesa
        ? { id: sesionMesa.id, nombre_cliente: sesionMesa.nombre_cliente, estado: sesionMesa.estado, created_at: sesionMesa.created_at }
        : null,
    };
    res.json(sesion);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createSesion(req, res) {
  try {
    const mesaId = Number(req.body.mesa_id);
    const mesas = await query('SELECT * FROM mesas WHERE id = ? AND activa = 1', [mesaId]);
    if (!mesas.length) return res.status(404).json({ message: 'Mesa no encontrada' });

    const conflicto = await query(
      `SELECT id FROM mesa_sesiones
       WHERE mesa_id = ? AND estado IN ('pendiente', 'activa') AND usuario_id != ?`,
      [mesaId, req.user.id]
    );
    if (conflicto.length) {
      return res.status(409).json({
        message: 'Esta mesa ya tiene un cliente registrado. Pide al mesero que confirme tu ubicación.',
      });
    }

    const existente = await query(
      `SELECT s.*, m.numero AS mesa_numero, m.zona AS mesa_zona, m.codigo_qr, m.capacidad, m.estado AS mesa_estado
       FROM mesa_sesiones s JOIN mesas m ON m.id = s.mesa_id
       WHERE s.usuario_id = ? AND s.estado IN ('pendiente', 'activa') LIMIT 1`,
      [req.user.id]
    );
    if (existente.length) {
      const row = existente[0];
      const sesion = formatSesion(row);
      sesion.mesa = {
        id: row.mesa_id,
        numero: row.mesa_numero,
        codigo_qr: row.codigo_qr,
        capacidad: row.capacidad,
        zona: row.mesa_zona,
        estado: row.mesa_estado,
      };
      return res.json(sesion);
    }

    const result = await query(
      `INSERT INTO mesa_sesiones (mesa_id, usuario_id, nombre_cliente, estado)
       VALUES (?, ?, ?, 'pendiente')`,
      [mesaId, req.user.id, req.user.nombre || 'Cliente']
    );

    const mesa = mesas[0];
    const sesionMesa = await sesionActivaEnMesa(mesaId);
    res.status(201).json({
      id: result.insertId,
      mesa_id: mesaId,
      mesa_numero: mesa.numero,
      mesa_zona: mesa.zona,
      usuario_id: req.user.id,
      nombre_cliente: req.user.nombre || 'Cliente',
      estado: 'pendiente',
      created_at: new Date(),
      mesa: {
        ...mesa,
        sesion: sesionMesa
          ? { id: sesionMesa.id, nombre_cliente: sesionMesa.nombre_cliente, estado: sesionMesa.estado, created_at: sesionMesa.created_at }
          : null,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function cerrarSesion(req, res) {
  try {
    const sesiones = await query('SELECT * FROM mesa_sesiones WHERE id = ?', [req.params.id]);
    if (!sesiones.length) return res.status(404).json({ message: 'Sesión no encontrada' });

    const sesion = sesiones[0];
    if (!['pendiente', 'activa'].includes(sesion.estado)) {
      return res.status(400).json({ message: 'La sesión ya está cerrada' });
    }

    const esStaff = ['staff', 'admin'].includes(req.user.rol);
    const esDueño = req.user.rol === 'cliente' && sesion.usuario_id === req.user.id;
    if (!esStaff && !esDueño) return res.status(403).json({ message: 'No autorizado' });

    await query(
      `UPDATE mesa_sesiones SET estado = 'cerrada', cerrado_por = ?, cerrado_at = NOW() WHERE id = ?`,
      [req.user.nombre, sesion.id]
    );
    await liberarMesaSiCorresponde(sesion.mesa_id, sesion.id);

    res.json({ ...sesion, estado: 'cerrada', cerrado_por: req.user.nombre });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function enrichMesaWithSesion(mesa) {
  const sesion = await sesionActivaEnMesa(mesa.id);
  return {
    ...mesa,
    sesion: sesion
      ? { id: sesion.id, nombre_cliente: sesion.nombre_cliente, estado: sesion.estado, created_at: sesion.created_at }
      : null,
  };
}
