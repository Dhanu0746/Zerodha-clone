import { useState, useEffect } from 'react';
import axios from 'axios';

const LiquidityView = () => {
  const [liquidityData, setLiquidityData] = useState({
    marketDepth: [],
    topStocks: [],
    aggregatedStats: {
      totalVolume: 0,
      avgSpread: 0,
      liquidStocks: 0,
      illiquidStocks: 0
    }
  });
  const [selectedSymbol, setSelectedSymbol] = useState('RELIANCE');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiquidityData();
  }, []);

  useEffect(() => {
    if (selectedSymbol) {
      fetchSymbolLiquidity();
    }
  }, [selectedSymbol]);

  const fetchLiquidityData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/market/liquidity/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiquidityData(response.data);
    } catch (error) {
      console.error('Error fetching liquidity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSymbolLiquidity = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/market/liquidity/${selectedSymbol}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiquidityData(prev => ({
        ...prev,
        marketDepth: response.data.marketDepth || []
      }));
    } catch (error) {
      console.error('Error fetching symbol liquidity:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatVolume = (volume) => {
    if (volume >= 10000000) return `${(volume / 10000000).toFixed(1)}Cr`;
    if (volume >= 100000) return `${(volume / 100000).toFixed(1)}L`;
    if (volume >= 1000) return `${(volume / 1000).toFixed(1)}K`;
    return volume.toString();
  };

  const getLiquidityStatus = (spread, volume) => {
    if (spread < 0.1 && volume > 1000000) return { status: 'High', color: 'green' };
    if (spread < 0.5 && volume > 100000) return { status: 'Medium', color: 'yellow' };
    return { status: 'Low', color: 'red' };
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="text-lg">Loading liquidity data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Market Liquidity Overview</h2>

      {/* Aggregated Liquidity Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Volume</h3>
          <p className="text-2xl font-bold text-blue-600">
            ₹{formatVolume(liquidityData.aggregatedStats.totalVolume)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Daily trading volume</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Avg Spread</h3>
          <p className="text-2xl font-bold text-green-600">
            {liquidityData.aggregatedStats.avgSpread?.toFixed(3)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">Bid-Ask spread</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Liquid Stocks</h3>
          <p className="text-2xl font-bold text-purple-600">
            {liquidityData.aggregatedStats.liquidStocks}
          </p>
          <p className="text-xs text-gray-500 mt-1">High liquidity stocks</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Illiquid Stocks</h3>
          <p className="text-2xl font-bold text-orange-600">
            {liquidityData.aggregatedStats.illiquidStocks}
          </p>
          <p className="text-xs text-gray-500 mt-1">Low liquidity stocks</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Market Depth for Selected Symbol */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-800">📊 Market Depth</h3>
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="RELIANCE">RELIANCE</option>
                <option value="TCS">TCS</option>
                <option value="INFY">INFY</option>
                <option value="HDFC">HDFC</option>
                <option value="ICICIBANK">ICICIBANK</option>
              </select>
            </div>
          </div>
          <div className="p-6">
            {liquidityData.marketDepth.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No market depth data available</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6">
                {/* Buy Orders */}
                <div>
                  <h4 className="text-sm font-medium text-green-600 mb-3 text-center">BUY ORDERS</h4>
                  <div className="space-y-2">
                    {liquidityData.marketDepth.slice(0, 5).map((level, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-green-50 rounded">
                        <span className="text-sm font-medium">{level.buyQuantity || 0}</span>
                        <span className="text-sm text-green-600 font-semibold">
                          {formatCurrency(level.buyPrice || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sell Orders */}
                <div>
                  <h4 className="text-sm font-medium text-red-600 mb-3 text-center">SELL ORDERS</h4>
                  <div className="space-y-2">
                    {liquidityData.marketDepth.slice(0, 5).map((level, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span className="text-sm text-red-600 font-semibold">
                          {formatCurrency(level.sellPrice || 0)}
                        </span>
                        <span className="text-sm font-medium">{level.sellQuantity || 0}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Spread Information */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Bid-Ask Spread:</span>
                <span className="text-sm font-semibold">
                  {liquidityData.marketDepth[0] ? 
                    `₹${((liquidityData.marketDepth[0].sellPrice || 0) - (liquidityData.marketDepth[0].buyPrice || 0)).toFixed(2)}` : 
                    'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">Spread %:</span>
                <span className="text-sm font-semibold">
                  {liquidityData.marketDepth[0] && liquidityData.marketDepth[0].buyPrice ? 
                    `${(((liquidityData.marketDepth[0].sellPrice - liquidityData.marketDepth[0].buyPrice) / liquidityData.marketDepth[0].buyPrice) * 100).toFixed(3)}%` : 
                    'N/A'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Liquid Stocks */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">🔥 Most Liquid Stocks</h3>
          </div>
          <div className="p-6">
            {liquidityData.topStocks.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>Loading top liquid stocks...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {liquidityData.topStocks.map((stock, index) => {
                  const liquidityStatus = getLiquidityStatus(stock.spread, stock.volume);
                  return (
                    <div key={stock.symbol} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                        <div>
                          <p className="font-semibold text-gray-900">{stock.symbol}</p>
                          <p className="text-xs text-gray-500">Vol: {formatVolume(stock.volume)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(stock.price)}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            liquidityStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                            liquidityStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {liquidityStatus.status}
                          </span>
                          <span className="text-xs text-gray-500">{stock.spread?.toFixed(3)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Liquidity Explanation */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">💡 Understanding Liquidity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-semibold mb-2">High Liquidity Benefits:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Tight bid-ask spreads (lower trading costs)</li>
              <li>Quick order execution</li>
              <li>Minimal price impact on large orders</li>
              <li>Easy entry and exit</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Low Liquidity Risks:</h4>
            <ul className="space-y-1 list-disc list-inside">
              <li>Wide bid-ask spreads (higher costs)</li>
              <li>Delayed order execution</li>
              <li>Price slippage on orders</li>
              <li>Difficulty in exiting positions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiquidityView;
