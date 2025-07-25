import React, { useState } from 'react';
import api from '../api/axios';

const StockPrice = () => {
  const [symbol, setSymbol] = useState('');
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrice(null);
    try {
      // Adjust the endpoint if your backend route is different
      const res = await api.get(`/stock/price/${symbol}`);
      setPrice(res.data.price);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4 text-center">Live Stock Price</h2>
      <form onSubmit={handleSubmit} className="flex gap-2 mb-4">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Enter symbol (e.g. AAPL)"
          className="flex-1 px-3 py-2 border rounded"
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Get Price'}
        </button>
      </form>
      {error && <div className="text-red-600 text-center mb-2">{error}</div>}
      {price !== null && (
        <div className="text-center text-lg font-semibold">
          Current Price: <span className="text-green-700">${price}</span>
        </div>
      )}
    </div>
  );
};

export default StockPrice; 