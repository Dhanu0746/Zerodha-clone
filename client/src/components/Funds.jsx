import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const Funds = () => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [amount, setAmount] = useState('');
  const [action, setAction] = useState('add');
  const [message, setMessage] = useState('');

  const fetchBalance = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await api.get('/funds/balance', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBalance(res.data.balance || 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const token = localStorage.getItem('token');
      const endpoint = action === 'add' ? '/funds/add' : '/funds/withdraw';
      const res = await api.post(endpoint, { amount: Number(amount) }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(res.data.message || 'Transaction successful!');
      setAmount('');
      fetchBalance();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Transaction failed');
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold mb-2 text-center">Funds</h2>
      {loading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-red-600 text-center">{error}</div>
      ) : (
        <div className="text-center mb-4">
          <span className="font-semibold">Current Balance: </span>
          <span className="text-green-700">₹{balance}</span>
        </div>
      )}
      <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 items-center justify-center mb-2">
        <input
          type="number"
          min="1"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          className="px-3 py-2 border rounded"
          required
        />
        <select value={action} onChange={(e) => setAction(e.target.value)} className="px-3 py-2 border rounded">
          <option value="add">Add Funds</option>
          <option value="withdraw">Withdraw Funds</option>
        </select>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Submit
        </button>
      </form>
      {message && <div className="text-center text-sm font-medium text-green-700">{message}</div>}
    </div>
  );
};

export default Funds; 