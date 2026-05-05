import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Transaction from './models/Transaction.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finflowy';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  const email = 'xyz@gmail.com';
  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: 'XYZ User',
      email: email,
      password: '789456',
      isAdmin: false
    });
    console.log('Created user:', email);
  } else {
    // If the user exists, we might want to update the password to make sure they can login
    user.password = '789456';
    await user.save();
    console.log('User found, ensured password is correct:', email);
  }

  const expenseCategories = ['Housing', 'Food', 'Transportation', 'Utilities', 'Insurance', 'Healthcare', 'Saving & Debts', 'Personal Spending', 'Entertainment'];
  const incomeCategories = ['Salary', 'Freelance', 'Investments', 'Gift', 'Other'];

  const transactions = [];
  
  const now = new Date();
  
  for (let i = 0; i < 125; i++) {
    const isExpense = Math.random() > 0.3; // 70% expenses
    const type = isExpense ? 'expense' : 'income';
    const categories = isExpense ? expenseCategories : incomeCategories;
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    let amount = Math.floor(Math.random() * 1990) + 10;
    if (type === 'income') amount = amount * 3;
    
    const daysAgo = Math.floor(Math.random() * 180);
    const date = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
    
    transactions.push({
      user: user._id,
      amount,
      type,
      category,
      date,
      description: `Auto-generated ${type} transaction (${category}) ${i}`
    });
  }

  await Transaction.insertMany(transactions);
  console.log(`Successfully added ${transactions.length} transactions for user ${email}`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
