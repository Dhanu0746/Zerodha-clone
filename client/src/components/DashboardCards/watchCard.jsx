import React from 'react';

const WatchlistCard = ({ watchlist }) => {
  return (
    <div className="p-4 bg-white shadow rounded-2xl w-full">
      <h2 className="text-lg font-semibold mb-2">Watchlist</h2>
      <ul className="text-sm text-gray-800 space-y-1">
        {watchlist?.length > 0 ? (
          watchlist.map((stock, idx) => (
            <li key={idx}>
              {stock.symbol} - ₹{stock.price}
            </li>
          ))
        ) : (
          <p className="text-gray-500">No stocks in watchlist.</p>
        )}
      </ul>
    </div>
  );
};

export default WatchlistCard;


