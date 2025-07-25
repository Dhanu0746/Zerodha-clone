import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { fetchLivePrice } from '../api/price';

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [symbol, setSymbol] = useState('');
  const [message, setMessage] = useState('');
  const [livePrices, setLivePrices] = useState({});

  const fetchWatchlist = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/watchlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWatchlist(res.data.watchlist || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch watchlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlist();
  }, []);

  useEffect(() => {
    // Fetch live prices for all watchlist stocks
    const fetchAllPrices = async () => {
      const prices = {};
      await Promise.all(
        watchlist.map(async (item) => {
          try {
            prices[item.symbol] = await fetchLivePrice(item.symbol);
          } catch {
            prices[item.symbol] = 'N/A';
          }
        })
      );
      setLivePrices(prices);
    };
    if (watchlist.length > 0) fetchAllPrices();
  }, [watchlist]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.post('/watchlist', { symbol: symbol.toUpperCase() }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message || 'Added to watchlist!');
      setSymbol('');
      fetchWatchlist();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to add to watchlist');
    }
  };

  const handleRemove = async (id) => {
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.delete(`/watchlist/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message || 'Removed from watchlist!');
      fetchWatchlist();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to remove from watchlist');
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-2 text-center">Watchlist</h2>
      <form onSubmit={handleAdd} className="flex gap-2 mb-4 items-center justify-center">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="Add Symbol (e.g. AAPL)"
          className="px-3 py-2 border rounded"
          required
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add
        </button>
      </form>
      {message && <div className="text-center text-sm font-medium text-green-700 mb-2">{message}</div>}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-red-600 text-center">{error}</div>
      ) : watchlist.length === 0 ? (
        <div className="text-center text-gray-500">No stocks in watchlist.</div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {watchlist.map((item) => (
            <li key={item._id} className="flex justify-between items-center py-2 px-2">
              <span className="font-semibold">{item.symbol}</span>
              <span className="ml-4 text-blue-700 font-semibold">
                {livePrices[item.symbol] !== undefined ?
                  (livePrices[item.symbol] === 'N/A' ? 'N/A' : `₹${livePrices[item.symbol]}`)
                  : '...'}
              </span>
              <button
                onClick={() => handleRemove(item._id)}
                className="text-red-600 hover:underline text-sm ml-4"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Watchlist; 