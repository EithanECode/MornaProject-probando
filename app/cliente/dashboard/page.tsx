'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
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
  ArrowRight
} from 'lucide-react';

// Datos mock para el cliente
const CLIENT_STATS = {
  totalOrders: 12,
  pendingOrders: 3,
  completedOrders: 8,
  totalSpent: 4850,
  averageRating: 4.8,
  activeShipments: 2
};

const QUICK_ACTIONS = [
  {
    id: 'new_order',
    title: 'Crear Nuevo Pedido',
    description: 'Solicita la importación de un producto',
    icon: ShoppingCart,
    color: 'bg-blue-500',
    href: '/mis-pedidos'
  },
  {
    id: 'track_order',
    title: 'Seguir Pedido',
    description: 'Consulta el estado de tus envíos',
    icon: Truck,
    color: 'bg-green-500',
    href: '/tracking'
  },
  {
    id: 'support',
    title: 'Contactar Soporte',
    description: 'Obtén ayuda cuando la necesites',
    icon: MessageSquare,
    color: 'bg-purple-500',
    href: '/soporte'
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
    statusColor: 'bg-orange-100 text-orange-600',
    progressColor: 'bg-orange-500'
  },
  {
    id: 'ORD-2024-002',
    productName: 'MACBOOK AIR M2',
    status: 'PROCESANDO',
    progress: 45,
    estimatedDelivery: '2024-01-25',
    price: 1199,
    trackingNumber: 'TRK-987654321',
    statusColor: 'bg-blue-100 text-blue-600',
    progressColor: 'bg-blue-500'
  },
  {
    id: 'ORD-2024-003',
    productName: 'AIRPODS PRO',
    status: 'ENTREGADO',
    progress: 100,
    estimatedDelivery: '2024-01-15',
    price: 249,
    trackingNumber: 'TRK-456789123',
    statusColor: 'bg-green-100 text-green-600',
    progressColor: 'bg-green-500'
  }
];


export default function DashboardPage() {
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



  if (!mounted) return null;

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
          title="Dashboard"
          subtitle="Bienvenido de vuelta, aquí tienes un resumen de tu actividad"
        />
        
        <div className="p-6 space-y-6">
          {/* Header de bienvenida */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div>
              <h1 className="text-2xl font-bold">¡Bienvenido de vuelta!</h1>
              <p className="text-blue-100 mt-1">Aquí tienes un resumen de tu actividad reciente</p>
            </div>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Pedidos</p>
                    <p className="text-2xl font-bold">{CLIENT_STATS.totalOrders}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">{CLIENT_STATS.pendingOrders}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">En Tránsito</p>
                    <p className="text-2xl font-bold text-blue-600">{CLIENT_STATS.activeShipments}</p>
                  </div>
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Gastado</p>
                    <p className="text-2xl font-bold text-green-600">${CLIENT_STATS.totalSpent.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>



          {/* Acciones rápidas */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {QUICK_ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start space-y-2 hover:shadow-md transition-all duration-200"
                      onClick={() => window.location.href = action.href}
                    >
                      <div className={`p-2 rounded-lg ${action.color} text-white`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{action.title}</p>
                        <p className="text-sm text-slate-600">{action.description}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 ml-auto" />
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* MIS PEDIDOS */}
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg">MIS PEDIDOS</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {RECENT_ORDERS.map((order) => (
                    <div key={order.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-bold text-sm text-slate-800">{order.id}</p>
                          <p className="font-semibold text-lg">{order.productName}</p>
                        </div>
                        <Badge className={`${order.statusColor} font-medium`}>
                          {order.status}
                        </Badge>
                      </div>
                      
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-slate-600">PROGRESO</span>
                          <span className="text-sm font-bold">{order.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${order.progressColor}`}
                            style={{ width: `${order.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div>
                          <p className="text-slate-600">ENTREGA ESTIMADA:</p>
                          <p className="font-medium">{order.estimatedDelivery}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-600">PRECIO:</p>
                          <p className="font-bold text-green-600">${order.price.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-slate-600">TRACKING: <span className="font-mono font-medium">{order.trackingNumber}</span></p>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                        onClick={() => window.location.href = '/mis-pedidos'}
                      >
                        VER DETALLES
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>


          </div>
        </div>
      </main>
    </div>
  );
}