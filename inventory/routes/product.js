import express from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ error: "Access Token Required" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid Token" });
        req.user = user;
        next();
    });
};

router.post('/sync-product', authenticateToken, async (req, res) => {
    const { product_name, sku, price, quantity } = req.body;

    if (!product_name || !sku) return res.status(400).json({ error: "Missing fields" });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // 1. Save Local
        const result = await client.query(
            `INSERT INTO inventory (product_name, sku, price, quantity) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [product_name, sku, price || 0, quantity || 0]
        );
        const productData = result.rows[0];

        // 2. Sync External
        const syncUrl = process.env.ORDER_SERVICE_URL || 'http://order-service:3003/api/orders/receive-product';
        await axios.post(syncUrl, productData, {
            headers: { 'x-shared-secret': process.env.SHARED_SECRET_KEY }
        });

        await client.query('COMMIT');
        res.status(201).json({ success: true, data: productData });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Sync/DB Error:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        client.release();
    }
});

export default router;