const Deposit = require('../models/depositModel');
const User = require('../models/User'); 

const axios = require('axios');

const createDeposit = async (req, res) => {
  const { amount, source, currency } = req.body;

  let amountInILS = amount;
  if (currency !== 'ILS') {
    try {
      const response = await axios.get(
        `https://api.frankfurter.app/latest?amount=${amount}&from=${currency}&to=ILS`
      );
      if (response.data?.rates?.ILS) {
        amountInILS = response.data.rates.ILS;
      }
    } catch (error) {
      console.error('Currency conversion failed:', error.message);
      return res.status(500).json({ message: 'Currency conversion failed' });
    }
  }

  const newDeposit = new Deposit({
    amount: amountInILS,
    source,
    userId: req.user.id
  });

  await newDeposit.save();
  res.status(201).json(newDeposit);
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
