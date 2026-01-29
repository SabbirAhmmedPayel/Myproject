const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const axios = require('axios');

// The URL of your other backend (usually stored in .env)
const OTHER_BACKEND_URL = 'http://localhost:5001/api/users/sync'; 
const SHARED_SECRET = 'your_internal_secret_key'; 

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

        // SYNCING TO OTHER BACKEND
        try {
            await axios.post(OTHER_BACKEND_URL, userData, {
                headers: { 'x-auth-secret': SHARED_SECRET }
            });
        } catch (syncErr) {
            console.error("Sync failed, but user was created locally:", syncErr.message);
            // We still return 201 because the user is in our DB
        }

        res.status(201).json(userData);
    } catch (err) {
        res.status(500).json({ error: "Registration failed" });
    }
});

// Login Route
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

        const token = jwt.sign({ userId: userData.userId }, 'your_jwt_secret', { expiresIn: '1h' });

        // Optional: Sync login status to other backend
        // await axios.post(`${OTHER_BACKEND_URL}/login-event`, userData);

        res.json({ message: "Logged in successfully!", token, user: userData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;