'use client';

import { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useVzlaContext } from '@/lib/VzlaContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
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
  BarChart3,
  Search,
  Filter,
  Eye,
  Send,
  Calculator,
  Package,
  UserCheck,
  Star,
  TrendingUp,
  Calendar,
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

// Tipos
interface PendingOrder {
  id: string;
  clientName: string;
  clientId: string;
  product: string;
  description: string;
  quantity: number;
  specifications: string;
  shippingOptions: string[];
  deliveryOptions: string[];
  receivedFromChina: string;
  status: 'pending' | 'reviewing' | 'quoted' | 'sent';
  priority: 'low' | 'medium' | 'high';
  estimatedDelivery?: string;
  finalPrice?: number;
  currency?: 'USD' | 'BS';
}

interface ChatSupport {
  id: string;
  clientName: string;
  clientId: string;
  lastMessage: string;
  lastMessageTime: string;
  status: 'active' | 'waiting' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  unreadMessages: number;
  orderId?: string;
}

interface TrackingUpdate {
  id: string;
  orderId: string;
  clientName: string;
  product: string;
  currentStatus: string;
  location: string;
  lastUpdate: string;
  nextStep: string;
  estimatedArrival: string;
  needsUpdate: boolean;
}

interface SatisfactionSurvey {
  id: string;
  orderId: string;
  clientName: string;
  rating: number;
  feedback: string;
  date: string;
  category: 'delivery' | 'product' | 'service' | 'communication';
}

// Datos mock para el dashboard (mantenemos algunos para funcionalidad completa)
const PENDING_ORDERS = [
  { id: 1, client: 'Cliente A', product: 'Producto 1', status: 'pending', priority: 'high' },
  { id: 2, client: 'Cliente B', product: 'Producto 2', status: 'pending', priority: 'medium' },
  { id: 3, client: 'Cliente C', product: 'Producto 3', status: 'pending', priority: 'low' },
];

const CHAT_SUPPORT = [
  { id: 1, client: 'Cliente X', status: 'active', lastMessage: 'Hace 5 min' },
  { id: 2, client: 'Cliente Y', status: 'active', lastMessage: 'Hace 10 min' },
  { id: 3, client: 'Cliente Z', status: 'waiting', lastMessage: 'Hace 15 min' },
];

const TRACKING_UPDATES = [
  { id: 1, order: 'ORD-001', status: 'En tránsito', needsUpdate: true },
  { id: 2, order: 'ORD-002', status: 'Entregado', needsUpdate: false },
  { id: 3, order: 'ORD-003', status: 'En aduana', needsUpdate: true },
];

export default function VenezuelaDashboard() {
  const { vzlaId } = useVzlaContext();
  const { t, language } = require('@/hooks/useTranslation').useTranslation();
  const { data: vzlaOrdersRaw, refetch: refetchVzlaOrders } = require('@/hooks/use-vzla-orders').useVzlaOrders();
  // Suscripción realtime
  const { useRealtimeVzla } = require('@/hooks/use-realtime-vzla');
  const handleRealtimeUpdate = useCallback(() => {
    // Refrescamos los pedidos asignados a este usuario
    refetchVzlaOrders();
  }, [refetchVzlaOrders]);
  useRealtimeVzla(handleRealtimeUpdate, vzlaId);
  const vzlaOrders = Array.isArray(vzlaOrdersRaw) ? vzlaOrdersRaw : [];

  // Polling de respaldo: refetch periódico por tolerancia a eventos perdidos
  useEffect(() => {
    if (!vzlaId) return;
    const id = window.setInterval(() => {
      refetchVzlaOrders();
    }, 10000);
    return () => window.clearInterval(id);
  }, [vzlaId, refetchVzlaOrders]);

  const totalPedidos = vzlaOrders.length;
  // Estados: 1-4 Pendientes, 5-13 Seguimiento Activo
  const pedidosPendientes = vzlaOrders.filter((order: any) => order.state >= 1 && order.state <= 4).length;
  const pedidosTracking = vzlaOrders.filter((order: any) => order.state >= 5 && order.state <= 13).length;
  const reputaciones = vzlaOrders.filter((order: any) => order.asignedEVzla === vzlaId && typeof order.reputation === 'number').map((order: any) => order.reputation);
  const promedioReputacion = reputaciones.length > 0 ? reputaciones.reduce((acc: number, r: number) => acc + r, 0) / reputaciones.length : 0;
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Estadísticas usando datos reales de Supabase
  const stats = {
    pendingOrders: pedidosPendientes,
    activeChats: CHAT_SUPPORT.filter(c => c.status === 'active').length,
    trackingUpdates: pedidosTracking,
  deliveredOrders: vzlaOrders.filter((order: any) => order.state === 13).length,
    averageRating: promedioReputacion,
    responseTime: '12 min',
    satisfactionRate: '94%'
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'quoted': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'sent': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'waiting': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'resolved': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'reviewing': return 'Revisando';
      case 'quoted': return 'Cotizado';
      case 'sent': return 'Enviado';
      case 'active': return 'Activo';
      case 'waiting': return 'Esperando';
      case 'resolved': return 'Resuelto';
      default: return 'Desconocido';
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
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
        userRole="venezuela"
      />
      
      <main className={`transition-all duration-300 flex-1 ${
        sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={stats.pendingOrders + stats.activeChats}
          notificationsRole="venezuela"
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title={t('venezuela.dashboard.title')}
          subtitle={t('venezuela.dashboard.subtitle')}
        />
        
        <div className="p-4 md:p-5 lg:p-6 space-y-6 md:space-y-6 lg:space-y-8">
          {/* Header del Dashboard con Bienvenida */}
          <div className="bg-gradient-to-r from-blue-500 via-blue-600 to-orange-500 rounded-xl p-4 md:p-6 lg:p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">{t('venezuela.dashboard.welcome')}</h2>
                  <p className="text-blue-100 text-sm md:text-base lg:text-lg">{t('venezuela.dashboard.panel')}</p>
                  <p className="text-blue-200 mt-2 text-xs md:text-sm">{t('venezuela.dashboard.manage')}</p>
                </div>
                <div className="flex md:hidden lg:flex items-center space-x-4 md:space-x-6">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold">{pedidosPendientes + pedidosTracking}</div>
                    <p className="text-blue-100 text-xs md:text-sm">{t('venezuela.dashboard.pendingTasks')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Principal */}
          <div className="space-y-6 md:space-y-6 lg:space-y-8">
            {/* Estadísticas Principales */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
              <Card className="bg-blue-50 border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-blue-800">{t('venezuela.dashboard.pendingOrders')}</CardTitle>
                  <div className="p-1 md:p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Package className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-900">{pedidosPendientes}</div>
                  <p className="text-xs text-blue-700">{t('venezuela.dashboard.pendingOrdersDesc')}</p>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(pedidosPendientes / Math.max(totalPedidos, 1)) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-orange-50 border-orange-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-orange-800">{t('venezuela.dashboard.activeChats')}</CardTitle>
                  <div className="p-1 md:p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-orange-900">{stats.activeChats}</div>
                  <p className="text-xs text-orange-700">{t('venezuela.dashboard.activeChatsDesc')}</p>
                  <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: `${(stats.activeChats / 5) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-blue-50 border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-blue-800">{t('venezuela.dashboard.trackingUpdates')}</CardTitle>
                  <div className="p-1 md:p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                    <MapPin className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-900">{pedidosTracking}</div>
                  <p className="text-xs text-blue-700">{t('venezuela.dashboard.trackingUpdatesDesc')}</p>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(pedidosTracking / Math.max(totalPedidos, 1)) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Acciones Rápidas */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg md:text-xl font-semibold">{t('venezuela.quickActions.title')}</CardTitle>
                <p className="text-xs md:text-sm text-slate-600">{t('venezuela.quickActions.subtitle')}</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-4 lg:gap-6">
                  <Link href="/venezuela/pedidos">
                    <Button variant="outline" className="h-16 md:h-20 lg:h-24 flex flex-col gap-2 md:gap-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group w-full">
                      <div className="p-2 md:p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Package className="h-5 w-5 md:h-6 md:w-6 lg:h-8 lg:w-8 text-blue-600" />
                      </div>
                      <span className="text-xs md:text-sm font-medium">{t('venezuela.quickActions.reviewOrder')}</span>
                    </Button>
                  </Link>
                  {/* Tarjetas removidas: soporte y validación de pagos */}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}