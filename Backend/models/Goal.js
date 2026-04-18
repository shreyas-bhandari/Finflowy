import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
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

const Goal = mongoose.model('Goal', goalSchema);
export default Goal;
