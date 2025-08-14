'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
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
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
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

  if (!mounted) return null;

  return (
    <div className={`min-h-screen flex overflow-x-hidden ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <Sidebar 
        isExpanded={sidebarExpanded} 
        setIsExpanded={setSidebarExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        userRole="venezuela"
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-24 w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={stats.pendingOrders + stats.activeChats}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Panel Venezuela"
          subtitle="Revisión de pedidos, soporte al cliente y tracking"
        />
        
        <div className="p-6 space-y-8">
          {/* Header del Dashboard con Bienvenida */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">¡Bienvenido de vuelta!</h2>
                  <p className="text-blue-100 text-lg">Panel de Control - Empleado Venezuela</p>
                  <p className="text-blue-200 mt-2">Gestiona pedidos, soporte y tracking desde un solo lugar</p>
                </div>
                <div className="hidden lg:flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{stats.pendingOrders + stats.activeChats}</div>
                    <p className="text-blue-100">Tareas Pendientes</p>
                  </div>
                  <div className="w-px h-16 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">98%</div>
                    <p className="text-blue-100">Eficiencia</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Principal */}
          <div className="space-y-8">
            {/* Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Pedidos Pendientes</CardTitle>
                  <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{stats.pendingOrders}</div>
                  <p className="text-xs text-blue-700">Esperando revisión</p>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(stats.pendingOrders / 10) * 100}%`}}></div>
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
                  <div className="text-3xl font-bold text-green-900">{stats.activeChats}</div>
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
                  <div className="text-3xl font-bold text-purple-900">{stats.trackingUpdates}</div>
                  <p className="text-xs text-purple-700">Pendientes</p>
                  <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(stats.trackingUpdates / 8) * 100}%`}}></div>
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
                  <div className="text-3xl font-bold text-orange-900">{stats.averageRating}/5</div>
                  <p className="text-xs text-orange-700">{stats.satisfactionRate} satisfechos</p>
                  <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: `${(stats.averageRating / 5) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Acciones Rápidas */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Acciones Rápidas</CardTitle>
                <p className="text-sm text-slate-600">Accede rápidamente a las funciones más utilizadas</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <Button variant="outline" className="h-24 flex flex-col gap-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group">
                    <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">Revisar Pedido</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-3 hover:bg-green-50 hover:border-green-300 transition-all duration-300 group">
                    <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                      <MessageSquare className="h-8 w-8 text-green-600" />
                    </div>
                    <span className="text-sm font-medium">Chat Soporte</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-3 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 group">
                    <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                      <MapPin className="h-8 w-8 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Actualizar Tracking</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex flex-col gap-3 hover:bg-red-50 hover:border-red-300 transition-all duration-300 group">
                    <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                      <Phone className="h-8 w-8 text-red-600" />
                    </div>
                    <span className="text-sm font-medium">Llamar Cliente</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Métricas de Rendimiento y Próximas Acciones */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Métricas de Rendimiento</CardTitle>
                  <p className="text-sm text-slate-600">Tu desempeño en tiempo real</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Satisfacción del cliente</span>
                        <span className="font-bold text-lg">{stats.averageRating}/5</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500" style={{ width: `${(stats.averageRating/5)*100}%` }}></div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                        <div className="text-2xl font-bold text-blue-600">{stats.responseTime}</div>
                        <p className="text-sm text-blue-700">Tiempo de respuesta</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-xl">
                        <div className="text-2xl font-bold text-green-600">{stats.satisfactionRate}</div>
                        <p className="text-sm text-green-700">Tasa de satisfacción</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Próximas Acciones</CardTitle>
                  <p className="text-sm text-slate-600">Tareas que requieren tu atención</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-red-50 to-red-100 border border-red-200">
                      <div className="p-2 bg-red-500 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-red-800">{stats.pendingOrders} pedidos requieren revisión</p>
                        <p className="text-xs text-red-600">Prioridad alta</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                      <div className="p-2 bg-blue-500 rounded-lg">
                        <MessageSquare className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-blue-800">{stats.activeChats} chats requieren atención</p>
                        <p className="text-xs text-blue-600">Clientes esperando</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-green-50 to-green-100 border border-green-200">
                      <div className="p-2 bg-green-500 rounded-lg">
                        <Truck className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-green-800">{stats.trackingUpdates} actualizaciones pendientes</p>
                        <p className="text-xs text-green-600">Tracking activo</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
                      <div className="p-2 bg-purple-500 rounded-lg">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-purple-800">12 clientes nuevos esta semana</p>
                        <p className="text-xs text-purple-600">Crecimiento</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 