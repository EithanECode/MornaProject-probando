'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
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
// ...existing code...


// Tipos para los pedidos reales
interface Order {
  id: string;
  quantity: number;
  productName: string;
  deliveryType: string;
  shippingType: string;
  state: number;
  clientName: string;
  client_id: string;
  description?: string;
  pdfRoutes?: string;
}


export default function VenezuelaPedidosPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener pedidos (puede ser llamada desde useEffect y desde el botón)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      const empleadoId = user?.id;
      if (!empleadoId) throw new Error('No se pudo obtener el usuario logueado');
      const res = await fetch(`/venezuela/pedidos/api/orders?asignedEVzla=${empleadoId}`);
      if (!res.ok) throw new Error('Error al obtener pedidos');
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchOrders();
  }, []);

  // Filtros: búsqueda y estado
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.id !== undefined && order.id !== null && order.id.toString().toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && order.state === 1) ||
      (statusFilter === 'reviewing' && order.state === 2) ||
      (statusFilter === 'quoted' && order.state === 3) ||
      (statusFilter === 'processing' && order.state === 4);
    return matchesSearch && matchesStatus;
  });

  // Ordenar: siempre los de estado 1 primero
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const wa = a.state === 1 ? 0 : 1;
    const wb = b.state === 1 ? 0 : 1;
    if (wa !== wb) return wa - wb;
    return 0;
  });

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
      
      <main className={`transition-all duration-300 flex-1 ${
        sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={0}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Pedidos"
          subtitle="Revisa y envía pedidos a China para cotización"
        />
        
        <div className="p-4 md:p-5 lg:p-6 space-y-6">
          {/* Header de la página */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-4 md:p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Pedidos</h1>
                <p className="text-orange-100 mt-1 text-sm md:text-base">Revisa y envía pedidos a China para cotización</p>
              </div>
              <div className="grid grid-cols-2 md:flex md:items-center md:space-x-4 gap-4">
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{orders.filter(o => o.state === 1).length}</p>
                  <p className="text-xs md:text-sm text-orange-100">PENDIENTES</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{orders.filter(o => o.state === 2).length}</p>
                  <p className="text-xs md:text-sm text-orange-100">REVISANDO</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{orders.filter(o => o.state === 3).length}</p>
                  <p className="text-xs md:text-sm text-orange-100">COTIZADOS</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{orders.filter(o => o.state === 4).length}</p>
                  <p className="text-xs md:text-sm text-orange-100">PROCESANDO</p>
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
                    placeholder="Buscar por cliente, producto o ID..."
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
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="reviewing">Revisando</SelectItem>
                      <SelectItem value="quoted">Cotizado</SelectItem>
                      <SelectItem value="processing">Procesando</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="flex items-center gap-2" onClick={fetchOrders} disabled={loading}>
                    <RefreshCw className="w-4 h-4" />
                    {loading ? 'Actualizando...' : 'Actualizar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Lista de Pedidos desde backend */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
            {loading ? (
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                <CardContent className="p-12 text-center">Cargando pedidos...</CardContent>
              </Card>
            ) : error ? (
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                <CardContent className="p-12 text-center text-red-600">{error}</CardContent>
              </Card>
            ) : filteredOrders.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay pedidos para revisar</h3>
                  <p className="text-slate-600">Todos los pedidos han sido procesados o no hay coincidencias con los filtros.</p>
                </CardContent>
              </Card>
                        ) : (
                          sortedOrders.map((order) => (
                            <Card key={order.id} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                              <CardHeader>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <CardTitle className="text-lg">{order.productName}</CardTitle>
                                    <p className="text-sm text-slate-600">{order.id} - {order.clientName}</p>
                                  </div>
                                  <div className="flex gap-2">
                                    {order.state === 1 && (
                                      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">PENDIENTE</Badge>
                                    )}
                                    {order.state === 2 && (
                                      <Badge className="bg-green-100 text-green-800 border-green-200">REVISANDO</Badge>
                                    )}
                                    {order.state === 3 && (
                                      <Badge className="bg-purple-100 text-purple-800 border-purple-200">COTIZADO</Badge>
                                    )}
                                    {order.state === 4 && (
                                      <Badge className="bg-blue-100 text-blue-800 border-blue-200">PROCESANDO</Badge>
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Cantidad:</span>
                                    <span className="font-medium">{order.quantity}</span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Tipo de Entrega:</span>
                                    <span className="font-medium">
                                      {order.deliveryType === 'office' && 'Oficina'}
                                      {order.deliveryType === 'warehouse' && 'Almacén'}
                                      {order.deliveryType !== 'office' && order.deliveryType !== 'warehouse' && order.deliveryType}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between text-sm">
                                    <span>Tipo de Envío:</span>
                                    <span className="font-medium">
                                      {order.shippingType === 'doorToDoor' && 'Puerta A Puerta'}
                                      {order.shippingType === 'maritime' && 'Marítimo'}
                                      {order.shippingType === 'air' && 'Aéreo'}
                                      {order.shippingType !== 'doorToDoor' && order.shippingType !== 'maritime' && order.shippingType !== 'air' && order.shippingType}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    className="bg-blue-600 gap-x-1 text-white hover:bg-blue-700 hover:text-white card-animate-liftbounce flex-1"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (order.pdfRoutes) {
                                        const win = window.open(order.pdfRoutes, '_blank');
                                        if (!win) {
                                          alert('No se pudo abrir el PDF. Verifica que tu navegador no esté bloqueando ventanas emergentes.');
                                        }
                                      } else {
                                        alert('No hay PDF disponible para este pedido.');
                                      }
                                    }}
                                  >
                                    <Eye className="w-4 h-4" /> Ver
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="flex-1"
                                    disabled={order.state !== 1 || loading}
                                    onClick={async () => {
                                      if (order.state !== 1) return;
                                      try {
                                        const res = await fetch('/venezuela/pedidos/api/send-to-china', {
                                          method: 'PATCH',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ orderId: order.id })
                                        });
                                        if (!res.ok) {
                                          const err = await res.json().catch(() => ({}));
                                          throw new Error(err.error || 'No se pudo actualizar el pedido');
                                        }
                                        await fetchOrders();
                                      } catch (err) {
                                        console.error(err);
                                        alert((err as Error).message || 'Error al enviar a China');
                                      }
                                    }}
                                  >
                                    <Send className="w-4 h-4 mr-2" />
                                    Enviar a China
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  </main>
                </div>
              );
            }