const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const Deposit = require('../models/depositModel');
const Expense = require('../models/expenseModel');
const User = require('../models/User');

// GET /balance
router.get('/balance', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ balance: user.balance });
    } catch (err) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /income-today
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

// GET /expense-today
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

// GET /income-month
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

// GET /expense-month
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

// GET /hourly
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

// GET /daily
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

module.exports = router;
