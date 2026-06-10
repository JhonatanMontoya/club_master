import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Clever Cloud / planes compartidos suelen limitar a 5 conexiones totales.
const pool = mysql.createPool({
  host: process.env.MYSQL_ADDON_HOST,
  port: Number(process.env.MYSQL_ADDON_PORT) || 3306,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_POOL_SIZE) || 1,
  maxIdle: 1,
  idleTimeout: 30_000,
  queueLimit: 0,
  enableKeepAlive: true,
});

export default pool;

function isConnectionLimitError(err) {
  return err?.message?.includes('max_user_connections');
}

export async function query(sql, params = [], retries = 4) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (err) {
      lastErr = err;
      if (isConnectionLimitError(err) && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}
