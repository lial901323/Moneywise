const Expense = require('../models/expenseModel');
const User = require('../models/User');
const mongoose = require('mongoose');


const createExpense = async (req, res) => {
  try {
    const { amount, category } = req.body;
    const userId = new mongoose.Types.ObjectId(req.user.id);

    if (!amount || !category) {
      return res.status(400).json({ message: 'Amount and category are required' });
    }

    const newExpense = new Expense({
      userId,
      amount,
      category
    });

    await newExpense.save();

    await User.findByIdAndUpdate(userId, {
      $inc: { balance: -amount }
    });

    res.status(201).json(newExpense);
  } catch (err) {
    console.error('Create Expense Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


const getTotalExpenses = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const result = await Expense.aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const total = result.length > 0 ? result[0].total : 0;
    res.json({ total });
  } catch (err) {
    console.error('Total Expenses Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};


const getExpenses = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const expenses = await Expense.find({ userId });
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const getMonthlyExpensesByCategory = async (req, res) => {
  try {
    const userId = req.user._id;
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

    const summary = await Expense.aggregate([
      { $match: { userId, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } }
    ]);

    res.status(200).json(summary);
  } catch (err) {
    console.error('Monthly Expenses Error:', err);
    res.status(500).json({ message: 'Server Error' });
  }
};




module.exports = {
  createExpense,
  getTotalExpenses,
  getExpenses,
  getMonthlyExpensesByCategory
};
