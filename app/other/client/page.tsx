'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Package, 
  ShoppingCart, 
  Truck, 
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  MessageSquare,
  User,
  Flag,
  Star,
  Heart
} from 'lucide-react';

export default function ClientDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Estadísticas específicas para Cliente
  const stats = {
    activeOrders: 3,
    completedOrders: 12,
    totalSpent: '$2,450',
    loyaltyPoints: 1250,
    averageRating: '4.8/5',
    nextDelivery: '2 días'
  };

  const myOrders = [
    { 
      id: 'ORD-2024-001', 
      product: 'iPhone 15 Pro Max',
      status: 'in_transit',
      progress: 75,
      estimatedDelivery: '2024-01-20',
      amount: '$1,319',
      tracking: 'TRK-123456789'
    },
    { 
      id: 'ORD-2024-002', 
      product: 'MacBook Air M2',
      status: 'processing',
      progress: 45,
      estimatedDelivery: '2024-01-25',
      amount: '$1,199',
      tracking: 'TRK-987654321'
    },
    { 
      id: 'ORD-2024-003', 
      product: 'AirPods Pro',
      status: 'delivered',
      progress: 100,
      estimatedDelivery: '2024-01-15',
      amount: '$249',
      tracking: 'TRK-456789123'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'processing': return 'Procesando';
      case 'in_transit': return 'En Tránsito';
      case 'delivered': return 'Entregado';
      default: return 'Pendiente';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-600';
    if (progress >= 50) return 'bg-orange-600';
    return 'bg-blue-600';
  };

  return (
    <div className={`min-h-screen flex overflow-x-hidden ${
      mounted && theme === 'dark' 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <Sidebar 
        isExpanded={sidebarExpanded} 
        setIsExpanded={setSidebarExpanded}
        userRole="client"
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-20 w-[calc(100%-5rem)]'
      }`}>
        <Header 
          notifications={stats.activeOrders}
          onMenuToggle={() => setSidebarExpanded(!sidebarExpanded)}
        />
        
        <div className="p-6 space-y-6">
          {/* Header del Dashboard */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${
                mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Mi Panel de Cliente
              </h1>
              <p className={`text-sm ${
                mounted && theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Bienvenido de vuelta, María González
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Cliente VIP
            </Badge>
          </div>

          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Activos</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeOrders}</div>
                <p className="text-xs text-slate-600">En proceso</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Completados</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completedOrders}</div>
                <p className="text-xs text-slate-600">Total histórico</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Gastado</CardTitle>
                <DollarSign className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSpent}</div>
                <p className="text-xs text-slate-600">Este año</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Puntos de Lealtad</CardTitle>
                <Star className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.loyaltyPoints}</div>
                <p className="text-xs text-slate-600">Disponibles</p>
              </CardContent>
            </Card>
          </div>

          {/* Acciones Rápidas */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <ShoppingCart className="h-6 w-6" />
                  <span className="text-sm">Nuevo Pedido</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <MapPin className="h-6 w-6" />
                  <span className="text-sm">Tracking</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-sm">Soporte</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Heart className="h-6 w-6" />
                  <span className="text-sm">Favoritos</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Mis Pedidos */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle>Mis Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {myOrders.map((order) => (
                  <div key={order.id} className="p-4 rounded-lg bg-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <p className="font-medium text-sm">{order.id}</p>
                          <p className="text-xs text-slate-600">{order.product}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">{order.amount}</p>
                        <p className="text-xs text-slate-600">Tracking: {order.tracking}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso</span>
                        <span>{order.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(order.progress)}`} 
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Entrega estimada: {order.estimatedDelivery}</span>
                        <Button variant="ghost" size="sm" className="h-6 px-2">
                          Ver detalles
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Calificación promedio</span>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{stats.averageRating}</span>
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Próxima entrega</span>
                    <span className="font-medium">{stats.nextDelivery}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Nivel de cliente</span>
                    <Badge className="bg-purple-100 text-purple-800">VIP</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Descuentos disponibles</span>
                    <span className="font-medium text-green-600">15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle>Recomendaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                    <Truck className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Tu pedido ORD-2024-001 llegará en 2 días</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50">
                    <Star className="h-4 w-4 text-green-600" />
                    <span className="text-sm">¡Gana 50 puntos extra con tu próximo pedido!</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-50">
                    <Heart className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Productos similares a tus favoritos en oferta</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50">
                    <MessageSquare className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">Soporte disponible 24/7 para consultas</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 