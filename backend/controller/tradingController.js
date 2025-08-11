const Order = require('../models/Order');
const Holding = require('../models/Holding');
const User = require('../models/User');
const getLivePrice = require('../utils/finnhub');

exports.placeOrder = async (req, res) => {
  try {
    const { symbol, quantity, orderType, limitPrice, side } = req.body;
    const userId = req.user.userId;

    const marketPrice = await getLivePrice(symbol);

    let executedPrice = null;
    let status = 'open';

    if (orderType === 'market') {
      executedPrice = marketPrice;
      status = 'executed';
    } else if (orderType === 'limit') {
      if ((side === 'buy' && limitPrice >= marketPrice) || (side === 'sell' && limitPrice <= marketPrice)) {
        executedPrice = limitPrice;
        status = 'executed';
      }
    }

    const order = new Order({
      user: userId,
      symbol,
      quantity,
      side,
      type: orderType,
      price: orderType === 'limit' ? limitPrice : marketPrice,
      status,
      executedPrice: executedPrice || null,
    });

    await order.save();

    if (status === 'executed') {
      let holding = await Holding.findOne({ user: userId, symbol });

      if (side === 'buy') {
        if (holding) {
          holding.quantity += quantity;
        } else {
          holding = new Holding({ user: userId, symbol, quantity });
        }
      } else if (side === 'sell') {
        if (!holding || holding.quantity < quantity) {
          return res.status(400).json({ error: 'Not enough holdings to sell' });
        }
        holding.quantity -= quantity;
      }

      await holding.save();
    } else {
      await matchOrders(symbol); // ✅ Call matching engine
    }

    res.status(200).json({ message: 'Order placed', order });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};
