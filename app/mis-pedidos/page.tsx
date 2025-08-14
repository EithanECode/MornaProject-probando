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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  MapPin, 
  MessageSquare, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  FileText,
  AlertTriangle,
  Star,
  Heart,
  Download
} from 'lucide-react';

interface Order {
  id: string;
  product: string;
  description: string;
  amount: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  progress: number;
  tracking: string;
  estimatedDelivery: string;
  createdAt: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  documents?: Array<{
    type: 'image' | 'link';
    url: string;
    label: string;
  }>;
}

export default function MisPedidosPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Datos mock de pedidos del cliente
  const [orders] = useState<Order[]>([
    {
      id: 'ORD-2024-001',
      product: 'Smartphone Samsung Galaxy S24',
      description: 'Teléfono inteligente de última generación con cámara de 200MP',
      amount: '$1,250.00',
      status: 'shipped',
      progress: 75,
      tracking: 'TRK-789456123',
      estimatedDelivery: '15 días',
      createdAt: '2024-01-15',
      category: 'Electrónicos',
      priority: 'high',
      documents: [
        { type: 'image', url: '/images/products/samsung-s24.jpg', label: 'Foto del producto' },
        { type: 'link', url: 'https://tracking.example.com/TRK-789456123', label: 'Seguimiento en línea' }
      ]
    },
    {
      id: 'ORD-2024-002',
      product: 'Laptop Dell Inspiron 15',
      description: 'Computadora portátil para trabajo y gaming',
      amount: '$2,450.00',
      status: 'processing',
      progress: 45,
      tracking: 'TRK-456789321',
      estimatedDelivery: '25 días',
      createdAt: '2024-01-20',
      category: 'Computadoras',
      priority: 'medium',
      documents: [
        { type: 'image', url: '/images/products/dell-inspiron.jpg', label: 'Foto del producto' }
      ]
    },
    {
      id: 'ORD-2024-003',
      product: 'Auriculares Sony WH-1000XM5',
      description: 'Auriculares inalámbricos con cancelación de ruido',
      amount: '$350.00',
      status: 'delivered',
      progress: 100,
      tracking: 'TRK-123456789',
      estimatedDelivery: 'Completado',
      createdAt: '2024-01-10',
      category: 'Audio',
      priority: 'low'
    },
    {
      id: 'ORD-2024-004',
      product: 'Smartwatch Apple Watch Series 9',
      description: 'Reloj inteligente con monitor cardíaco',
      amount: '$899.00',
      status: 'pending',
      progress: 10,
      tracking: 'Pendiente',
      estimatedDelivery: '30 días',
      createdAt: '2024-01-25',
      category: 'Wearables',
      priority: 'high'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'shipped': return 'Enviado';
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Media';
      case 'low': return 'Baja';
      default: return 'Normal';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tracking.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    totalSpent: orders.reduce((sum, order) => sum + parseFloat(order.amount.replace('$', '').replace(',', '')), 0)
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className={`min-h-screen flex overflow-x-hidden ${mounted && theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} userRole="client" />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-20 w-[calc(100%-5rem)]'}`}>
        <Header notifications={stats.pending} onMenuToggle={() => setSidebarExpanded(!sidebarExpanded)} />
        
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Mis Pedidos</h1>
              <p className={`text-sm ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Gestiona y sigue el estado de tus pedidos</p>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              {stats.total} Pedidos
            </Badge>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Pedidos</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">En Proceso</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                  </div>
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Enviados</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Gastado</p>
                    <p className="text-2xl font-bold text-green-600">${stats.totalSpent.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y búsqueda */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por producto, ID o tracking..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="processing">En proceso</SelectItem>
                    <SelectItem value="shipped">Enviados</SelectItem>
                    <SelectItem value="delivered">Entregados</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de pedidos */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle>Mis Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <p className="font-medium text-sm">{order.id}</p>
                          <p className="text-xs text-slate-600">{order.product}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                        <Badge className={getPriorityColor(order.priority)}>
                          {getPriorityText(order.priority)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">{order.amount}</p>
                        <p className="text-xs text-slate-600">Tracking: {order.tracking}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso</span>
                        <span>{order.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(order.progress)}`} 
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Entrega estimada: {order.estimatedDelivery}</span>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2"
                            onClick={() => handleViewDetails(order)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver detalles
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Soporte
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredOrders.length === 0 && (
                  <div className="text-center py-10">
                    <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No se encontraron pedidos</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal de detalles del pedido */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          {selectedOrder && (
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalles del Pedido: {selectedOrder.id}</DialogTitle>
                <DialogDescription>
                  Información completa y documentos del pedido
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Producto</p>
                    <p className="text-lg">{selectedOrder.product}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Monto</p>
                    <p className="text-lg font-bold text-green-600">{selectedOrder.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Estado</p>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {getStatusText(selectedOrder.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Tracking</p>
                    <p className="text-sm font-mono">{selectedOrder.tracking}</p>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Descripción</p>
                  <p className="text-sm text-slate-700">{selectedOrder.description}</p>
                </div>

                {/* Progreso */}
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Progreso del pedido</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso actual</span>
                      <span>{selectedOrder.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${getProgressColor(selectedOrder.progress)}`} 
                        style={{ width: `${selectedOrder.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-600">
                      Entrega estimada: {selectedOrder.estimatedDelivery}
                    </p>
                  </div>
                </div>

                {/* Documentos */}
                {selectedOrder.documents && selectedOrder.documents.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">Documentos</p>
                    <div className="space-y-2">
                      {selectedOrder.documents.map((doc, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                          {doc.type === 'image' ? (
                            <FileText className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Download className="h-4 w-4 text-green-600" />
                          )}
                          <span className="text-sm">{doc.label}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 ml-auto">
                            Ver
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contactar Soporte
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Descargar Factura
                  </Button>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </main>
    </div>
  );
} 