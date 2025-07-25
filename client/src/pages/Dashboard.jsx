import React from 'react';
import StockPrice from '../components/StockPrice';
import Holdings from '../components/Holdings';
import Orders from '../components/Orders';
import Funds from '../components/Funds';
import Watchlist from '../components/Watchlist';
import AIChat from '../components/AIChat';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Welcome to Your Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <StockPrice />
        </div>
        <div className="bg-white rounded shadow p-6 flex items-center justify-center min-h-[200px]">
          <Holdings />
        </div>
        <div className="bg-white rounded shadow p-6 flex items-center justify-center min-h-[200px]">
          <Orders />
        </div>
        <div className="bg-white rounded shadow p-6 flex items-center justify-center min-h-[200px]">
          <Funds />
        </div>
        <div className="bg-white rounded shadow p-6 flex items-center justify-center min-h-[200px]">
          <Watchlist />
        </div>
        <div className="bg-white rounded shadow p-6 flex items-center justify-center min-h-[200px]">
          <AIChat />
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 