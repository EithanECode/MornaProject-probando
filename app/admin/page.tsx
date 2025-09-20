'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAdminContext } from '@/lib/AdminContext';
import { useAdminOrders } from '@/hooks/use-admin-orders';
import { useAdminUsers } from '@/hooks/use-admin-users';
// RealtimeTest eliminado (no utilizado)
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
  const { data: adminOrdersData, error: adminOrdersError, refetch: refetchOrders } = useAdminOrders();
    const totalPedidos =
      (adminOrdersData?.pedidosPendientes ?? 0) +
      (adminOrdersData?.pedidosTransito ?? 0);
    const totalIngresos = adminOrdersData?.totalIngresos ?? 0;

    // Datos de usuarios desde la tabla userlevel
  const { data: adminUsersData, error: adminUsersError, refetch: refetchUsers } = useAdminUsers();
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

  const getTranslatedActivity = (type: string) => {
    switch (type) {
      case 'user': return t('admin.dashboard.recentActivity.activities.newUserRegistered');
      case 'payment': return t('admin.dashboard.recentActivity.activities.paymentValidated');
      case 'alert': return t('admin.dashboard.recentActivity.activities.criticalAlert');
      case 'config': return t('admin.dashboard.recentActivity.activities.configurationUpdated');
      default: return '';
    }
  };

  const recentActivities = [
    { id: 1, action: getTranslatedActivity('user'), user: 'Carlos Pérez', time: t('admin.dashboard.recentActivity.timeAgo.minAgo', { count: 2 }), type: 'user' },
    { id: 2, action: getTranslatedActivity('payment'), user: 'María González', time: t('admin.dashboard.recentActivity.timeAgo.minAgo', { count: 5 }), type: 'payment' },
    { id: 3, action: getTranslatedActivity('alert'), user: 'Pedido #1234', time: t('admin.dashboard.recentActivity.timeAgo.minAgo', { count: 8 }), type: 'alert' },
    { id: 4, action: getTranslatedActivity('config'), user: t('admin.dashboard.recentActivity.activities.system'), time: t('admin.dashboard.recentActivity.timeAgo.minAgo', { count: 15 }), type: 'config' },
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
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-orange-500 rounded-2xl p-4 md:p-6 lg:p-8 text-white relative overflow-hidden">
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
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Card className="bg-blue-50 border-blue-200 hover:shadow-lg transition-all duration-300 group">
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

              <Card className="bg-orange-50 border-orange-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-orange-800">{t('admin.dashboard.stats.activeOrders')}</CardTitle>
                  <div className="p-1.5 md:p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Package className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-orange-900">{totalPedidos}</div>
                  <p className="text-xs text-orange-700">{t('admin.dashboard.stats.inProcess')}</p>
                  <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: `${(stats.activeOrders / 200) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-blue-800">{t('admin.dashboard.stats.totalRevenue')}</CardTitle>
                  <div className="p-1.5 md:p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-900">{totalIngresos}$</div>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '85%'}}></div>
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
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                  <Link href="/admin/usuarios">
                    <Button variant="outline" className="h-20 md:h-24 flex flex-col gap-2 md:gap-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group w-full">
                      <div className="p-2 md:p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                      </div>
                      <span className="text-xs md:text-sm font-medium">{t('admin.dashboard.quickActions.manageUsers')}</span>
                    </Button>
                  </Link>
                  <Link href="/admin/configuracion">
                    <Button variant="outline" className="h-20 md:h-24 flex flex-col gap-2 md:gap-3 hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 group w-full">
                      <div className="p-2 md:p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                        <Settings className="h-6 w-6 md:h-8 md:w-8 text-orange-600" />
                      </div>
                      <span className="text-xs md:text-sm font-medium">{t('admin.dashboard.quickActions.configuration')}</span>
                    </Button>
                  </Link>
                  <Link href="/admin/pedidos">
                    <Button variant="outline" className="h-20 md:h-24 flex flex-col gap-2 md:gap-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group w-full">
                      <div className="p-2 md:p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Package className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                      </div>
                      <span className="text-xs md:text-sm font-medium">{t('admin.dashboard.quickActions.orders')}</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
} 