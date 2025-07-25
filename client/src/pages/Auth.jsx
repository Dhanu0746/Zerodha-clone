import React, { useState } from 'react';
import axios from 'axios';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';

const AuthForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup';
      const res = await api.post(endpoint, formData);
      alert(res.data.message);
      console.log('API response:', res.data);

      if (isLogin && res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.user); // <-- Store user in state
        navigate('/dashboard'); // Redirect to dashboard
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error occurred');
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">
        {isLogin ? 'Login to Your Account' : 'Create a New Account'}
      </h2>
      <form onSubmit={handleSubmit} className="w-[300px] space-y-4">
        {!isLogin && (
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="border w-full p-2"
            required
          />
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="border w-full p-2"
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="border w-full p-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2">
          {isLogin ? 'Login' : 'Sign Up'}
        </button>
      </form>
      <p className="mt-4">
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-blue-500 underline"
        >
          {isLogin ? 'Sign Up' : 'Login'}
        </button>
      </p>
      {user && (
        <div>
          <h3>Welcome, {user.name}!</h3>
          <p>Email: {user.email}</p>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
