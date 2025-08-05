"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Package, 
  Plane, 
  Ship, 
  CheckCircle, 
  Clock, 
  MessageCircle, 
  TrendingUp,
  Bell,
  Plus,
  BarChart3,
  MapPin,
  Users,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface OrderStats {
  total: number;
  pending: number;
  completed: number;
  inTransit: number;
}

interface WorkflowStep {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  status: 'completed' | 'active' | 'pending';
  color: string;
}

export default function Dashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [stats, setStats] = useState<OrderStats>({
    total: 156,
    pending: 23,
    completed: 128,
    inTransit: 5
  });

  const [notifications, setNotifications] = useState(3);
  const [animateStats, setAnimateStats] = useState(false);

  useEffect(() => {
    setAnimateStats(true);
  }, []);

  const workflowSteps: WorkflowStep[] = [
    {
      id: 'solicitud',
      title: 'Pedido Solicitado',
      subtitle: 'Cliente realiza pedido',
      icon: Package,
      status: 'completed',
      color: 'text-blue-500'
    },
    {
      id: 'cotizacion',
      title: 'Cotización China',
      subtitle: 'Verificación de precios',
      icon: RefreshCw,
      status: 'completed',
      color: 'text-orange-500'
    },
    {
      id: 'cotizacion-vzla',
      title: 'Cotización Venezuela',
      subtitle: 'Precio final al cliente',
      icon: BarChart3,
      status: 'active',
      color: 'text-green-500'
    },
    {
      id: 'pago',
      title: 'Cliente Paga',
      subtitle: 'Confirmación de pago',
      icon: CheckCircle,
      status: 'pending',
      color: 'text-gray-400'
    },
    {
      id: 'empaque',
      title: 'Re-empacar China',
      subtitle: 'Preparación para envío',
      icon: Package,
      status: 'pending',
      color: 'text-gray-400'
    },
    {
      id: 'transito',
      title: 'En Tránsito',
      subtitle: 'Aéreo/Marítimo',
      icon: Plane,
      status: 'pending',
      color: 'text-gray-400'
    },
    {
      id: 'almacen',
      title: 'Almacén Vzla',
      subtitle: 'Llegada a Venezuela',
      icon: MapPin,
      status: 'pending',
      color: 'text-gray-400'
    },
    {
      id: 'entregado',
      title: 'Entregado',
      subtitle: 'Entrega final',
      icon: CheckCircle,
      status: 'pending',
      color: 'text-gray-400'
    }
  ];

  const recentOrders = [
    { id: '#ORD-001', client: 'Maria González', status: 'En tránsito aéreo', progress: 65, eta: '2 días' },
    { id: '#ORD-002', client: 'Carlos Pérez', status: 'En almacén Vzla', progress: 85, eta: '1 día' },
    { id: '#ORD-003', client: 'Ana Rodriguez', status: 'Cotización China', progress: 25, eta: '5 días' },
    { id: '#ORD-004', client: 'Luis Martinez', status: 'Re-empacado', progress: 45, eta: '7 días' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar */}
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-72' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <p className="text-sm text-slate-600">Resumen de la operación</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="w-4 h-4 mr-2" />
                  Notificaciones
                  {notifications > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                      {notifications}
                    </Badge>
                  )}
                </Button>
                <Button variant="outline" size="sm">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chat Soporte
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Pedidos</p>
                  <p className={`text-3xl font-bold transition-all duration-1000 ${animateStats ? 'scale-100' : 'scale-0'}`}>
                    {stats.total}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Package className="w-6 h-6 animate-bounce" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Pendientes</p>
                  <p className={`text-3xl font-bold transition-all duration-1000 delay-200 ${animateStats ? 'scale-100' : 'scale-0'}`}>
                    {stats.pending}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Completados</p>
                  <p className={`text-3xl font-bold transition-all duration-1000 delay-400 ${animateStats ? 'scale-100' : 'scale-0'}`}>
                    {stats.completed}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 animate-pulse" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">En Tránsito</p>
                  <p className={`text-3xl font-bold transition-all duration-1000 delay-600 ${animateStats ? 'scale-100' : 'scale-0'}`}>
                    {stats.inTransit}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="relative">
                    <Plane className="w-6 h-6 animate-bounce" style={{ animationDuration: '2s' }} />
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Workflow Section */}
        <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
                  Flujo de Trabajo
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Seguimiento completo del proceso de pedidos
                </CardDescription>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                23 pedidos activos
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
              {workflowSteps.map((step, index) => (
                <div key={step.id} className="relative">
                  <div className={`
                    p-4 rounded-xl border-2 transition-all duration-500 hover:shadow-lg cursor-pointer
                    ${step.status === 'completed' ? 'bg-green-50 border-green-200 shadow-sm' : ''}
                    ${step.status === 'active' ? 'bg-blue-50 border-blue-200 shadow-md ring-2 ring-blue-400 ring-opacity-50' : ''}
                    ${step.status === 'pending' ? 'bg-gray-50 border-gray-200' : ''}
                  `}>
                    <div className="text-center space-y-2">
                      <div className={`
                        w-12 h-12 mx-auto rounded-full flex items-center justify-center transition-all duration-300
                        ${step.status === 'completed' ? 'bg-green-100' : ''}
                        ${step.status === 'active' ? 'bg-blue-100 animate-pulse' : ''}
                        ${step.status === 'pending' ? 'bg-gray-100' : ''}
                      `}>
                        <step.icon className={`w-6 h-6 ${step.color} ${
                          step.status === 'active' ? 'animate-bounce' : ''
                        } ${
                          step.icon === Plane && step.status === 'active' ? 'animate-pulse' : ''
                        }`} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{step.title}</p>
                        <p className="text-xs text-slate-500">{step.subtitle}</p>
                      </div>
                    </div>
                  </div>
                  
                  {index < workflowSteps.length - 1 && (
                    <div className="hidden md:block absolute top-8 -right-2 w-4 h-4">
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <Card className="lg:col-span-2 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="w-5 h-5 mr-2 text-blue-600" />
                Pedidos Recientes
              </CardTitle>
              <CardDescription>
                Seguimiento de pedidos en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order, index) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{order.id}</p>
                        <p className="text-sm text-slate-600">{order.client}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-900">{order.status}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Progress value={order.progress} className="w-20 h-2" />
                          <span className="text-xs text-slate-500">{order.progress}%</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        ETA: {order.eta}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & Stats */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Pedido (China)
                </Button>
                <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Pedido (Vzla)
                </Button>
                <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Avanzar Todos los Pedidos
                </Button>
              </CardContent>
            </Card>

            {/* Transport Methods */}
            <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg">Métodos de Envío</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-200">
                    <Plane className="w-8 h-8 mx-auto mb-2 text-blue-600 animate-bounce" style={{ animationDuration: '3s' }} />
                    <p className="text-xs font-semibold text-blue-900">Aéreo</p>
                    <p className="text-xs text-blue-600">15-20 días</p>
                  </div>
                  <div className="p-3 bg-teal-50 rounded-lg text-center border border-teal-200">
                    <Ship className="w-8 h-8 mx-auto mb-2 text-teal-600" style={{ 
                      animation: 'float 4s ease-in-out infinite',
                    }} />
                    <p className="text-xs font-semibold text-teal-900">Marítimo</p>
                    <p className="text-xs text-teal-600">35-45 días</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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