const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authController = require('../controller/authController');
const twoFactorController = require('../controller/twoFactorController');
const authMiddleware = require('../middleware/authMiddleware');

// Signup
router.post('/signup', authController.signup);

// Login (first step - email/password)
router.post('/login', authController.login);

// 2FA verification (second step - after login)
router.post('/verify-2fa', twoFactorController.verify2FALogin);

// Get current user info
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
