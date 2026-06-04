import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import pool from '../config/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runSqlFile(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'));

  const conn = await pool.getConnection();
  try {
    for (const stmt of statements) {
      if (stmt) await conn.query(stmt);
    }
  } finally {
    conn.release();
  }
}

async function seedUsers() {
  const hash = await bcrypt.hash('admin123', 10);
  const staffHash = await bcrypt.hash('staff123', 10);
  const clientHash = await bcrypt.hash('cliente123', 10);

  await pool.execute(
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
  console.log('Migración completada.');
  process.exit(0);
}

migrate().catch((err) => {
  console.error('Error migración:', err.message);
  process.exit(1);
});
