import { pool } from './db.js';

async function testConnection() {
    console.log("--- Starting DB Connection Test ---");
    try {
        // 1. Check connectivity
        const res = await pool.query('SELECT NOW()');
        console.log("✅ Success! Database connected at:", res.rows[0].now);

        // 2. Check if tables exist
        const tables = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        
        console.log("📂 Existing tables in your DB:");
        tables.rows.forEach(row => console.log(` - ${row.table_name}`));

    } catch (err) {
        console.error("❌ Connection Failed!");
        console.error("Error details:", err.message);
    } finally {
        // Close the pool so the script finishes
        await pool.end();
        console.log("--- Test Complete ---");
    }
}

testConnection();