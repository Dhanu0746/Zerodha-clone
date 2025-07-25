const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const holdingController = require('../controller/holdingController');

// Get all holdings for the user
router.get('/', authMiddleware, holdingController.getUserHoldings);

module.exports = router; 