import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRoutes from './routes/user.js';
import productRoutes from './routes/product.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);         // URL: /api/users/sync
app.use('/api/inventory', productRoutes);  // URL: /api/inventory/sync-product

app.listen(PORT, () => {
    console.log(`📦 Inventory Service running on port ${PORT}`);
});