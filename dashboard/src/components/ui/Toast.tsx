import { Toaster } from 'react-hot-toast';
import React from 'react';

const ToastProvider: React.FC = () => {
  return (
    <Toaster 
    position="top-center"
    toastOptions={{
      duration: 3000,
      success: {
        className: 'bg-teal-50 border border-teal-500 text-teal-700 p-4',
        iconTheme: {
          primary: '#069494',
          secondary: '#F0FDFA',
        },
      },
      error: {
        className: 'bg-primary-50 border border-primary-700 text-primary-800 p-4',
        iconTheme: {
          primary: '#EE1C00',
          secondary: '#FFF5F3',
        },
      },
    }}
  />
  );
};

export default ToastProvider;