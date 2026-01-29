import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import axios from 'axios'; // Import Axios
import { pool } from './db.js';
import authRoutes from './routes/auth.js';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3002;
let requestCount = 0;

// --- Gremlin Latency Middleware ---
app.use((req, res, next) => {
    requestCount++;
    if (requestCount % 3 === 0) {
        console.log(`[Gremlin] Injecting 6s latency for request #${requestCount}`);
        setTimeout(next, 6000);
    } else {
        next();
    }
});

// --- Health Check (Using Axios for dependency pings) ---
app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        // Example: If inventory needed to ping a 3rd party shipping API
        // await axios.get('https://api.shipping.com/v1/status', { timeout: 2000 });

        res.status(200).json({ status: 'UP', database: 'connected' });
    } catch (err) {
        res.status(503).json({ status: 'DOWN', error: err.message });
    }
});

// --- Inventory Update (Idempotent) ---
app.post('/inventory/update', async (req, res) => {
    const { productId, quantityChange, idempotencyKey } = req.body;

    if (!idempotencyKey) return res.status(400).json({ error: 'idempotencyKey is required' });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const existing = await client.query('SELECT response_payload FROM idempotency_keys WHERE key_text = $1', [idempotencyKey]);
        if (existing.rows.length > 0) {
            await client.query('ROLLBACK');
            return res.json(existing.rows[0].response_payload);
        }

        const result = await client.query(
            'UPDATE inventory SET quantity = quantity + $1 WHERE id = $2 RETURNING quantity',
            [quantityChange, productId]
        );

        if (result.rows.length === 0) throw new Error('Product not found');

        const payload = { success: true, newQuantity: result.rows[0].quantity };
        await client.query('INSERT INTO idempotency_keys (key_text, response_payload) VALUES ($1, $2)', [idempotencyKey, payload]);

        await client.query('COMMIT');
        res.json(payload);
    } catch (err) {
        await client.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

app.use('/auth', authRoutes);
app.listen(PORT, () => console.log(`Inventory Service (Axios ready) on port ${PORT}`));