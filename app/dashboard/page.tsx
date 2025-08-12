'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StatsCards from '@/components/dashboard/StatsCards';
import WorkflowSection from '@/components/dashboard/WorkflowSection';
import RecentOrders from '@/components/dashboard/RecentOrders';
import QuickActions from '@/components/dashboard/QuickActions';

import { OrderStats } from '@/lib/types/dashboard';
import { INITIAL_STATS, WORKFLOW_STEPS } from '@/lib/constants/dashboard';

// Importar hooks optimizados
import { useStatsQuery, useRecentOrdersQuery } from '@/hooks/use-supabase-query';

// Lazy load components that are not immediately visible
const LazyWorkflowSection = dynamic(() => import('@/components/dashboard/WorkflowSection'), {
  loading: () => <div className="h-64 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg animate-pulse" />
});

const LazyRecentOrders = dynamic(() => import('@/components/dashboard/RecentOrders'), {
  loading: () => <div className="h-80 bg-white rounded-lg shadow-lg animate-pulse" />
});

// ✅ Interfaz para los datos del modal de China
interface FormDataChina {
  cliente: string
  telefono: string
  producto: string
  cantidad: number | null
  precioUnitario: number | null
  direccionEntrega: string
}

// ✅ Interfaz para los datos del modal de Venezuela
interface FormDataVzla {
  empresa: string
  rif: string
  contacto: string
  telefono: string
  categoria: string
  cantidadLotes: number | null
  precioPorLote: number | null
  almacenDestino: string
  observaciones: string
}

export default function DashboardPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(false); // Inicializar contraído por defecto
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [notifications, setNotifications] = useState(3);
  const [animateStats, setAnimateStats] = useState(false);

  // Detectar si estamos en el cliente
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const updateScreenWidth = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      
      // Aplicar lógica de sidebar inmediatamente
      if (width >= 1024) {
        setSidebarExpanded(false); // Desktop: contraído
        setIsMobileMenuOpen(false);
      } else {
        setSidebarExpanded(true); // Mobile: expandido para mejor usabilidad
      }
    };

    // Actualizar inmediatamente y con un pequeño delay para herramientas de desarrollo
    updateScreenWidth();
    
    // Delay adicional para asegurar que funcione en herramientas de desarrollo
    const timeoutId = setTimeout(updateScreenWidth, 100);
    
    window.addEventListener('resize', updateScreenWidth);
    return () => {
      window.removeEventListener('resize', updateScreenWidth);
      clearTimeout(timeoutId);
    };
  }, [isClient]);

  const isMobile = isClient && screenWidth < 1024;

  // Usar hooks optimizados
  const { 
    data: stats, 
    loading: statsLoading, 
    error: statsError,
    isStale: statsStale 
  } = useStatsQuery();
  
  const { 
    data: recentOrders, 
    loading: ordersLoading, 
    error: ordersError,
    isStale: ordersStale 
  } = useRecentOrdersQuery(5);

  // Memoizar el estado de animación
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateStats(true);
    }, 100); // Pequeño delay para mejorar la experiencia visual

    return () => clearTimeout(timer);
  }, []);

  // ✅ Crea las funciones que el componente QuickActions necesita
  const handleChinaSubmit = useCallback((data: FormDataChina) => {
    console.log('Nuevo pedido de China creado:', data);
    // Aquí puedes agregar la lógica para guardar el pedido de China
  }, []);

  const handleVzlaSubmit = useCallback((data: FormDataVzla) => {
    console.log('Nuevo pedido de Venezuela creado:', data);
    // Aquí puedes agregar la lógica para guardar el pedido de Venezuela
  }, []);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  // Memoizar el contenido principal para evitar re-renders innecesarios
  const mainContent = useMemo(() => (
    <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
      <StatsCards stats={stats} animateStats={animateStats} />
      
      {/* Lazy load components */}
      <LazyWorkflowSection workflowSteps={WORKFLOW_STEPS} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <LazyRecentOrders orders={recentOrders} />
        <QuickActions 
          onChinaSubmit={handleChinaSubmit} 
          onVzlaSubmit={handleVzlaSubmit} 
        />
      </div>
    </div>
  ), [stats, animateStats, recentOrders, handleChinaSubmit, handleVzlaSubmit]);

  // Memoizar el error state
  const errorContent = useMemo(() => (
    <div className="p-4 sm:p-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">
          {statsError || ordersError}
        </p>
      </div>
    </div>
  ), [statsError, ordersError]);

  // Memoizar el stale indicator
  const staleIndicator = useMemo(() => {
    if (statsStale || ordersStale) {
      return (
        <div className="fixed top-4 right-4 z-50">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm">Actualizando datos...</p>
          </div>
        </div>
      );
    }
    return null;
  }, [statsStale, ordersStale]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex overflow-x-hidden">
      <Sidebar 
        isExpanded={sidebarExpanded} 
        setIsExpanded={setSidebarExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={handleMobileMenuClose}
      />
      
      <main 
        className="flex-1 transition-all duration-200 ease-out"
        style={{
          marginLeft: isMobile ? '0' : (sidebarExpanded ? '18rem' : '5rem'),
          width: isMobile ? '100%' : (sidebarExpanded ? 'calc(100% - 18rem)' : 'calc(100% - 5rem)')
        }}
      >
        <Header 
          notifications={notifications} 
          onMenuToggle={handleMobileMenuToggle}
        />
        
        {/* Stale indicator */}
        {staleIndicator}
        
        {/* Mostrar errores si existen */}
        {(statsError || ordersError) && errorContent}

        {/* Contenido principal - StatsCards y RecentOrders manejan el estado null internamente */}
        {mainContent}
      </main>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}