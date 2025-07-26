// routes/holdings.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const holdingController = require('../controller/holdingController');

// Only this route
router.get('/', authMiddleware, holdingController.getUserHoldings);

module.exports = router;
