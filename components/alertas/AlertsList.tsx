import React from 'react';
import AlertCard from './AlertCard';
import { getTypeIcon } from '@/lib/icons';
import { Alert } from '@/lib/types/Alerts';

interface AlertsListProps {
  alerts: Alert[];
  onResolve: (id: string) => void;
  onView: (alert: Alert) => void;
}

const renderAlertSection = (title: string, alerts: Alert[], color: string, onResolve: (id: string) => void, onView: (alert: Alert) => void, theme?: string, mounted?: boolean) => {
  if (alerts.length === 0) return null;
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-${color}-200 overflow-hidden mb-6 dark:bg-slate-900 dark:border-slate-800`}>
      <div className={`px-6 py-4 border-b border-${color}-200 bg-${color}-50 dark:border-slate-800 dark:bg-slate-900`}>
        <h3 className={`text-lg font-semibold text-${color}-900 flex items-center dark:text-white`}>
          {getTypeIcon(alerts[0].type)}
          {title} ({alerts.length})
        </h3>
      </div>
      <div className={`divide-y divide-gray-200 dark:divide-slate-800`}>
        {alerts.map(alert => (
          <AlertCard key={alert.id} alert={alert} onResolve={onResolve} onView={onView} />
        ))}
      </div>
    </div>
  );
};

import { useTheme } from 'next-themes';
const AlertsList: React.FC<AlertsListProps> = ({ alerts, onResolve, onView }) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => { setMounted(true); }, []);
  const criticalAlerts = alerts.filter(a => a.type === 'critical');
  const warningAlerts = alerts.filter(a => a.type === 'warning');
  const infoAlerts = alerts.filter(a => a.type === 'info');

  return (
    <>
      {renderAlertSection('Alertas Críticas', criticalAlerts, 'red', onResolve, onView, theme, mounted)}
      {renderAlertSection('Advertencias', warningAlerts, 'yellow', onResolve, onView)}
      {renderAlertSection('Informativas', infoAlerts, 'blue', onResolve, onView)}
    </>
  );
};

export default AlertsList;