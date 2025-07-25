// UnbeatablePricing.jsx
import React from 'react';

const Pricing = () => {
  return (
    <div className="bg-white py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="inline-block bg-gray-100 shadow-xl rounded-lg p-10">
          <h2 className="text-4xl font-bold text-gray-800 mb-10">Unbeatable pricing</h2>
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="text-center">
              <p className="text-5xl font-bold text-yellow-600">₹0</p>
              <p className="mt-4 font-medium">Free account opening</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-yellow-600">₹0</p>
              <p className="mt-4 font-medium">Free equity delivery and direct mutual funds</p>
            </div>
            <div className="text-center">
              <p className="text-5xl font-bold text-yellow-600">₹20</p>
              <p className="mt-4 font-medium">Intraday and F&O</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
