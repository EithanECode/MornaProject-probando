'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Truck, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  FileText,
  Phone,
  Flag,
  Users,
  BarChart3
} from 'lucide-react';

export default function VenezuelaDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Estadísticas específicas para Venezuela
  const stats = {
    pendingQuotations: 18,
    activeChats: 7,
    trackingUpdates: 12,
    deliveredOrders: 45,
    customerSatisfaction: '4.8/5',
    averageResponseTime: '15 min'
  };

  const recentActivities = [
    { 
      id: 1, 
      type: 'quotation', 
      action: 'Cotización enviada', 
      client: 'María González',
      product: 'iPhone 15 Pro',
      time: '5 min ago',
      status: 'completed'
    },
    { 
      id: 2, 
      type: 'chat', 
      action: 'Consulta de cliente', 
      client: 'Carlos Pérez',
      product: 'MacBook Air M2',
      time: '12 min ago',
      status: 'active'
    },
    { 
      id: 3, 
      type: 'tracking', 
      action: 'Actualización de tracking', 
      client: 'Ana Rodríguez',
      product: 'AirPods Pro',
      time: '25 min ago',
      status: 'completed'
    },
    { 
      id: 4, 
      type: 'delivery', 
      action: 'Pedido entregado', 
      client: 'Luis Martínez',
      product: 'iPad Pro',
      time: '1 hora ago',
      status: 'completed'
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'quotation': return <FileText className="h-4 w-4" />;
      case 'chat': return <MessageSquare className="h-4 w-4" />;
      case 'tracking': return <MapPin className="h-4 w-4" />;
      case 'delivery': return <Truck className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'quotation': return 'text-blue-600 bg-blue-100';
      case 'chat': return 'text-green-600 bg-green-100';
      case 'tracking': return 'text-purple-600 bg-purple-100';
      case 'delivery': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
        userRole="venezuela"
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-20 w-[calc(100%-5rem)]'
      }`}>
        <Header 
          notifications={stats.pendingQuotations}
          onMenuToggle={() => setSidebarExpanded(!sidebarExpanded)}
        />
        
        <div className="p-6 space-y-6">
          {/* Header del Dashboard */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${
                mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Panel de Venezuela
              </h1>
              <p className={`text-sm ${
                mounted && theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Validación, comunicación y soporte al cliente
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Empleado Venezuela
            </Badge>
          </div>

          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cotizaciones Pendientes</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingQuotations}</div>
                <p className="text-xs text-slate-600">Esperando respuesta</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chats Activos</CardTitle>
                <MessageSquare className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeChats}</div>
                <p className="text-xs text-slate-600">Clientes en línea</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Actualizaciones Tracking</CardTitle>
                <MapPin className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.trackingUpdates}</div>
                <p className="text-xs text-slate-600">Pendientes</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Entregados</CardTitle>
                <CheckCircle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.deliveredOrders}</div>
                <p className="text-xs text-slate-600">Este mes</p>
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
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Enviar Cotización</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <MessageSquare className="h-6 w-6" />
                  <span className="text-sm">Chat Soporte</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <MapPin className="h-6 w-6" />
                  <span className="text-sm">Actualizar Tracking</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Phone className="h-6 w-6" />
                  <span className="text-sm">Llamar Cliente</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actividad Reciente */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle>Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm">{activity.action}</p>
                        <Badge className={getStatusColor(activity.status)}>
                          {activity.status === 'completed' && 'Completado'}
                          {activity.status === 'active' && 'Activo'}
                          {activity.status === 'pending' && 'Pendiente'}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600">{activity.client} - {activity.product}</p>
                    </div>
                    <span className="text-xs text-slate-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métricas de Rendimiento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Satisfacción del cliente</span>
                    <span className="font-medium">{stats.customerSatisfaction}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '96%' }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tiempo promedio de respuesta</span>
                    <span className="font-medium">{stats.averageResponseTime}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Chats resueltos hoy</span>
                    <span className="font-medium">23/25</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle>Próximas Acciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">5 cotizaciones vencen en 2 horas</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">3 chats requieren atención</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50">
                    <Truck className="h-4 w-4 text-green-600" />
                    <span className="text-sm">8 pedidos llegando hoy</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-purple-50">
                    <Users className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">12 clientes nuevos esta semana</span>
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