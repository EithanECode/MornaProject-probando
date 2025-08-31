
"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useClientContext } from '@/lib/ClientContext';
import { useClientOrders } from '@/hooks/use-client-orders';
import { useTheme } from 'next-themes';
import dynamicImport from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Star,
  ShoppingCart,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Calendar,
  MapPin,
  User,
  Shield,
  Zap
} from 'lucide-react';
import Link from 'next/link';

// Lazy load components
const QuickActions = dynamicImport(() => import('@/components/dashboard/QuickActions'), {
  loading: () => <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-lg" />
    ))}
  </div>
});

const RecentOrders = dynamicImport(() => import('@/components/dashboard/RecentOrders'), {
  loading: () => <div className="space-y-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-16 bg-slate-200 animate-pulse rounded-lg" />
    ))}
  </div>
});

// Datos mock para el cliente
const CLIENT_STATS = {
  totalOrders: 12,
  pendingOrders: 3,
  completedOrders: 8,
  totalSpent: 4850,
  activeShipments: 2
};

const QUICK_ACTIONS = [
  {
    id: 'new_order',
    title: 'Crear Nuevo Pedido',
    description: 'Solicita la importación de un producto',
    icon: ShoppingCart,
    color: 'bg-blue-500',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-600',
    hoverBg: 'hover:bg-blue-50',
    hoverBorder: 'hover:border-blue-300',
    href: '/cliente/mis-pedidos'
  },
  {
    id: 'track_order',
    title: 'Seguir Pedido',
    description: 'Consulta el estado de tus envíos',
    icon: Truck,
    color: 'bg-green-500',
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    hoverBg: 'hover:bg-green-50',
    hoverBorder: 'hover:border-green-300',
    href: '/cliente/tracking'
  },
  {
    id: 'support',
    title: 'Contactar Soporte',
    description: 'Obtén ayuda cuando la necesites',
    icon: MessageSquare,
    color: 'bg-purple-500',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-600',
    hoverBg: 'hover:bg-purple-50',
    hoverBorder: 'hover:border-purple-300',
    href: '/cliente/soporte'
  },
  {
    id: 'payments',
    title: 'Mis Pagos',
    description: 'Gestiona tus transacciones',
    icon: DollarSign,
    color: 'bg-orange-500',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600',
    hoverBg: 'hover:bg-orange-50',
    hoverBorder: 'hover:border-orange-300',
    href: '/cliente/pagos'
  }
];

const RECENT_ORDERS = [
  {
    id: 'ORD-2024-001',
    productName: 'IPHONE 15 PRO MAX',
    status: 'EN TRANSITO',
    progress: 75,
    estimatedDelivery: '2024-01-20',
    price: 1319,
    trackingNumber: 'TRK-123456789',
    statusColor: 'bg-orange-100 text-orange-800 border-orange-200',
    progressColor: 'bg-orange-500',
    icon: Truck
  },
  {
    id: 'ORD-2024-002',
    productName: 'MACBOOK AIR M2',
    status: 'PROCESANDO',
    progress: 45,
    estimatedDelivery: '2024-01-25',
    price: 1199,
    trackingNumber: 'TRK-987654321',
    statusColor: 'bg-blue-100 text-blue-800 border-blue-200',
    progressColor: 'bg-blue-500',
    icon: Package
  },
  {
    id: 'ORD-2024-003',
    productName: 'AIRPODS PRO',
    status: 'ENTREGADO',
    progress: 100,
    estimatedDelivery: '2024-01-15',
    price: 249,
    trackingNumber: 'TRK-456789123',
    statusColor: 'bg-green-100 text-green-800 border-green-200',
    progressColor: 'bg-green-500',
    icon: CheckCircle
  }
];

export default function DashboardPage() {
  // Hooks al inicio y en orden estable
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Obtener el id del cliente autenticado
  const { clientId } = useClientContext();
  // Obtener los pedidos del cliente autenticado
  const { data: clientOrders, loading: ordersLoading, error: ordersError } = useClientOrders();

  // Variables de pedidos
  const totalPedidos = clientOrders?.length ?? 0;
  const pedidosPendientes = clientOrders?.filter(order => order.state === 1).length ?? 0;
  const pedidosEnTransito = clientOrders?.filter(order => order.state === 2).length ?? 0;
  const pedidosCompletados = clientOrders?.filter(order => order.state === 3).length ?? 0;
  const totalGastado = clientOrders?.reduce((acc, order) => acc + (order.estimatedBudget || 0), 0) ?? 0;

  // Datos de los 3 pedidos más recientes
  const pedidosRecientes = clientOrders?.slice(-3).reverse() ?? [];
  const orderId = pedidosRecientes.map(order => order.id);
  const orderName = pedidosRecientes.map(order => order.productName);
  const orderStatus = pedidosRecientes.map(order => order.state);
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  // Pantalla de carga hasta que se monte (evita desajustes con theme/SSR)
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex overflow-x-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      <Sidebar 
        isExpanded={sidebarExpanded} 
        setIsExpanded={setSidebarExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={handleMobileMenuClose}
        userRole="client"
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={CLIENT_STATS.pendingOrders} 
          onMenuToggle={handleMobileMenuToggle}
          title="Dashboard Cliente"
          subtitle="Bienvenido de vuelta, aquí tienes un resumen de tu actividad"
        />
        
        <div className="p-4 md:p-5 lg:p-6 space-y-6 md:space-y-6 lg:space-y-8">
          {/* Header del Dashboard con Bienvenida */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-4 md:p-6 lg:p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">¡Bienvenido de vuelta!</h2>
                  <p className="text-blue-100 text-sm md:text-base lg:text-lg">Panel de Control - Cliente</p>
                  <p className="text-blue-200 mt-2 text-xs md:text-sm">Gestiona tus pedidos, tracking y pagos desde un solo lugar</p>
                </div>
                <div className="grid grid-cols-1 md:flex md:items-center md:space-x-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold">{pedidosEnTransito + pedidosPendientes}</div>
                    <p className="text-blue-100 text-xs md:text-sm">Envíos Activos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Principal */}
          <div className="space-y-6 md:space-y-6 lg:space-y-8">
            {/* Estadísticas Principales */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Total Pedidos</CardTitle>
                  <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-900">{totalPedidos}</div>
                  <p className="text-xs text-blue-700">Pedidos realizados</p>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: `100%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">En Tránsito</CardTitle>
                  <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Truck className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-green-900">{pedidosEnTransito}</div>
                  <p className="text-xs text-green-700">Envíos activos</p>
                  <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: `${(pedidosEnTransito / totalPedidos) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">Total Gastado</CardTitle>
                  <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-900">${totalGastado}</div>
                  <p className="text-xs text-purple-700">Inversión total</p>
                  <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: `100%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">Completados</CardTitle>
                  <div className="p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-orange-900">{pedidosCompletados}</div>
                  <p className="text-xs text-orange-700">Pedidos entregados</p>
                  <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: `${(pedidosCompletados / totalPedidos) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Acciones Rápidas */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Acciones Rápidas</CardTitle>
                <p className="text-sm text-slate-600">Accede rápidamente a las funciones más utilizadas</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link key={action.id} href={action.href}>
                        <Button variant="outline" className={`h-20 md:h-24 flex flex-col gap-2 md:gap-3 ${action.hoverBg} ${action.hoverBorder} transition-all duration-300 group w-full`}>
                                                      <div className={`p-2 md:p-3 ${action.bgColor} rounded-lg group-hover:scale-110 transition-all duration-300`}>
                              <Icon className={`h-6 w-6 md:h-8 md:w-8 ${action.textColor}`} />
                            </div>
                            <span className="text-xs md:text-sm font-medium">{action.title}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* MIS PEDIDOS */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Mis Pedidos Recientes</CardTitle>
                <p className="text-sm text-slate-600">Seguimiento de tus envíos más recientes</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {pedidosRecientes.length === 0 ? (
                    <div className="text-center text-slate-500">No hay pedidos recientes.</div>
                  ) : (
                    pedidosRecientes.map((order, idx) => (
                      <div key={order.id} className="border border-slate-200 rounded-xl p-4 md:p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-slate-50 to-white">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                          <div className="flex items-center gap-3 md:gap-4">
                            <div className="p-2 md:p-3 bg-slate-100 rounded-lg">
                              <Truck className="h-5 w-5 md:h-6 md:w-6 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-bold text-xs md:text-sm text-slate-600">{order.id}</p>
                              <p className="font-semibold text-lg md:text-xl text-slate-800">{order.productName}</p>
                            </div>
                          </div>
                          <Badge className={`font-medium border text-xs md:text-sm`}>
                            Estado: {order.state}
                          </Badge>
                        </div>
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs md:text-sm font-medium text-slate-600">PRESUPUESTO</span>
                            <span className="text-xs md:text-sm font-bold">${order.estimatedBudget?.toLocaleString() ?? 'N/A'}</span>
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group text-xs md:text-sm"
                          onClick={() => window.location.href = '/cliente/mis-pedidos'}
                        >
                          <span className="group-hover:scale-105 transition-transform">VER DETALLES</span>
                          <ArrowRight className="ml-2 h-3 w-3 md:h-4 md:w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}