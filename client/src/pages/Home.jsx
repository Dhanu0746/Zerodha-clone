import React from 'react';
import HeroSection from '../components/HeroSection';
import TrustSection from '../components/TrustSection';
import Pricing from '../components/Pricing';
import OpenAccountSection from '../components/OpenAccountSection';
import Varsity from '../components/Varsity';

const Home = () => {
  return (
    <div className="space-y-16">
      <HeroSection />
      <TrustSection />
      <Pricing />
      <OpenAccountSection />
      <Varsity />
    </div>
  );
};

export default Home;
