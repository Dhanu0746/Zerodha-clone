import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.svg';

const Navbar = () => {
  return (
    <nav className="w-full bg-white shadow-md px-6 py-4">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex-shrink-0">
          <img src={logo} alt="Zerodha Logo" className="w-[130px] h-auto" />
        </div>

        {/* Right: Navigation Links */}
        <div className="flex items-center gap-6 text-sm font-medium text-gray-800">
          <Link to="/auth" className="hover:text-blue-600 no-underline">Sign up</Link>
          <Link to="/about" className="hover:text-blue-600 no-underline">About</Link>
          <Link to="/products" className="hover:text-blue-600 no-underline">Products</Link>
          <Link to="/pricing" className="hover:text-blue-600 no-underline">Pricing</Link>
          <Link to="/support" className="hover:text-blue-600 no-underline">Support</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
