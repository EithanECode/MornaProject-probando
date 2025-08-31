"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
// Importaciones de componentes desde la nueva ubicación
import Header from '@/components/alertas/Header';
import StatsDashboard from '@/components/alertas/StatsDashboard';
import ControlPanel from '@/components/alertas/ControlPanel';
import AlertsList from '@/components/alertas/AlertsList';
import AlertDetailsModal from '@/components/alertas/AlertDetailsModal';
import AlertCard from '@/components/alertas/AlertCard';
import EmptyState from '@/components/alertas/EmptyState';
import Modal from '@/components/alertas/Modal';
// Importaciones de datos e interfaces desde la nueva ubicación
import { alertTemplates, sampleUsers } from '@/lib/alertsData';
import { Alert, AlertFormData } from '@/lib/types/Alerts';

const generateId = (): string => 'ALERT-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

const AlertasPage: React.FC = () => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [resolvedToday, setResolvedToday] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [alertTypeFilter, setAlertTypeFilter] = useState<string>('all');
  const [alertPriorityFilter, setAlertPriorityFilter] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
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
    const matchesType = !alertTypeFilter || alertTypeFilter === 'all' || alert.type === alertTypeFilter;
    const matchesPriority = !alertPriorityFilter || alertPriorityFilter === 'all' || alert.priority === alertPriorityFilter;
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
    <div
      className={
        `min-h-screen flex overflow-x-hidden ` +
        (mounted && theme === 'dark'
          ? 'bg-slate-900'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50')
      }
    >
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} userRole="admin" />

      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'}`}>
        {/* Header sticky superior solo con el título */}
        <header className={mounted && theme === 'dark' ? 'bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40' : 'bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40'}>
          <div className="px-4 md:px-5 lg:px-6 py-4">
            <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Alertas</h1>
            <p className={`text-sm md:text-base ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Notificaciones críticas para atención inmediata</p>
          </div>
        </header>

        {/* Dashboard avanzado de alertas */}
        <div className={`p-4 md:p-5 lg:p-6 space-y-6 md:space-y-8 ${mounted && theme === 'dark' ? 'bg-slate-900' : ''}`}>
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




