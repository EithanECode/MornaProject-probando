'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Package, 
  AlertTriangle, 
  Settings, 
  BarChart3, 
  Eye,
  DollarSign,
  TrendingUp,
  Activity,
  Shield
} from 'lucide-react';

export default function AdminDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Estadísticas del Master
  const stats = {
    totalUsers: 45,
    activeOrders: 128,
    criticalAlerts: 3,
    pendingPayments: 12,
    totalRevenue: '$45,230',
    monthlyGrowth: '+12.5%'
  };

  const recentActivities = [
    { id: 1, action: 'Nuevo usuario registrado', user: 'Carlos Pérez', time: '2 min ago', type: 'user' },
    { id: 2, action: 'Pago validado', user: 'María González', time: '5 min ago', type: 'payment' },
    { id: 3, action: 'Alerta crítica', user: 'Pedido #1234', time: '8 min ago', type: 'alert' },
    { id: 4, action: 'Configuración actualizada', user: 'Sistema', time: '15 min ago', type: 'config' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <Users className="h-4 w-4" />;
      case 'payment': return <DollarSign className="h-4 w-4" />;
      case 'alert': return <AlertTriangle className="h-4 w-4" />;
      case 'config': return <Settings className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user': return 'text-blue-600 bg-blue-100';
      case 'payment': return 'text-green-600 bg-green-100';
      case 'alert': return 'text-red-600 bg-red-100';
      case 'config': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
    <div className={`min-h-screen flex overflow-x-hidden ${
      theme === 'dark' 
        ? 'bg-slate-900' 
        : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <Sidebar 
        isExpanded={sidebarExpanded} 
        setIsExpanded={setSidebarExpanded}
        userRole="admin"
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-20 w-[calc(100%-5rem)]'
      }`}>
        <Header 
          notifications={stats.criticalAlerts}
          onMenuToggle={() => setSidebarExpanded(!sidebarExpanded)}
        />
        
        <div className="p-6 space-y-6">
          {/* Header del Dashboard */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Panel de Administración
              </h1>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Supervisión completa del sistema Morna
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Master Admin
            </Badge>
          </div>

          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
                <Users className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-slate-600">Usuarios activos</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Activos</CardTitle>
                <Package className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeOrders}</div>
                <p className="text-xs text-slate-600">En proceso</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Críticas</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.criticalAlerts}</div>
                <p className="text-xs text-slate-600">Requieren atención</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalRevenue}</div>
                <p className="text-xs text-slate-600">{stats.monthlyGrowth} este mes</p>
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
                  <Users className="h-6 w-6" />
                  <span className="text-sm">Gestionar Usuarios</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Settings className="h-6 w-6" />
                  <span className="text-sm">Configuración</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span className="text-sm">Reportes</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Eye className="h-6 w-6" />
                  <span className="text-sm">Supervisar Todo</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Actividad Reciente */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle>Actividad Reciente del Sistema</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-50">
                    <div className={`p-2 rounded-full ${getActivityColor(activity.type)}`}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{activity.action}</p>
                      <p className="text-xs text-slate-600">{activity.user}</p>
                    </div>
                    <span className="text-xs text-slate-500">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 