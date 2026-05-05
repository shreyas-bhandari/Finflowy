import mongoose from 'mongoose';
import { transactionDB } from '../config/db.js';

// DB 2: transaction_finflowy — Transactions collection
const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Note: ref across DBs is not enforced by Mongoose — integrity handled via JWT userId
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: ['income', 'expense'],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  description: {
    type: String,
    default: "",
  }
}, { timestamps: true });

// Register model on the TRANSACTION DB connection
const Transaction = transactionDB.model('Transaction', transactionSchema);
export default Transaction;
