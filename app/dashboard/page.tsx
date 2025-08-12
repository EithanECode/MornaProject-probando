'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import StatsCards from '@/components/dashboard/StatsCards';
import WorkflowSection from '@/components/dashboard/WorkflowSection';
import RecentOrders from '@/components/dashboard/RecentOrders';

import QuickActions from '@/components/dashboard/QuickActions';

import { OrderStats } from '@/lib/types/dashboard';
import { INITIAL_STATS, WORKFLOW_STEPS, RECENT_ORDERS } from '@/lib/constants/dashboard';

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

export default function Dashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [stats, setStats] = useState<OrderStats>(INITIAL_STATS);
  const [notifications, setNotifications] = useState(3);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    setAnimateStats(true);
  }, []);

  // ✅ Crea las funciones que el componente QuickActions necesita
  const handleChinaSubmit = (data: FormDataChina) => {
    console.log('Nuevo pedido de China creado:', data);
    // Aquí puedes agregar la lógica para guardar el pedido de China
  };

  const handleVzlaSubmit = (data: FormDataVzla) => {
    console.log('Nuevo pedido de Venezuela creado:', data);
    // Aquí puedes agregar la lógica para guardar el pedido de Venezuela
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} />
      
      <main className={`flex-1 transition-all duration-200 ease-out ${sidebarExpanded ? 'ml-72' : 'ml-20'}`}>
        <Header notifications={notifications} />
        
        <div className="p-6 space-y-8">
          <StatsCards stats={stats} animateStats={animateStats} />
          <WorkflowSection workflowSteps={WORKFLOW_STEPS} />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <RecentOrders orders={RECENT_ORDERS} />
            {/* ✅ Renderiza el componente QuickActions y pásale las dos funciones como props */}
            <QuickActions 
              onChinaSubmit={handleChinaSubmit} 
              onVzlaSubmit={handleVzlaSubmit} 
            />
          </div>
        </div>
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