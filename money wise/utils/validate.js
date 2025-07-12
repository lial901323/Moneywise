function validateExpenseInput(data) {
  const errors = [];

  if (typeof data.amount !== 'number' || data.amount <= 0) {
    errors.push('Amount must be a positive number');
  }

  if (!data.category || typeof data.category !== 'string') {
    errors.push('Category is required and must be a string');
  }

  if (data.date && isNaN(Date.parse(data.date))) {
    errors.push('Date must be a valid date');
  }

  if (!data.userId) {
    errors.push('userId is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

module.exports = { validateExpenseInput };
