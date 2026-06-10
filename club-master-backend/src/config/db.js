import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.MYSQL_ADDON_HOST,
  port: Number(process.env.MYSQL_ADDON_PORT) || 3306,
  user: process.env.MYSQL_ADDON_USER,
  password: process.env.MYSQL_ADDON_PASSWORD,
  database: process.env.MYSQL_ADDON_DB,
};

function isConnectionLimitError(err) {
  return err?.message?.includes('max_user_connections');
}

async function openConnection(retries = 5) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      return await mysql.createConnection(dbConfig);
    } catch (err) {
      lastErr = err;
      if (isConnectionLimitError(err) && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

/** Una conexión por consulta: libera el slot en Clever Cloud (máx. 5). */
export async function query(sql, params = [], retries = 5) {
  let lastErr;
  for (let attempt = 0; attempt < retries; attempt += 1) {
    const conn = await openConnection(retries);
    try {
      const [rows] = await conn.execute(sql, params);
      return rows;
    } catch (err) {
      lastErr = err;
      if (isConnectionLimitError(err) && attempt < retries - 1) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }
      throw err;
    } finally {
      await conn.end().catch(() => {});
    }
  }
  throw lastErr;
}

export async function withTransaction(fn) {
  const conn = await openConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback().catch(() => {});
    throw err;
  } finally {
    await conn.end().catch(() => {});
  }
}

export default { query, withTransaction };
