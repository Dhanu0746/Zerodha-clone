const express = require('express');
const router = express.Router();
const marketController = require('../controller/marketController');
const authMiddleware = require('../middleware/authMiddleware');

// Get live stock quote from Finnhub
router.get('/quote/:symbol', authMiddleware, marketController.getQuote);

// Get multiple stock quotes for dashboard
router.get('/quotes', authMiddleware, marketController.getMultipleQuotes);

// Get market depth (order book)
router.get('/depth/:symbol', authMiddleware, marketController.getMarketDepth);

module.exports = router;
