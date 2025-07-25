import React, { useState } from 'react';
import api from '../api/axios';

const AIChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]); // { sender: 'user'|'ai', text: string }
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { sender: 'user', text: input }]);
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/ask', { question: input });
      setMessages((msgs) => [...msgs, { sender: 'ai', text: res.data.answer }]);
    } catch (err) {
      setError(err.response?.data?.message || 'AI service error');
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-4 bg-white rounded shadow flex flex-col h-[400px]">
      <h2 className="text-xl font-bold mb-2 text-center">Ask AI Assistant</h2>
      <div className="flex-1 overflow-y-auto mb-2 border rounded p-2 bg-gray-50">
        {messages.length === 0 && <div className="text-gray-400 text-center">Ask me anything about stocks, trading, or the app!</div>}
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-2 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`px-3 py-2 rounded-lg max-w-[80%] ${msg.sender === 'user' ? 'bg-blue-100 text-right' : 'bg-green-100 text-left'}`}>
              <span className="block text-xs text-gray-500 mb-1">{msg.sender === 'user' ? 'You' : 'AI'}</span>
              {msg.text}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your question..."
          className="flex-1 px-3 py-2 border rounded"
          disabled={loading}
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? '...' : 'Send'}
        </button>
      </form>
      {error && <div className="text-center text-red-600 mt-2">{error}</div>}
    </div>
  );
};

export default AIChat; 