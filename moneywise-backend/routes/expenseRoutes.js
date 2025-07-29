const express = require('express');
const router = express.Router();
const {
  createExpense,
  getMonthlyExpensesByCategory
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');


router.get('/monthly-summary', protect, getMonthlyExpensesByCategory);


router.post('/', protect, createExpense);

module.exports = router;
