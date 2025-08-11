// OrderBook.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const OrderBook = () => {
  const [orderBook, setOrderBook] = useState({ buy: [], sell: [] });

  useEffect(() => {
    const fetchOrderBook = async () => {
      const res = await axios.get("/api/orderbook");
      setOrderBook(res.data);
    };

    fetchOrderBook();
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4 mt-6">
      <div>
        <h3 className="font-bold text-green-600">Buy Orders (Bids)</h3>
        <ul>
          {orderBook.buy.map((o, idx) => (
            <li key={idx}>₹{o.price} | Qty: {o.quantity}</li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-bold text-red-600">Sell Orders (Asks)</h3>
        <ul>
          {orderBook.sell.map((o, idx) => (
            <li key={idx}>₹{o.price} | Qty: {o.quantity}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default OrderBook;
