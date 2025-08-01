const Expense = require('../models/expenseModel');
const User = require('../models/User');
const mongoose = require('mongoose');
const axios = require('axios');

const createExpense = async (req, res) => {
  const { amount, category, currency } = req.body;

  let amountInILS = amount;
  if (currency !== 'ILS') {
    const response = await axios.get(
      `https://api.frankfurter.app/latest?amount=${amount}&from=${currency}&to=ILS`
    );
    if (response.data?.rates?.ILS) {
      amountInILS = response.data.rates.ILS;
    }
  }

  const newExpense = new Expense({
    amount: amountInILS,
    category,
    userId: req.user.id,
  });


  await newExpense.save();

  const user = await User.findById(req.user.id);
  user.balance -= amountInILS;
  await user.save();

  res.status(201).json(newExpense);
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
