import mongoose from 'mongoose';
import { goalDB } from '../config/db.js';

// DB 3: goal_finflowy — Goals collection
const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    // Note: ref across DBs is not enforced by Mongoose — integrity handled via JWT userId
  },
  name: {
    type: String,
    required: true,
  },
  targetAmount: {
    type: Number,
    required: true,
  },
  currentAmount: {
    type: Number,
    default: 0,
  },
  probability: {
    type: Number,
    default: 0,
  },
  deadline: {
    type: Date,
    required: true,
  },
  priorityWeight: {
    type: Number,
    default: 50,
  }
}, { timestamps: true });

// Register model on the GOAL DB connection
const Goal = goalDB.model('Goal', goalSchema);
export default Goal;
