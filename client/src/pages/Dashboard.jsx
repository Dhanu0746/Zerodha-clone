import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, BarChart3 } from 'lucide-react';
import StockTrading from '../components/StockTrading';
import EnhancedOrderBook from '../components/EnhancedOrderBook';
import BuySellManager from '../components/BuySellManager';
import RealTimePrices from '../components/RealTimePrices';
import RealTimeNotifications from '../components/RealTimeNotifications';
import { useWebSocket, useStockPrices, useOrderUpdates } from '../hooks/useWebSocket';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    balance: 0,
    availableBalance: 0,
    portfolioValue: 0,
    totalValue: 0,
    openOrders: [],
    recentOrders: [],
    holdings: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [showBuySell, setShowBuySell] = useState(false);
  
  // WebSocket hooks
  const { connect, isConnected, connectionStatus } = useWebSocket();
  const { orderUpdates } = useOrderUpdates();
  const watchlist = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'];

  const fetchData = async () => {
    try {
      setLoading(true);
      const userToken = localStorage.getItem("token");
      const res = await axios.get("/api/user/dashboard", {
        headers: { Authorization: `Bearer ${userToken}` }
      });
      setDashboardData(res.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
      setDashboardData({
        balance: 0,
        availableBalance: 0,
        portfolioValue: 0,
        totalValue: 0,
        openOrders: [],
        recentOrders: [],
        holdings: []
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrderComplete = () => {
    // Refresh dashboard data when an order is completed
    fetchData();
  };

  // Initialize WebSocket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      connect(token);
    }
  }, [connect]);

  // Refresh dashboard when orders are updated via WebSocket
  useEffect(() => {
    if (orderUpdates.length > 0) {
      fetchData(); // Refresh dashboard data
    }
  }, [orderUpdates]);

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Trading Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor your portfolio and execute trades</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isConnected ? '🟢 Live' : '🔴 Offline'}
              </div>
              <RealTimeNotifications />
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Balance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Available Balance</h3>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(dashboardData.availableBalance)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Portfolio Value</h3>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(dashboardData.portfolioValue)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Value</h3>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(dashboardData.totalValue)}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Open Orders</h3>
            <p className="text-2xl font-bold text-orange-600">{dashboardData.openOrders?.length || 0}</p>
          </div>
        </div>

        {/* Real-Time Price Display */}
        <div className="mb-8">
          <RealTimePrices watchlist={watchlist} />
        </div>

        {/* Stock Trading Section */}
        <div className="mb-8">
          <StockTrading />
        </div>

        {/* Enhanced Order Book Section */}
        <div className="mb-8">
          <EnhancedOrderBook onOrderComplete={handleOrderComplete} />
        </div>

        {/* Buy/Sell Manager Section */}
        <div className="mb-8">
          <BuySellManager selectedStock="AAPL" onOrderComplete={handleOrderComplete} />
        </div>

        {/* Open Orders Section */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">📄 Open Orders</h3>
          </div>
          <div className="p-6">
            {(!dashboardData.openOrders || dashboardData.openOrders.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No open orders</p>
                <p className="text-sm">Your active orders will appear here</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Side</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(dashboardData.openOrders || []).map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.symbol}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            order.type === 'market' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.type?.toUpperCase() || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            order.side === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {order.side?.toUpperCase() || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.filledQuantity || 0}/{order.quantity}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.price ? formatCurrency(order.price) : 'Market'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            order.status === 'open' ? 'bg-yellow-100 text-yellow-800' : 
                            order.status === 'partial' ? 'bg-orange-100 text-orange-800' :
                            order.status === 'filled' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status?.toUpperCase() || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            order.orderType === 'maker' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {order.orderType?.toUpperCase() || 'TAKER'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatTime(order.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white rounded-lg shadow-md mt-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">📈 Recent Orders</h3>
          </div>
          <div className="p-6">
            {(!dashboardData.recentOrders || dashboardData.recentOrders.length === 0) ? (
              <div className="text-center py-8 text-gray-500">
                <p className="text-lg">No recent orders</p>
                <p className="text-sm">Your order history will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(dashboardData.recentOrders || []).slice(0, 5).map((order) => (
                  <div key={order._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        order.side === 'buy' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {order.side?.toUpperCase() || 'N/A'}
                      </span>
                      <span className="font-medium text-gray-900">{order.symbol || 'N/A'}</span>
                      <span className="text-sm text-gray-500">Qty: {order.quantity || 0}</span>
                      <span className="text-sm text-gray-500">
                        {order.price ? formatCurrency(order.price) : 'Market'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        order.status === 'filled' ? 'bg-green-100 text-green-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        order.status === 'partial' ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status?.toUpperCase() || 'N/A'}
                      </span>
                      <span className="text-sm text-gray-500">{formatTime(order.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
