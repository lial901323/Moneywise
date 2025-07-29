const Deposit = require('../models/depositModel');
const Expense = require('../models/expenseModel');
const User = require('../models/User');
const mongoose = require('mongoose');

const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

const hourlyStats = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);

    const startOfDay = getStartOfToday();
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const deposits = await Deposit.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: { hour: { $hour: '$date' } },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const expenses = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $group: {
          _id: { hour: { $hour: '$date' } },
          total: { $sum: '$amount' }
        }
      }
    ]);

    const labels = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
    const incomeMap = Object.fromEntries(deposits.map(d => [d._id.hour, d.total]));
    const expenseMap = Object.fromEntries(expenses.map(e => [e._id.hour, e.total]));

    const income = labels.map(hour => incomeMap[hour] || 0);
    const expense = labels.map(hour => expenseMap[hour] || 0);

    res.json({ labels, income, expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching hourly stats', error: err.message });
  }
};

const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const newCustomers = await User.countDocuments({ createdAt: { $gte: yesterday } });

    res.json({
      totalUsers,
      newCustomers
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};


exports.getBalance = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ balance: user.balance });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching balance' });
    }
};


const getIncomeToday = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const today = getStartOfToday();

    const result = await Deposit.aggregate([
      { $match: { userId, date: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const total = result[0]?.total || 0;
    res.json({ total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching todays income' });
  }
};

const getExpenseToday = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.id);
    const today = getStartOfToday();

    const result = await Expense.aggregate([
      { $match: { userId, date: { $gte: today } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const total = result[0]?.total || 0;
    res.json({ total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching todays expenses' });
  }
};

module.exports = {
  hourlyStats,
  getStats,
  getBalance,
  getIncomeToday,
  getExpenseToday
};
