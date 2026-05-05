import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Import DB connections first — this establishes all 3 connections on startup
import './config/db.js';

import authRoutes from './routes/authRoutes.js';
import financeRoutes from './routes/financeRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'finance-backend-api',
        databases: {
            auth:        process.env.AUTH_DB_URI        || 'mongodb://127.0.0.1:27017/auth_finflowy',
            transaction: process.env.TRANSACTION_DB_URI || 'mongodb://127.0.0.1:27019/transaction_finflowy',
            goal:        process.env.GOAL_DB_URI        || 'mongodb://127.0.0.1:27020/goal_finflowy',
        }
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`[Server] FinFlowy API running on port ${PORT}`);
    console.log('[Server] Database-per-Service pattern: 4 isolated MongoDB instances');
});
