const Order = require('../models/Order');

// Place a new order
exports.placeOrder = async (req, res) => {
  try {
    const { stockId, quantity, price, type } = req.body;
    const order = new Order({
      user: req.user.userId,
      stock: stockId,
      quantity,
      price,
      type
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all orders for the user
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.userId }).populate('stock');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cancel an order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findOne({ _id: orderId, user: req.user.userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'open') return res.status(400).json({ message: 'Only open orders can be cancelled' });
    order.status = 'cancelled';
    await order.save();
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 