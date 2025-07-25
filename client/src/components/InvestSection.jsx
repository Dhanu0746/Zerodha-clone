import React from 'react';
import { Link } from 'react-router-dom';

const InvestSection = () => {
  return (
    <section className="text-center py-16 bg-white">
      <h2 className="text-4xl font-semibold text-gray-800">Invest in everything</h2>
      <p className="mt-4 text-xl text-gray-600">
        Online platform to invest in stocks, derivatives, mutual funds, and more
      </p>
      <div className="mt-6">
  <Link to="/signup">
  <button className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600 transition">
    Sign up for free
  </button>
  </Link>
</div>

    </section>
  );
};

export default InvestSection;
