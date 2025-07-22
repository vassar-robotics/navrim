import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-800 text-white px-8 py-6 mt-auto">
      <div className="text-center">
        <p>&copy; 2024 Navrim. All rights reserved.</p>
        <p className="text-sm text-slate-400 mt-2">
          Version 1.0.0 | Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </footer>
  );
};

export default Footer; 