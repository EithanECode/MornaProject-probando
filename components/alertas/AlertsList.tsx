import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AlertCard from './AlertCard';
import { getTypeIcon } from '@/lib/icons';
import { Alert } from '@/lib/types/Alerts';
import { useTheme } from 'next-themes';

interface AlertsListProps {
  alerts: Alert[];
  onResolve: (id: string) => void;
  onView: (alert: Alert) => void;
}

const renderAlertSection = (
  title: string, 
  alerts: Alert[], 
  color: string, 
  onResolve: (id: string) => void, 
  onView: (alert: Alert) => void, 
  theme?: string, 
  mounted?: boolean
) => {
  if (alerts.length === 0) return null;
  
  const colorClasses = {
    red: {
      border: 'border-red-200',
      bg: 'bg-red-50',
      text: 'text-red-900',
      darkBorder: 'dark:border-red-800',
      darkBg: 'dark:bg-red-900/20',
      darkText: 'dark:text-red-100'
    },
    yellow: {
      border: 'border-yellow-200',
      bg: 'bg-yellow-50',
      text: 'text-yellow-900',
      darkBorder: 'dark:border-yellow-800',
      darkBg: 'dark:bg-yellow-900/20',
      darkText: 'dark:text-yellow-100'
    },
    blue: {
      border: 'border-blue-200',
      bg: 'bg-blue-50',
      text: 'text-blue-900',
      darkBorder: 'dark:border-blue-800',
      darkBg: 'dark:bg-blue-900/20',
      darkText: 'dark:text-blue-100'
    }
  };

  const colors = colorClasses[color as keyof typeof colorClasses] || colorClasses.blue;

  return (
    <Card className={`shadow-lg border-0 bg-white/70 backdrop-blur-sm ${mounted && theme === 'dark' ? 'bg-slate-800/70' : ''}`}>
      <CardHeader className={`${colors.border} ${colors.bg} ${mounted && theme === 'dark' ? `${colors.darkBorder} ${colors.darkBg}` : ''}`}>
        <CardTitle className={`text-lg md:text-xl font-semibold flex items-center gap-2 ${colors.text} ${mounted && theme === 'dark' ? colors.darkText : ''}`}>
          {getTypeIcon(alerts[0].type)}
          {title} ({alerts.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-gray-200 dark:divide-slate-700">
          {alerts.map(alert => (
            <AlertCard key={alert.id} alert={alert} onResolve={onResolve} onView={onView} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AlertsList: React.FC<AlertsListProps> = ({ alerts, onResolve, onView }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  
  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const warningAlerts = alerts.filter(a => a.type === 'warning');
  const infoAlerts = alerts.filter(a => a.type === 'info');

  return (
    <div className="space-y-6 md:space-y-8">
      {renderAlertSection('Alertas Críticas', criticalAlerts, 'red', onResolve, onView, theme, mounted)}
      {renderAlertSection('Advertencias', warningAlerts, 'yellow', onResolve, onView, theme, mounted)}
      {renderAlertSection('Informativas', infoAlerts, 'blue', onResolve, onView, theme, mounted)}
    </div>
  );
};

export default AlertsList;