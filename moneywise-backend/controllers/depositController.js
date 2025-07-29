const Deposit = require('../models/depositModel');
const User = require('../models/User'); 

const createDeposit = async (req, res) => {
  try {
    const { amount, source } = req.body;
    const userId = req.user.id;

    if (!amount || !source) {
      return res.status(400).json({ message: 'Amount and source are required' });
    }

    const newDeposit = new Deposit({
      userId,
      amount,
      source
    });

    await newDeposit.save();

    await User.findByIdAndUpdate(userId, {
      $inc: { balance: amount }
    });

    res.status(201).json(newDeposit);
  } catch (err) {
    console.error('Create Deposit Error:', err);
    res.status(500).json({ message: 'Server Error' });
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
