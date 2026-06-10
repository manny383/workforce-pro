import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_NAME'];
const missingEnvVars = requiredEnvVars.filter(
  (name) => !Object.prototype.hasOwnProperty.call(process.env, name)
);

if (missingEnvVars.length > 0) {
  throw new Error(`Missing database environment variables: ${missingEnvVars.join(', ')}`);
}

const mysqlPool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 5,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
});

const transientConnectionErrors = new Set([
  'ECONNRESET',
  'EPIPE',
  'ETIMEDOUT',
  'PROTOCOL_CONNECTION_LOST',
]);

const isClosedConnectionError = (error) => (
  transientConnectionErrors.has(error?.code)
  || String(error?.message || '').includes('connection is in closed state')
);

const runWithConnectionRetry = async (method, args) => {
  try {
    return await mysqlPool[method](...args);
  } catch (error) {
    if (!isClosedConnectionError(error)) {
      throw error;
    }

    console.warn(`Conexion MySQL cerrada durante ${method}; reintentando una vez`);
    return mysqlPool[method](...args);
  }
};

// Keep the same pool API used by controllers while recovering from stale
// Railway/MySQL connections on the next available pooled connection.
export const pool = {
  query: (...args) => runWithConnectionRetry('query', args),
  execute: (...args) => runWithConnectionRetry('execute', args),
  getConnection: (...args) => mysqlPool.getConnection(...args),
};
