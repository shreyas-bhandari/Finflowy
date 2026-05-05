import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finflowy';

const ADMIN_EMAIL    = 'admin@finflowy.com';
const ADMIN_PASSWORD = 'Admin@1234';
const ADMIN_NAME     = 'Admin';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_EMAIL });

  if (existing) {
    console.log('✅ Admin already exists — no changes made.');
    console.log(`   Email: ${ADMIN_EMAIL}`);
  } else {
    await User.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      isAdmin: true,
    });
    console.log('✅ Admin account created!');
    console.log(`   Email:    ${ADMIN_EMAIL}`);
    console.log(`   Password: ${ADMIN_PASSWORD}`);
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
