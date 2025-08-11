import { useState } from 'react';
import axios from 'axios';

const AIStockAssistant = ({ stock, onOrderSuggestion }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiAdvice, setAiAdvice] = useState('');
  const [userQuery, setUserQuery] = useState('');

  const getAIAdvice = async (query = '') => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const analysisQuery = query || `Should I buy ${stock.symbol} at current price ${stock.currentPrice}? 
        Current change: ${stock.changePercent}%. 
        Day range: ${stock.dayLow} - ${stock.dayHigh}. 
        Volume: ${stock.volume}`;

      const response = await axios.post('/api/ai/trading-guidance', {
        symbol: stock.symbol,
        quantity: 1,
        side: 'buy',
        currentPrice: stock.currentPrice,
        orderType: 'market',
        query: analysisQuery
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAiAdvice(response.data.guidance);
    } catch (error) {
      console.error('AI advice error:', error);
      setAiAdvice(generateMockAdvice());
    } finally {
      setLoading(false);
    }
  };

  const generateMockAdvice = () => {
    const isPositive = stock.changePercent >= 0;
    const volatility = ((stock.dayHigh - stock.dayLow) / stock.dayLow * 100).toFixed(2);
    
    return `🤖 **AI Analysis for ${stock.symbol}**

📊 **Current Market Conditions:**
• Price: ₹${stock.currentPrice.toFixed(2)} (${isPositive ? '+' : ''}${stock.changePercent.toFixed(2)}%)
• Volatility: ${volatility}% (Day range: ₹${stock.dayLow} - ₹${stock.dayHigh})
• Volume: ${stock.volume?.toLocaleString()} shares

${isPositive ? '🟢' : '🔴'} **Market Sentiment:** ${isPositive ? 'Bullish' : 'Bearish'}

💡 **AI Recommendation:**
${isPositive ? 
  `• Consider BUYING - Stock showing positive momentum
  • Suggested order: LIMIT order at ₹${(stock.currentPrice * 0.98).toFixed(2)} for better entry
  • Risk level: ${volatility > 5 ? 'HIGH' : volatility > 2 ? 'MEDIUM' : 'LOW'}` :
  `• Consider WAITING - Stock in downtrend
  • If buying: Use LIMIT order at ₹${(stock.currentPrice * 0.95).toFixed(2)}
  • Risk level: ${volatility > 5 ? 'HIGH' : volatility > 2 ? 'MEDIUM' : 'LOW'}`
}

⚠️ **Risk Management:**
• Don't invest more than 5% of portfolio in single stock
• Set stop-loss at ${isPositive ? '8%' : '5%'} below entry price
• Consider dollar-cost averaging for large positions

🎯 **Order Strategy:**
• **Market Order**: For immediate execution (higher fees)
• **Limit Order**: For better price control (lower fees, may not execute)
• **Recommended**: ${volatility > 3 ? 'Limit order due to high volatility' : 'Market order for quick execution'}`;
  };

  const handleQuickAnalysis = (type) => {
    const queries = {
      'buy-signal': `Is ${stock.symbol} showing buy signals? Analyze the current price action and volume.`,
      'risk-analysis': `What are the risks of buying ${stock.symbol} at current levels? Provide risk assessment.`,
      'price-target': `What should be the target price for ${stock.symbol}? Suggest entry and exit points.`,
      'order-type': `Should I use market or limit order for ${stock.symbol}? Which is better right now?`
    };
    
    setUserQuery(queries[type]);
    getAIAdvice(queries[type]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm transition-colors"
      >
        🤖 AI Advice
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800">🤖 AI Stock Assistant</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">Get AI-powered trading insights for {stock.symbol}</p>
          </div>

          <div className="p-4">
            {/* Quick Analysis Buttons */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={() => handleQuickAnalysis('buy-signal')}
                className="px-3 py-2 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                disabled={loading}
              >
                📈 Buy Signal?
              </button>
              <button
                onClick={() => handleQuickAnalysis('risk-analysis')}
                className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
                disabled={loading}
              >
                ⚠️ Risk Analysis
              </button>
              <button
                onClick={() => handleQuickAnalysis('price-target')}
                className="px-3 py-2 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                disabled={loading}
              >
                🎯 Price Target
              </button>
              <button
                onClick={() => handleQuickAnalysis('order-type')}
                className="px-3 py-2 bg-purple-100 text-purple-700 rounded text-sm hover:bg-purple-200 transition-colors"
                disabled={loading}
              >
                📋 Order Type
              </button>
            </div>

            {/* Custom Query */}
            <div className="mb-4">
              <textarea
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder={`Ask anything about ${stock.symbol}...`}
                className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows="2"
              />
              <button
                onClick={() => getAIAdvice(userQuery)}
                disabled={loading || !userQuery.trim()}
                className="mt-2 w-full px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Analyzing...' : 'Get AI Analysis'}
              </button>
            </div>

            {/* AI Response */}
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                <span className="ml-2 text-sm text-gray-600">AI is analyzing...</span>
              </div>
            )}

            {aiAdvice && !loading && (
              <div className="bg-gray-50 p-3 rounded text-sm">
                <div className="whitespace-pre-wrap text-gray-700">{aiAdvice}</div>
                
                {/* Quick Action Buttons */}
                <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-200">
                  <button
                    onClick={() => onOrderSuggestion && onOrderSuggestion(stock, 'buy', 'market')}
                    className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                  >
                    Quick Buy (Market)
                  </button>
                  <button
                    onClick={() => onOrderSuggestion && onOrderSuggestion(stock, 'buy', 'limit')}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    Limit Order
                  </button>
                </div>
              </div>
            )}

            {!aiAdvice && !loading && (
              <div className="text-center py-4 text-gray-500 text-sm">
                Click a quick analysis button or ask a custom question to get AI insights about {stock.symbol}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIStockAssistant;
