const Deposit = require('../models/depositModel');

const createDeposit = async (req, res) => {
  try {
    const { amount, source, userId } = req.body;
    const newDeposit = new Deposit({ amount, source, userId });
    await newDeposit.save();
    res.status(201).json(newDeposit);
  } catch (err) {
    res.status(500).json({ message: 'Error creating deposit', error: err.message });
  }
};

const getTotalDeposits = async (req, res) => {
  try {
    const result = await Deposit.aggregate([
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
    res.status(500).json({ message: 'Error fetching total deposits', error: err.message });
  }
};

module.exports = {
  createDeposit,
  getTotalDeposits
};
