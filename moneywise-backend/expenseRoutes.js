const express = require('express');
const router = express.Router();
const {
  createExpense,
  getTotalExpenses,
  getExpenses,
  getMonthlyExpensesByCategory
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createExpense);
router.get('/', protect, getExpenses);
router.get('/total', protect, getTotalExpenses);
router.get('/monthly-summary', protect, getMonthlyExpensesByCategory);

module.exports = router;
