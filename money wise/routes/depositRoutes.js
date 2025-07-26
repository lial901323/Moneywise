const express = require('express');
const router = express.Router();
const { createDeposit, getTotalDeposits } = require('../controllers/depositController');

router.post('/', createDeposit);
router.get('/total', getTotalDeposits);

module.exports = router;
