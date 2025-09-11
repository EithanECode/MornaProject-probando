'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
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
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Search, 
  Filter,
  Eye,
  Download,
  Share2,
  RefreshCw,
  Calendar,
  Navigation,
  Globe
} from 'lucide-react';

// Tipos
interface TrackingOrder {
  id: string;
  product: string;
  trackingNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'in-transit' | 'delivered' | 'cancelled';
  progress: number;
  estimatedDelivery: string;
  currentLocation: string;
  lastUpdate: string;
  carrier: string;
  timeline: Array<{
    id: string;
    status: string;
    description: string;
    location: string;
    timestamp: string;
    completed: boolean;
  }>;
}

// Datos mock
const TRACKING_ORDERS: TrackingOrder[] = [
  {
    id: 'ORD-2024-001',
    product: 'iPhone 15 Pro Max',
    trackingNumber: 'TRK-789456123',
    status: 'in-transit',
    progress: 75,
    estimatedDelivery: '2024-01-20',
    currentLocation: 'Miami, FL - En tránsito',
    lastUpdate: 'Hace 2 horas',
    carrier: 'DHL Express',
    timeline: [
      {
        id: '1',
        status: 'Pedido Creado',
        description: 'Tu pedido ha sido creado y confirmado',
        location: 'Shanghai, China',
        timestamp: '2024-01-15 10:30',
        completed: true
      },
      {
        id: '2',
        status: 'En Procesamiento',
        description: 'El producto está siendo preparado para envío',
        location: 'Shanghai, China',
        timestamp: '2024-01-16 14:20',
        completed: true
      },
      {
        id: '3',
        status: 'Enviado',
        description: 'El paquete ha sido enviado desde el almacén',
        location: 'Shanghai, China',
        timestamp: '2024-01-17 09:15',
        completed: true
      },
      {
        id: '4',
        status: 'En Tránsito',
        description: 'El paquete está en camino a su destino',
        location: 'Miami, FL',
        timestamp: '2024-01-18 16:45',
        completed: true
      },
      {
        id: '5',
        status: 'En Aduana',
        description: 'El paquete está siendo procesado en aduana',
        location: 'Caracas, Venezuela',
        timestamp: '2024-01-20 11:30',
        completed: false
      },
      {
        id: '6',
        status: 'Entregado',
        description: 'El paquete ha sido entregado exitosamente',
        location: 'Tu dirección',
        timestamp: '2024-01-22 15:00',
        completed: false
      }
    ]
  },
  {
    id: 'ORD-2024-002',
    product: 'MacBook Air M2',
    trackingNumber: 'TRK-987654321',
    status: 'processing',
    progress: 45,
    estimatedDelivery: '2024-01-25',
    currentLocation: 'Shanghai, China - En procesamiento',
    lastUpdate: 'Hace 1 día',
    carrier: 'FedEx',
    timeline: [
      {
        id: '1',
        status: 'Pedido Creado',
        description: 'Tu pedido ha sido creado y confirmado',
        location: 'Shanghai, China',
        timestamp: '2024-01-18 08:45',
        completed: true
      },
      {
        id: '2',
        status: 'En Procesamiento',
        description: 'El producto está siendo preparado para envío',
        location: 'Shanghai, China',
        timestamp: '2024-01-19 12:30',
        completed: true
      },
      {
        id: '3',
        status: 'Enviado',
        description: 'El paquete ha sido enviado desde el almacén',
        location: 'Shanghai, China',
        timestamp: '2024-01-22 10:20',
        completed: false
      },
      {
        id: '4',
        status: 'En Tránsito',
        description: 'El paquete está en camino a su destino',
        location: 'En ruta',
        timestamp: '2024-01-23 14:15',
        completed: false
      },
      {
        id: '5',
        status: 'En Aduana',
        description: 'El paquete está siendo procesado en aduana',
        location: 'Caracas, Venezuela',
        timestamp: '2024-01-25 09:00',
        completed: false
      },
      {
        id: '6',
        status: 'Entregado',
        description: 'El paquete ha sido entregado exitosamente',
        location: 'Tu dirección',
        timestamp: '2024-01-27 16:30',
        completed: false
      }
    ]
  },
  {
    id: 'ORD-2024-003',
    product: 'AirPods Pro',
    trackingNumber: 'TRK-456789123',
    status: 'delivered',
    progress: 100,
    estimatedDelivery: '2024-01-15',
    currentLocation: 'Entregado exitosamente',
    lastUpdate: 'Hace 3 días',
    carrier: 'UPS',
    timeline: [
      {
        id: '1',
        status: 'Pedido Creado',
        description: 'Tu pedido ha sido creado y confirmado',
        location: 'Shanghai, China',
        timestamp: '2024-01-10 11:20',
        completed: true
      },
      {
        id: '2',
        status: 'En Procesamiento',
        description: 'El producto está siendo preparado para envío',
        location: 'Shanghai, China',
        timestamp: '2024-01-11 15:45',
        completed: true
      },
      {
        id: '3',
        status: 'Enviado',
        description: 'El paquete ha sido enviado desde el almacén',
        location: 'Shanghai, China',
        timestamp: '2024-01-12 09:30',
        completed: true
      },
      {
        id: '4',
        status: 'En Tránsito',
        description: 'El paquete está en camino a su destino',
        location: 'Miami, FL',
        timestamp: '2024-01-13 13:15',
        completed: true
      },
      {
        id: '5',
        status: 'En Aduana',
        description: 'El paquete está siendo procesado en aduana',
        location: 'Caracas, Venezuela',
        timestamp: '2024-01-14 10:45',
        completed: true
      },
      {
        id: '6',
        status: 'Entregado',
        description: 'El paquete ha sido entregado exitosamente',
        location: 'Tu dirección',
        timestamp: '2024-01-15 14:20',
        completed: true
      }
    ]
  }
];

export default function TrackingPage() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<TrackingOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Abrir modal automáticamente si viene orderId en query
  useEffect(() => {
    if (!mounted) return;
    const orderId = searchParams?.get('orderId');
    if (orderId) {
      const order = TRACKING_ORDERS.find(o => o.id === orderId);
      if (order) {
        setSelectedOrder(order);
        setTimeout(() => setIsModalOpen(true), 10);
      }
    }
  }, [mounted, searchParams]);

  const openModal = (order: TrackingOrder) => {
    setSelectedOrder(order);
    // Pequeño delay para que se vea la animación de entrada
    setTimeout(() => {
      setIsModalOpen(true);
    }, 10);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setSelectedOrder(null);
    }, 300); // Aumentado para que coincida con la duración de la transición
  };

  const getStatusColor = (status: string) => {
    switch (status) {
  case 'pending': return 'bg-yellow-100 text-yellow-800 border border-yellow-200 hover:bg-yellow-50 hover:ring-1 hover:ring-yellow-200 transition-colors';
  case 'processing': return 'bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-50 hover:ring-1 hover:ring-blue-200 transition-colors';
  case 'shipped': return 'bg-purple-100 text-purple-800 border border-purple-200 hover:bg-purple-50 hover:ring-1 hover:ring-purple-200 transition-colors';
  case 'in-transit': return 'bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-50 hover:ring-1 hover:ring-orange-200 transition-colors';
  case 'delivered': return 'bg-green-100 text-green-800 border border-green-200 hover:bg-green-50 hover:ring-1 hover:ring-green-200 transition-colors';
  case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200 hover:bg-red-50 hover:ring-1 hover:ring-red-200 transition-colors';
  default: return 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-50 hover:ring-1 hover:ring-gray-200 transition-colors';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'shipped': return 'Enviado';
      case 'in-transit': return 'En Tránsito';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const filteredOrders = TRACKING_ORDERS.filter(order => {
    const matchesSearch = 
      order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: TRACKING_ORDERS.length,
    inTransit: TRACKING_ORDERS.filter(o => o.status === 'in-transit').length,
    delivered: TRACKING_ORDERS.filter(o => o.status === 'delivered').length,
    processing: TRACKING_ORDERS.filter(o => o.status === 'processing').length
  };

  if (!mounted) return null;

  return (
    <>
      <div className={`min-h-screen flex overflow-x-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
        <Sidebar 
          isExpanded={sidebarExpanded} 
          setIsExpanded={setSidebarExpanded}
          isMobileMenuOpen={isMobileMenuOpen}
          onMobileMenuClose={() => setIsMobileMenuOpen(false)}
          userRole="client"
        />
        
        <main className={`flex-1 transition-all duration-300 ${
          sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'
        }`}>
          <Header 
            notifications={stats.inTransit} 
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title="Tracking"
            subtitle="Sigue el estado de tus pedidos en tiempo real"
          />
          
          <div className="p-4 md:p-5 lg:p-6 space-y-6 md:space-y-6 lg:space-y-8">
            {/* Header de la página */}
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 md:p-6 text-white">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                <div>
                  <h1 className="text-xl md:text-2xl font-bold">Tracking de Pedidos</h1>
                  <p className="text-purple-100 mt-1 text-xs md:text-sm">Sigue el estado de tus pedidos en tiempo real</p>
                </div>
                <div className="grid grid-cols-3 md:flex md:items-center md:space-x-4 gap-4">
                  <div className="text-center">
                    <p className="text-lg md:text-xl lg:text-2xl font-bold">{stats.total}</p>
                    <p className="text-xs md:text-sm text-purple-100">Total Pedidos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg md:text-xl lg:text-2xl font-bold">{stats.inTransit}</p>
                    <p className="text-xs md:text-sm text-purple-100">En Tránsito</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg md:text-xl lg:text-2xl font-bold">{stats.delivered}</p>
                    <p className="text-xs md:text-sm text-purple-100">Entregados</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros y búsqueda - toolbar compacta, alineada a la derecha */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="hidden md:block">
                    <CardTitle className="text-sm font-medium text-slate-700">Filtros</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar por número de tracking, producto o ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="h-10 w-56 md:w-64 pl-10"
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="h-10 w-36 md:w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="processing">Procesando</SelectItem>
                        <SelectItem value="shipped">Enviado</SelectItem>
                        <SelectItem value="in-transit">En Tránsito</SelectItem>
                        <SelectItem value="delivered">Entregado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" className="h-10 px-3 flex items-center gap-2">
                      <RefreshCw className="w-4 h-4" />
                      <span className="hidden md:inline">Actualizar</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Lista de pedidos */}
            <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {filteredOrders.map((order) => (
                <Card key={order.id} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                      <div>
                        <CardTitle className="text-base md:text-lg">{order.product}</CardTitle>
                        <p className="text-xs md:text-sm text-slate-600">{order.id}</p>
                      </div>
                      <Badge className={`${getStatusColor(order.status)} text-xs md:text-sm`}>
                        {getStatusText(order.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Información de tracking */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="text-slate-600">Número de Tracking:</span>
                        <span className="font-mono font-medium">{order.trackingNumber}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="text-slate-600">Empresa de encomienda:</span>
                        <span className="font-medium">{order.carrier}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="text-slate-600">Entrega Estimada:</span>
                        <span className="font-medium">{order.estimatedDelivery}</span>
                      </div>
                    </div>

                    {/* Progreso */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs md:text-sm">
                        <span className="text-slate-600">Progreso</span>
                        <span className="font-bold">{order.progress}%</span>
                      </div>
                      <Progress value={order.progress} className="h-1.5 md:h-2" />
                    </div>

                    {/* Ubicación actual */}
                    <div className="flex items-center space-x-2 p-3 bg-slate-50 rounded-lg">
                      <MapPin className="w-4 h-4 text-blue-600" />
                      <div className="flex-1">
                        <p className="text-xs md:text-sm font-medium">{order.currentLocation}</p>
                        <p className="text-xs text-slate-500">{order.lastUpdate}</p>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1 text-xs"
                        onClick={() => openModal(order)}
                      >
                        <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                        Ver Detalles
                      </Button>
                      <Button variant="outline" size="sm" className="text-xs">
                        <Share2 className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de detalles - Fuera del layout principal */}
      {selectedOrder && (
        <div 
          className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
            isModalOpen 
              ? 'bg-black/50 backdrop-blur-sm opacity-100' 
              : 'bg-black/0 backdrop-blur-none opacity-0'
          }`}
          onClick={closeModal}
        >
          <div 
            className={`bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ease-out transform ${
              isModalOpen 
                ? 'scale-100 opacity-100 translate-y-0' 
                : 'scale-95 opacity-0 translate-y-8'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedOrder.product}</h2>
                  <p className="text-slate-600">{selectedOrder.id}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={closeModal}
                >
                  ✕
                </Button>
              </div>

              {/* Información del tracking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Número de Tracking</p>
                  <p className="font-mono font-medium">{selectedOrder.trackingNumber}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Empresa de encomienda</p>
                  <p className="font-medium">{selectedOrder.carrier}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Entrega Estimada</p>
                  <p className="font-medium">{selectedOrder.estimatedDelivery}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Estado Actual</p>
                  <Badge className={getStatusColor(selectedOrder.status)}>
                    {getStatusText(selectedOrder.status)}
                  </Badge>
                </div>
              </div>

              {/* Timeline */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Historial de Seguimiento</h3>
                <div className="space-y-4">
                  {selectedOrder.timeline.map((step, index) => (
                    <div key={step.id} className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-slate-200 text-slate-600'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{step.status}</p>
                        <p className="text-sm text-slate-600">{step.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-500">{step.location}</span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-500">{step.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

