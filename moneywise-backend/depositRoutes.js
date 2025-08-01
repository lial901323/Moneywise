const express = require('express');
const router = express.Router();
const { createDeposit, getTotalDeposits } = require('../controllers/depositController');
const { protect } = require('../middleware/authMiddleware');

router.get('/total', getTotalDeposits);

router.post('/', protect, createDeposit);

module.exports = router;
