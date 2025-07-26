import React from 'react';

const OrdersCard = ({ orders }) => {
  return (
    <div className="p-4 bg-white shadow rounded-2xl w-full">
      <h2 className="text-lg font-semibold mb-2">Recent Orders</h2>
      <ul className="text-sm text-gray-800 space-y-1">
        {orders?.length > 0 ? (
          orders.map((order, idx) => (
            <li key={idx}>
              {order.symbol} - {order.type} {order.quantity} @ ₹{order.price}
            </li>
          ))
        ) : (
          <p className="text-gray-500">No recent orders.</p>
        )}
      </ul>
    </div>
  );
};

export default OrdersCard;
