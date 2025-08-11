const Order = require('../models/Order');

exports.getLiquidity = async (symbol) => {
  const buyLiquidity = await Order.aggregate([
    { $match: { symbol, side: 'buy', status: 'open' } },
    { $group: { _id: null, total: { $sum: '$quantity' } } }
  ]);

  const sellLiquidity = await Order.aggregate([
    { $match: { symbol, side: 'sell', status: 'open' } },
    { $group: { _id: null, total: { $sum: '$quantity' } } }
  ]);

  return {
    buyLiquidity: buyLiquidity[0]?.total || 0,
    sellLiquidity: sellLiquidity[0]?.total || 0
  };
};
