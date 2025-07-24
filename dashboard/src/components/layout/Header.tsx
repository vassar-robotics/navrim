import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-5 lg:px-6 py-3 lg:py-4 shadow-sm sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
          <span className="text-primary-500">Navrim</span>
        </h1>
      </div>
    </header>
  );
};

export default Header; 