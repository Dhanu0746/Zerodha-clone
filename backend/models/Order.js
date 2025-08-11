const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true },     // Stock symbol like "RELIANCE"
  quantity: { type: Number, required: true },   // How many stocks to buy/sell
  filledQuantity: { type: Number, default: 0 }, // How many have been filled
  price: { type: Number },                      // Set only for limit orders
  avgFillPrice: { type: Number },               // Average price at which order was filled
  type: { type: String, enum: ['market', 'limit'], required: true },
  side: { type: String, enum: ['buy', 'sell'], required: true },
  status: { type: String, enum: ['open', 'partial', 'filled', 'cancelled'], default: 'open' },
  orderType: { type: String, enum: ['maker', 'taker'], default: 'taker' }, // For liquidity tracking
  fees: { type: Number, default: 0 },           // Trading fees
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  filledAt: { type: Date }                      // When order was completely filled
});

module.exports = mongoose.model('Order', orderSchema);
