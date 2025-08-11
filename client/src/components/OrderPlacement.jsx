import { useState, useEffect } from 'react';
import axios from 'axios';

const OrderPlacement = () => {
  const [orderData, setOrderData] = useState({
    symbol: '',
    quantity: '',
    price: '',
    type: 'market',
    side: 'buy'
  });
  const [aiGuidance, setAiGuidance] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [marketData, setMarketData] = useState(null);
  const [liquidityData, setLiquidityData] = useState(null);

  // Fetch market data when symbol changes
  useEffect(() => {
    if (orderData.symbol && orderData.symbol.length >= 3) {
      fetchMarketData();
      fetchLiquidityData();
    }
  }, [orderData.symbol]);

  const fetchMarketData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/market/quote/${orderData.symbol}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMarketData(response.data);
    } catch (error) {
      console.error('Error fetching market data:', error);
    }
  };

  const fetchLiquidityData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/orders/orderbook/${orderData.symbol}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiquidityData(response.data);
    } catch (error) {
      console.error('Error fetching liquidity data:', error);
    }
  };

  const getAIGuidance = async () => {
    if (!orderData.symbol || !orderData.quantity) {
      setAiGuidance('Please enter symbol and quantity to get AI guidance.');
      return;
    }

    setAiLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/ai/trading-guidance', {
        symbol: orderData.symbol,
        quantity: parseInt(orderData.quantity),
        side: orderData.side,
        currentPrice: marketData?.currentPrice,
        orderType: orderData.type,
        price: orderData.price ? parseFloat(orderData.price) : null
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAiGuidance(response.data.guidance);
    } catch (error) {
      console.error('Error getting AI guidance:', error);
      setAiGuidance('Unable to get AI guidance at the moment.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const orderPayload = {
        ...orderData,
        quantity: parseInt(orderData.quantity),
        price: orderData.type === 'limit' ? parseFloat(orderData.price) : undefined
      };

      const response = await axios.post('/api/orders', orderPayload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Order placed successfully!');
      setOrderData({
        symbol: '',
        quantity: '',
        price: '',
        type: 'market',
        side: 'buy'
      });
      setAiGuidance('');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Place Order</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Order Details</h3>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symbol
              </label>
              <input
                type="text"
                name="symbol"
                value={orderData.symbol}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., RELIANCE, TCS, INFY"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Side
                </label>
                <select
                  name="side"
                  value={orderData.side}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="buy">Buy</option>
                  <option value="sell">Sell</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Type
                </label>
                <select
                  name="type"
                  value={orderData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="market">Market</option>
                  <option value="limit">Limit</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                name="quantity"
                value={orderData.quantity}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Number of shares"
                min="1"
                required
              />
            </div>

            {orderData.type === 'limit' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price
                </label>
                <input
                  type="number"
                  name="price"
                  value={orderData.price}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Price per share"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            )}

            <button
              type="button"
              onClick={getAIGuidance}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              disabled={aiLoading}
            >
              {aiLoading ? 'Getting AI Guidance...' : '🤖 Get AI Guidance'}
            </button>

            <button
              type="submit"
              className={`w-full py-2 px-4 rounded-md focus:outline-none focus:ring-2 ${
                orderData.side === 'buy' 
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                  : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              } text-white`}
              disabled={loading}
            >
              {loading ? 'Placing Order...' : `${orderData.side === 'buy' ? 'Buy' : 'Sell'} ${orderData.symbol || 'Stock'}`}
            </button>
          </form>
        </div>

        {/* Market Data & AI Guidance */}
        <div className="space-y-6">
          {/* Market Data */}
          {marketData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Market Data - {orderData.symbol}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Current Price</p>
                  <p className="text-lg font-bold text-blue-600">
                    {formatCurrency(marketData.currentPrice)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Change</p>
                  <p className={`text-lg font-bold ${
                    marketData.change >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {marketData.change >= 0 ? '+' : ''}{marketData.change?.toFixed(2)}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Day High</p>
                  <p className="text-md font-semibold">{formatCurrency(marketData.dayHigh)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Day Low</p>
                  <p className="text-md font-semibold">{formatCurrency(marketData.dayLow)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Liquidity Data */}
          {liquidityData && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Order Book Liquidity</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-green-600 mb-2">Buy Orders</h4>
                  <div className="space-y-1">
                    {liquidityData.buyOrders?.slice(0, 3).map((order, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{order.quantity}</span>
                        <span className="text-green-600">{formatCurrency(order.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-red-600 mb-2">Sell Orders</h4>
                  <div className="space-y-1">
                    {liquidityData.sellOrders?.slice(0, 3).map((order, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{order.quantity}</span>
                        <span className="text-red-600">{formatCurrency(order.price)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Maker vs Taker Info */}
              <div className="mt-4 p-3 bg-gray-50 rounded-md">
                <h4 className="text-sm font-medium mb-2">💡 Liquidity Tip</h4>
                <p className="text-xs text-gray-600">
                  <span className="font-semibold text-blue-600">Maker:</span> Place limit orders that add liquidity (lower fees)<br/>
                  <span className="font-semibold text-purple-600">Taker:</span> Market orders that remove liquidity (higher fees)
                </p>
              </div>
            </div>
          )}

          {/* AI Guidance */}
          {aiGuidance && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">🤖 AI Trading Guidance</h3>
              <div className="bg-purple-50 p-4 rounded-md">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{aiGuidance}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPlacement;
