// routes/orderbook.js

const express = require('express');
const router = express.Router();

// Dummy order book data (you can connect this to MongoDB or any DB later)
const orderBook = {
  buy: [
    { price: 285, quantity: 30 },
    { price: 284, quantity: 45 },
    { price: 283, quantity: 20 }
  ],
  sell: [
    { price: 287, quantity: 20 },
    { price: 288, quantity: 50 },
    { price: 289, quantity: 10 }
  ]
};

// GET /api/orderbook
router.get('/', (req, res) => {
  res.json(orderBook);
});

module.exports = router;
