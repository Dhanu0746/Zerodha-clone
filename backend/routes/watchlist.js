const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const watchlistController = require('../controller/watchlistController');

// Get user's watchlist
router.get('/', authMiddleware, watchlistController.getWatchlist);

// Add stock to watchlist
router.post('/add', authMiddleware, watchlistController.addToWatchlist);

// Remove stock from watchlist
router.post('/remove', authMiddleware, watchlistController.removeFromWatchlist);

module.exports = router; 