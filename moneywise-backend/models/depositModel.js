const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  source: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
  type: Date,
  default: Date.now
}
});

module.exports = mongoose.model('Deposit', depositSchema);
