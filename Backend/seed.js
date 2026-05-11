import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { authDB } from './config/db.js';
import User from './models/User.js';

dotenv.config();

// ── Admin credentials ─────────────────────────────────────────────────────────
const ADMIN_EMAIL    = 'admin@finflowy.com';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_NAME     = 'Admin';

// ── Wait for the authDB connection to be ready ────────────────────────────────
async function waitForConnection(conn, label) {
  // mongoose.ConnectionStates.connected === 1
  if (conn.readyState === 1) return;
  return new Promise((resolve, reject) => {
    conn.once('connected', resolve);
    conn.once('error', reject);
  });
}

async function seed() {
  console.log('[Seed] Connecting to Auth DB →', process.env.AUTH_DB_URI || 'mongodb://127.0.0.1:27017/auth_finflowy');
  await waitForConnection(authDB, 'authDB');
  console.log('[Seed] Auth DB connected ✅');

  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    console.log('✅ Admin already exists — no changes made.');
    console.log(`   Email: ${ADMIN_EMAIL}`);
  } else {
    await User.create({
      name:     ADMIN_NAME,
      email:    ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      isAdmin:  true,
    });
    console.log('✅ Admin account created!');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
  }

  await authDB.close();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Failed:', err.message);
  process.exit(1);
});
