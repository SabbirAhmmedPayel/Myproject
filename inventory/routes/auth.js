import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { pool } from '../db.js';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

// --- Middleware: Verify User JWT ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: "Access Token Required" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Invalid or Expired Token" });
        req.user = user;
        next();
    });
};

// --- Route: User Login (Generates JWT) ---
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        const user = result.rows[0];

        if (user && await bcrypt.compare(password, user.password)) {
            const accessToken = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ success: true, accessToken });
        } else {
            res.status(401).json({ error: "Invalid Credentials" });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Route: Sync Product (Locked by JWT, Sends via Shared Secret) ---
router.post('/sync-product', authenticateToken, async (req, res) => {
    const { product_name, sku, price, quantity } = req.body;

    try {
        // 1. Save to Inventory DB
        const result = await pool.query(
            `INSERT INTO inventory (product_name, sku, price, quantity) 
             VALUES ($1, $2, $3, $4) 
             RETURNING id, product_name, price, quantity AS stock`,
            [product_name, sku, price, quantity]
        );

        const productData = result.rows[0];

        // 2. Axios POST to Order Service
        // We use the SHARED_SECRET_KEY in headers so the other service trusts us
        const response = await axios.post(process.env.ORDER_SERVICE_URL, productData, {
            headers: {
                'x-shared-secret': process.env.SHARED_SECRET_KEY,
                'Content-Type': 'application/json'
            },
            timeout: 5000
        });

        res.status(201).json({
            success: true,
            message: "Product synced successfully",
            data: productData,
            recipient_status: response.status
        });

    } catch (err) {
        console.error("Sync Failed:", err.message);
        res.status(500).json({ success: false, error: "Internal Sync Error" });
    }
});

export default router;