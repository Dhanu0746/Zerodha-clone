// VarsitySection.jsx
import React from 'react';
import { FaGraduationCap } from 'react-icons/fa';

const VarsitySection = () => {
  return (
    <div className="bg-blue-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <FaGraduationCap className="text-blue-600 text-5xl" />
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Varsity</h2>
            <p className="text-gray-700 mt-2">The largest online stock market education book in the world covering everything from basics to advanced strategies.</p>
          </div>
        </div>
        <a
          href="https://zerodha.com/varsity"
          className="inline-block mt-6 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300"
        >
          Explore Varsity
        </a>
      </div>
    </div>
  );
};

export default VarsitySection;
