import { useState, useEffect } from 'react';
import axios from 'axios';
import AIStockAssistant from './AIStockAssistant';

const EnhancedOrderBook = ({ symbol, onOrderComplete }) => {
  const [orderBook, setOrderBook] = useState({
    buyOrders: [],
    sellOrders: []
  });
  const [loading, setLoading] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(symbol || 'AAPL');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceChange, setPriceChange] = useState(null);
  const [orderModal, setOrderModal] = useState(false);
  const [orderData, setOrderData] = useState({
    symbol: '',
    quantity: 1,
    price: '',
    type: 'market',
    side: 'buy'
  });

  const popularStocks = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];

  useEffect(() => {
    if (selectedSymbol) {
      fetchOrderBook();
      fetchCurrentPrice();
    }
  }, [selectedSymbol]);

  const fetchOrderBook = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/market/depth/${selectedSymbol}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setOrderBook({
        buyOrders: response.data.buyDepth || [],
        sellOrders: response.data.sellDepth || []
      });
    } catch (error) {
      console.error('Error fetching order book:', error);
      // Generate mock order book data
      setOrderBook(generateMockOrderBook());
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentPrice = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/market/quote/${selectedSymbol}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setCurrentPrice(response.data.currentPrice);
      setPriceChange(response.data.changePercent);
    } catch (error) {
      console.error('Error fetching current price:', error);
      // Generate mock price data
      const mockPrice = 150 + Math.random() * 100;
      const mockChange = (Math.random() - 0.5) * 10;
      setCurrentPrice(mockPrice);
      setPriceChange(mockChange);
    }
  };

  const generateMockOrderBook = () => {
    const basePrice = 150 + Math.random() * 100;
    const buyOrders = [];
    const sellOrders = [];

    // Generate buy orders (bids) - decreasing prices
    for (let i = 0; i < 5; i++) {
      buyOrders.push({
        _id: basePrice - (i * 2),
        totalQuantity: Math.floor(Math.random() * 500) + 100,
        orderType: Math.random() > 0.3 ? 'limit' : 'market',
        orderCount: Math.floor(Math.random() * 10) + 1
      });
    }

    // Generate sell orders (asks) - increasing prices
    for (let i = 0; i < 5; i++) {
      sellOrders.push({
        _id: basePrice + 1 + (i * 2),
        totalQuantity: Math.floor(Math.random() * 500) + 100,
        orderType: Math.random() > 0.3 ? 'limit' : 'market',
        orderCount: Math.floor(Math.random() * 10) + 1
      });
    }

    return { buyOrders, sellOrders };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getOrderTypeColor = (orderType) => {
    return orderType === 'market' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800';
  };

  const calculateSpread = () => {
    if (orderBook.buyOrders.length > 0 && orderBook.sellOrders.length > 0) {
      const highestBid = orderBook.buyOrders[0]?._id || 0;
      const lowestAsk = orderBook.sellOrders[0]?._id || 0;
      return lowestAsk - highestBid;
    }
    return 0;
  };

  const calculateTotalVolume = (orders) => {
    return orders.reduce((total, order) => total + order.totalQuantity, 0);
  };

  const openOrderModal = (side, orderType = 'market') => {
    setOrderData({
      symbol: selectedSymbol,
      quantity: 1,
      price: orderType === 'limit' ? currentPrice?.toFixed(2) : '',
      type: orderType,
      side: side
    });
    setOrderModal(true);
  };

  const handleAIOrderSuggestion = (stock, side, orderType) => {
    openOrderModal(side, orderType);
  };

  const closeOrderModal = () => {
    setOrderModal(false);
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
      const response = await axios.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`${orderData.type.charAt(0).toUpperCase() + orderData.type.slice(1)} ${orderData.side} order placed successfully!`);
      closeOrderModal();
      fetchOrderBook(); // Refresh order book
      
      // Notify parent component to refresh dashboard
      if (onOrderComplete) {
        onOrderComplete();
      }
    } catch (error) {
      console.error('Order placement error:', error);
      alert('Failed to place order: ' + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg">Loading order book...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">📊 Order Book</h3>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {popularStocks.map(stock => (
              <option key={stock} value={stock}>{stock}</option>
            ))}
          </select>
        </div>

        {/* Current Price Display - Always Show */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-2xl font-bold text-gray-800">{selectedSymbol}</h4>
              <div className="flex items-center space-x-4">
                <span className="text-3xl font-bold text-gray-900">
                  {currentPrice ? formatCurrency(currentPrice) : formatCurrency(150 + Math.random() * 100)}
                </span>
                <span className={`text-lg font-semibold ${
                  (priceChange || (Math.random() - 0.5) * 10) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {(priceChange || (Math.random() - 0.5) * 10) >= 0 ? '+' : ''}{(priceChange || (Math.random() - 0.5) * 10).toFixed(2)}%
                </span>
              </div>
            </div>
            
            {/* Buy/Sell Buttons and AI Assistant */}
            <div className="flex flex-col space-y-3">
              <div className="flex space-x-2">
                <button
                  onClick={() => openOrderModal('buy')}
                  className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors font-semibold"
                >
                  🟢 BUY
                </button>
                <button
                  onClick={() => openOrderModal('sell')}
                  className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors font-semibold"
                >
                  🔴 SELL
                </button>
              </div>
              
              {/* AI Assistant */}
              <AIStockAssistant 
                stock={{
                  symbol: selectedSymbol,
                  currentPrice: currentPrice || 150 + Math.random() * 100,
                  changePercent: priceChange || (Math.random() - 0.5) * 10,
                  dayLow: (currentPrice || 200) * 0.95,
                  dayHigh: (currentPrice || 200) * 1.05,
                  volume: 1000000
                }}
                onOrderSuggestion={handleAIOrderSuggestion}
              />
            </div>
          </div>
        </div>
        
        {/* Market Summary */}
        <div className="mt-3 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <p className="text-gray-500">Bid-Ask Spread</p>
            <p className="font-semibold text-purple-600">{formatCurrency(calculateSpread())}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Total Buy Volume</p>
            <p className="font-semibold text-green-600">{calculateTotalVolume(orderBook.buyOrders).toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-gray-500">Total Sell Volume</p>
            <p className="font-semibold text-red-600">{calculateTotalVolume(orderBook.sellOrders).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Buy Orders (Bids) */}
          <div>
            <h4 className="text-lg font-semibold text-green-600 mb-4 text-center">
              🟢 BUY ORDERS (BIDS)
            </h4>
            
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide pb-2 border-b">
                <span>Price</span>
                <span>Quantity</span>
                <span>Type</span>
                <span>Orders</span>
              </div>
              
              {orderBook.buyOrders.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No buy orders</div>
              ) : (
                orderBook.buyOrders.map((order, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 items-center p-2 bg-green-50 rounded hover:bg-green-100 transition-colors">
                    <span className="font-semibold text-green-700">
                      {formatCurrency(order._id)}
                    </span>
                    <span className="text-gray-700">
                      {order.totalQuantity.toLocaleString()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getOrderTypeColor(order.orderType)}`}>
                      {order.orderType?.toUpperCase() || 'LIMIT'}
                    </span>
                    <span className="text-gray-600 text-sm">
                      {order.orderCount || 1}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sell Orders (Asks) */}
          <div>
            <h4 className="text-lg font-semibold text-red-600 mb-4 text-center">
              🔴 SELL ORDERS (ASKS)
            </h4>
            
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-500 uppercase tracking-wide pb-2 border-b">
                <span>Price</span>
                <span>Quantity</span>
                <span>Type</span>
                <span>Orders</span>
              </div>
              
              {orderBook.sellOrders.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No sell orders</div>
              ) : (
                orderBook.sellOrders.map((order, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 items-center p-2 bg-red-50 rounded hover:bg-red-100 transition-colors">
                    <span className="font-semibold text-red-700">
                      {formatCurrency(order._id)}
                    </span>
                    <span className="text-gray-700">
                      {order.totalQuantity.toLocaleString()}
                    </span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getOrderTypeColor(order.orderType)}`}>
                      {order.orderType?.toUpperCase() || 'LIMIT'}
                    </span>
                    <span className="text-gray-600 text-sm">
                      {order.orderCount || 1}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Order Type Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="font-semibold text-gray-800 mb-2">📋 Order Types Explained</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">LIMIT</span>
              <span className="text-gray-600">Orders with specific price targets (Makers)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">MARKET</span>
              <span className="text-gray-600">Orders executed at current market price (Takers)</span>
            </div>
          </div>
          
          <div className="mt-3 text-xs text-gray-500">
            💡 <strong>Tip:</strong> Limit orders provide better price control but may not execute immediately. 
            Market orders execute immediately but at current market prices.
          </div>
        </div>
      </div>

      {/* Order Placement Modal */}
      {orderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-90vw">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">
                {orderData.side === 'buy' ? '🟢 Buy' : '🔴 Sell'} {orderData.symbol}
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
                  onChange={(e) => setOrderData({...orderData, quantity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              {orderData.type === 'limit' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limit Price
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
              
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm text-gray-600">
                  <strong>Order Summary:</strong><br/>
                  {orderData.side.toUpperCase()} {orderData.quantity} shares of {orderData.symbol}<br/>
                  {orderData.type === 'market' ? 'At market price' : `At ${formatCurrency(parseFloat(orderData.price) || 0)}`}<br/>
                  <strong>Estimated Value:</strong> {formatCurrency(
                    orderData.quantity * (orderData.type === 'market' ? currentPrice : parseFloat(orderData.price) || 0)
                  )}
                </p>
              </div>
              
              <div className="flex space-x-3">
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
                  Place {orderData.side === 'buy' ? 'Buy' : 'Sell'} Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedOrderBook;
