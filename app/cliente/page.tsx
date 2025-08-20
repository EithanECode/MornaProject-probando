'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
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
const QuickActions = dynamic(() => import('@/components/dashboard/QuickActions'), {
  loading: () => <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="h-24 bg-slate-200 animate-pulse rounded-lg" />
    ))}
  </div>
});

const RecentOrders = dynamic(() => import('@/components/dashboard/RecentOrders'), {
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
      
      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-20 w-[calc(100%-5rem)]'}`}>
        <Header 
          notifications={CLIENT_STATS.pendingOrders} 
          onMenuToggle={handleMobileMenuToggle}
          title="Dashboard Cliente"
          subtitle="Bienvenido de vuelta, aquí tienes un resumen de tu actividad"
        />
        
        <div className="p-6 space-y-8">
          {/* Header del Dashboard con Bienvenida */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">¡Bienvenido de vuelta!</h2>
                  <p className="text-blue-100 text-lg">Panel de Control - Cliente</p>
                  <p className="text-blue-200 mt-2">Gestiona tus pedidos, tracking y pagos desde un solo lugar</p>
                </div>
                <div className="hidden lg:flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{CLIENT_STATS.activeShipments}</div>
                    <p className="text-blue-100">Envíos Activos</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Principal */}
          <div className="space-y-8">
            {/* Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Total Pedidos</CardTitle>
                  <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{CLIENT_STATS.totalOrders}</div>
                  <p className="text-xs text-blue-700">Pedidos realizados</p>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(CLIENT_STATS.totalOrders / 20) * 100}%`}}></div>
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
                  <div className="text-3xl font-bold text-green-900">{CLIENT_STATS.activeShipments}</div>
                  <p className="text-xs text-green-700">Envíos activos</p>
                  <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: `${(CLIENT_STATS.activeShipments / 5) * 100}%`}}></div>
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
                  <div className="text-3xl font-bold text-purple-900">${CLIENT_STATS.totalSpent.toLocaleString()}</div>
                  <p className="text-xs text-purple-700">Inversión total</p>
                  <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(CLIENT_STATS.totalSpent / 10000) * 100}%`}}></div>
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
                  <div className="text-3xl font-bold text-orange-900">{CLIENT_STATS.completedOrders}</div>
                  <p className="text-xs text-orange-700">Pedidos entregados</p>
                  <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: `${(CLIENT_STATS.completedOrders / 20) * 100}%`}}></div>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link key={action.id} href={action.href}>
                        <Button variant="outline" className={`h-24 flex flex-col gap-3 ${action.hoverBg} ${action.hoverBorder} transition-all duration-300 group w-full`}>
                          <div className={`p-3 ${action.bgColor} rounded-lg group-hover:scale-110 transition-all duration-300`}>
                            <Icon className={`h-8 w-8 ${action.textColor}`} />
                          </div>
                          <span className="text-sm font-medium">{action.title}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Métricas de Rendimiento y Próximas Acciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Resumen de Actividad</CardTitle>
                  <p className="text-sm text-slate-600">Tu actividad reciente en la plataforma</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Progreso de pedidos</span>
                        <span className="font-bold text-lg">{Math.round((CLIENT_STATS.completedOrders / CLIENT_STATS.totalOrders) * 100)}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500" style={{ width: `${(CLIENT_STATS.completedOrders / CLIENT_STATS.totalOrders) * 100}%` }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">{CLIENT_STATS.pendingOrders}</div>
                        <p className="text-sm text-blue-700">Pendientes</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <div className="text-2xl font-bold text-green-600">{CLIENT_STATS.activeShipments}</div>
                        <p className="text-sm text-green-700">En tránsito</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Estado de Tus Pedidos</CardTitle>
                  <p className="text-sm text-slate-600">Resumen de tus envíos actuales</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200">
                      <div className="p-2 bg-orange-500 rounded-lg">
                        <Package className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-orange-800">{CLIENT_STATS.pendingOrders} pedidos en proceso</p>
                        <p className="text-xs text-orange-600">Seguimiento activo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <Truck className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-blue-800">{CLIENT_STATS.activeShipments} envíos en tránsito</p>
                        <p className="text-xs text-blue-600">Llegada próxima</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-green-800">{CLIENT_STATS.completedOrders} pedidos completados</p>
                        <p className="text-xs text-green-600">Entregas exitosas</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <DollarSign className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-purple-800">${CLIENT_STATS.totalSpent.toLocaleString()} gastados</p>
                        <p className="text-xs text-purple-600">Inversión total</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* MIS PEDIDOS */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Mis Pedidos Recientes</CardTitle>
                <p className="text-sm text-slate-600">Seguimiento de tus envíos más recientes</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {RECENT_ORDERS.map((order) => {
                    const Icon = order.icon;
                    return (
                      <div key={order.id} className="border border-slate-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 bg-gradient-to-r from-slate-50 to-white">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-100 rounded-lg">
                              <Icon className="h-6 w-6 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-bold text-sm text-slate-600">{order.id}</p>
                              <p className="font-semibold text-xl text-slate-800">{order.productName}</p>
                            </div>
                          </div>
                          <Badge className={`${order.statusColor} font-medium border`}>
                            {order.status}
                          </Badge>
                        </div>
                        
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-slate-600">PROGRESO</span>
                            <span className="text-sm font-bold">{order.progress}%</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-3">
                            <div 
                              className={`h-3 rounded-full transition-all duration-500 ${order.progressColor}`}
                              style={{ width: `${order.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                          <div className="p-3 bg-slate-50 rounded-lg">
                            <p className="text-slate-600 font-medium">ENTREGA ESTIMADA:</p>
                            <p className="font-bold text-slate-800">{order.estimatedDelivery}</p>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-lg text-right">
                            <p className="text-slate-600 font-medium">PRECIO:</p>
                            <p className="font-bold text-green-600">${order.price.toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="mb-4 p-3 bg-slate-50 rounded-lg">
                          <p className="text-sm text-slate-600 font-medium">TRACKING: <span className="font-mono font-bold text-slate-800">{order.trackingNumber}</span></p>
                        </div>
                        
                        <Button 
                          variant="outline" 
                          className="w-full hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group"
                          onClick={() => window.location.href = '/cliente/mis-pedidos'}
                        >
                          <span className="group-hover:scale-105 transition-transform">VER DETALLES</span>
                          <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}