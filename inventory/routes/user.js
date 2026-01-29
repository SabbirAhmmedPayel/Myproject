import express from 'express';
import dotenv from 'dotenv';

dotenv.config();
const router = express.Router();

const verifyInternalSecret = (req, res, next) => {
    const incomingSecret = req.headers['x-auth-secret'] || req.headers['x-shared-secret'];
    if (!incomingSecret || incomingSecret !== process.env.SHARED_SECRET_KEY) {
        return res.status(403).json({ error: "Unauthorized internal request" });
    }
    next();
};

router.post('/sync', verifyInternalSecret, (req, res) => {
    const { userId, username } = req.body;
    console.log(`✅ Inventory Sync: User '${username}' (ID: ${userId}) received.`);
    res.status(200).json({ status: "User synced to Inventory" });
});

export default router;