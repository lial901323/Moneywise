const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');


const { 
    getUserIncomes, 
    getUserExpenses, 
    deleteIncome, 
    deleteExpense 
} = require('../controllers/transactionController');

router.get('/incomes', protect, getUserIncomes);
router.get('/expenses', protect, getUserExpenses);

router.delete('/incomes/:id', protect, deleteIncome);
router.delete('/expenses/:id', protect, deleteExpense);

module.exports = router;
