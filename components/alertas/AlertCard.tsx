import React from 'react';
import { toast } from '@/hooks/use-toast';
import { Alert } from '@/lib/types/Alerts';
import { getPriorityBadge } from '@/lib/badges';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { getTypeIcon } from '@/lib/icons';

interface AlertCardProps {
  alert: Alert;
  onResolve: (id: string) => void;
  onView: (alert: Alert) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({ alert, onResolve, onView }) => {
  const timeAgo = formatDistanceToNow(alert.timestamp, { addSuffix: true, locale: es });

  const handleResolve = () => {
    onResolve(alert.id);
    toast({
      title: 'Alerta resuelta',
      description: `La alerta "${alert.title}" ha sido marcada como resuelta.`,
      variant: 'default',
    });
  };

  return (
    <div className="px-6 py-4 flex items-start space-x-4">
      <div className={`flex-shrink-0 w-1 rounded-md ${
        alert.type === 'critical' ? 'bg-red-500' :
        alert.type === 'warning' ? 'bg-yellow-500' :
        'bg-blue-500'
      }`} />

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center space-x-2">
            {getTypeIcon(alert.type)}
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {alert.title}
            </h3>
            {getPriorityBadge(alert.priority)}
              {alert.category && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                  {alert.category}
                </span>
              )}
          </div>
        </div>
          <p className="text-gray-500 dark:text-gray-200 text-sm truncate mb-1">{alert.message}</p>
          <div className="text-gray-500 dark:text-gray-300 text-xs flex items-center space-x-4">
          <span>{timeAgo}</span>
          <span>{alert.pedidoId}</span>
          <span>{alert.usuario}</span>
        </div>
      </div>

      <div className="flex flex-col space-y-1 flex-shrink-0 ml-2">
        <button
          className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${alert.type}-500 ${
            alert.type === 'critical' ? 'bg-red-600 hover:bg-red-700' :
            alert.type === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' :
            'bg-blue-600 hover:bg-blue-700'
          }`}
          onClick={handleResolve}
        >
          {alert.action}
        </button>
        <button
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
          onClick={() => onView(alert)}
        >
          Ver
        </button>
        <button
          onClick={() => onResolve(alert.id)}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-105 hover:shadow-lg"
        >
          Descartar
        </button>
      </div>
    </div>
  );
};

export default AlertCard;