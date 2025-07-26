// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Page imports
import Home from './pages/Home';
import Signup from './pages/Signup';
import About from './pages/About';
import Products from './pages/Products';
import Support from './pages/Support';
import NavBar from './components/Navbar';
import Footer from './components/Footer';
import AuthForm from './pages/Auth';
import Dashboard from './pages/Dashboard';
const App = () => {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <NavBar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<AuthForm />} />
            <Route path="/about" element={<About />} />
            <Route path="/product" element={<Products />} />
            <Route path="/pricing" element={<Home />} />
            <Route path="/support" element={<Support />} />
            <Route path="/dashboard" element={ <Dashboard />} />

          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
