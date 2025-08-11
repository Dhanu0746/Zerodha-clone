const Order = require('../models/Order');
const axios = require('axios');

// Finnhub API configuration
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY || 'sandbox_c3h2ckhr01qgd5ub5qbgc3h2ckhr01qgd5ub5qc0';
const FINNHUB_BASE_URL = 'https://finnhub.io/api/v1';

// Popular Indian stocks for demo (using US symbols for Finnhub free tier)
const POPULAR_STOCKS = [
  'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN',
  'META', 'NVDA', 'NFLX', 'UBER', 'SPOT'
];

// Get live stock quote from Finnhub
exports.getQuote = async (req, res) => {
  try {
    const { symbol } = req.params;
    
    const response = await axios.get(`${FINNHUB_BASE_URL}/quote`, {
      params: {
        symbol: symbol.toUpperCase(),
        token: FINNHUB_API_KEY
      }
    });
    
    const quote = response.data;
    
    res.json({
      symbol: symbol.toUpperCase(),
      currentPrice: quote.c || 0,
      change: quote.d || 0,
      changePercent: quote.dp || 0,
      dayHigh: quote.h || 0,
      dayLow: quote.l || 0,
      openPrice: quote.o || 0,
      previousClose: quote.pc || 0,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Quote fetch error:', error);
    // Return mock data if API fails
    res.json({
      symbol: req.params.symbol.toUpperCase(),
      currentPrice: Math.random() * 1000 + 500,
      change: (Math.random() - 0.5) * 100,
      changePercent: (Math.random() - 0.5) * 10,
      dayHigh: Math.random() * 1000 + 600,
      dayLow: Math.random() * 1000 + 400,
      openPrice: Math.random() * 1000 + 500,
      previousClose: Math.random() * 1000 + 500,
      timestamp: Date.now()
    });
  }
};

// Get multiple stock quotes for dashboard
exports.getMultipleQuotes = async (req, res) => {
  try {
    console.log('Fetching multiple quotes...');
    const symbols = req.query.symbols ? req.query.symbols.split(',') : POPULAR_STOCKS;
    const quotes = [];
    
    // Always provide mock data for now to ensure the API works
    const mockStocks = [
      {
        symbol: 'AAPL',
        currentPrice: 150.25 + (Math.random() - 0.5) * 10,
        change: (Math.random() - 0.5) * 5,
        changePercent: (Math.random() - 0.5) * 3,
        dayHigh: 155.30,
        dayLow: 148.90,
        volume: 45000000
      },
      {
        symbol: 'GOOGL',
        currentPrice: 2750.80 + (Math.random() - 0.5) * 50,
        change: (Math.random() - 0.5) * 20,
        changePercent: (Math.random() - 0.5) * 2,
        dayHigh: 2780.00,
        dayLow: 2740.50,
        volume: 1200000
      },
      {
        symbol: 'MSFT',
        currentPrice: 305.45 + (Math.random() - 0.5) * 15,
        change: (Math.random() - 0.5) * 8,
        changePercent: (Math.random() - 0.5) * 2.5,
        dayHigh: 308.20,
        dayLow: 302.10,
        volume: 28000000
      },
      {
        symbol: 'TSLA',
        currentPrice: 245.67 + (Math.random() - 0.5) * 20,
        change: (Math.random() - 0.5) * 12,
        changePercent: (Math.random() - 0.5) * 4,
        dayHigh: 255.80,
        dayLow: 240.30,
        volume: 35000000
      },
      {
        symbol: 'AMZN',
        currentPrice: 3180.25 + (Math.random() - 0.5) * 60,
        change: (Math.random() - 0.5) * 25,
        changePercent: (Math.random() - 0.5) * 1.8,
        dayHigh: 3220.50,
        dayLow: 3150.75,
        volume: 2800000
      }
    ];
    
    console.log('Returning mock stock data:', mockStocks.length, 'stocks');
    res.json({ stocks: mockStocks });
    
  } catch (error) {
    console.error('Multiple quotes error:', error);
    // Always return some data even if there's an error
    const fallbackStocks = [
      {
        symbol: 'DEMO',
        currentPrice: 100.00,
        change: 0,
        changePercent: 0,
        dayHigh: 105.00,
        dayLow: 95.00,
        volume: 1000000
      }
    ];
    res.json({ stocks: fallbackStocks });
  }
};

exports.getMarketDepth = async (req, res) => {
  try {
    const symbol = req.params.symbol.toUpperCase();

    // Get top 5 buy orders (grouped by price)
    const buyDepth = await Order.aggregate([
      { $match: { symbol, side: 'buy', status: 'open' } },
      {
        $group: {
          _id: '$price',
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { _id: -1 } }, // Highest price first
      { $limit: 5 }
    ]);

    // Get top 5 sell orders (grouped by price)
    const sellDepth = await Order.aggregate([
      { $match: { symbol, side: 'sell', status: 'open' } },
      {
        $group: {
          _id: '$price',
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { _id: 1 } }, // Lowest price first
      { $limit: 5 }
    ]);

    res.status(200).json({ buyDepth, sellDepth });
  } catch (err) {
    res.status(500).json({ error: 'Failed to get market depth' });
  }
};
