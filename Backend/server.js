import 'dotenv/config';   // ← MUST be first: loads .env before any other imports
import express from 'express';
import cors from 'cors';

// Import DB connections AFTER dotenv so env vars are available in db.js
import { authDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import financeRoutes from './routes/financeRoutes.js';

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

// ── Auto-seed admin account on startup ───────────────────────────────────────
// Ensures admin@finflowy.com always exists on any machine / fresh Docker run.
async function autoSeedAdmin() {
    try {
        // Wait for authDB to be ready
        if (authDB.readyState !== 1) {
            await new Promise((resolve, reject) => {
                authDB.once('connected', resolve);
                authDB.once('error', reject);
            });
        }

        // Dynamically import User model (avoids circular import issues)
        const { default: User } = await import('./models/User.js');

        const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'admin@finflowy.com';
        const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@1234';
        const ADMIN_NAME     = process.env.ADMIN_NAME     || 'Admin';

        const existing = await User.findOne({ email: ADMIN_EMAIL });

        if (!existing) {
            await User.create({ name: ADMIN_NAME, email: ADMIN_EMAIL, password: ADMIN_PASSWORD, isAdmin: true });
            console.log(`[Seed] Admin account created → ${ADMIN_EMAIL}`);
        } else if (!existing.isAdmin) {
            // Fix: ensure existing account has admin rights
            await User.updateOne({ email: ADMIN_EMAIL }, { $set: { isAdmin: true } });
            console.log(`[Seed] Admin flag fixed for → ${ADMIN_EMAIL}`);
        } else {
            console.log(`[Seed] Admin account OK → ${ADMIN_EMAIL}`);
        }
    } catch (err) {
        console.error('[Seed] Admin seed failed:', err.message);
    }
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`[Server] FinFlowy API running on port ${PORT}`);
    console.log('[Server] Database-per-Service pattern: 4 isolated MongoDB instances');
    autoSeedAdmin();
});

