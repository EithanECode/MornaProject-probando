'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  CreditCard, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Shield,
  Flag,
  Users,
  BarChart3,
  Zap
} from 'lucide-react';

export default function PagosDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Estadísticas específicas para Pagos
  const stats = {
    pendingPayments: 15,
    approvedPayments: 28,
    rejectedPayments: 3,
    totalProcessed: '$12,450',
    averageProcessingTime: '8 min',
    fraudAlerts: 2
  };

  const recentPayments = [
    { 
      id: 'PAY-001', 
      client: 'María González',
      amount: '$1,250',
      method: 'Binance USDT',
      status: 'pending',
      time: '5 min ago',
      priority: 'high'
    },
    { 
      id: 'PAY-002', 
      client: 'Carlos Pérez',
      amount: '$890',
      method: 'Zelle',
      status: 'approved',
      time: '12 min ago',
      priority: 'medium'
    },
    { 
      id: 'PAY-003', 
      client: 'Ana Rodríguez',
      amount: '$2,100',
      method: 'PayPal',
      status: 'rejected',
      time: '25 min ago',
      priority: 'high'
    },
    { 
      id: 'PAY-004', 
      client: 'Luis Martínez',
      amount: '$750',
      method: 'Pago Móvil',
      status: 'approved',
      time: '1 hora ago',
      priority: 'low'
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'Binance USDT': return <TrendingUp className="h-4 w-4" />;
      case 'Zelle': return <CreditCard className="h-4 w-4" />;
      case 'PayPal': return <DollarSign className="h-4 w-4" />;
      case 'Pago Móvil': return <Zap className="h-4 w-4" />;
      default: return <DollarSign className="h-4 w-4" />;
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
        userRole="pagos"
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-20 w-[calc(100%-5rem)]'
      }`}>
        <Header 
          notifications={stats.pendingPayments}
          onMenuToggle={() => setSidebarExpanded(!sidebarExpanded)}
        />
        
        <div className="p-6 space-y-6">
          {/* Header del Dashboard */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${
                mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'
              }`}>
                Panel de Validación de Pagos
              </h1>
              <p className={`text-sm ${
                mounted && theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
              }`}>
                Gestión financiera y validación de transacciones
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Validador de Pagos
            </Badge>
          </div>

          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagos Pendientes</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingPayments}</div>
                <p className="text-xs text-slate-600">Esperando validación</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagos Aprobados</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approvedPayments}</div>
                <p className="text-xs text-slate-600">Hoy</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pagos Rechazados</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejectedPayments}</div>
                <p className="text-xs text-slate-600">Requieren revisión</p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Procesado</CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProcessed}</div>
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
                  <CheckCircle className="h-6 w-6" />
                  <span className="text-sm">Aprobar Pago</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <AlertTriangle className="h-6 w-6" />
                  <span className="text-sm">Rechazar Pago</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <FileText className="h-6 w-6" />
                  <span className="text-sm">Reporte Financiero</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2">
                  <Shield className="h-6 w-6" />
                  <span className="text-sm">Auditoría</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Pagos Recientes */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle>Pagos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                    <div className="flex items-center gap-4">
                      <div className="flex flex-col">
                        <p className="font-medium text-sm">{payment.id}</p>
                        <p className="text-xs text-slate-600">{payment.client}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.method)}
                        <span className="text-sm font-medium">{payment.method}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-lg">{payment.amount}</span>
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status === 'pending' && 'Pendiente'}
                        {payment.status === 'approved' && 'Aprobado'}
                        {payment.status === 'rejected' && 'Rechazado'}
                      </Badge>
                      <Badge className={getPriorityColor(payment.priority)}>
                        {payment.priority === 'high' && 'Alta'}
                        {payment.priority === 'medium' && 'Media'}
                        {payment.priority === 'low' && 'Baja'}
                      </Badge>
                      <span className="text-xs text-slate-500">{payment.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métricas Financieras */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle>Métricas de Rendimiento</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tiempo promedio de procesamiento</span>
                    <span className="font-medium">{stats.averageProcessingTime}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Tasa de aprobación</span>
                    <span className="font-medium">93.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Alertas de fraude</span>
                    <span className="font-medium text-red-600">{stats.fraudAlerts}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle>Alertas y Notificaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">2 pagos sospechosos detectados</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-yellow-50">
                    <Clock className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm">5 pagos vencen en 1 hora</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm">$8,450 procesados hoy</span>
                  </div>
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Reporte mensual listo</span>
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