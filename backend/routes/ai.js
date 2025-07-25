const express = require('express');
const router = express.Router();
const aiController = require('../controller/aiController');

// Ask AI for trading advice
router.post('/ask', aiController.ask);

module.exports = router; 