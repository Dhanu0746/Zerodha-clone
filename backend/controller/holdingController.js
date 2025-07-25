const Holding = require('../models/Holding');

// Get all holdings for the user
exports.getUserHoldings = async (req, res) => {
  try {
    const holdings = await Holding.find({ user: req.user.userId }).populate('stock');
    res.json(holdings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 