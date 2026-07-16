import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

const isAzure = process.env.DATABASE_URL?.includes('azure.com');

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isAzure ? { rejectUnauthorized: false } : false,
});
