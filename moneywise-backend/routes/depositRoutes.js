const express = require('express');
const router = express.Router();
const { createDeposit, getTotalDeposits } = require('../controllers/depositController');
const { protect } = require('../middleware/authMiddleware');



router.get('/total', getTotalDeposits);
router.post('/', protect, createDeposit);


router.post('/', protect, async (req, res) => {
  try {
    const { amount, source } = req.body;
    const userId = req.user.id;

    const newDeposit = new Deposit({
      userId,
      amount,
      source
    });

    await newDeposit.save();
    res.status(201).json(newDeposit);
  } catch (err) {
    res.status(500).json({ message: 'Error creating deposit', error: err.message });
  }
});


module.exports = router;
