import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import seedPedidos from './seedPedidos.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function stripLineComments(sql) {
  return sql
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
}

async function runSqlFile(filePath) {
  const sql = stripLineComments(fs.readFileSync(filePath, 'utf8'));
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    if (stmt) await query(stmt);
  }
}

async function seedUsers() {
  const roles = await query('SELECT COUNT(*) AS c FROM roles');
  if (roles[0].c === 0) {
    await query(
      `INSERT INTO roles (nombre, descripcion) VALUES
       ('cliente', 'Usuario final que realiza pedidos'),
       ('staff', 'Personal operativo del local'),
       ('admin', 'Administrador del sistema')`
    );
  }

  const hash = await bcrypt.hash('admin123', 10);
  const staffHash = await bcrypt.hash('staff123', 10);
  const clientHash = await bcrypt.hash('cliente123', 10);

  await query(
    `INSERT IGNORE INTO usuarios (id, rol_id, nombre, email, telefono, password_hash) VALUES
     (1, 3, 'Admin CLUB MASTER', 'admin@clubmaster.com', '3000000001', ?),
     (2, 2, 'Staff Operativo', 'staff@clubmaster.com', '3000000002', ?),
     (3, 1, 'Cliente Demo', 'cliente@clubmaster.com', '3000000003', ?)`,
    [hash, staffHash, clientHash]
  );
}

async function migrate() {
  console.log('Ejecutando schema...');
  await runSqlFile(path.join(__dirname, '../../database/schema.sql'));
  console.log('Ejecutando seed...');
  await runSqlFile(path.join(__dirname, '../../database/seed.sql'));
  await seedUsers();
  console.log('Insertando pedidos demo...');
  await seedPedidos({ reset: false });
  console.log('Migración completada.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Error migración:', err.message);
  process.exit(1);
});
