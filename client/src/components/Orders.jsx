import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ symbol: '', quantity: '', type: 'buy' });
  const [placing, setPlacing] = useState(false);
  const [message, setMessage] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/order', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPlacing(true);
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const payload = {
        symbol: form.symbol.toUpperCase(),
        quantity: Number(form.quantity),
        type: form.type,
      };
      const res = await api.post('/order', payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message || 'Order placed!');
      setForm({ symbol: '', quantity: '', type: 'buy' });
      fetchOrders(); // Refresh orders
    } catch (err) {
      setMessage(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-2 text-center">Your Orders</h2>
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 mb-4 items-center justify-center">
        <input
          type="text"
          name="symbol"
          value={form.symbol}
          onChange={handleChange}
          placeholder="Symbol (e.g. AAPL)"
          className="px-3 py-2 border rounded"
          required
        />
        <input
          type="number"
          name="quantity"
          value={form.quantity}
          onChange={handleChange}
          placeholder="Quantity"
          className="px-3 py-2 border rounded"
          min="1"
          required
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="px-3 py-2 border rounded"
        >
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={placing}
        >
          {placing ? 'Placing...' : 'Place Order'}
        </button>
      </form>
      {message && <div className="text-center mb-2 text-sm font-medium text-green-700">{message}</div>}
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-red-600 text-center">{error}</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500">No orders found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Stock</th>
                <th className="py-2 px-4 border-b">Type</th>
                <th className="py-2 px-4 border-b">Quantity</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="py-2 px-4 border-b">{o.symbol}</td>
                  <td className="py-2 px-4 border-b capitalize">{o.type}</td>
                  <td className="py-2 px-4 border-b">{o.quantity}</td>
                  <td className="py-2 px-4 border-b">₹{o.price}</td>
                  <td className="py-2 px-4 border-b capitalize">{o.status}</td>
                  <td className="py-2 px-4 border-b">{new Date(o.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders; 