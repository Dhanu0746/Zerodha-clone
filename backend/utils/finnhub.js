const axios = require('axios');

const getLivePrice = async (symbol) => {
  const apiKey = process.env.FINNHUB_API_KEY;
  const url = `https://finnhub.io/api/v1/quote?symbol=${symbol}&token=${apiKey}`;
  try {
    const response = await axios.get(url);
    // Finnhub returns { c: current price, ... }
    return response.data.c || null;
  } catch (err) {
    console.error('Finnhub API error:', err.message);
    return null;
  }
};

module.exports = { getLivePrice }; 