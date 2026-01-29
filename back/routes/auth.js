const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const axios = require('axios');

// Fetching URLs and Secret from environment variables (set in docker-compose)
const INVENTORY_SYNC_URL = process.env.INVENTORY_URL; 
const ORDER_SYNC_URL = process.env.ORDER_URL;
const SHARED_SECRET = process.env.SHARED_SECRET_KEY; 

// Register Route
router.post('/register', async (req, res) => {
    const { username, password, balance = 0 } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await pool.query(
            'INSERT INTO users (username, password_hash, balance) VALUES ($1, $2, $3) RETURNING id, username, balance',
            [username, hashedPassword, balance]
        );

        const userData = {
            userId: newUser.rows[0].id,
            username: newUser.rows[0].username,
            balance: newUser.rows[0].balance
        };

        // SYNCING TO BOTH BACKENDS
        // We use Promise.allSettled so that if one sync fails, it doesn't stop the other
        await Promise.allSettled([
            axios.post(INVENTORY_SYNC_URL, userData, {
                headers: { 'x-auth-secret': SHARED_SECRET }
            }),
            axios.post(ORDER_SYNC_URL, userData, {
                headers: { 'x-auth-secret': SHARED_SECRET }
            })
        ]).then(results => {
            results.forEach((result, index) => {
                const service = index === 0 ? "Inventory" : "Order";
                if (result.status === 'rejected') {
                    console.error(`❌ ${service} Sync failed:`, result.reason.message);
                } else {
                    console.log(`✅ ${service} Sync successful`);
                }
            });
        });

        res.status(201).json(userData);
    } catch (err) {
        console.error("Registration Error:", err.message);
        res.status(500).json({ error: "Registration failed" });
    }
});

// Login Route remains mostly the same, but ensure it uses process.env.JWT_SECRET
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (user.rows.length === 0) return res.status(401).json({ error: "Invalid Credentials" });

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) return res.status(401).json({ error: "Invalid Credentials" });

        const userData = {
            userId: user.rows[0].id,
            username: user.rows[0].username,
            balance: user.rows[0].balance
        };

        const token = jwt.sign({ userId: userData.userId }, process.env.JWT_SECRET || 'secret', { expiresIn: '1h' });

        res.json({ message: "Logged in successfully!", token, user: userData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;