import React, { useState, useEffect } from 'react';
import { useStockPrices, useWebSocket } from '../hooks/useWebSocket';
import { TrendingUp, TrendingDown, Wifi, WifiOff, Users } from 'lucide-react';

const RealTimePrices = ({ watchlist = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'] }) => {
  const { prices, lastUpdate, isConnected } = useStockPrices(watchlist);
  const { connectionStatus, connectedUsers } = useWebSocket();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString();
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getChangeBgColor = (change) => {
    if (change > 0) return 'bg-green-50 border-green-200';
    if (change < 0) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Header with connection status */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-800">Live Market Prices</h2>
        <div className="flex items-center space-x-4">
          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            {isConnected ? (
              <>
                <Wifi className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 font-medium">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600 font-medium">Disconnected</span>
              </>
            )}
          </div>
          
          {/* Connected Users */}
          {connectedUsers > 0 && (
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-blue-600">{connectedUsers} online</span>
            </div>
          )}
          
          {/* Last Update */}
          {lastUpdate && (
            <span className="text-xs text-gray-500">
              Updated: {formatTime(lastUpdate)}
            </span>
          )}
        </div>
      </div>

      {/* Price Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {watchlist.map((symbol) => {
          const priceData = prices[symbol];
          
          return (
            <div
              key={symbol}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                priceData 
                  ? getChangeBgColor(priceData.change)
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-lg text-gray-800">{symbol}</h3>
                {priceData && (
                  <div className="flex items-center">
                    {priceData.change > 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : priceData.change < 0 ? (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>

              {priceData ? (
                <>
                  <div className="mb-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {formatCurrency(priceData.price)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className={`font-medium ${getChangeColor(priceData.change)}`}>
                      {priceData.change > 0 ? '+' : ''}
                      {formatCurrency(priceData.change)}
                    </div>
                    <div className={`font-medium ${getChangeColor(priceData.change)}`}>
                      {priceData.changePercent > 0 ? '+' : ''}
                      {priceData.changePercent.toFixed(2)}%
                    </div>
                  </div>
                  
                  {priceData.volume && (
                    <div className="mt-2 text-xs text-gray-500">
                      Volume: {priceData.volume.toLocaleString()}
                    </div>
                  )}
                  
                  <div className="mt-1 text-xs text-gray-400">
                    {formatTime(priceData.timestamp)}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Loading...</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Connection Status Banner */}
      {!isConnected && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-5 h-5 text-yellow-600" />
            <span className="text-sm text-yellow-800">
              Real-time updates are currently unavailable. Attempting to reconnect...
            </span>
          </div>
        </div>
      )}

      {/* Market Status */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Market Status: 
            <span className={`ml-1 font-medium ${
              isConnected ? 'text-green-600' : 'text-red-600'
            }`}>
              {isConnected ? 'Open' : 'Closed'}
            </span>
          </span>
          <span>
            Connection: 
            <span className={`ml-1 font-medium ${
              connectionStatus === 'connected' ? 'text-green-600' : 
              connectionStatus === 'connecting' ? 'text-yellow-600' : 'text-red-600'
            }`}>
              {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default RealTimePrices;
