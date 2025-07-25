const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const fundsController = require('../controller/fundsController');

// Add funds
router.post('/add', authMiddleware, fundsController.addFunds);

// Withdraw funds
router.post('/withdraw', authMiddleware, fundsController.withdrawFunds);

// Get transaction history
router.get('/transactions', authMiddleware, fundsController.getTransactions);

module.exports = router; 