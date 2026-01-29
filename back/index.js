const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
require('dotenv').config(); // Load environment variables

const app = express();

// Middleware
app.use(cors()); 
app.use(express.json()); // Essential for reading req.body

// Routes
app.use('/api/auth', authRoutes);

// Basic Health Check (Good for testing if the server is alive)
app.get('/health', (req, res) => res.status(200).send('OK'));

const PORT = process.env.PORT || 3000; // Use environment variable if available
app.listen(PORT, () => {
    console.log(`Main Auth Server running on http://localhost:${PORT}`);
});