const User = require('../models/User');
const Expense = require('../models/expenseModel');
const Deposit = require('../models/depositModel');
const mongoose = require('mongoose');

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }) 
      .select('username email role balance')
      .sort({ balance: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching users', error: err.message });
  }
};


const getUserActivityChart = async (req, res) => {
  try {
    const users = await User.find({}, 'email totalActivity');
    const labels = users.map(u => u.email);
    const data = users.map(u => u.totalActivity || 0);
    res.status(200).json({ labels, data });
  } catch (err) {
    console.error('Error generating chart data:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
// ✅ Get all expenses (with user email)
const getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find().populate('userId', 'email');
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Error fetching expenses", error: err.message });
  }
};




const getTotalDepositsForAllUsers = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0); 

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999); 

    const result = await Deposit.aggregate([
      {
        $match: {
          date: { $gte: startOfDay, $lte: endOfDay }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $match: {
          'user.role': 'user'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const total = result.length > 0 ? result[0].total : 0;
    res.json({ total });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching today\'s deposits', error: err.message });
  }
};



// ✅ Delete user by ID
const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Optionally prevent deleting yourself
    if (req.user.id === userId) {
      return res.status(400).json({ message: "Admins cannot delete themselves" });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "User deleted successfully", user });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user", error: err.message });
  }
};


const getTopUsers = async (req, res) => {
  try {
    const topUsers = await User.find({ role: 'user' })
      .select('username email role balance')
      .sort({ balance: -1 })
      .limit(5);

    res.json(topUsers);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching top users', error: err.message });
  }
};






const getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("username email balance");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      username: user.username,
      email: user.email,
      balance: user.balance
    });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user data", error: err.message });
  }
};


const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' }); 
    res.json({ totalUsers });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching total users', error: err.message });
  }
};




const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const newCustomers = await User.countDocuments({
      role: 'user',
      createdAt: { $gte: startOfDay }
    });

    const totalDepositsResult = await Deposit.aggregate([
      { $match: { date: { $gte: startOfDay } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const totalDeposits = totalDepositsResult.length > 0 ? totalDepositsResult[0].total : 0;

    res.json({
      totalUsers,
      newCustomers,
      totalDeposits
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching stats', error: err.message });
  }
};





const getWeeklyDeposits = async (req, res) => {
  try {
    const weeklyData = await Deposit.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 6))
          }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);
    res.json(weeklyData);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching weekly deposits' });
  }
};




const getTop3UsersWithExpensesIncome = async (req, res) => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const topUsers = await User.find({ role: 'user' })
      .sort({ balance: -1 })
      .limit(3)
      .select('username');

    const userStats = await Promise.all(
      topUsers.map(async (user) => {
        const totalExpenses = await Expense.aggregate([
          { $match: { userId: user._id, createdAt: { $gte: lastWeek } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        const totalIncome = await Deposit.aggregate([
          { $match: { userId: user._id, createdAt: { $gte: lastWeek } } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        return {
          username: user.username,
          expenses: totalExpenses.length > 0 ? totalExpenses[0].total : 0,
          income: totalIncome.length > 0 ? totalIncome[0].total : 0
        };
      })
    );

    res.status(200).json(userStats);
  } catch (err) {
    console.error('Error fetching top 3 users stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
};



const getGrowthRate = async (req, res) => {
  try {
    const now = new Date();
    const startCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startPreviousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endPreviousMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentTotal = await Deposit.aggregate([
      { $match: { createdAt: { $gte: startCurrentMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const previousTotal = await Deposit.aggregate([
      { $match: { createdAt: { $gte: startPreviousMonth, $lte: endPreviousMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const current = currentTotal[0]?.total || 0;
    const previous = previousTotal[0]?.total || 0;
    const growthRate = previous === 0 ? 0 : ((current - previous) / previous) * 100;

    res.json({ growthRate });
  } catch (err) {
    res.status(500).json({ message: 'Error calculating growth rate', error: err.message });
  }
};






const getRecentTransactions = async (req, res) => {
  try {
    const deposits = await Deposit.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('userId amount createdAt');
    const expenses = await Expense.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('userId amount createdAt');

    const combined = [...deposits.map(d => ({ ...d.toObject(), type: 'Deposit' })), 
                      ...expenses.map(e => ({ ...e.toObject(), type: 'Expense' }))];

    const sorted = combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
    res.json(sorted);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching transactions', error: err.message });
  }
};



const getGrowthRateHistory = async (req, res) => {
  try {
    const history = [];

    for (let i = 6; i >= 0; i--) {
      const start = new Date();
      start.setDate(start.getDate() - i);
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setDate(end.getDate() - i);
      end.setHours(23, 59, 59, 999);

      const total = await Deposit.aggregate([
        { $match: { createdAt: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      const rate = total[0]?.total || 0;
      history.push({ date: start, rate });
    }

    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching growth rate history', error: err.message });
  }
};





module.exports = {
  getAllUsers,
  getAllExpenses,
  getTotalDepositsForAllUsers,
  deleteUser,
  getTopUsers,
  getUserDetails,
  getUserActivityChart,
  getTotalUsers,
  getStats,
  getWeeklyDeposits,
  getTop3UsersWithExpensesIncome,
  getGrowthRate,
  getRecentTransactions,
  getGrowthRateHistory,
};
