const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect } = require('../middleware/authMiddleware');


module.exports = { protect };

// Generate Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register Route
router.post('/signup', async (req, res) => {
  const { email, password, username } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      email,
      password,
      username,
      role: 'user'
      });

    res.status(201).json({
      _id: user._id,
      email: user.email,
      username: user.username,
      role: user.role,
      token: generateToken(user._id)
    });

  } catch (err) {
    console.error(err); // مهمة!
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});



// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'wrong user-name or password' });
    }

    res.json({
      token: generateToken(user._id),
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



// Admin Dashboard Route - Protected
router.get('/admin-dashboard', protect, async (req, res) => {
  const user = req.user;

  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  res.json({
    username: user.username,
    email: user.email,
    role: user.role,
    permissions: user.permissions
  });
});

router.get('/user-data', protect, async (req, res) => {
  res.json({ username: req.user.username });
});


module.exports = router;
