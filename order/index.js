import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
// FIX: Import the Order routes file
import orderRoutes from './routes/order.js'; 

dotenv.config();

const app = express();
// FIX: Order Service runs on 3003
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// FIX: Mount routes at /api/orders
app.use('/api/orders', orderRoutes);

app.listen(PORT, () => {
    console.log(`📦 Order Service running on port ${PORT}`);
});