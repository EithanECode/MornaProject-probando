import React from 'react';
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';

interface StatusBadgeProps {
  estado: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ estado }) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      'completado': {
        className: 'bg-green-100 text-green-800 border-green-200',
        text: 'Completado',
        icon: <CheckCircle size={14} />
      },
      'pendiente': {
        className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        text: 'Pendiente',
        icon: <Clock size={14} />
      },
      'en proceso': {
        className: 'bg-blue-100 text-blue-800 border-blue-200',
        text: 'En Proceso',
        icon: <AlertCircle size={14} />
      },
      'cancelado': {
        className: 'bg-red-100 text-red-800 border-red-200',
        text: 'Cancelado',
        icon: <XCircle size={14} />
      }
    };
    
    return configs[status.toLowerCase() as keyof typeof configs] || {
      className: 'bg-gray-100 text-gray-800 border-gray-200',
      text: status,
      icon: <AlertCircle size={14} />
    };
  };

  const config = getStatusConfig(estado);

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border gap-1 ${config.className}`}>
      {config.icon}
      <span>{config.text}</span>
    </span>
  );
};

export default StatusBadge;