import express from 'express';
// FIX: Use { pool } for named import to match your db.js
import { pool } from '../db.js'; 
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// Middleware: Internal Security Check
const verifyInternalSecret = (req, res, next) => {
    const incomingSecret = req.headers['x-shared-secret'] || req.headers['x-auth-secret'];
    if (!incomingSecret || incomingSecret !== process.env.SHARED_SECRET_KEY) {
        return res.status(403).json({ error: "Unauthorized internal request" });
    }
    next();
};

// 1. SYNC USER (From Auth)
router.post('/sync-incoming', verifyInternalSecret, async (req, res) => {
    const data = req.body;
    console.log(`📦 Order Service Sync: User ${data.username} (ID: ${data.userId}) received.`);
    res.status(200).json({ status: "Received and synced" });
});

// 2. RECEIVE PRODUCT (From Inventory) 
// *** This was missing in your snippet! ***
router.post('/receive-product', verifyInternalSecret, async (req, res) => {
    const { product_name, sku } = req.body;
    console.log(`📦 Order Service: Product '${product_name}' (${sku}) received from Inventory.`);
    res.status(200).json({ status: "Product synced to Order Service" });
});

// 3. CREATE ORDER (Client Facing)
router.post('/create', async (req, res) => {
    const { user_id, product_id, quantity, price_per_unit } = req.body;
    const total_price = quantity * price_per_unit;

    try {
        const newOrder = await pool.query(
            `INSERT INTO orders (user_id, product_id, quantity, price, total_price) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user_id, product_id, quantity, price_per_unit, total_price]
        );
        res.status(201).json({
            message: "Order placed successfully",
            order: newOrder.rows[0]
        });
    } catch (err) {
        console.error("Order DB Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

export default router;