import React from 'react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex h-screen bg-dark-900 text-gray-200 overflow-hidden font-sans">
      {children}
    </div>
  );
};
