'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminContext } from '@/lib/AdminContext';
import { useAdminOrders } from '@/hooks/use-admin-orders';
import { useAdminUsers } from '@/hooks/use-admin-users';
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
  Shield,
  MessageSquare,
  MapPin,
  Star,
  Bell,
  RefreshCw,
  Download,
  Share2,
  Edit,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function AdminDashboard() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const { adminId } = useAdminContext();

    // Datos de pedidos desde la tabla orders
  const { data: adminOrdersData, error: adminOrdersError } = useAdminOrders();
    const totalPedidos = adminOrdersData?.totalPedidos ?? 0;
    const totalIngresos = adminOrdersData?.totalIngresos ?? 0;

    // Datos de usuarios desde la tabla userlevel
  const { data: adminUsersData, error: adminUsersError } = useAdminUsers();
  const totalUsuarios = Array.isArray(adminUsersData) ? adminUsersData.length : 0;

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
    monthlyGrowth: '+12.5%',
    responseTime: '8 min',
    satisfactionRate: '96%'
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
    <div className="min-h-screen flex overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar 
        isExpanded={sidebarExpanded} 
        setIsExpanded={setSidebarExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        userRole="admin"
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={stats.criticalAlerts}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title={t('admin.dashboard.title')}
          subtitle={t('admin.dashboard.subtitle')}
        />
        
        <div className="p-4 md:p-5 lg:p-6 space-y-6 md:space-y-6 lg:space-y-8">
          {/* Header del Dashboard con Bienvenida */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-4 md:p-6 lg:p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
                <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">{t('admin.dashboard.welcome.title')}</h2>
                  <p className="text-blue-100 text-sm md:text-base lg:text-lg">{t('admin.dashboard.welcome.subtitle')}</p>
                  <p className="text-blue-200 mt-2 text-xs md:text-sm">{t('admin.dashboard.welcome.description')}</p>
                </div>
                <div className="flex md:hidden lg:flex items-center space-x-4 md:space-x-6">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold">{totalUsuarios}</div>
                    <p className="text-blue-100 text-xs md:text-sm">{t('admin.dashboard.stats.totalUsers')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Principal */}
          <div className="space-y-8">
            {/* Estadísticas Principales */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-blue-800">{t('admin.dashboard.stats.totalUsers')}</CardTitle>
                  <div className="p-1.5 md:p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Users className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-900">{totalUsuarios}</div>
                  <p className="text-xs text-blue-700">{t('admin.dashboard.stats.activeUsers')}</p>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(stats.totalUsers / 100) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-green-800">{t('admin.dashboard.stats.activeOrders')}</CardTitle>
                  <div className="p-1.5 md:p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Package className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-green-900">{totalPedidos}</div>
                  <p className="text-xs text-green-700">{t('admin.dashboard.stats.inProcess')}</p>
                  <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: `${(stats.activeOrders / 200) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-red-800">{t('admin.dashboard.stats.criticalAlerts')}</CardTitle>
                  <div className="p-1.5 md:p-2 bg-red-500 rounded-lg group-hover:scale-110 transition-transform">
                    <AlertTriangle className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-red-900">{stats.criticalAlerts}</div>
                  <p className="text-xs text-red-700">{t('admin.dashboard.stats.requireAttention')}</p>
                  <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{width: `${(stats.criticalAlerts / 10) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-purple-800">{t('admin.dashboard.stats.totalRevenue')}</CardTitle>
                  <div className="p-1.5 md:p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-900">{totalIngresos}$</div>
                  <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: '85%'}}></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Acciones Rápidas */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl font-semibold">{t('admin.dashboard.quickActions.title')}</CardTitle>
                <p className="text-xs md:text-sm text-slate-600">{t('admin.dashboard.quickActions.subtitle')}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                  <Link href="/admin/usuarios">
                    <Button variant="outline" className="h-20 md:h-24 flex flex-col gap-2 md:gap-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group w-full">
                      <div className="p-2 md:p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                      </div>
                      <span className="text-xs md:text-sm font-medium">{t('admin.dashboard.quickActions.manageUsers')}</span>
                    </Button>
                  </Link>
                  <Link href="/admin/configuracion">
                    <Button variant="outline" className="h-20 md:h-24 flex flex-col gap-2 md:gap-3 hover:bg-green-50 hover:border-green-300 transition-all duration-300 group w-full">
                      <div className="p-2 md:p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <Settings className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                      </div>
                      <span className="text-xs md:text-sm font-medium">{t('admin.dashboard.quickActions.configuration')}</span>
                    </Button>
                  </Link>
                  <Link href="/admin/alertas">
                    <Button variant="outline" className="h-20 md:h-24 flex flex-col gap-2 md:gap-3 hover:bg-red-50 hover:border-red-300 transition-all duration-300 group w-full">
                      <div className="p-2 md:p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                        <AlertTriangle className="h-6 w-6 md:h-8 md:w-8 text-red-600" />
                      </div>
                      <span className="text-xs md:text-sm font-medium">{t('admin.dashboard.quickActions.alerts')}</span>
                    </Button>
                  </Link>
                  <Link href="/admin/reportes">
                    <Button variant="outline" className="h-20 md:h-24 flex flex-col gap-2 md:gap-3 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 group w-full">
                      <div className="p-2 md:p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <BarChart3 className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                      </div>
                      <span className="text-xs md:text-sm font-medium">{t('admin.dashboard.quickActions.reports')}</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Actividad Reciente */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl font-semibold">{t('admin.dashboard.recentActivity.title')}</CardTitle>
                <p className="text-xs md:text-sm text-slate-600">{t('admin.dashboard.recentActivity.subtitle')}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 md:space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className={`p-2 md:p-3 rounded-full ${getActivityColor(activity.type)}`}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-xs md:text-sm">{activity.action}</p>
                        <p className="text-xs text-slate-600">{activity.user}</p>
                      </div>
                      <span className="text-xs text-slate-500 bg-white px-2 py-1 rounded-full">{activity.time}</span>
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