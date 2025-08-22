import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-primary-600">
              KIM-Service
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('home')}
              className="text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('services')}
              className="text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection('about')}
              className="text-secondary-700 hover:text-primary-600 transition-colors"
            >
              About
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="text-secondary-700 hover:text-primary-600 transition-colors"
            >
              Contact
            </button>
            <Link
              to="/"
              className="text-secondary-500 hover:text-primary-600 transition-colors text-sm"
            >
              Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-secondary-700 hover:text-primary-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
              <button
                onClick={() => scrollToSection('home')}
                className="block px-3 py-2 text-secondary-700 hover:text-primary-600 transition-colors w-full text-left"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection('services')}
                className="block px-3 py-2 text-secondary-700 hover:text-primary-600 transition-colors w-full text-left"
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="block px-3 py-2 text-secondary-700 hover:text-primary-600 transition-colors w-full text-left"
              >
                About
              </button>
              <button
                onClick={() => scrollToSection('contact')}
                className="block px-3 py-2 text-secondary-700 hover:text-primary-600 transition-colors w-full text-left"
              >
                Contact
              </button>
              <Link
                to="/admin/login"
                className="block px-3 py-2 text-secondary-500 hover:text-primary-600 transition-colors text-sm"
                onClick={() => setIsOpen(false)}
              >
                Admin Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;