import React from 'react';
import spiralImg from '../assets/ecosystem.png';

const TrustSection = () => {
  return (
    <section className="bg-gray-100 py-16 px-6 md:px-20">
      <div className="max-w-7xl mx-auto flex flex-col-reverse md:flex-row items-center md:items-start justify-between gap-10">
        
        {/* Left Text Block */}
        <div className="md:w-1/2 text-center md:text-left">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-800 mb-4">
            Largest stock broker in India
          </h2>

          <p className="text-lg text-gray-600 mb-8">
            1+ crore clients place millions of orders every day through our powerful ecosystem of investment platforms,
            contributing to over 15% of all retail order volumes in India. Now everyone can invest!
          </p>

          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">1+ Crore Clients,15% of retail volume,₹0 Free equity investments</h3>
            </div>
          </div>
        </div>

        {/* Right Spiral Image */}
        <div className="md:w-1/2 flex justify-center md:justify-end">
          <img src={spiralImg} alt="Zerodha Ecosystem Spiral" className="mx-auto w-64 md:w-80" />
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
