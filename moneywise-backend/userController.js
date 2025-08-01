const User = require('../models/User');

const deleteMyAccount = async (req, res) => {
  try {
    const { accountCode } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.accountCode !== accountCode) {
      return res.status(400).json({ message: 'Invalid account code' });
    }

    await User.findByIdAndDelete(req.user.id);
    res.status(200).json({ message: 'Your account has been deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting account', error: error.message });
  }
};


module.exports = { deleteMyAccount };
