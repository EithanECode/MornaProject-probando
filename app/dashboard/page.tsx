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

import {getSupabaseBrowserClient} from "@/lib/supabase/client";

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

//Backend de RecentOrders
const STATE_LABELS = [
  "", // 0 no se usa
  "Pedido solicitado",
  "Cotización China",
  "Cotización Venezuela",
  "Cliente paga",
  "Re-empacado",
  "En tránsito aéreo",
  "En álmacen Venezuela",
  "Entregado"
];

export default function Dashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [stats, setStats] = useState<OrderStats>({
    total: 0,
    pending: 0,
    completed: 0,
    inTransit: 0,
  });
  const [notifications, setNotifications] = useState(3);
  const [animateStats, setAnimateStats] = useState(false);

  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    setAnimateStats(true);

  const fetchStats = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("orders")
      .select("state", { count: "exact", head: false });

      if (error) {
      console.error("Error fetching stats:", error);
      return;
    }

    // Contar los estados
    const total = data.length;
    const pending = data.filter((order) => order.state >= 1 && order.state <= 5).length;
    const inTransit = data.filter((order) => order.state === 6 || order.state === 7).length;
    const completed = data.filter((order) => order.state === 8).length;

    setStats({
      total,
      pending,
      completed,
      inTransit,
    });
  };

  const fetchRecentOrders = async () => {
    const supabase = getSupabaseBrowserClient();
    // Consulta los últimos 5 pedidos
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, state, client_id, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching orders:", error);
      setRecentOrders([]);
      return;
    }

    // Obtén los nombres de los clientes
    const clientIds = orders.map(order => order.client_id);
    const { data: clients, error: clientError } = await supabase
      .from("clients")
      .select("user_id, name")
      .in("user_id", clientIds);

    if (clientError) {
      console.error("Error fetching clients:", clientError);
      setRecentOrders([]);
      return;
    }

    // Mapea el id del cliente al nombre
    const clientMap = Object.fromEntries(clients.map(c => [c.user_id, c.name]));

    // Transforma los datos para RecentOrders
    const recentOrdersData = orders.map(order => ({
      id: order.id,
      client: clientMap[order.client_id] || "Desconocido",
      status: STATE_LABELS[order.state] || "Desconocido",
      progress: Math.round((order.state / 8) * 100),
      eta: "", // Puedes calcular o mostrar vacío si no tienes ETA
    }));

    setRecentOrders(recentOrdersData);
  };

  fetchStats();
  fetchRecentOrders();
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
            <RecentOrders orders={recentOrders} />
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