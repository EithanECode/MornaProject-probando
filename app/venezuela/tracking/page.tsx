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
import '../../animations/animations.css';
import { 
  MapPin, 
  Truck,
  Search,
  Filter,
  RefreshCw,
  Edit,
  Eye,
  Clock,
  AlertTriangle,
  Package,
  CheckCircle
} from 'lucide-react';

// Tipos
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
  progress: number;
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
const TRACKING_UPDATES: TrackingUpdate[] = [
  {
    id: 'TRK-001',
    orderId: 'ORD-2024-001',
    clientName: 'María González',
    product: 'iPhone 15 Pro Max',
    currentStatus: 'En Tránsito',
    location: 'Miami, FL',
    lastUpdate: 'Hace 2 horas',
    nextStep: 'Llegada a Venezuela',
    estimatedArrival: '2024-01-20',
    needsUpdate: true,
    progress: 75,
    timeline: [
      {
        id: '1',
        status: 'Pedido Creado',
        description: 'Pedido recibido y confirmado',
        location: 'Shanghai, China',
        timestamp: '2024-01-15 10:30',
        completed: true
      },
      {
        id: '2',
        status: 'En Procesamiento',
        description: 'Producto preparado para envío',
        location: 'Shanghai, China',
        timestamp: '2024-01-16 14:20',
        completed: true
      },
      {
        id: '3',
        status: 'Enviado',
        description: 'Paquete enviado desde almacén',
        location: 'Shanghai, China',
        timestamp: '2024-01-17 09:15',
        completed: true
      },
      {
        id: '4',
        status: 'En Tránsito',
        description: 'En camino a Venezuela',
        location: 'Miami, FL',
        timestamp: '2024-01-18 16:45',
        completed: true
      },
      {
        id: '5',
        status: 'En Aduana',
        description: 'Procesando en aduana venezolana',
        location: 'Caracas, Venezuela',
        timestamp: '2024-01-20 11:30',
        completed: false
      },
      {
        id: '6',
        status: 'Entregado',
        description: 'Entregado al cliente',
        location: 'Dirección del cliente',
        timestamp: '2024-01-22 15:00',
        completed: false
      }
    ]
  },
  {
    id: 'TRK-002',
    orderId: 'ORD-2024-002',
    clientName: 'Carlos Pérez',
    product: 'MacBook Air M2',
    currentStatus: 'En Procesamiento',
    location: 'Shanghai, China',
    lastUpdate: 'Hace 1 día',
    nextStep: 'Envío desde China',
    estimatedArrival: '2024-01-25',
    needsUpdate: false,
    progress: 45,
    timeline: [
      {
        id: '1',
        status: 'Pedido Creado',
        description: 'Pedido recibido y confirmado',
        location: 'Shanghai, China',
        timestamp: '2024-01-18 08:45',
        completed: true
      },
      {
        id: '2',
        status: 'En Procesamiento',
        description: 'Producto preparado para envío',
        location: 'Shanghai, China',
        timestamp: '2024-01-19 12:30',
        completed: true
      },
      {
        id: '3',
        status: 'Enviado',
        description: 'Paquete enviado desde almacén',
        location: 'Shanghai, China',
        timestamp: '2024-01-22 10:20',
        completed: false
      },
      {
        id: '4',
        status: 'En Tránsito',
        description: 'En camino a Venezuela',
        location: 'En ruta',
        timestamp: '2024-01-23 14:15',
        completed: false
      },
      {
        id: '5',
        status: 'En Aduana',
        description: 'Procesando en aduana venezolana',
        location: 'Caracas, Venezuela',
        timestamp: '2024-01-25 09:00',
        completed: false
      },
      {
        id: '6',
        status: 'Entregado',
        description: 'Entregado al cliente',
        location: 'Dirección del cliente',
        timestamp: '2024-01-27 16:30',
        completed: false
      }
    ]
  },
  {
    id: 'TRK-003',
    orderId: 'ORD-2024-003',
    clientName: 'Ana Rodríguez',
    product: 'AirPods Pro',
    currentStatus: 'Entregado',
    location: 'Entregado exitosamente',
    lastUpdate: 'Hace 3 días',
    nextStep: 'Completado',
    estimatedArrival: '2024-01-15',
    needsUpdate: false,
    progress: 100,
    timeline: [
      {
        id: '1',
        status: 'Pedido Creado',
        description: 'Pedido recibido y confirmado',
        location: 'Shanghai, China',
        timestamp: '2024-01-10 11:20',
        completed: true
      },
      {
        id: '2',
        status: 'En Procesamiento',
        description: 'Producto preparado para envío',
        location: 'Shanghai, China',
        timestamp: '2024-01-11 15:45',
        completed: true
      },
      {
        id: '3',
        status: 'Enviado',
        description: 'Paquete enviado desde almacén',
        location: 'Shanghai, China',
        timestamp: '2024-01-12 09:30',
        completed: true
      },
      {
        id: '4',
        status: 'En Tránsito',
        description: 'En camino a Venezuela',
        location: 'Miami, FL',
        timestamp: '2024-01-13 13:15',
        completed: true
      },
      {
        id: '5',
        status: 'En Aduana',
        description: 'Procesando en aduana venezolana',
        location: 'Caracas, Venezuela',
        timestamp: '2024-01-14 10:45',
        completed: true
      },
      {
        id: '6',
        status: 'Entregado',
        description: 'Entregado al cliente',
        location: 'Dirección del cliente',
        timestamp: '2024-01-15 14:20',
        completed: true
      }
    ]
  }
];

export default function VenezuelaTrackingPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'En Procesamiento': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Enviado': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'En Tránsito': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'En Aduana': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Entregado': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const filteredTracking = TRACKING_UPDATES.filter(tracking => {
    const matchesSearch = 
      tracking.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tracking.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tracking.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tracking.currentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: TRACKING_UPDATES.length,
    inTransit: TRACKING_UPDATES.filter(t => t.currentStatus === 'En Tránsito').length,
    delivered: TRACKING_UPDATES.filter(t => t.currentStatus === 'Entregado').length,
    needsUpdate: TRACKING_UPDATES.filter(t => t.needsUpdate).length
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
        sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={stats.needsUpdate}
          notificationsRole="venezuela"
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Tracking de Pedidos"
          subtitle="Sigue el estado de los pedidos en tiempo real"
        />
        
        <div className="p-4 md:p-5 lg:p-6 space-y-6">
          {/* Header de la página */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-4 md:p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Tracking de Pedidos</h1>
                <p className="text-purple-100 mt-1 text-sm md:text-base">Sigue el estado de los pedidos en tiempo real</p>
              </div>
              <div className="grid grid-cols-3 md:flex md:items-center md:space-x-4 gap-4">
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs md:text-sm text-purple-100">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{stats.inTransit}</p>
                  <p className="text-xs md:text-sm text-purple-100">En Tránsito</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{stats.delivered}</p>
                  <p className="text-xs md:text-sm text-purple-100">Entregados</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-4">
              <div className="flex flex-col gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <Input
                    placeholder="Buscar por producto, cliente o ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="flex-1 md:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="En Procesamiento">En Procesamiento</SelectItem>
                      <SelectItem value="Enviado">Enviado</SelectItem>
                      <SelectItem value="En Tránsito">En Tránsito</SelectItem>
                      <SelectItem value="En Aduana">En Aduana</SelectItem>
                      <SelectItem value="Entregado">Entregado</SelectItem>
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

          {/* Lista de Tracking */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
            {filteredTracking.map((tracking) => (
              <Card key={tracking.id} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{tracking.product}</CardTitle>
                      <p className="text-sm text-slate-600">{tracking.orderId} - {tracking.clientName}</p>
                    </div>
                    {tracking.needsUpdate && (
                      <Badge className="bg-red-100 text-red-800 border-red-200">
                        Necesita Actualización
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Estado Actual:</span>
                      <Badge className={getStatusColor(tracking.currentStatus)}>
                        {tracking.currentStatus}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Ubicación:</span>
                      <span className="font-medium">{tracking.location}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Última Actualización:</span>
                      <span className="font-medium">{tracking.lastUpdate}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Próximo Paso:</span>
                      <span className="font-medium">{tracking.nextStep}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Llegada Estimada:</span>
                      <span className="font-medium">{tracking.estimatedArrival}</span>
                    </div>
                  </div>

                  {/* Progreso */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progreso</span>
                      <span className="font-bold">{tracking.progress}%</span>
                    </div>
                    <Progress value={tracking.progress} className="h-2" />
                  </div>

                  <div className="flex gap-2">
                    <Button className="bg-blue-600 gap-x-1 text-white hover:bg-blue-700 hover:text-white card-animate-liftbounce flex-1" variant="outline" size="sm">
                      <Eye className="w-4 h-4" /> 
                      <span className="hidden sm:inline">Ver</span>
                      <span className="sm:hidden">Ver</span>
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Actualizar</span>
                      <span className="sm:hidden">Actualizar</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Estado vacío */}
          {filteredTracking.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-8 md:p-12 text-center">
                <MapPin className="w-12 h-12 md:w-16 md:h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2">No hay tracking activo</h3>
                <p className="text-sm md:text-base text-slate-600">Todos los pedidos han sido entregados o no hay coincidencias con los filtros.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
} 