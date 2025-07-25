
import React, { useState } from 'react';
import axios from 'axios';
import api from '../api/axios';

const Signup = () => {
  const [isSignup, setIsSignup] = useState(true); // toggle between signup and login
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');

  const toggleForm = () => {
    setFormData({ name: '', email: '', password: '' });
    setMessage('');
    setIsSignup(!isSignup);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    try {
      const url = isSignup ? '/auth/signup' : '/auth/login';
      const payload = isSignup
        ? { name: formData.name, email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password };

      const res = await api.post(url, payload);
      setMessage(res.data.message);

      if (isSignup && res.data.message && res.data.message.toLowerCase().includes('success')) {
        setFormData({ name: '', email: '', password: '' });
      }

      if (!isSignup) {
        // Store JWT token in localStorage
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);
          // Optionally, redirect or update UI here
          // e.g., navigate('/dashboard');
        }
        console.log('Login Success:', res.data.user);
      }

    } catch (err) {
      setMessage(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">{isSignup ? 'Sign Up' : 'Log In'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              required
            />
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {isSignup ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <p className="mt-4 text-sm text-gray-600 text-center">
          {isSignup ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={toggleForm} className="text-blue-600 ml-1 underline">
            {isSignup ? 'Log in here' : 'Sign up here'}
          </button>
        </p>
        {message && (
  <div
    className={`mt-4 text-center text-sm font-medium ${
      message.toLowerCase().includes('success') ? 'text-green-700' : 'text-red-600'
    }`}
  >
    {message}
  </div>
)}

      </div>
    </div>
  );
};

export default Signup;
