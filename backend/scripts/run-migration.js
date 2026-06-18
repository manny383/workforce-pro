import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendDir = path.resolve(__dirname, '..');
const projectDir = path.resolve(backendDir, '..');

dotenv.config({ path: path.join(projectDir, '.env') });
dotenv.config({ path: path.join(projectDir, '.env.local'), override: false });
dotenv.config({ path: path.join(backendDir, '.env'), override: false });

const migrationArg = process.argv[2] || '20260617_add_attendance_biometric_evidence.sql';
const migrationPath = path.isAbsolute(migrationArg)
  ? migrationArg
  : path.join(backendDir, 'migrations', migrationArg);

const getConnectionConfig = () => {
  const connectionUri = process.env.DATABASE_URL || process.env.MYSQL_URL;

  if (connectionUri) {
    return {
      uri: connectionUri,
      multipleStatements: true,
    };
  }

  const missing = ['DB_HOST', 'DB_USER', 'DB_NAME'].filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(`Faltan variables de base de datos: ${missing.join(', ')}`);
  }

  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    multipleStatements: true,
  };
};

const main = async () => {
  const sql = await fs.readFile(migrationPath, 'utf8');
  const connection = await mysql.createConnection(getConnectionConfig());

  try {
    console.log(`Ejecutando migracion: ${path.relative(projectDir, migrationPath)}`);
    await connection.query(sql);
    console.log('Migracion aplicada correctamente.');
  } finally {
    await connection.end();
  }
};

main().catch((error) => {
  console.error('No se pudo aplicar la migracion.');
  console.error(error.message);
  process.exitCode = 1;
});
