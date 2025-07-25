const express = require('express');
const router = express.Router();
const stockController = require('../controller/stockController');

// Get all stocks
router.get('/', stockController.getAllStocks);

// Search stocks
router.get('/search', stockController.searchStocks);

// Get live price for a symbol
router.get('/price/:symbol', stockController.getLivePrice);

module.exports = router; 