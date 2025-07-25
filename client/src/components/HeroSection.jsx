import React from 'react';
import landing from '../assets/landing.png';

const HeroSection = () => {
  return (
    <section className="bg-white pt-20 pb-10">
      <div className="max-w-[1200px] mx-auto px-4 text-center">
        {/* Landing Image */}
        <img
          src={landing}
          alt="Zerodha Dashboard"
          className="mx-auto mb-8 w-[780px] h-auto"
        />

        {/* Headline */}
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Invest in everything</h1>
        <p className="text-gray-700 mb-6">
          Online platform to invest in stocks, derivatives, mutual funds, and more
        </p>

        {/* Button */}
        <button className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600 transition">
          Sign up for free
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
