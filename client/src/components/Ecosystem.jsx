import React from 'react';

const Ecosystem = () => {
  return (
    <section className="text-center py-16 bg-gray-50">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6">The Zerodha Universe</h2>
      <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-10">
        A whole ecosystem of modern investment platforms tailored to help you grow your wealth.
      </p>
      <div className="flex justify-center">
        <img
          src="/assets/spiral.png"
          alt="Zerodha ecosystem"
          className="w-[550px] md:w-[650px]"
        />
      </div>
    </section>
  );
};

export default Ecosystem;
