// components/Watchlist.jsx
import React, { useState, useEffect } from 'react';

const Watchlist = () => {
  const [symbol, setSymbol] = useState('');
  const [watchlist, setWatchlist] = useState(() => {
    const stored = localStorage.getItem('watchlist');
    return stored ? JSON.parse(stored) : [];
  });

  const [prices, setPrices] = useState({});

  useEffect(() => {
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    const fetchPrices = async () => {
      const newPrices = {};
      for (const stock of watchlist) {
        try {
          const res = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stock}&apikey=demo`);
          const data = await res.json();
          newPrices[stock] = data["Global Quote"]?.["05. price"] || "N/A";
        } catch (err) {
          newPrices[stock] = "Error";
        }
      }
      setPrices(newPrices);
    };
    fetchPrices();
  }, [watchlist]);

  const addStock = () => {
    if (symbol && !watchlist.includes(symbol.toUpperCase())) {
      setWatchlist([...watchlist, symbol.toUpperCase()]);
      setSymbol('');
    }
  };

  const removeStock = (stock) => {
    setWatchlist(watchlist.filter((s) => s !== stock));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-gray-700">📋 Watchlist</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          className="border px-3 py-2 rounded w-full"
          placeholder="Enter stock symbol (e.g. AAPL)"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
        />
        <button
          onClick={addStock}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add
        </button>
      </div>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Symbol</th>
            <th className="border p-2">Live Price</th>
            <th className="border p-2">Action</th>
          </tr>
        </thead>
        <tbody>
          {watchlist.map((stock) => (
            <tr key={stock}>
              <td className="border p-2">{stock}</td>
              <td className="border p-2">₹{prices[stock]}</td>
              <td className="border p-2 text-center">
                <button
                  onClick={() => removeStock(stock)}
                  className="text-red-600 hover:underline"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
          {watchlist.length === 0 && (
            <tr>
              <td colSpan="3" className="text-center p-4 text-gray-500">
                No stocks in watchlist.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Watchlist;
