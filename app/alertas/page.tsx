
"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
// Importaciones directas de los componentes
import Header from './Header';
import StatsDashboard from './StatsDashboard';
import ControlPanel from './ControlPanel';
import AlertsList from './AlertsList';
import AlertDetailsModal from './AlertDetailsModal';
import AlertCard from './AlertCard';
import EmptyState from './EmptyState';
import Modal from './Modal';
// Las rutas a carpetas anidadas se mantienen
import { alertTemplates, sampleUsers } from './data/alertsData';
import { Alert, AlertFormData } from './interfaces/Alerts';

const generateId = (): string => 'ALERT-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

const AlertasPage: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [resolvedToday, setResolvedToday] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>('');
  const [alertPriorityFilter, setAlertPriorityFilter] = useState<string>('');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  useEffect(() => {
    generateSampleAlerts();
  }, []);

  const generateSampleAlerts = () => {
    const newAlerts: Alert[] = [];
    for (let i = 0; i < 12; i++) {
      const template = alertTemplates[Math.floor(Math.random() * alertTemplates.length)];
      const user = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
      const pedidoId = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
      const dias = Math.floor(Math.random() * 10) + 1;

      // Aseguramos todas las propiedades requeridas por Alert
      const newAlert: Alert = {
        id: generateId(),
        type: template.type,
        priority: template.priority,
        title: template.title,
        category: template.category,
        action: template.action,
        message: template.message
          .replace('{id}', pedidoId)
          .replace('{usuario}', user)
          .replace('{dias}', String(dias))
          .replace('{estado}', 'en tránsito'),
        pedidoId: 'PED-' + pedidoId,
        usuario: user,
        timestamp: new Date(Date.now() - Math.random() * 86400000 * 3),
      };
      newAlerts.push(newAlert);
    }
    setAlerts(newAlerts);
    setResolvedToday(0);
  };

  const resolveAlert = (id: string) => {
    setAlerts(prevAlerts =>
      prevAlerts.filter(alert => {
        if (alert.id === id) {
          setResolvedToday(count => count + 1);
          return false;
        }
        return true;
      })
    );
  };

  const resolveAllAlerts = () => {
    setResolvedToday(alerts.length + resolvedToday);
    setAlerts([]);
  };

  const createAlert = (newAlertData: AlertFormData) => {
    const newAlert: Alert = {
      id: generateId(),
      ...newAlertData,
      timestamp: new Date(),
    };
    setAlerts(prevAlerts => [newAlert, ...prevAlerts]);
    setIsModalOpen(false);
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = alert.title.toLowerCase().includes(searchQuery.toLowerCase()) || alert.message.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = !alertTypeFilter || alert.type === alertTypeFilter;
    const matchesPriority = !alertPriorityFilter || alert.priority === alertPriorityFilter;
    return matchesSearch && matchesType && matchesPriority;
  });

  const stats = {
    total: alerts.length,
    critical: alerts.filter(a => a.type === 'critical').length,
    warning: alerts.filter(a => a.type === 'warning').length,
    info: alerts.filter(a => a.type === 'info').length,
    resolved: resolvedToday,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} />

      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-72' : 'ml-20'}`}>
        {/* Header sticky superior solo con el título */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-slate-900">Alertas</h1>
            <p className="text-sm text-slate-600">Notificaciones críticas para atención inmediata</p>
          </div>
        </header>

        {/* Dashboard avanzado de alertas */}
        <div className="p-6 space-y-6">
          <StatsDashboard stats={stats} />
          <ControlPanel
            onGenerateNewAlert={() => setIsModalOpen(true)}
            onResolveAll={resolveAllAlerts}
            onRefresh={generateSampleAlerts}
            onSearchChange={(v) => setSearchQuery(String(v))}
            onTypeFilterChange={(v) => setAlertTypeFilter(String(v))}
            onPriorityFilterChange={(v) => setAlertPriorityFilter(String(v))}
          />
          {alerts.length > 0 ? (
            <AlertsList
              alerts={filteredAlerts}
              onResolve={resolveAlert}
              onView={setSelectedAlert}
            />
          ) : (
            <EmptyState onGenerateSample={generateSampleAlerts} />
          )}
        </div>

        {/* Modal para crear alerta */}
        {isModalOpen && (
          <Modal onClose={() => setIsModalOpen(false)} onCreateAlert={createAlert} />
        )}
        {/* Modal para ver detalles de alerta */}
        {selectedAlert && (
          <AlertDetailsModal alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
        )}
      </main>
    </div>
  );
};

export default AlertasPage;



