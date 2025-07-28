import React from 'react';
import HuggingfaceToken from '@/components/common/HuggingfaceToken';
import OpenaiToken from '@/components/common/OpenaiToken';
import WandbToken from '@/components/common/WandbToken';

const ConfigurationPage: React.FC = () => {
  return (
    <div className="mx-auto space-y-4">
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Configuration</h2>
        <p className="mt-1 text-sm text-gray-600">System settings and preferences</p>
      </div>

      {/* Hugging Face Token Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 lg:p-5 space-y-4">
        <HuggingfaceToken />
        <OpenaiToken />
        <WandbToken />
      </div>

      {/* Other Configuration Sections */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 lg:p-5">
        <h3 className="text-base font-semibold text-gray-800 mb-3">General Settings</h3>
        <p className="text-gray-600">Other configuration options coming soon...</p>
      </div>
    </div>
  );
};

export default ConfigurationPage; 