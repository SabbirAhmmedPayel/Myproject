import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
    // crucial: Use the variable from docker-compose, or default to 'db'
    host: process.env.DB_HOST || 'db', 
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'NewPassword123',
    database: process.env.DB_NAME || 'login_db',
    port: 5432 // Internal Docker port is always 5432
});

// Test the connection on startup
pool.connect()
    .then(() => console.log('✅ Inventory connected to Database (db)'))
    .catch(err => console.error('❌ Database Connection Error:', err.message));

export { pool };