const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Deposit = require('../models/depositModel');
const Expense = require('../models/expenseModel');
const User = require('../models/User');
const checkRole = require('../middleware/roleMiddleware');

// ✅ Total Users and New Customers

router.get('/', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        const newCustomers = await User.countDocuments({ createdAt: { $gte: startOfToday } });

        res.json({ totalUsers, newCustomers });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching stats', error: err.message });
    }
});




router.get('/top-users', protect, checkRole('admin'), async (req, res) => {
    try {
        const users = await User.find()
            .sort({ balance: -1 })
            .limit(5);
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});



router.get('/user-activity', protect, checkRole('admin'), async (req, res) => {
    try {
        const data = [
            { date: '2025-07-01', deposits: 20 },
            { date: '2025-07-02', deposits: 30 },
            { date: '2025-07-03', deposits: 10 },
        ];
        res.json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});




// ✅ Balance
router.get('/balance', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ balance: user.balance });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// ✅ Income Today
router.get('/income-today', protect, async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deposits = await Deposit.find({
        userId: req.user.id,
        createdAt: { $gte: today }
    });

    const total = deposits.reduce((sum, d) => sum + d.amount, 0);
    res.json({ total });
});

// ✅ Expense Today
router.get('/expense-today', protect, async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const expenses = await Expense.find({
        userId: req.user.id,
        createdAt: { $gte: today }
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    res.json({ total });
});

// ✅ Income Month
router.get('/income-month', protect, async (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const deposits = await Deposit.find({
        userId: req.user.id,
        createdAt: { $gte: startOfMonth }
    });

    const total = deposits.reduce((sum, d) => sum + d.amount, 0);
    res.json({ total });
});

// ✅ Expense Month
router.get('/expense-month', protect, async (req, res) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const expenses = await Expense.find({
        userId: req.user.id,
        createdAt: { $gte: startOfMonth }
    });

    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    res.json({ total });
});

// ✅ Hourly Stats
router.get('/hourly', protect, async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const deposits = await Deposit.find({
            userId: req.user.id,
            createdAt: { $gte: startOfDay }
        });

        const expenses = await Expense.find({
            userId: req.user.id,
            createdAt: { $gte: startOfDay }
        });

        const hours = Array.from({ length: 24 }, (_, i) => i);
        const income = Array(24).fill(0);
        const expense = Array(24).fill(0);

        for (const d of deposits) {
            const hour = new Date(d.createdAt).getHours();
            income[hour] += d.amount;
        }

        for (const e of expenses) {
            const hour = new Date(e.createdAt).getHours();
            expense[hour] += e.amount;
        }

        res.json({
            labels: hours.map(h => `${h}:00`),
            income,
            expense
        });
    } catch (err) {
        res.status(500).json({ message: 'Error generating hourly stats', error: err.message });
    }
});

// ✅ Daily Stats
router.get('/daily', protect, async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const deposits = await Deposit.find({
            userId: req.user.id,
            createdAt: { $gte: startOfMonth }
        });

        const expenses = await Expense.find({
            userId: req.user.id,
            createdAt: { $gte: startOfMonth }
        });

        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const income = Array(daysInMonth).fill(0);
        const expense = Array(daysInMonth).fill(0);

        for (const d of deposits) {
            const day = new Date(d.createdAt).getDate() - 1;
            income[day] += d.amount;
        }

        for (const e of expenses) {
            const day = new Date(e.createdAt).getDate() - 1;
            expense[day] += e.amount;
        }

        res.json({
            labels: Array.from({ length: daysInMonth }, (_, i) => `Day ${i + 1}`),
            income,
            expense
        });
    } catch (err) {
        res.status(500).json({ message: 'Error generating daily stats', error: err.message });
    }
});



router.get('/users/:id/details', protect, checkRole("admin"), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({
            username: user.username,
            email: user.email,
            balance: user.balance
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user details', error: error.message });
    }
});

module.exports = router;
