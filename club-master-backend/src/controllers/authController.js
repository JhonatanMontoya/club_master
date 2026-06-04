import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../config/jwt.js';
import { logAuditoria } from '../utils/helpers.js';

function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, rol: user.rol, nombre: user.nombre },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Correo y contraseña requeridos' });
    }

    const users = await query(
      `SELECT u.*, r.nombre AS rol FROM usuarios u
       JOIN roles r ON r.id = u.rol_id
       WHERE u.email = ? AND u.activo = 1`,
      [email]
    );

    if (!users.length) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash || '');
    if (!valid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = signToken(user);
    await logAuditoria(user.id, 'LOGIN', 'auth', 'Inicio de sesión', req.ip);

    res.json({
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        telefono: user.telefono,
        rol: user.rol,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function register(req, res) {
  try {
    const { nombre, email, telefono, password } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Nombre, correo y contraseña requeridos' });
    }

    const existing = await query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existing.length) {
      return res.status(409).json({ message: 'El correo ya está registrado' });
    }

    const hash = await bcrypt.hash(password, 10);
    const roles = await query("SELECT id FROM roles WHERE nombre = 'cliente'");
    const rolId = roles[0]?.id || 1;

    const result = await query(
      'INSERT INTO usuarios (rol_id, nombre, email, telefono, password_hash) VALUES (?, ?, ?, ?, ?)',
      [rolId, nombre, email, telefono || null, hash]
    );

    const user = {
      id: result.insertId,
      nombre,
      email,
      telefono,
      rol: 'cliente',
    };

    const token = signToken(user);
    await logAuditoria(user.id, 'REGISTER', 'auth', 'Registro de usuario', req.ip);

    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function guestLogin(req, res) {
  try {
    const { nombre } = req.body;
    if (!nombre?.trim()) {
      return res.status(400).json({ message: 'Nombre requerido' });
    }

    const roles = await query("SELECT id FROM roles WHERE nombre = 'cliente'");
    const rolId = roles[0]?.id || 1;

    const result = await query(
      'INSERT INTO usuarios (rol_id, nombre, es_invitado, activo) VALUES (?, ?, 1, 1)',
      [rolId, nombre.trim()]
    );

    const user = {
      id: result.insertId,
      nombre: nombre.trim(),
      email: null,
      rol: 'cliente',
    };

    const token = signToken(user);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function me(req, res) {
  try {
    const users = await query(
      `SELECT u.id, u.nombre, u.email, u.telefono, u.es_invitado, r.nombre AS rol
       FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE u.id = ?`,
      [req.user.id]
    );
    if (!users.length) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(users[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
