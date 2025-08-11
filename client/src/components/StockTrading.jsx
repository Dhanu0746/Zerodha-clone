import { useState, useEffect } from 'react';
import axios from 'axios';
import AIStockAssistant from './AIStockAssistant';

const StockTrading = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStock, setSelectedStock] = useState(null);
  const [orderModal, setOrderModal] = useState(false);
  const [orderData, setOrderData] = useState({
    symbol: '',
    quantity: 1,
    price: '',
    type: 'market',
    side: 'buy'
  });
  const [userHoldings, setUserHoldings] = useState([]);

  useEffect(() => {
    fetchStocks();
    fetchUserHoldings();
    
    // Set up auto-refresh for live prices
    const interval = setInterval(fetchStocks, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStocks = async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get('/api/market/quotes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Backend now always returns { stocks: [...] } structure
      setStocks(response.data.stocks || []);
      
    } catch (error) {
      console.error('Error fetching stocks:', error);
      setError('Unable to fetch live stock prices');
      
      // Fallback to empty array - backend should handle this
      setStocks([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserHoldings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/user/dashboard', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserHoldings(response.data.holdings || []);
    } catch (error) {
      console.error('Error fetching holdings:', error);
    }
  };

  const openOrderModal = (stock, side, orderType = 'market') => {
    setSelectedStock(stock);
    setOrderData({
      symbol: stock.symbol,
      quantity: 1,
      price: orderType === 'limit' ? stock.currentPrice.toFixed(2) : '',
      type: orderType,
      side: side
    });
    setOrderModal(true);
  };

  const handleAIOrderSuggestion = (stock, side, orderType) => {
    openOrderModal(stock, side, orderType);
  };

  const closeOrderModal = () => {
    setOrderModal(false);
    setSelectedStock(null);
    setOrderData({
      symbol: '',
      quantity: 1,
      price: '',
      type: 'market',
      side: 'buy'
    });
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/orders', {
        ...orderData,
        quantity: parseInt(orderData.quantity),
        price: orderData.type === 'limit' ? parseFloat(orderData.price) : undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert(`${orderData.side.toUpperCase()} order placed successfully!`);
      closeOrderModal();
      fetchUserHoldings(); // Refresh holdings
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.error || 'Failed to place order');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getHoldingForStock = (symbol) => {
    return userHoldings.find(holding => holding.symbol === symbol);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg">Loading live stock prices...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800">📈 Live Stock Prices</h3>
        <p className="text-sm text-gray-500 mt-1">Real-time prices • Auto-refresh every 30s</p>
        {error && (
          <div className="mt-2 p-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded text-sm">
            ⚠️ API Error: {error} (Showing demo data)
          </div>
        )}
      </div>
      
      <div className="p-6">
        <div className="grid gap-4">
          {(stocks || []).map((stock) => {
            const holding = getHoldingForStock(stock.symbol);
            const isPositive = stock.changePercent >= 0;
            
            return (
              <div key={stock.symbol} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-semibold text-gray-900">{stock.symbol}</h4>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        isPositive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Current Price</p>
                        <p className="font-semibold text-lg">{formatCurrency(stock.currentPrice)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Change</p>
                        <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '+' : ''}{formatCurrency(stock.change)}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Day Range</p>
                        <p className="font-semibold">{formatCurrency(stock.dayLow)} - {formatCurrency(stock.dayHigh)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Volume</p>
                        <p className="font-semibold">{stock.volume?.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Holdings Info */}
                    {holding && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-blue-700 font-medium">Your Holdings:</span>
                          <div className="text-blue-800">
                            <span className="font-semibold">{holding.quantity} shares</span>
                            <span className="ml-2">@ {formatCurrency(holding.avgPrice)}</span>
                            <span className="ml-2 font-semibold">
                              P&L: {formatCurrency((stock.currentPrice - holding.avgPrice) * holding.quantity)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* AI Assistant and Buy/Sell Buttons */}
                  <div className="flex flex-col space-y-2 ml-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openOrderModal(stock, 'buy')}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                      >
                        BUY
                      </button>
                      <button
                        onClick={() => openOrderModal(stock, 'sell')}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                        disabled={!holding || holding.quantity === 0}
                      >
                        SELL
                      </button>
                    </div>
                    <AIStockAssistant 
                      stock={stock} 
                      onOrderSuggestion={handleAIOrderSuggestion}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Modal */}
      {orderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {orderData.side.toUpperCase()} {selectedStock?.symbol}
              </h3>
              <button
                onClick={closeOrderModal}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Type
                </label>
                <select
                  value={orderData.type}
                  onChange={(e) => setOrderData({...orderData, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="market">Market Order</option>
                  <option value="limit">Limit Order</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={orderData.quantity}
                  onChange={(e) => setOrderData({...orderData, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {orderData.type === 'limit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={orderData.price}
                    onChange={(e) => setOrderData({...orderData, price: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-sm">
                  <div className="flex justify-between">
                    <span>Current Price:</span>
                    <span className="font-semibold">{formatCurrency(selectedStock?.currentPrice || 0)}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span>Estimated Total:</span>
                    <span className="font-semibold">
                      {formatCurrency((orderData.type === 'market' ? selectedStock?.currentPrice : parseFloat(orderData.price) || 0) * parseInt(orderData.quantity) || 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={closeOrderModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`flex-1 px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 ${
                    orderData.side === 'buy'
                      ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
                      : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  }`}
                >
                  Place {orderData.side.toUpperCase()} Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockTrading;
