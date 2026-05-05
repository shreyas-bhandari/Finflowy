import mongoose from 'mongoose';

/**
 * FinFlowy — Database-per-Service Pattern
 * Each domain has its own isolated MongoDB database.
 *
 * DB 1 (authDB)        → auth_finflowy        :27017  — Users
 * DB 2 (transactionDB) → transaction_finflowy :27019  — Transactions
 * DB 3 (goalDB)        → goal_finflowy        :27020  — Goals
 * DB 4 (mlDB)          → ml_finflowy          :27018  — Alert Logs (ML Service)
 */

const AUTH_URI        = process.env.AUTH_DB_URI        || 'mongodb://127.0.0.1:27017/auth_finflowy';
const TRANSACTION_URI = process.env.TRANSACTION_DB_URI || 'mongodb://127.0.0.1:27019/transaction_finflowy';
const GOAL_URI        = process.env.GOAL_DB_URI        || 'mongodb://127.0.0.1:27020/goal_finflowy';

// Create separate named connections (NOT the default mongoose connection)
export const authDB        = mongoose.createConnection(AUTH_URI);
export const transactionDB = mongoose.createConnection(TRANSACTION_URI);
export const goalDB        = mongoose.createConnection(GOAL_URI);

// Log connection events for each DB
authDB.on('connected',        () => console.log('[DB] Auth DB connected        → auth_finflowy'));
transactionDB.on('connected', () => console.log('[DB] Transaction DB connected → transaction_finflowy'));
goalDB.on('connected',        () => console.log('[DB] Goal DB connected        → goal_finflowy'));

authDB.on('error',        (e) => console.error('[DB] Auth DB error:', e.message));
transactionDB.on('error', (e) => console.error('[DB] Transaction DB error:', e.message));
goalDB.on('error',        (e) => console.error('[DB] Goal DB error:', e.message));
