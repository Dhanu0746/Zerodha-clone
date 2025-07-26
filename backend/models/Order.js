const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true }, // <-- change from stockId
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  type: { type: String, enum: ['buy', 'sell'], required: true },
  status: { type: String, enum: ['open', 'completed', 'cancelled'], default: 'open' },
  createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('Order', orderSchema); 