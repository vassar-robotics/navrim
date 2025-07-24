import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200 px-4 sm:px-5 lg:px-6 py-3 lg:py-4 mt-auto">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
        <p className="text-center sm:text-left">&copy; 2024 Navrim. All rights reserved.</p>
        <div className="flex items-center gap-3 sm:gap-4">
          <a href="#" className="hover:text-primary-600 transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-primary-600 transition-colors">Terms of Service</a>
          <span className="text-gray-400">Version 1.0.0</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 