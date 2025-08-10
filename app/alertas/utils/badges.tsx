import React from 'react';

export const getPriorityBadge = (priority: 'urgente' | 'alta' | 'media' | 'baja'): React.ReactNode => {
  let colorClass = '';
  let text = '';
  switch (priority) {
    case 'urgente':
      colorClass = 'bg-red-100 text-red-800';
      text = 'URGENTE';
      break;
    case 'alta':
      colorClass = 'bg-orange-100 text-orange-800';
      text = 'ALTA';
      break;
    case 'media':
      colorClass = 'bg-yellow-100 text-yellow-800';
      text = 'MEDIA';
      break;
    case 'baja':
      colorClass = 'bg-green-100 text-green-800';
      text = 'BAJA';
      break;
    default:
      return null;
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {text}
    </span>
  );
};
