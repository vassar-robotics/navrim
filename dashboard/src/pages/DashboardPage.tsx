import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <div className="mx-auto space-y-4">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-600">Welcome to your Navrim dashboard</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 lg:p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-3">Overview</h3>
        <p className="text-gray-600">Dashboard page content coming soon...</p>
      </div>
    </div>
  );
};

export default DashboardPage;