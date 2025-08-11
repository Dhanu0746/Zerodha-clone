const { askAI } = require('../utils/openai');
const axios = require('axios');
const Order = require('../models/Order');
const Stock = require('../models/Stock');

// AI Trading Guidance
exports.getTradingGuidance = async (req, res) => {
  try {
    const { symbol, quantity, side, currentPrice, orderType, price } = req.body;
    const userId = req.user.userId;

    // Get user's trading history for this symbol
    const userOrders = await Order.find({ 
      user: userId, 
      symbol: symbol.toUpperCase() 
    }).sort({ createdAt: -1 }).limit(10);

    // Get market data for the symbol
    let marketAnalysis = '';
    try {
      const stockData = await Stock.findOne({ symbol: symbol.toUpperCase() });
      if (stockData) {
        marketAnalysis = `Current market price: ₹${currentPrice || stockData.currentPrice}. `;
        
        if (stockData.dayHigh && stockData.dayLow) {
          const dayRange = ((stockData.dayHigh - stockData.dayLow) / stockData.dayLow * 100).toFixed(2);
          marketAnalysis += `Today's range: ₹${stockData.dayLow} - ₹${stockData.dayHigh} (${dayRange}% volatility). `;
        }
      }
    } catch (error) {
      console.log('Could not fetch stock data:', error.message);
    }

    // Generate AI guidance based on order details
    let guidance = `📊 **Trading Analysis for ${symbol.toUpperCase()}**\n\n`;
    
    guidance += marketAnalysis + '\n\n';
    
    // Order type analysis
    if (orderType === 'market') {
      guidance += `🚀 **Market Order Analysis:**\n`;
      guidance += `• You're placing a ${side.toUpperCase()} market order for ${quantity} shares\n`;
      guidance += `• Market orders execute immediately at current market price\n`;
      guidance += `• ⚡ Pros: Immediate execution, guaranteed fill\n`;
      guidance += `• ⚠️ Cons: Price uncertainty, you'll be a TAKER (higher fees)\n\n`;
    } else {
      guidance += `🎯 **Limit Order Analysis:**\n`;
      guidance += `• You're placing a ${side.toUpperCase()} limit order for ${quantity} shares at ₹${price}\n`;
      
      if (currentPrice && price) {
        const priceDiff = ((price - currentPrice) / currentPrice * 100).toFixed(2);
        if (side === 'buy' && price < currentPrice) {
          guidance += `• 💡 Good strategy: Buying below market price (${priceDiff}% below)\n`;
          guidance += `• You'll be a MAKER if filled (lower fees)\n`;
        } else if (side === 'sell' && price > currentPrice) {
          guidance += `• 💡 Good strategy: Selling above market price (${Math.abs(priceDiff)}% above)\n`;
          guidance += `• You'll be a MAKER if filled (lower fees)\n`;
        } else {
          guidance += `• ⚠️ Your limit price is ${Math.abs(priceDiff)}% ${priceDiff > 0 ? 'above' : 'below'} market\n`;
        }
      }
      guidance += `• ⏰ May not execute immediately\n\n`;
    }
    
    // Position sizing advice
    const orderValue = currentPrice ? (currentPrice * quantity) : (price * quantity);
    guidance += `💰 **Position Sizing:**\n`;
    guidance += `• Order value: ₹${orderValue?.toLocaleString('en-IN') || 'N/A'}\n`;
    guidance += `• Consider your risk tolerance and portfolio size\n`;
    guidance += `• Recommended: Don't risk more than 2-5% of portfolio on single trade\n\n`;
    
    // Trading history insights
    if (userOrders.length > 0) {
      const avgOrderSize = userOrders.reduce((sum, order) => sum + order.quantity, 0) / userOrders.length;
      guidance += `📈 **Your Trading Pattern:**\n`;
      guidance += `• You've traded ${symbol.toUpperCase()} ${userOrders.length} times recently\n`;
      guidance += `• Your average order size: ${Math.round(avgOrderSize)} shares\n`;
      guidance += `• Current order is ${quantity > avgOrderSize ? 'larger' : 'smaller'} than your average\n\n`;
    }
    
    // Risk management
    guidance += `⚠️ **Risk Management Tips:**\n`;
    guidance += `• Set stop-loss orders to limit downside\n`;
    guidance += `• Consider taking partial profits on the way up\n`;
    guidance += `• Don't chase prices - stick to your plan\n`;
    guidance += `• Market orders during volatile times can have significant slippage\n\n`;
    
    // Maker vs Taker explanation
    guidance += `🏦 **Liquidity & Fees:**\n`;
    guidance += `• **MAKER**: Add liquidity with limit orders (lower fees ~0.1%)\n`;
    guidance += `• **TAKER**: Remove liquidity with market orders (higher fees ~0.15%)\n`;
    guidance += `• Tip: Use limit orders when not in a hurry to save on fees\n`;
    
    res.json({ guidance });
  } catch (error) {
    console.error('AI guidance error:', error);
    res.status(500).json({ 
      guidance: 'Unable to provide guidance at the moment. Please ensure all order details are correct and try again.' 
    });
  }
};

// AI Chat endpoint for general queries
exports.aiChat = async (req, res) => {
  try {
    const { message } = req.body;
    
    // Simple rule-based responses (you can integrate with OpenAI API here)
    let response = '';
    
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('market') && lowerMessage.includes('order')) {
      response = '🚀 Market orders execute immediately at the current market price. They guarantee execution but you pay the market price and higher fees as a taker.';
    } else if (lowerMessage.includes('limit') && lowerMessage.includes('order')) {
      response = '🎯 Limit orders let you set your desired price. They may not execute immediately but you get better price control and lower fees as a maker.';
    } else if (lowerMessage.includes('maker') || lowerMessage.includes('taker')) {
      response = '🏦 Makers add liquidity to the order book with limit orders (lower fees). Takers remove liquidity with market orders (higher fees).';
    } else if (lowerMessage.includes('risk') || lowerMessage.includes('stop loss')) {
      response = '⚠️ Always use stop-loss orders to limit downside risk. Never risk more than 2-5% of your portfolio on a single trade.';
    } else if (lowerMessage.includes('portfolio') || lowerMessage.includes('diversification')) {
      response = '📊 Diversify your portfolio across different sectors and asset classes. Don\'t put all eggs in one basket!';
    } else {
      response = `I understand you're asking about: "${message}". For specific trading advice, please use the Order Placement page where I can provide detailed guidance based on your order details.`;
    }
    
    res.json({ response });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ response: 'Sorry, I\'m having trouble right now. Please try again later.' });
  }
};

exports.ask = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });
    const response = await askAI(prompt);
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};