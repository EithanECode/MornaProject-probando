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
import { AlertTriangle, Boxes, Calendar, CheckCircle, Clock, Eye, Filter, List, Package, RefreshCw, Search, Send } from 'lucide-react';
export default function VenezuelaPedidosPage() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  type Order = {
    id: string | number;
    quantity: number;
    productName: string;
    deliveryType?: string;
    shippingType?: string;
    state: number;
    clientName: string;
    client_id?: string;
    description?: string;
    pdfRoutes?: string;
  };
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs: pedidos | cajas | contenedores
  const [activeTab, setActiveTab] = useState<'pedidos' | 'cajas' | 'contenedores'>('pedidos');

  // Cajas state
  type BoxItem = { boxes_id?: number | string; id?: number | string; box_id?: number | string; container_id?: number | string; state?: number; creation_date?: string; created_at?: string };
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [boxesLoading, setBoxesLoading] = useState(false);
  const [filtroCaja, setFiltroCaja] = useState('');
  const [orderCountsByBoxMain, setOrderCountsByBoxMain] = useState<Record<string | number, number>>({});
  const [ordersByBox, setOrdersByBox] = useState<Order[]>([]);
  const [ordersByBoxLoading, setOrdersByBoxLoading] = useState(false);
  // Modal para ver pedidos de una caja
  const [modalVerPedidos, setModalVerPedidos] = useState<{ open: boolean; boxId?: number | string }>({ open: false });

  // Contenedores state
  type ContainerItem = { containers_id?: number | string; id?: number | string; container_id?: number | string; state?: number; creation_date?: string; created_at?: string };
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [containersLoading, setContainersLoading] = useState(false);
  const [filtroContenedor, setFiltroContenedor] = useState('');
  const [boxesByContainer, setBoxesByContainer] = useState<BoxItem[]>([]);
  const [boxesByContainerLoading, setBoxesByContainerLoading] = useState(false);
  const [orderCountsByBox, setOrderCountsByBox] = useState<Record<string | number, number>>({});
  const [modalVerCajas, setModalVerCajas] = useState<{ open: boolean; containerId?: number | string }>({ open: false });

  // Función para obtener pedidos (puede ser llamada desde useEffect y desde el botón)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      const empleadoId = user?.id;
      if (!empleadoId) throw new Error('No se pudo obtener el usuario logueado');
      const res = await fetch(`/venezuela/pedidos/api/orders?asignedEVzla=${encodeURIComponent(String(empleadoId))}`, { cache: 'no-store' });
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

  // Carga cajas/contenedores al cambiar de pestaña
  useEffect(() => {
    if (activeTab === 'cajas') fetchBoxes();
    if (activeTab === 'contenedores') fetchContainers();
  }, [activeTab]);

  // Fetch boxes
  const fetchBoxes = async () => {
    setBoxesLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.from('boxes').select('*');
      if (error) throw error;
      const list = (data || []) as BoxItem[];
      list.sort((a, b) => {
        const da = new Date((a.creation_date ?? a.created_at ?? '') as string).getTime() || 0;
        const db = new Date((b.creation_date ?? b.created_at ?? '') as string).getTime() || 0;
        return db - da;
      });
      setBoxes(list);
      // counts
      const ids = list.map(b => b.box_id ?? b.boxes_id ?? (b as any).id).filter(v => v !== undefined && v !== null);
      if (ids.length > 0) {
        const { data: ordersData, error: err2 } = await supabase.from('orders').select('id, box_id').in('box_id', ids as any);
        if (!err2) {
          const counts: Record<string | number, number> = {};
          (ordersData || []).forEach((row: any) => {
            const key = row.box_id as string | number;
            counts[key] = (counts[key] || 0) + 1;
          });
          setOrderCountsByBoxMain(counts);
        } else {
          setOrderCountsByBoxMain({});
        }
      } else setOrderCountsByBoxMain({});
    } catch (e) {
      console.error('Error fetchBoxes:', e);
    } finally {
      setBoxesLoading(false);
    }
  };

  // Fetch containers
  const fetchContainers = async () => {
    setContainersLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.from('containers').select('*');
      if (error) throw error;
      const list = (data || []) as ContainerItem[];
      list.sort((a, b) => {
        const da = new Date((a.creation_date ?? a.created_at ?? '') as string).getTime() || 0;
        const db = new Date((b.creation_date ?? b.created_at ?? '') as string).getTime() || 0;
        return db - da;
      });
      setContainers(list);
    } catch (e) {
      console.error('Error fetchContainers:', e);
    } finally {
      setContainersLoading(false);
    }
  };

  // Fetch orders by box
  const fetchOrdersByBoxId = async (boxId: number | string) => {
    setOrdersByBoxLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.from('orders').select('*').eq('box_id', boxId);
      if (error) throw error;
      const mapped: Order[] = (data || []).map((o: any) => ({
        id: String(o.id),
        quantity: Number(o.quantity || 0),
        productName: o.productName || o.product || '—',
        deliveryType: o.deliveryType || '',
        shippingType: o.shippingType || '',
        state: Number(o.state || 0),
        clientName: o.clientName || o.client || '—',
        client_id: o.client_id || '',
        description: o.specifications || '',
        pdfRoutes: o.pdfRoutes || ''
      }));
      setOrdersByBox(mapped);
    } catch (e) {
      console.error('Error fetchOrdersByBoxId:', e);
    } finally {
      setOrdersByBoxLoading(false);
    }
  };

  // Fetch boxes by container
  const fetchBoxesByContainerId = async (containerId: number | string) => {
    setBoxesByContainerLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.from('boxes').select('*').eq('container_id', containerId);
      if (error) throw error;
      const list = (data || []) as BoxItem[];
      list.sort((a, b) => {
        const da = new Date((a.creation_date ?? a.created_at ?? '') as string).getTime() || 0;
        const db = new Date((b.creation_date ?? b.created_at ?? '') as string).getTime() || 0;
        return db - da;
      });
      setBoxesByContainer(list);
      const ids = list.map(b => b.box_id ?? b.boxes_id ?? (b as any).id).filter(v => v !== undefined && v !== null);
      if (ids.length > 0) {
        const { data: ordersData, error: err2 } = await supabase.from('orders').select('id, box_id').in('box_id', ids as any);
        if (!err2) {
          const counts: Record<string | number, number> = {};
          (ordersData || []).forEach((row: any) => {
            const key = row.box_id as string | number;
            counts[key] = (counts[key] || 0) + 1;
          });
          setOrderCountsByBox(counts);
        } else setOrderCountsByBox({});
      } else setOrderCountsByBox({});
    } catch (e) {
      console.error('Error fetchBoxesByContainerId:', e);
    } finally {
      setBoxesByContainerLoading(false);
    }
  };

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
          <div className="space-y-4">
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white">Pedidos</h1>
              <p className="text-sm md:text-base text-slate-600 dark:text-slate-300">Revisa y envía pedidos a China para cotización</p>
            </div>
            
            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm md:text-base font-medium text-yellow-700 dark:text-yellow-300">PENDIENTES</p>
                      <p className="text-2xl md:text-3xl font-bold text-yellow-800 dark:text-yellow-200">
                        {orders.filter(o => o.state === 1).length}
                      </p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-800/30 rounded-lg flex items-center justify-center">
                      <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm md:text-base font-medium text-green-700 dark:text-green-300">REVISANDO</p>
                      <p className="text-2xl md:text-3xl font-bold text-green-800 dark:text-green-200">
                        {orders.filter(o => o.state === 2).length}
                      </p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-800/30 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-700">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm md:text-base font-medium text-purple-700 dark:text-purple-300">COTIZADOS</p>
                      <p className="text-2xl md:text-3xl font-bold text-purple-800 dark:text-purple-200">
                        {orders.filter(o => o.state === 3).length}
                      </p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-800/30 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm md:text-base font-medium text-blue-700 dark:text-blue-300">PROCESANDO</p>
                      <p className="text-2xl md:text-3xl font-bold text-blue-800 dark:text-blue-200">
                        {orders.filter(o => o.state === 4).length}
                      </p>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-800/30 rounded-lg flex items-center justify-center">
                      <Send className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            {/* Tabs: Pedidos | Cajas | Contenedores (debajo de estadísticas) */}
            <div className="flex justify-start pt-2">
              <div className="inline-flex rounded-lg border border-slate-200 bg-white/70 backdrop-blur px-1 py-1 shadow-sm">
                <Button
                  variant={activeTab === 'pedidos' ? 'default' : 'ghost'}
                  size="sm"
                  className={`rounded-md transition-colors ${activeTab === 'pedidos' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setActiveTab('pedidos')}
                >
                  Lista de pedidos
                </Button>
                <Button
                  variant={activeTab === 'cajas' ? 'default' : 'ghost'}
                  size="sm"
                  className={`rounded-md transition-colors ${activeTab === 'cajas' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setActiveTab('cajas')}
                >
                  Cajas
                </Button>
                <Button
                  variant={activeTab === 'contenedores' ? 'default' : 'ghost'}
                  size="sm"
                  className={`rounded-md transition-colors ${activeTab === 'contenedores' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setActiveTab('contenedores')}
                >
                  Contenedores
                </Button>
              </div>
            </div>
          </div>
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-4">
              {activeTab === 'pedidos' ? (
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input placeholder="Buscar por cliente, producto o ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                  </div>
                  <div className="flex gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter as any}>
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
                    <Button variant="outline" className="flex items-center gap-2 ml-auto" onClick={fetchOrders} disabled={loading}>
                      <RefreshCw className="w-4 h-4" />
                      {loading ? 'Actualizando...' : 'Actualizar'}
                    </Button>
                  </div>
                </div>
              ) : activeTab === 'cajas' ? (
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por caja (ID)..."
                      value={filtroCaja}
                      onChange={(e) => setFiltroCaja(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2 ml-auto" onClick={fetchBoxes} disabled={boxesLoading}>
                      <RefreshCw className="w-4 h-4" />
                      {boxesLoading ? 'Actualizando...' : 'Actualizar'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por contenedor (ID)..."
                      value={filtroContenedor}
                      onChange={(e) => setFiltroContenedor(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex items-center gap-2 ml-auto" onClick={fetchContainers} disabled={containersLoading}>
                      <RefreshCw className="w-4 h-4" />
                      {containersLoading ? 'Actualizando...' : 'Actualizar'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>


          {/* Contenido por pestaña */}
          {activeTab === 'pedidos' && (
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
                sortedOrders.map((order) => {
                  const stateNum = Number(order.state);
                  return (
                    <Card key={order.id} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{order.productName}</CardTitle>
                            <p className="text-sm text-slate-600">{order.id} - {order.clientName}</p>
                          </div>
                          <div className="flex gap-2">
                            {stateNum === 13 && (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">ENTREGADO</Badge>
                            )}
                            {stateNum === 12 && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">LISTO PARA ENTREGA</Badge>
                            )}
                            {stateNum === 11 && (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">RECIBIDO</Badge>
                            )}
                            {stateNum === 10 && (
                              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">EN ADUANA</Badge>
                            )}
                            {stateNum === 9 && (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">LLEGÓ A Vzla</Badge>
                            )}
                            {stateNum === 8 && (
                              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">EN CAMINO A Vzla</Badge>
                            )}
                            {stateNum === 1 && (
                              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">PENDIENTE</Badge>
                            )}
                            {stateNum === 2 && (
                              <Badge className="bg-green-100 text-green-800 border-green-200">REVISANDO</Badge>
                            )}
                            {stateNum === 3 && (
                              <Badge className="bg-purple-100 text-purple-800 border-purple-200">COTIZADO</Badge>
                            )}
                            {stateNum === 4 && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-200">PROCESANDO</Badge>
                            )}
                            {(stateNum >= 5 && stateNum <= 7) && (
                              <Badge className="bg-gray-100 text-gray-800 border-gray-200">EN PROCESO</Badge>
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
                            disabled={loading || ![1,8,11,12].includes(stateNum)}
                            onClick={async () => {
                              if (stateNum === 1) {
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
                                return;
                              }
                              if (stateNum === 8) {
                                // Marcar como recibido (enviado -> estado 9)
                                try {
                                  const res = await fetch('/venezuela/pedidos/api/advance-state', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ orderId: order.id, nextState: 9 })
                                  });
                                  if (!res.ok) {
                                    const err = await res.json().catch(() => ({}));
                                    throw new Error(err.error || 'No se pudo actualizar el pedido');
                                  }
                                  await fetchOrders();
                                } catch (err) {
                                  console.error(err);
                                  alert((err as Error).message || 'Error al actualizar estado');
                                }
                                return;
                              }
                              if (stateNum === 9) {
                                // Marcar recibido en aduana -> estado 10
                                try {
                                  const res = await fetch('/venezuela/pedidos/api/advance-state', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ orderId: order.id, nextState: 10 })
                                  });
                                  if (!res.ok) {
                                    const err = await res.json().catch(() => ({}));
                                    throw new Error(err.error || 'No se pudo actualizar el pedido');
                                  }
                                  await fetchOrders();
                                } catch (err) {
                                  console.error(err);
                                  alert((err as Error).message || 'Error al actualizar estado');
                                }
                                return;
                              }
                              if (stateNum === 11) {
                                // Pedido recibido después de contenedor -> avanzar a 12
                                try {
                                  const res = await fetch('/venezuela/pedidos/api/advance-state', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ orderId: order.id, nextState: 12 })
                                  });
                                  if (!res.ok) {
                                    const err = await res.json().catch(() => ({}));
                                    throw new Error(err.error || 'No se pudo actualizar el pedido');
                                  }
                                  await fetchOrders();
                                } catch (err) {
                                  console.error(err);
                                  alert((err as Error).message || 'Error al actualizar estado');
                                }
                                return;
                              }
                              if (stateNum === 12) {
                                // Entregar al cliente -> 13
                                try {
                                  const res = await fetch('/venezuela/pedidos/api/advance-state', {
                                    method: 'PATCH',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ orderId: order.id, nextState: 13 })
                                  });
                                  if (!res.ok) {
                                    const err = await res.json().catch(() => ({}));
                                    throw new Error(err.error || 'No se pudo actualizar el pedido');
                                  }
                                  await fetchOrders();
                                } catch (err) {
                                  console.error(err);
                                  alert((err as Error).message || 'Error al actualizar estado');
                                }
                                return;
                              }
                            }}
                          >
                            {stateNum >= 13 ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Entregado
                              </>
                            ) : stateNum === 12 ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Entregado
                              </>
                            ) : stateNum === 11 ? (
                              <>
                                <Package className="w-4 h-4 mr-2" />
                                Recibido
                              </>
                            ) : stateNum === 9 ? (
                              <>
                                <Package className="w-4 h-4 mr-2" />
                                Recibido
                              </>
                            ) : stateNum === 8 ? (
                              <>
                                <Package className="w-4 h-4 mr-2" />
                                Recibido
                              </>
                            ) : stateNum === 10 ? (
                              <>
                                <Clock className="w-4 h-4 mr-2" />
                                En aduana
                              </>
                            ) : (stateNum >= 2 && stateNum <= 7) ? (
                              <>
                                <Clock className="w-4 h-4 mr-2" />
                                Esperando
                              </>
                            ) : (
                              <>
                                <Send className="w-4 h-4 mr-2" />
                                Enviar a China
                              </>
                            )}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'cajas' && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Boxes className="h-5 w-5" />
                    Cajas
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {boxes.length === 0 ? (
                  <div className="text-center py-12">
                    <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No hay cajas</h3>
                    <p className="text-slate-500">No se encontraron cajas.</p>
                  </div>
                ) : boxes.filter((b, idx) => {
                  if (!filtroCaja) return true;
                  const id = b.box_id ?? b.boxes_id ?? b.id ?? idx;
                  return String(id).toLowerCase().includes(filtroCaja.toLowerCase());
                }).length === 0 ? (
                  <div className="text-center py-12">
                    <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron cajas</h3>
                    <p className="text-slate-500">Ajusta la búsqueda por ID.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {boxes.filter((b, idx) => {
                      if (!filtroCaja) return true;
                      const id = b.box_id ?? b.boxes_id ?? b.id ?? idx;
                      return String(id).toLowerCase().includes(filtroCaja.toLowerCase());
                    }).map((box, idx) => {
                      const id = box.box_id ?? box.boxes_id ?? box.id ?? idx;
                      const created = box.creation_date ?? box.created_at ?? '';
                      const stateNum = (box.state ?? 1) as number;
                      const countKey = box.box_id ?? box.boxes_id ?? box.id ?? id;
                      return (
                        <div key={`${id}`} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 rounded-lg">
                              <Boxes className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900">#BOX-{id}</h3>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{created ? new Date(created).toLocaleString('es-ES') : '—'}</span>
                                <span className="flex items-center gap-1"><List className="h-3 w-3" />Pedidos: {orderCountsByBoxMain[countKey as any] ?? 0}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`border ${stateNum === 1 ? 'bg-blue-100 text-blue-800 border-blue-200' : stateNum === 2 ? 'bg-green-100 text-green-800 border-green-200' : (stateNum === 5 || stateNum === 6) ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                              {stateNum === 1 ? 'Nueva' : stateNum === 2 ? 'Empaquetada' : stateNum === 5 ? 'Contenedor recibido' : stateNum === 6 ? 'Recibida' : `Estado ${stateNum}`}
                            </Badge>
                            {/* Botón Recibido: visible solo cuando boxes.state === 5 */}
                            {stateNum === 5 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const res = await fetch('/venezuela/pedidos/api/advance-box', {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ boxId: box.box_id ?? box.boxes_id ?? box.id ?? id, nextState: 6 })
                                    });
                                    if (!res.ok) {
                                      const err = await res.json().catch(() => ({}));
                                      throw new Error(err.error || 'No se pudo actualizar la caja');
                                    }
                                    await Promise.all([fetchBoxes(), fetchOrders()]);
                                  } catch (e) {
                                    alert((e as Error).message || 'Error al actualizar caja');
                                  }
                                }}
                                className="flex items-center gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                title={'Marcar caja como recibida'}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Recibido
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => {
                                const boxId = box.box_id ?? box.boxes_id ?? box.id;
                                setModalVerPedidos({ open: true, boxId });
                                if (boxId !== undefined) fetchOrdersByBoxId(boxId as any);
                              }}
                            >
                              <List className="h-4 w-4" />
                              Ver pedidos
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {boxesLoading && (
                  <p className="text-center text-sm text-slate-500 mt-4">Cargando cajas...</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'contenedores' && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Boxes className="h-5 w-5" />
                    Contenedores
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                {containers.length === 0 ? (
                  <div className="text-center py-12">
                    <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No hay contenedores</h3>
                    <p className="text-slate-500">No se encontraron contenedores.</p>
                  </div>
                ) : containers.filter((c, idx) => {
                  if (!filtroContenedor) return true;
                  const id = c.container_id ?? c.containers_id ?? c.id ?? idx;
                  return String(id).toLowerCase().includes(filtroContenedor.toLowerCase());
                }).length === 0 ? (
                  <div className="text-center py-12">
                    <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron contenedores</h3>
                    <p className="text-slate-500">Ajusta la búsqueda por ID.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {containers.filter((c, idx) => {
                      if (!filtroContenedor) return true;
                      const id = c.container_id ?? c.containers_id ?? c.id ?? idx;
                      return String(id).toLowerCase().includes(filtroContenedor.toLowerCase());
                    }).map((container, idx) => {
                      const id = container.container_id ?? container.containers_id ?? container.id ?? idx;
                      const created = container.creation_date ?? container.created_at ?? '';
                      const stateNum = (container.state ?? 1) as number;
                      return (
                        <div key={`${id}`} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md transition-all duration-300">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 rounded-lg">
                              <Boxes className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900">#CONT-{id}</h3>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{created ? new Date(created).toLocaleString('es-ES') : '—'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`border ${stateNum === 1 ? 'bg-blue-100 text-blue-800 border-blue-200' : stateNum === 4 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                              {stateNum === 1 ? 'Nuevo' : stateNum === 4 ? 'Recibido' : `Estado ${stateNum}`}
                            </Badge>
                            {/* Botón Recibido: visible solo cuando containers.state === 3 */}
                            {stateNum === 3 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const res = await fetch('/venezuela/pedidos/api/advance-container', {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ containerId: container.container_id ?? container.containers_id ?? container.id ?? id, nextState: 4 })
                                    });
                                    if (!res.ok) {
                                      const err = await res.json().catch(() => ({}));
                                      throw new Error(err.error || 'No se pudo actualizar el contenedor');
                                    }
                                    await Promise.all([fetchContainers(), fetchBoxes(), fetchOrders()]);
                                  } catch (e) {
                                    alert((e as Error).message || 'Error al actualizar contenedor');
                                  }
                                }}
                                className="flex items-center gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                title={'Marcar contenedor como recibido'}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Recibido
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => {
                                const containerId = container.container_id ?? container.containers_id ?? container.id;
                                setModalVerCajas({ open: true, containerId });
                                if (containerId !== undefined) fetchBoxesByContainerId(containerId as any);
                              }}
                            >
                              <List className="h-4 w-4" />
                              Ver cajas
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
                {containersLoading && (
                  <p className="text-center text-sm text-slate-500 mt-4">Cargando contenedores...</p>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Modales */}
          {modalVerPedidos.open && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-3xl mx-4 w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Pedidos de la caja #BOX-{String(modalVerPedidos.boxId ?? '')}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setModalVerPedidos({ open: false })} className="h-8 w-8 p-0">✕</Button>
                </div>
                {ordersByBoxLoading ? (
                  <p className="text-center text-sm text-slate-500 py-6">Cargando pedidos...</p>
                ) : ordersByBox.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h4 className="text-base font-medium text-slate-900 mb-2">No hay pedidos asociados a esta caja</h4>
                    <p className="text-slate-500">Cuando asignes pedidos a esta caja, aparecerán aquí.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ordersByBox.map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-blue-100 rounded-lg">
                            <Package className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">#ORD-{o.id}</h3>
                            </div>
                            <p className="text-sm text-slate-600">{o.productName}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (o.pdfRoutes) {
                              const win = window.open(o.pdfRoutes, '_blank');
                              if (!win) alert('No se pudo abrir el PDF');
                            } else {
                              alert('No hay PDF disponible');
                            }
                          }}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" /> Ver
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {modalVerCajas.open && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-3xl mx-4 w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Cajas del contenedor #CONT-{String(modalVerCajas.containerId ?? '')}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setModalVerCajas({ open: false })} className="h-8 w-8 p-0">✕</Button>
                </div>
                {boxesByContainerLoading ? (
                  <p className="text-center text-sm text-slate-500 py-6">Cargando cajas...</p>
                ) : boxesByContainer.length === 0 ? (
                  <div className="text-center py-12">
                    <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h4 className="text-base font-medium text-slate-900 mb-2">No hay cajas asociadas a este contenedor</h4>
                    <p className="text-slate-500">Cuando se asignen cajas a este contenedor, aparecerán aquí.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {boxesByContainer.map((box, idx) => {
                      const id = box.box_id ?? box.boxes_id ?? box.id ?? idx;
                      const created = box.creation_date ?? box.created_at ?? '';
                      const stateNum = (box.state ?? 1) as number;
                      return (
                        <div key={`${id}`} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 rounded-lg">
                              <Boxes className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900">#BOX-{id}</h3>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{created ? new Date(created).toLocaleString('es-ES') : '—'}</span>
                                <span className="flex items-center gap-1"><List className="h-3 w-3" />Pedidos: {orderCountsByBox[id as any] ?? 0}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge className={`border ${stateNum === 1 ? 'bg-blue-100 text-blue-800 border-blue-200' : stateNum === 2 ? 'bg-green-100 text-green-800 border-green-200' : (stateNum === 5 || stateNum === 6) ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                              {stateNum === 1 ? 'Nueva' : stateNum === 2 ? 'Empaquetada' : stateNum === 5 ? 'Contenedor recibido' : stateNum === 6 ? 'Recibida' : `Estado ${stateNum}`}
                            </Badge>
                            {/* Botón Recibido en modal: visible solo cuando boxes.state === 5 */}
                            {stateNum === 5 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    const res = await fetch('/venezuela/pedidos/api/advance-box', {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ boxId: box.box_id ?? box.boxes_id ?? box.id ?? id, nextState: 6 })
                                    });
                                    if (!res.ok) {
                                      const err = await res.json().catch(() => ({}));
                                      throw new Error(err.error || 'No se pudo actualizar la caja');
                                    }
                                    await Promise.all([
                                      modalVerCajas.containerId ? fetchBoxesByContainerId(modalVerCajas.containerId) : Promise.resolve(),
                                      fetchOrders()
                                    ]);
                                  } catch (e) {
                                    alert((e as Error).message || 'Error al actualizar caja');
                                  }
                                }}
                                className="flex items-center gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                title={'Marcar caja como recibida'}
                              >
                                <CheckCircle className="h-4 w-4" />
                                Recibido
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1"
                              onClick={() => {
                                const boxId = box.box_id ?? box.boxes_id ?? box.id;
                                setModalVerPedidos({ open: true, boxId });
                                if (boxId !== undefined) fetchOrdersByBoxId(boxId as any);
                              }}
                            >
                              <List className="h-4 w-4" />
                              Ver pedidos
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}