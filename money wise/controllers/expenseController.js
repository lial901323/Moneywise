const Expense = require('../models/expenseModel');
const { validateExpenseInput } = require('../utils/validate');

const createExpense = async (req, res) => {
   const { isValid, errors } = validateExpenseInput(req.body);
  if (!isValid) return res.status(400).json({ errors });

  try {
    const { amount, category, date, userId } = req.body;
    const newExpense = new Expense({ amount, category, date, userId });
    await newExpense.save();
    res.status(201).json(newExpense);
  } catch (err) {
    res.status(500).json({ message: 'Error creating expense', error: err.message });
  }
};

const getExpenses = async (req, res) => {
  const { userId } = req.query;
  try {
    const expenses = userId
      ? await Expense.find({ userId })
      : await Expense.find();
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


const updateExpense = async (req, res) => {
  const { isValid, errors } = validateExpenseInput(req.body);
  if (!isValid) return res.status(400).json({ errors });
  
  try {
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(updatedExpense);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const expenseId = req.params.id;
    await Expense.findByIdAndDelete(expenseId);
    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting expense', error: err.message });
  }
};



module.exports = {
  createExpense,
  getExpenses,
  updateExpense,
  deleteExpense,
};
