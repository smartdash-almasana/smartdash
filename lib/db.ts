import { neon } from '@neondatabase/serverless';

/**
 * Database connection for Neon (PostgreSQL).
 * 
 * This project runs without a local environment.
 * The connection string is provided by GitHub Environment Secrets
 * under the name `DATABASE_URL`.
 */

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not configured. ' +
    'Make sure it exists as a GitHub Environment Secret.'
  );
}

export const sql = neon(process.env.DATABASE_URL);
