const express = require('express');
const router = express.Router();
const aiController = require('../controller/aiController');
const authMiddleware = require('../middleware/authMiddleware');

// AI Trading Guidance - This is your unique feature!
router.post('/trading-guidance', authMiddleware, aiController.getTradingGuidance);

// AI Chat for general queries
router.post('/chat', authMiddleware, aiController.aiChat);

// Legacy route (if you had this before)
router.post('/ask', authMiddleware, aiController.ask);

module.exports = router;
