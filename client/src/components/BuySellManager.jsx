import { useState, useEffect } from 'react';
import axios from 'axios';

const BuySellManager = ({ selectedStock = 'AAPL', onOrderComplete }) => {
  const [orderData, setOrderData] = useState({
    symbol: selectedStock,
    quantity: 1,
    price: '',
    type: 'market',
    side: 'buy'
  });
  const [currentPrice, setCurrentPrice] = useState(200);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    setOrderData(prev => ({ ...prev, symbol: selectedStock }));
    fetchCurrentPrice();
    fetchOrders();
  }, [selectedStock]);

  const fetchCurrentPrice = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/market/quote/${selectedStock}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentPrice(response.data.currentPrice);
    } catch (error) {
      // Use mock price if API fails
      setCurrentPrice(150 + Math.random() * 100);
    }
  };

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Check if response.data is an array, if not, use empty array
      const ordersData = Array.isArray(response.data) ? response.data : 
                        Array.isArray(response.data.orders) ? response.data.orders : [];
      
      setOrders(ordersData.filter(order => order.symbol === selectedStock));
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Set empty array on error
      setOrders([]);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert(`${orderData.type.charAt(0).toUpperCase() + orderData.type.slice(1)} ${orderData.side} order placed successfully!`);
      
      // Reset form
      setOrderData({
        symbol: selectedStock,
        quantity: 1,
        price: '',
        type: 'market',
        side: 'buy'
      });
      
      // Refresh orders
      fetchOrders();
      
      // Notify parent component to refresh dashboard
      if (onOrderComplete) {
        onOrderComplete();
      }
    } catch (error) {
      console.error('Order placement error:', error);
      alert('Failed to place order: ' + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Order cancelled successfully!');
      fetchOrders();
      
      // Notify parent component to refresh dashboard
      if (onOrderComplete) {
        onOrderComplete();
      }
    } catch (error) {
      console.error('Order cancellation error:', error);
      alert('Failed to cancel order: ' + (error.response?.data?.error || error.message));
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const estimatedValue = orderData.quantity * (orderData.type === 'market' ? currentPrice : parseFloat(orderData.price) || 0);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-semibold text-gray-800 mb-6">
        🔄 Buy/Sell Manager - {selectedStock}
      </h3>

      {/* Current Price Display */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-semibold text-gray-800">{selectedStock}</h4>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(currentPrice)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Market Price</p>
            <p className="text-xs text-gray-400">Live Price</p>
          </div>
        </div>
      </div>

      {/* Order Form */}
      <form onSubmit={handleOrderSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          {/* Buy/Sell Toggle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setOrderData({...orderData, side: 'buy'})}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                  orderData.side === 'buy' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🟢 BUY
              </button>
              <button
                type="button"
                onClick={() => setOrderData({...orderData, side: 'sell'})}
                className={`flex-1 py-2 px-4 rounded-md font-semibold transition-colors ${
                  orderData.side === 'sell' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                🔴 SELL
              </button>
            </div>
          </div>

          {/* Order Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Order Type</label>
            <select
              value={orderData.type}
              onChange={(e) => setOrderData({...orderData, type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="market">Market Order</option>
              <option value="limit">Limit Order</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              min="1"
              value={orderData.quantity}
              onChange={(e) => setOrderData({...orderData, quantity: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Price (for limit orders) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {orderData.type === 'limit' ? 'Limit Price' : 'Market Price'}
            </label>
            {orderData.type === 'limit' ? (
              <input
                type="number"
                step="0.01"
                value={orderData.price}
                onChange={(e) => setOrderData({...orderData, price: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            ) : (
              <input
                type="text"
                value={formatCurrency(currentPrice)}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-600"
              />
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Order Summary</h4>
          <div className="text-sm text-blue-700">
            <p><strong>Action:</strong> {orderData.side.toUpperCase()} {orderData.quantity} shares of {orderData.symbol}</p>
            <p><strong>Type:</strong> {orderData.type.toUpperCase()} order</p>
            <p><strong>Price:</strong> {orderData.type === 'market' ? 'Market Price' : formatCurrency(parseFloat(orderData.price) || 0)}</p>
            <p><strong>Estimated Value:</strong> {formatCurrency(estimatedValue)}</p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md font-semibold text-white transition-colors ${
            orderData.side === 'buy'
              ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
              : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
          } focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {loading ? 'Placing Order...' : `Place ${orderData.side.toUpperCase()} Order`}
        </button>
      </form>

      {/* Recent Orders for this Stock */}
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Recent Orders - {selectedStock}</h4>
        {orders.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No orders for {selectedStock}</p>
            <p className="text-sm">Your orders will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((order) => (
              <div key={order._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.side === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {order.side?.toUpperCase() || 'N/A'}
                  </span>
                  <span className="font-medium">{order.quantity || 0} shares</span>
                  <span className="text-sm text-gray-500">
                    {order.price ? formatCurrency(order.price) : 'Market'}
                  </span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    order.status === 'filled' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    order.status === 'partial' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status?.toUpperCase() || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{formatTime(order.createdAt)}</span>
                  {order.status === 'open' && (
                    <button
                      onClick={() => cancelOrder(order._id)}
                      className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BuySellManager;
