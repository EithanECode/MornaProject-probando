import React from 'react';

interface EmptyStateProps {
  onGenerateSample: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onGenerateSample }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl shadow-sm border border-gray-200">
      <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
      </svg>
      <h3 className="mt-2 text-lg font-medium text-gray-900">No hay alertas</h3>
      <p className="mt-1 text-sm text-gray-500">
        Parece que todo está en orden.
      </p>
      <div className="mt-6">
        <button
          onClick={onGenerateSample}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Generar alertas de ejemplo
        </button>
      </div>
    </div>
  );
};

export default EmptyState;