'use client';

import { useState, useEffect } from 'react';
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

// Datos mock
const PENDING_ORDERS: PendingOrder[] = [
  {
    id: 'ORD-2024-001',
    clientName: 'María González',
    clientId: 'CL-001',
    product: 'iPhone 15 Pro Max',
    description: 'iPhone 15 Pro Max 256GB Titanio Natural',
    quantity: 1,
    specifications: 'Color: Titanio Natural, Almacenamiento: 256GB',
    shippingOptions: ['Aéreo', 'Marítimo'],
    deliveryOptions: ['Courier', 'Oficina'],
    receivedFromChina: '2024-01-15 10:30',
    status: 'pending',
    priority: 'high'
  },
  {
    id: 'ORD-2024-002',
    clientName: 'Carlos Pérez',
    clientId: 'CL-002',
    product: 'MacBook Air M2',
    description: 'MacBook Air M2 13" 8GB RAM 256GB SSD',
    quantity: 1,
    specifications: 'Procesador: M2, RAM: 8GB, SSD: 256GB',
    shippingOptions: ['Aéreo'],
    deliveryOptions: ['Courier'],
    receivedFromChina: '2024-01-15 14:20',
    status: 'reviewing',
    priority: 'medium'
  },
  {
    id: 'ORD-2024-003',
    clientName: 'Ana Rodríguez',
    clientId: 'CL-003',
    product: 'AirPods Pro',
    description: 'AirPods Pro 2da Generación',
    quantity: 2,
    specifications: 'Con cancelación de ruido activa',
    shippingOptions: ['Marítimo'],
    deliveryOptions: ['Oficina'],
    receivedFromChina: '2024-01-15 16:45',
    status: 'quoted',
    priority: 'low',
    estimatedDelivery: '2024-02-15',
    finalPrice: 450,
    currency: 'USD'
  }
];

const CHAT_SUPPORT: ChatSupport[] = [
  {
    id: 'CHAT-001',
    clientName: 'Luis Martínez',
    clientId: 'CL-004',
    lastMessage: '¿Cuándo llegará mi pedido?',
    lastMessageTime: '2 min ago',
    status: 'active',
    priority: 'high',
    unreadMessages: 3,
    orderId: 'ORD-2024-004'
  },
  {
    id: 'CHAT-002',
    clientName: 'Patricia López',
    clientId: 'CL-005',
    lastMessage: 'Quiero modificar mi pedido',
    lastMessageTime: '15 min ago',
    status: 'waiting',
    priority: 'medium',
    unreadMessages: 1
  },
  {
    id: 'CHAT-003',
    clientName: 'Roberto Silva',
    clientId: 'CL-006',
    lastMessage: 'Gracias por la entrega',
    lastMessageTime: '1 hora ago',
    status: 'resolved',
    priority: 'low',
    unreadMessages: 0,
    orderId: 'ORD-2024-005'
  }
];

const TRACKING_UPDATES: TrackingUpdate[] = [
  {
    id: 'TRK-001',
    orderId: 'ORD-2024-006',
    clientName: 'Carmen Ruiz',
    product: 'iPad Pro',
    currentStatus: 'En Aduana Venezuela',
    location: 'Aduana Principal, Caracas',
    lastUpdate: '2024-01-15 09:30',
    nextStep: 'Llegada a Almacén Local',
    estimatedArrival: '2024-01-18',
    needsUpdate: true
  },
  {
    id: 'TRK-002',
    orderId: 'ORD-2024-007',
    clientName: 'Diego Morales',
    product: 'Apple Watch Series 9',
    currentStatus: 'En Tránsito',
    location: 'Miami, FL',
    lastUpdate: '2024-01-14 16:45',
    nextStep: 'Llegada a Venezuela',
    estimatedArrival: '2024-01-20',
    needsUpdate: false
  }
];

const SATISFACTION_SURVEYS: SatisfactionSurvey[] = [
  {
    id: 'SURV-001',
    orderId: 'ORD-2024-008',
    clientName: 'Elena Vargas',
    rating: 5,
    feedback: 'Excelente servicio, entrega rápida y producto en perfecto estado',
    date: '2024-01-15',
    category: 'delivery'
  },
  {
    id: 'SURV-002',
    orderId: 'ORD-2024-009',
    clientName: 'Miguel Torres',
    rating: 4,
    feedback: 'Buen servicio, pero la comunicación podría mejorar',
    date: '2024-01-14',
    category: 'communication'
  }
];

export default function VenezuelaDashboard() {
  const { vzlaId } = useVzlaContext();
  const { data: vzlaOrdersRaw } = require('@/hooks/use-vzla-orders').useVzlaOrders();
  const vzlaOrders = Array.isArray(vzlaOrdersRaw) ? vzlaOrdersRaw : [];

  const totalPedidos = vzlaOrders.filter((order: any) => order.asignedEVzla === vzlaId).length;
  const pedidosPendientes = vzlaOrders.filter((order: any) => order.state === 1).length;
  const pedidosTracking = vzlaOrders.filter((order: any) => order.state === 2).length;
  const reputaciones = vzlaOrders.filter((order: any) => order.asignedEVzla === vzlaId && typeof order.reputation === 'number').map((order: any) => order.reputation);
  const promedioReputacion = reputaciones.length > 0 ? reputaciones.reduce((acc: number, r: number) => acc + r, 0) / reputaciones.length : 0;

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Estadísticas
  const stats = {
    pendingOrders: PENDING_ORDERS.filter(o => o.status === 'pending').length,
    activeChats: CHAT_SUPPORT.filter(c => c.status === 'active').length,
    trackingUpdates: TRACKING_UPDATES.filter(t => t.needsUpdate).length,
    deliveredOrders: 45,
    averageRating: 4.6,
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
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Layout Desktop */}
      <div className="hidden lg:flex min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar 
          isExpanded={sidebarExpanded} 
          setIsExpanded={setSidebarExpanded}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
          userRole="venezuela"
        />
        
        <main className={`transition-all duration-300 ${
          sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-24 w-[calc(100%-6rem)]'
        } flex-1`}>
          <Header 
            notifications={stats.pendingOrders + stats.activeChats}
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title="Panel Venezuela"
            subtitle="Revisión de pedidos, soporte al cliente y tracking"
          />
          
          <div className="p-6 space-y-8">
          {/* Header del Dashboard con Bienvenida */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 lg:gap-6">
                <div className="flex-1">
                  <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">¡Bienvenido de vuelta!</h2>
                  <p className="text-blue-100 text-sm sm:text-base md:text-lg">Panel de Control - Empleado Venezuela</p>
                  <p className="text-blue-200 mt-2 text-xs sm:text-sm md:text-base">Gestiona pedidos, soporte y tracking desde un solo lugar</p>
                </div>
                <div className="flex lg:hidden items-center justify-center lg:justify-end">
                  <div className="text-center">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold">{pedidosPendientes + pedidosTracking}</div>
                    <p className="text-blue-100 text-xs sm:text-sm">Tareas Pendientes</p>
                  </div>
                </div>
                <div className="hidden lg:flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{pedidosPendientes + pedidosTracking}</div>
                    <p className="text-blue-100">Tareas Pendientes</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Principal */}
          <div className="space-y-4 sm:space-y-6 md:space-y-8">
            {/* Estadísticas Principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-blue-800">Pedidos Pendientes</CardTitle>
                  <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Package className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-900">{pedidosPendientes}</div>
                  <p className="text-xs text-blue-700">Esperando revisión</p>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-1.5 sm:h-2">
                    <div className="bg-blue-500 h-1.5 sm:h-2 rounded-full" style={{width: `${(pedidosPendientes / (pedidosPendientes + pedidosTracking)) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-green-800">Chats Activos</CardTitle>
                  <div className="p-1.5 sm:p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-green-900">{stats.activeChats}</div>
                  <p className="text-xs text-green-700">Clientes en línea</p>
                  <div className="mt-2 w-full bg-green-200 rounded-full h-1.5 sm:h-2">
                    <div className="bg-green-500 h-1.5 sm:h-2 rounded-full" style={{width: `${(stats.activeChats / 5) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-purple-800">Tracking Activo</CardTitle>
                  <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-purple-900">{pedidosTracking}</div>
                  <p className="text-xs text-purple-700">Pendientes</p>
                  <div className="mt-2 w-full bg-purple-200 rounded-full h-1.5 sm:h-2">
                    <div className="bg-purple-500 h-1.5 sm:h-2 rounded-full" style={{width: `${(pedidosTracking / (pedidosPendientes + pedidosTracking)) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-xs sm:text-sm font-medium text-orange-800">Satisfacción</CardTitle>
                  <div className="p-1.5 sm:p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Star className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl sm:text-2xl md:text-3xl font-bold text-orange-900">{promedioReputacion}/5</div>
                  <div className="mt-2 w-full bg-orange-200 rounded-full h-1.5 sm:h-2">
                    <div className="bg-orange-500 h-1.5 sm:h-2 rounded-full" style={{width: `${(promedioReputacion / 5) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Acciones Rápidas */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl font-semibold">Acciones Rápidas</CardTitle>
                <p className="text-xs sm:text-sm text-slate-600">Accede rápidamente a las funciones más utilizadas</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                  <Link href="/venezuela/pedidos">
                    <Button variant="outline" className="h-16 sm:h-20 md:h-24 flex flex-col gap-2 sm:gap-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group w-full">
                      <div className="p-2 sm:p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Package className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-blue-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium">Revisar Pedido</span>
                    </Button>
                  </Link>
                  <Link href="/venezuela/soporte">
                    <Button variant="outline" className="h-16 sm:h-20 md:h-24 flex flex-col gap-2 sm:gap-3 hover:bg-green-50 hover:border-green-300 transition-all duration-300 group w-full">
                      <div className="p-2 sm:p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-green-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium">Chat Soporte</span>
                    </Button>
                  </Link>
                  <Link href="/venezuela/tracking">
                    <Button variant="outline" className="h-16 sm:h-20 md:h-24 flex flex-col gap-2 sm:gap-3 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 group w-full">
                      <div className="p-2 sm:p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-purple-600" />
                      </div>
                      <span className="text-xs sm:text-sm font-medium">Actualizar Tracking</span>
                    </Button>
                  </Link>
                  <Button variant="outline" className="h-16 sm:h-20 md:h-24 flex flex-col gap-2 sm:gap-3 hover:bg-red-50 hover:border-red-300 transition-all duration-300 group w-full">
                    <div className="p-2 sm:p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-red-600" />
                    </div>
                    <span className="text-xs sm:text-sm font-medium">Validar Pago</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
              </main>
      </div>

      {/* Layout Tablet */}
      <div className="hidden md:flex lg:hidden min-h-screen overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar 
          isExpanded={sidebarExpanded} 
          setIsExpanded={setSidebarExpanded}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
          userRole="venezuela"
        />
        
        <main className="w-full flex-1">
          <Header 
            notifications={stats.pendingOrders + stats.activeChats}
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title="Panel Venezuela"
            subtitle="Revisión de pedidos, soporte al cliente y tracking"
          />
          
          <div className="p-5 space-y-6">
            {/* Header del Dashboard con Bienvenida */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">¡Bienvenido de vuelta!</h2>
                    <p className="text-blue-100 text-base">Panel de Control - Empleado Venezuela</p>
                    <p className="text-blue-200 mt-2 text-sm">Gestiona pedidos, soporte y tracking desde un solo lugar</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold">{pedidosPendientes + pedidosTracking}</div>
                    <p className="text-blue-100 text-sm">Tareas Pendientes</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Principal */}
            <div className="space-y-6">
              {/* Estadísticas Principales */}
              <div className="grid grid-cols-2 gap-5">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">Pedidos Pendientes</CardTitle>
                    <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">{pedidosPendientes}</div>
                    <p className="text-xs text-blue-700">Esperando revisión</p>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(pedidosPendientes / (pedidosPendientes + pedidosTracking)) * 100}%`}}></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Chats Activos</CardTitle>
                    <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">{stats.activeChats}</div>
                    <p className="text-xs text-green-700">Clientes en línea</p>
                    <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${(stats.activeChats / 5) * 100}%`}}></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-800">Tracking Activo</CardTitle>
                    <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900">{pedidosTracking}</div>
                    <p className="text-xs text-purple-700">Pendientes</p>
                    <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(pedidosTracking / (pedidosPendientes + pedidosTracking)) * 100}%`}}></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-800">Satisfacción</CardTitle>
                    <div className="p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-900">{promedioReputacion}/5</div>
                    <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: `${(promedioReputacion / 5) * 100}%`}}></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Acciones Rápidas */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
                  <p className="text-sm text-slate-600">Accede rápidamente a las funciones más utilizadas</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-5">
                    <Link href="/venezuela/pedidos">
                      <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group w-full">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">Revisar Pedido</span>
                      </Button>
                    </Link>
                    <Link href="/venezuela/soporte">
                      <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-green-50 hover:border-green-300 transition-all duration-300 group w-full">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                          <MessageSquare className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">Chat Soporte</span>
                      </Button>
                    </Link>
                    <Link href="/venezuela/tracking">
                      <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 group w-full">
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <MapPin className="h-6 w-6 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium">Actualizar Tracking</span>
                      </Button>
                    </Link>
                    <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-red-50 hover:border-red-300 transition-all duration-300 group w-full">
                      <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                        <DollarSign className="h-6 w-6 text-red-600" />
                      </div>
                      <span className="text-sm font-medium">Validar Pago</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Layout Mobile */}
      <div className="md:hidden min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Sidebar 
          isExpanded={sidebarExpanded} 
          setIsExpanded={setSidebarExpanded}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
          userRole="venezuela"
        />
        
        <main className="w-full">
          <Header 
            notifications={stats.pendingOrders + stats.activeChats}
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title="Panel Venezuela"
            subtitle="Revisión de pedidos, soporte al cliente y tracking"
          />
          
          <div className="p-4 space-y-6">
            {/* Header del Dashboard con Bienvenida */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col gap-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">¡Bienvenido de vuelta!</h2>
                    <p className="text-blue-100 text-base">Panel de Control - Empleado Venezuela</p>
                    <p className="text-blue-200 mt-2 text-sm">Gestiona pedidos, soporte y tracking desde un solo lugar</p>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl font-bold">{pedidosPendientes + pedidosTracking}</div>
                      <p className="text-blue-100 text-sm">Tareas Pendientes</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dashboard Principal */}
            <div className="space-y-6">
              {/* Estadísticas Principales */}
              <div className="grid grid-cols-1 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-blue-800">Pedidos Pendientes</CardTitle>
                    <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Package className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-900">{pedidosPendientes}</div>
                    <p className="text-xs text-blue-700">Esperando revisión</p>
                    <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(pedidosPendientes / (pedidosPendientes + pedidosTracking)) * 100}%`}}></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-green-800">Chats Activos</CardTitle>
                    <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                      <MessageSquare className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-900">{stats.activeChats}</div>
                    <p className="text-xs text-green-700">Clientes en línea</p>
                    <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${(stats.activeChats / 5) * 100}%`}}></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-purple-800">Tracking Activo</CardTitle>
                    <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                      <MapPin className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-900">{pedidosTracking}</div>
                    <p className="text-xs text-purple-700">Pendientes</p>
                    <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(pedidosTracking / (pedidosPendientes + pedidosTracking)) * 100}%`}}></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 group">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-orange-800">Satisfacción</CardTitle>
                    <div className="p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-900">{promedioReputacion}/5</div>
                    <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full" style={{width: `${(promedioReputacion / 5) * 100}%`}}></div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Acciones Rápidas */}
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Acciones Rápidas</CardTitle>
                  <p className="text-sm text-slate-600">Accede rápidamente a las funciones más utilizadas</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/venezuela/pedidos">
                      <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group w-full">
                        <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                          <Package className="h-6 w-6 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium">Revisar Pedido</span>
                      </Button>
                    </Link>
                    <Link href="/venezuela/soporte">
                      <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-green-50 hover:border-green-300 transition-all duration-300 group w-full">
                        <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                          <MessageSquare className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="text-sm font-medium">Chat Soporte</span>
                      </Button>
                    </Link>
                    <Link href="/venezuela/tracking">
                      <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 group w-full">
                        <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                          <MapPin className="h-6 w-6 text-purple-600" />
                        </div>
                        <span className="text-sm font-medium">Actualizar Tracking</span>
                      </Button>
                    </Link>
                    <Button variant="outline" className="h-20 flex flex-col gap-2 hover:bg-red-50 hover:border-red-300 transition-all duration-300 group w-full">
                      <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                        <DollarSign className="h-6 w-6 text-red-600" />
                      </div>
                      <span className="text-sm font-medium">Validar Pago</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </>
  );
} 