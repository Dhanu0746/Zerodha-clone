import React from "react";

const About = () => {
  return (
    <div className="max-w-6xl mx-auto px-8 py-24 text-gray-800">
      <h1 className="text-4xl font-semibold mb-4">Invest in everything</h1>
      <p className="text-lg mb-8">
        Online platform to invest in stocks, derivatives, mutual funds, and more
      </p>
      <img
        src="https://zerodha.com/static/images/landing.png"
        alt="Zerodha About"
        className="w-full rounded-lg shadow"
      />
    </div>
  );
};

export default About;
