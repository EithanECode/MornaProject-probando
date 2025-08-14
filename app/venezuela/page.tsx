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
        
        <div className="p-6 space-y-6">
          {/* Header del Dashboard */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Panel de Venezuela
              </h1>
              <p className="text-sm text-slate-600">
                Revisión de pedidos, soporte al cliente y tracking
              </p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              Empleado Venezuela
            </Badge>
          </div>

                    {/* Dashboard Principal */}
          <div className="space-y-6">
              {/* Estadísticas Principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingOrders}</div>
                <p className="text-xs text-slate-600">Esperando revisión</p>
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
                    <CardTitle className="text-sm font-medium">Satisfacción</CardTitle>
                    <Star className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageRating}/5</div>
                    <p className="text-xs text-slate-600">{stats.satisfactionRate} satisfechos</p>
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
                  <Package className="h-6 w-6" />
                  <span className="text-sm">Revisar Pedido</span>
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
                        <span className="font-medium">{stats.averageRating}/5</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(stats.averageRating/5)*100}%` }}></div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tiempo promedio de respuesta</span>
                        <span className="font-medium">{stats.responseTime}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tasa de satisfacción</span>
                        <span className="font-medium">{stats.satisfactionRate}</span>
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
                                        <div className="flex items-center gap-3 p-2 rounded-lg bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">{stats.pendingOrders} pedidos requieren revisión</span>
                  </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-blue-50">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{stats.activeChats} chats requieren atención</span>
                      </div>
                      <div className="flex items-center gap-3 p-2 rounded-lg bg-green-50">
                        <Truck className="h-4 w-4 text-green-600" />
                        <span className="text-sm">{stats.trackingUpdates} actualizaciones pendientes</span>
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
        </div>
      </main>
    </div>
  );
} 