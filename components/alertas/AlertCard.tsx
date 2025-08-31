import React from 'react';
import { toast } from '@/hooks/use-toast';
import { Alert } from '@/lib/types/Alerts';
import { getPriorityBadge } from '@/lib/badges';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { getTypeIcon } from '@/lib/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, X, CheckCircle } from 'lucide-react';

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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      case 'warning': return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
    }
  };

  return (
    <div className={`p-4 md:p-6 border-l-4 ${getTypeColor(alert.type)} hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors duration-200`}>
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        {/* Contenido principal */}
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              {getTypeIcon(alert.type)}
              <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
                {alert.title}
              </h3>
              {getPriorityBadge(alert.priority)}
              {alert.category && (
                <Badge variant="outline" className="text-xs">
                  {alert.category}
                </Badge>
              )}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {alert.message}
          </p>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              {timeAgo}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              {alert.pedidoId}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
              {alert.usuario}
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex flex-col sm:flex-row gap-2 lg:flex-shrink-0">
          <Button
            onClick={() => onView(alert)}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            <Eye className="w-4 h-4 mr-2" />
            Ver
          </Button>
          <Button
            onClick={handleResolve}
            size="sm"
            className={`w-full sm:w-auto ${
              alert.type === 'critical' ? 'bg-red-600 hover:bg-red-700' :
              alert.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
              'bg-blue-600 hover:bg-blue-700'
            } text-white`}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {alert.action}
          </Button>
          <Button
            onClick={() => onResolve(alert.id)}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto border-gray-300 hover:bg-gray-50"
          >
            <X className="w-4 h-4 mr-2" />
            Descartar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AlertCard;