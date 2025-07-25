const Stock = require('../models/Stock');
const { getLivePrice: fetchLivePrice } = require('../utils/finnhub');

// Get all stocks
exports.getAllStocks = async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search stocks by symbol or name
exports.searchStocks = async (req, res) => {
  try {
    const { q } = req.query;
    const stocks = await Stock.find({
      $or: [
        { symbol: { $regex: q, $options: 'i' } },
        { name: { $regex: q, $options: 'i' } }
      ]
    });
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get live price for a symbol
exports.getLivePrice = async (req, res) => {
  try {
    const { symbol } = req.params;
    const price = await fetchLivePrice(symbol);
    if (price === null) return res.status(404).json({ message: 'Price not found' });
    res.json({ symbol, price });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 