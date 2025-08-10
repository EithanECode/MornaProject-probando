import React from 'react';

interface HeaderProps {
  totalAlerts: number;
}

const Header: React.FC<HeaderProps> = ({ totalAlerts }) => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0h6m-9-4h9" />
          </svg>
          <h1 className="text-2xl font-bold text-gray-900">Panel de Tracking</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-lg font-medium text-gray-700">Alertas Activas:</span>
          <span className="bg-red-500 text-white font-bold text-lg px-3 py-1 rounded-full">{totalAlerts}</span>
        </div>
      </div>
    </header>
  );
};

export default Header;