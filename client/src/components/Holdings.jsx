import React, { useEffect, useState } from 'react';
import api from '../api/axios';
import { fetchLivePrice } from '../api/price';

const Holdings = () => {
  const [holdings, setHoldings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [livePrices, setLivePrices] = useState({});

  useEffect(() => {
    const fetchHoldings = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/holding', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setHoldings(res.data.holdings || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch holdings');
      } finally {
        setLoading(false);
      }
    };
    fetchHoldings();
  }, []);

  useEffect(() => {
    // Fetch live prices for all holdings
    const fetchAllPrices = async () => {
      const prices = {};
      await Promise.all(
        holdings.map(async (h) => {
          try {
            prices[h.symbol] = await fetchLivePrice(h.symbol);
          } catch {
            prices[h.symbol] = 'N/A';
          }
        })
      );
      setLivePrices(prices);
    };
    if (holdings.length > 0) fetchAllPrices();
  }, [holdings]);

  return (
    <div>
      <h2 className="text-lg font-bold mb-2 text-center">Your Holdings</h2>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-red-600 text-center">{error}</div>
      ) : holdings.length === 0 ? (
        <div className="text-center text-gray-500">No holdings found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Stock</th>
                <th className="py-2 px-4 border-b">Quantity</th>
                <th className="py-2 px-4 border-b">Avg. Price</th>
                <th className="py-2 px-4 border-b">Current Value</th>
                <th className="py-2 px-4 border-b">Live Price</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map((h) => (
                <tr key={h._id}>
                  <td className="py-2 px-4 border-b">{h.symbol}</td>
                  <td className="py-2 px-4 border-b">{h.quantity}</td>
                  <td className="py-2 px-4 border-b">₹{h.avgPrice}</td>
                  <td className="py-2 px-4 border-b">₹{h.currentValue}</td>
                  <td className="py-2 px-4 border-b text-blue-700 font-semibold">
                    {livePrices[h.symbol] !== undefined ?
                      (livePrices[h.symbol] === 'N/A' ? 'N/A' : `₹${livePrices[h.symbol]}`)
                      : '...'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Holdings; 