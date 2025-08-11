const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const orderController = require('../controller/orderController');

// Get all orders for a user
router.get('/', authMiddleware, orderController.getUserOrders);

// Place a new order
router.post('/', authMiddleware, orderController.placeOrder);

// Update an order (not implemented in controller)
// router.put('/:orderId', authMiddleware, orderController.updateOrder);

// Cancel an order
router.delete('/:orderId', authMiddleware, orderController.cancelOrder);

module.exports = router;