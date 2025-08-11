const User = require('../models/User');
const Holding = require('../models/Holding');
const Order = require('../models/Order');

exports.getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select('balance');
    const holdings = await Holding.find({ user: userId });
    
    // Get open orders specifically
    const openOrders = await Order.find({ 
      user: userId, 
      status: { $in: ['open', 'partial'] } 
    }).sort({ createdAt: -1 });
    
    // Get recent orders (all statuses)
    const recentOrders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate portfolio value
    const portfolioValue = holdings.reduce((total, holding) => {
      return total + (holding.quantity * holding.avgPrice);
    }, 0);

    res.status(200).json({
      balance: user?.balance || 0,
      availableBalance: user?.balance || 0,
      portfolioValue,
      totalValue: (user?.balance || 0) + portfolioValue,
      holdings,
      openOrders,
      recentOrders
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Failed to load dashboard data' });
  }
};
