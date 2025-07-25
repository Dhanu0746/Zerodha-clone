const Watchlist = require('../models/Watchlist');

// Get user's watchlist
exports.getWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ user: req.user.userId }).populate('stocks');
    if (!watchlist) return res.json({ stocks: [] });
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add stock to watchlist
exports.addToWatchlist = async (req, res) => {
  try {
    const { stockId } = req.body;
    let watchlist = await Watchlist.findOne({ user: req.user.userId });
    if (!watchlist) {
      watchlist = new Watchlist({ user: req.user.userId, stocks: [stockId] });
    } else if (!watchlist.stocks.includes(stockId)) {
      watchlist.stocks.push(stockId);
    }
    await watchlist.save();
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Remove stock from watchlist
exports.removeFromWatchlist = async (req, res) => {
  try {
    const { stockId } = req.body;
    const watchlist = await Watchlist.findOne({ user: req.user.userId });
    if (!watchlist) return res.status(404).json({ message: 'Watchlist not found' });
    watchlist.stocks = watchlist.stocks.filter(id => id.toString() !== stockId);
    await watchlist.save();
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 