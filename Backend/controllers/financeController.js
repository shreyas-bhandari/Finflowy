import Transaction from '../models/Transaction.js';
import Goal from '../models/Goal.js';
import axios from 'axios';

const ML_API_URL = process.env.ML_API_URL || 'http://ml-service:5001/api/ml';

// @desc    Get all transactions for user
// @route   GET /api/finance/transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a transaction and fetch ML Insights
// @route   POST /api/finance/transactions
export const createTransaction = async (req, res) => {
  try {
    const { amount, type, category, date, description } = req.body;
    
    // Create new transaction
    const transaction = await Transaction.create({
      user: req.user._id,
      amount,
      type,
      category,
      date,
      description
    });

    // Run ML algorithms to generate insights asynchronously
    // Background task so we don't hold up the API response
    res.status(201).json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ML Behavior Analysis & Alerts
// @route   GET /api/finance/insights
export const getFinancialInsights = async (req, res) => {
    try {
      const transactions = await Transaction.find({ user: req.user._id });
      
      const mlResponse = await axios.post(`${ML_API_URL}/behavior-analysis`, {
        userId: req.user._id.toString(),
        transactions
      });
      
      res.json(mlResponse.data);
    } catch (error) {
      console.error('ML API Error:', error.message);
      res.status(500).json({ message: 'Error fetching AI insights' });
    }
};

// @desc    Get Goals
// @route   GET /api/finance/goals
export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id }).sort({ priorityWeight: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Goal
// @route   POST /api/finance/goals
export const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, deadline, priorityWeight } = req.body;
    const goal = await Goal.create({
      user: req.user._id,
      name,
      targetAmount,
      deadline,
      priorityWeight
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ML Goal Prediction
// @route   GET /api/finance/goals/:id/predict
export const getGoalPrediction = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);
    if(!goal || goal.user.toString() !== req.user._id.toString()) {
        return res.status(404).json({ message: 'Goal not found' });
    }

    const transactions = await Transaction.find({ user: req.user._id });

    const mlResponse = await axios.post(`${ML_API_URL}/goal-prediction`, {
        goal,
        history: transactions
    });

    // Update goal probability with ML result
    goal.probability = mlResponse.data.probability;
    await goal.save();

    res.json({ goal, prediction: mlResponse.data });
  } catch (error) {
    console.error('ML API Error:', error.message);
    res.status(500).json({ message: 'Error predicting goal trajectory' });
  }
}
