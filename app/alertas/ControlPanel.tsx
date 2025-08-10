import React from 'react';

interface ControlPanelProps {
  onGenerateNewAlert: () => void;
  onResolveAll: () => void;
  onRefresh: () => void;
  onSearchChange: (query: string) => void;
  onTypeFilterChange: (type: string) => void;
  onPriorityFilterChange: (priority: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onGenerateNewAlert, 
  onResolveAll, 
  onRefresh, 
  onSearchChange,
  onTypeFilterChange,
  onPriorityFilterChange
}) => {
  return (
    <div className="mb-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
      <div className="flex space-x-2 w-full md:w-auto">
        <input
          type="text"
          placeholder="Buscar alertas..."
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full md:w-64 px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500"
        />
        <select onChange={(e) => onTypeFilterChange(e.target.value)} className="px-4 py-2 border rounded-md">
          <option value="">Tipo (Todos)</option>
          <option value="critical">Críticas</option>
          <option value="warning">Advertencias</option>
          <option value="info">Informativas</option>
        </select>
        <select onChange={(e) => onPriorityFilterChange(e.target.value)} className="px-4 py-2 border rounded-md">
          <option value="">Prioridad (Todas)</option>
          <option value="urgente">Urgente</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={onGenerateNewAlert}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          Crear Alerta
        </button>
        <button
          onClick={onResolveAll}
          className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
        >
          Resolver Todo
        </button>
        <button
          onClick={onRefresh}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Actualizar
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;