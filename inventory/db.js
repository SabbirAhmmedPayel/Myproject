import pg from 'pg';
import dotenv from 'dotenv';

// Initialize environment variables
dotenv.config();

const { Pool } = pg;

/**
 * DATABASE CONFIGURATION
 * The DATABASE_URL is pulled from your .env file.
 * Example format: postgres://user:password@host:port/database
 */
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Connection Pool Settings
    max: 20,                // Max number of clients in the pool
    idleTimeoutMillis: 30000, // How long a client is allowed to sit idle before being closed
    connectionTimeoutMillis: 2000, // How long to wait when connecting before timing out
});

// Listener for pool errors to prevent the service from crashing unexpectedly
pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err);
    process.exit(-1);
});

/**
 * Export the pool to be used in:
 * 1. index.js (for health checks and inventory updates)
 * 2. routes/auth.js (for user registration and product fetching)
 */
export { pool };