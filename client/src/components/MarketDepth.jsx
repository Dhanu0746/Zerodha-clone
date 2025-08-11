import React, { useEffect, useState } from 'react';

const MarketDepth = ({ symbol }) => {
  const [buyOrders, setBuyOrders] = useState([]);
  const [sellOrders, setSellOrders] = useState([]);

  useEffect(() => {
    const fetchDepth = async () => {
      const res = await fetch(`/api/market-depth/${symbol}`);
      const data = await res.json();
      setBuyOrders(data.buyDepth);
      setSellOrders(data.sellDepth);
    };

    fetchDepth();
    const interval = setInterval(fetchDepth, 5000); // Refresh every 5 sec
    return () => clearInterval(interval);
  }, [symbol]);

  return (
    <div className="p-4 border rounded-lg w-full max-w-md">
      <h2 className="text-lg font-bold mb-2">📊 Market Depth ({symbol})</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h3 className="font-semibold mb-1 text-green-600">Buy Orders</h3>
          <ul>
            {buyOrders.map((b, i) => (
              <li key={i}>
                ₹{b._id} - {b.totalQuantity} shares
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold mb-1 text-red-600">Sell Orders</h3>
          <ul>
            {sellOrders.map((s, i) => (
              <li key={i}>
                ₹{s._id} - {s.totalQuantity} shares
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MarketDepth;
