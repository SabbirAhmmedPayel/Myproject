import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Direct destructuring often works better in Node 20 ESM
const { Pool } = pg;

export const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: 5432,
    database: process.env.DB_NAME
});