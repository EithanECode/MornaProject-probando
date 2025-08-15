'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import '../../animations/animations.css';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  Eye,
  Search,
  Filter,
  RefreshCw,
  Send,
  Clock,
  AlertTriangle
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

export default function VenezuelaPedidosPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

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
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'reviewing': return 'Revisando';
      case 'quoted': return 'Cotizado';
      case 'sent': return 'Enviado';
      default: return 'Desconocido';
    }
  };

  const filteredOrders = PENDING_ORDERS.filter(order => {
    const matchesSearch = 
      order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: PENDING_ORDERS.filter(o => o.status === 'pending').length,
    reviewing: PENDING_ORDERS.filter(o => o.status === 'reviewing').length,
    quoted: PENDING_ORDERS.filter(o => o.status === 'quoted').length,
    sent: PENDING_ORDERS.filter(o => o.status === 'sent').length
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
          notifications={stats.pending + stats.reviewing}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Revisar Pedidos"
          subtitle="Revisa y envía pedidos a China para cotización"
        />
        
        <div className="p-6 space-y-6">
          {/* Header de la página */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Revisar Pedidos</h1>
                <p className="text-orange-100 mt-1">Revisa y envía pedidos a China para cotización</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-orange-100">Pendientes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.reviewing}</p>
                  <p className="text-sm text-orange-100">Revisando</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.quoted}</p>
                  <p className="text-sm text-orange-100">Cotizados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por cliente, producto o ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="reviewing">Revisando</SelectItem>
                      <SelectItem value="quoted">Cotizado</SelectItem>
                      <SelectItem value="sent">Enviado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Actualizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Pedidos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredOrders.map((order) => (
              <Card key={order.id} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{order.product}</CardTitle>
                      <p className="text-sm text-slate-600">{order.id} - {order.clientName}</p>
                    </div>
                                         <div className="flex gap-2">
                       <Badge className={getStatusColor(order.status)}>
                         {getStatusText(order.status)}
                       </Badge>
                     </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">{order.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>Cantidad:</span>
                      <span className="font-medium">{order.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Recibido de China:</span>
                      <span className="font-medium">{order.receivedFromChina}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Opciones de Envío:</p>
                    <div className="flex gap-2">
                      {order.shippingOptions.map((option, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Opciones de Entrega:</p>
                    <div className="flex gap-2">
                      {order.deliveryOptions.map((option, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {option}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="bg-blue-600 gap-x-1 text-white hover:bg-blue-700 hover:text-white card-animate-liftbounce flex-1" variant="outline" size="sm">
                      <Eye className="w-4 h-4" /> Ver
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar a China
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Estado vacío */}
          {filteredOrders.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay pedidos para revisar</h3>
                <p className="text-slate-600">Todos los pedidos han sido procesados o no hay coincidencias con los filtros.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
} 