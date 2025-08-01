const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { deleteMyAccount } = require('../controllers/userController');

router.delete('/delete-me', protect, deleteMyAccount);

module.exports = router;
