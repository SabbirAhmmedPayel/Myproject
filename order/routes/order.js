import express from 'express';
import { pool } from '../db.js'; 
import dotenv from 'dotenv';
import axios from 'axios'; // Added for inter-service communication

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

// --- NEW: HEALTH CHECK (Requirement: Beyond 200 OK) ---
router.get('/health', async (req, res) => {
    try {
        // Verify downstream dependency: Database [cite: 51, 52]
        await pool.query('SELECT 1'); 
        res.status(200).json({ status: "healthy", database: "connected" });
    } catch (err) {
        // Return appropriate error message if DB is down 
        res.status(503).json({ status: "unhealthy", error: "Database unreachable" });
    }
});

// 1. SYNC USER
router.post('/sync-incoming', verifyInternalSecret, async (req, res) => {
    const data = req.body;
    console.log(`📦 Order Service Sync: User ${data.username} received.`);
    res.status(200).json({ status: "Received and synced" });
});

// 2. RECEIVE PRODUCT
router.post('/receive-product', verifyInternalSecret, async (req, res) => {
    const { product_name, sku } = req.body;
    console.log(`📦 Order Service: Product '${product_name}' synced.`);
    res.status(200).json({ status: "Product synced" });
});

// 3. CREATE ORDER (Updated for Resilience & Coordination)
router.post('/create', async (req, res) => {
    const { user_id, product_id, quantity, price_per_unit } = req.body;
    const total_price = quantity * price_per_unit;

    try {
        // 1. Local Database Commit
        const newOrder = await pool.query(
            `INSERT INTO orders (user_id, product_id, quantity, price, total_price) 
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [user_id, product_id, quantity, price_per_unit, total_price]
        );

        // 2. COORDINATION: Call Inventory to update stock 
        // TIMEOUT: Handle "Gremlin Latency" (don't wait forever) [cite: 30, 31]
        try {
            const inventoryUrl = process.env.INVENTORY_SERVICE_URL || 'http://inventory-service:3002/api/inventory/update-stock';
            await axios.post(inventoryUrl, {
                product_id,
                quantity
            }, { 
                timeout: 3000, // Stop waiting after 3 seconds [cite: 31]
                headers: { 'x-shared-secret': process.env.SHARED_SECRET_KEY }
            });

            res.status(201).json({
                message: "Order placed and stock updated successfully",
                order: newOrder.rows[0]
            });
        } catch (syncErr) {
            // Handle slow responses or crashes gracefully [cite: 33, 66]
            console.error("Coordination Error:", syncErr.message);
            res.status(202).json({ 
                message: "Order recorded, but inventory sync is pending or timed out.",
                order: newOrder.rows[0]
            });
        }

    } catch (err) {
        console.error("Order DB Error:", err.message);
        res.status(500).json({ error: "Internal Server Error during order creation" });
    }
});

export default router;