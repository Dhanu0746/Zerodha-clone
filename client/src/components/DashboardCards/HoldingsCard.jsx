import React from 'react';

const HoldingsCard = ({ holdings }) => {
  return (
    <div className="p-4 bg-white shadow rounded-2xl w-full">
      <h2 className="text-lg font-semibold mb-2">Holdings</h2>
      <ul className="text-sm text-gray-800 space-y-1">
        {holdings?.length > 0 ? (
          holdings.map((stock, idx) => (
            <li key={idx}>
              {stock.symbol}: {stock.quantity} shares @ ₹{stock.avgPrice}
            </li>
          ))
        ) : (
          <p className="text-gray-500">No holdings yet.</p>
        )}
      </ul>
    </div>
  );
};

export default HoldingsCard;
