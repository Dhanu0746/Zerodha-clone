const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  symbol: { type: String, required: true }, // e.g., "RELIANCE"
  quantity: { type: Number, required: true }
});

module.exports = mongoose.model('Holding', holdingSchema);
