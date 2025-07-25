const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const orderController = require('../controller/orderController');

// Place a new order
router.post('/', authMiddleware, orderController.placeOrder);

// Get all orders for the user
router.get('/', authMiddleware, orderController.getUserOrders);

// Cancel an order
router.post('/cancel', authMiddleware, orderController.cancelOrder);

module.exports = router; 