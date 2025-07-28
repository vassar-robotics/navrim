import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-5 lg:px-6 py-3 lg:py-4 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          <span className="text-primary-500">Navrim</span>
        </h1>
        <div className="flex items-center gap-3">
          <Link 
            to="/login"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            Sign in
          </Link>
          <Link 
            to="/signup"
            className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700 transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header; 