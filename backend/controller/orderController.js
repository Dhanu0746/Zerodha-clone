const Order = require('../models/Order');
const User = require('../models/User');
const Holding = require('../models/Holding');


// Get all orders for a specific user
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email');
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

exports.getOrderBook = async (req, res) => {
  try {
    const symbol = req.params.symbol;

    const buyOrders = await Order.find({
      symbol,
      side: 'buy',
      status: 'open'
    }).sort({ price: -1 });

    const sellOrders = await Order.find({
      symbol,
      side: 'sell',
      status: 'open'
    }).sort({ price: 1 });

    res.status(200).json({
      buyOrders,
      sellOrders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch order book' });
  }
};

// Place a new order with proper execution logic
exports.placeOrder = async (req, res) => {
  try {
    const { symbol, quantity, price, type, side } = req.body;
    const userId = req.user.userId;
    
    // Get WebSocket service
    const websocketService = req.app.get('websocketService');
    
    // Get user to check balance
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Calculate order value for balance check
    let orderValue = 0;
    if (type === 'market') {
      // For market orders, estimate using current market price
      // In real implementation, you'd get this from market data
      const estimatedPrice = price || 1000; // Fallback price
      orderValue = quantity * estimatedPrice;
    } else {
      orderValue = quantity * price;
    }

    // Check if user has sufficient balance for buy orders
    if (side === 'buy' && user.balance < orderValue) {
      return res.status(400).json({ 
        error: 'Insufficient balance', 
        required: orderValue, 
        available: user.balance 
      });
    }

    // Create the order
    const order = new Order({
      user: userId,
      symbol: symbol.toUpperCase(),
      quantity,
      price: type === 'limit' ? price : undefined,
      type,
      side,
      status: 'open',
      orderType: type === 'limit' ? 'maker' : 'taker',
      createdAt: new Date()
    });

    // For market orders, execute immediately
    if (type === 'market') {
      await executeMarketOrder(order, user);
      
      // Publish order execution via WebSocket
      if (websocketService) {
        await websocketService.publishOrderUpdate(userId, order, 'filled');
        await websocketService.publishPortfolioUpdate(userId, {
          balance: user.balance,
          totalValue: user.balance // Add portfolio calculation logic here
        });
      }
    } else {
      // For limit orders, just save and wait for matching
      await order.save();
      
      // Reserve balance for buy orders
      if (side === 'buy') {
        user.balance -= orderValue;
        await user.save();
      }
      
      // Publish order placement via WebSocket
      if (websocketService) {
        await websocketService.publishOrderUpdate(userId, order, 'placed');
      }
    }

    res.status(201).json({ 
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} order placed successfully!`, 
      order,
      remainingBalance: user.balance
    });
  } catch (err) {
    console.error('Order placement error:', err);
    res.status(500).json({ error: err.message });
  }
};

// Execute market order immediately
const executeMarketOrder = async (order, user) => {
  try {
    // Simulate market execution
    const executionPrice = order.price || (Math.random() * 1000 + 500); // Mock price
    const fees = (executionPrice * order.quantity) * 0.001; // 0.1% fees
    
    order.status = 'filled';
    order.filledQuantity = order.quantity;
    order.avgFillPrice = executionPrice;
    order.fees = fees;
    order.filledAt = new Date();
    
    await order.save();
    
    // Update user balance
    if (order.side === 'buy') {
      const totalCost = (executionPrice * order.quantity) + fees;
      user.balance -= totalCost;
      
      // Add to holdings
      let holding = await Holding.findOne({ user: user._id, symbol: order.symbol });
      
      if (holding) {
        // Update existing holding
        const totalQuantity = holding.quantity + order.quantity;
        const totalValue = (holding.quantity * holding.avgPrice) + (order.quantity * executionPrice);
        holding.avgPrice = totalValue / totalQuantity;
        holding.quantity = totalQuantity;
        await holding.save();
      } else {
        // Create new holding
        holding = new Holding({
          user: user._id,
          symbol: order.symbol,
          quantity: order.quantity,
          avgPrice: executionPrice
        });
        await holding.save();
      }
    } else {
      // Sell order
      const totalReceived = (executionPrice * order.quantity) - fees;
      user.balance += totalReceived;
      
      // Update holdings
      const holding = await Holding.findOne({ user: user._id, symbol: order.symbol });
      
      if (holding && holding.quantity >= order.quantity) {
        holding.quantity -= order.quantity;
        if (holding.quantity === 0) {
          await Holding.deleteOne({ _id: holding._id });
        } else {
          await holding.save();
        }
      }
    }
    
    await user.save();
    
  } catch (error) {
    console.error('Market order execution error:', error);
    order.status = 'cancelled';
    await order.save();
    throw error;
  }
};



// Cancel an order
exports.cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.userId;

    // Get WebSocket service
    const websocketService = req.app.get('websocketService');

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    if (order.status !== 'open') {
      return res.status(400).json({ message: 'Only open orders can be cancelled' });
    }
    
    order.status = 'cancelled';
    await order.save();
    
    // Publish order cancellation via WebSocket
    if (websocketService) {
      await websocketService.publishOrderUpdate(userId, order, 'cancelled');
    }
    
    res.json({ 
      message: 'Order cancelled successfully',
      order 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 