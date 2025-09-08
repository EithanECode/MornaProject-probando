'use client';

import { useState, useEffect, useCallback } from 'react';
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
import { AlertTriangle, Boxes, Calendar, CheckCircle, Clock, Eye, Filter, List, Package, Search, Send } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRealtimeVzla } from '@/hooks/use-realtime-vzla';
import { useRealtimeVzlaBoxesContainers } from '@/hooks/use-realtime-vzla-boxes-containers';
export default function VenezuelaPedidosPage() {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const { t } = useTranslation();
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
  asignedEVzla?: string;
    description?: string;
    pdfRoutes?: string;
  };
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Modal genérico de aviso (para "Sin PDF")
  const [modalAviso, setModalAviso] = useState<{ open: boolean; title?: string; description?: string }>({ open: false });
  const [isClosingModalAviso, setIsClosingModalAviso] = useState(false);
  const closeModalAviso = () => {
    setIsClosingModalAviso(true);
    setTimeout(() => {
      setModalAviso({ open: false });
      setIsClosingModalAviso(false);
    }, 200);
  };

  // Paginación (8 por página)
  const ITEMS_PER_PAGE = 8;
  const [ordersPage, setOrdersPage] = useState(1);
  const [boxesPage, setBoxesPage] = useState(1);
  const [containersPage, setContainersPage] = useState(1);
  const getPageSlice = (total: number, page: number) => {
    const start = Math.max(0, (page - 1) * ITEMS_PER_PAGE);
    const end = Math.min(total, start + ITEMS_PER_PAGE);
    return { start, end };
  };
  const getVisiblePages = (totalPages: number, current: number) => {
    if (totalPages <= 1) return [1];
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    let start = Math.max(1, current - 2);
    let end = Math.min(totalPages, start + 4);
    start = Math.max(1, end - 4);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  // Reset pages on filters/data change
  useEffect(() => { setOrdersPage(1); }, [searchQuery, statusFilter, orders.length]);

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

  // Reset boxes/containers pagination when filters or data length change
  useEffect(() => { setBoxesPage(1); }, [filtroCaja, boxes.length]);
  useEffect(() => { setContainersPage(1); }, [filtroContenedor, containers.length]);

  // Función para obtener pedidos (puede ser llamada desde useEffect y desde el botón)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
  const empleadoId = user?.id;
  if (!empleadoId) throw new Error(t('venezuela.pedidos.errors.getUser'));
      const res = await fetch(`/venezuela/pedidos/api/orders?asignedEVzla=${encodeURIComponent(String(empleadoId))}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(t('venezuela.pedidos.errors.fetchOrders'));
      const data = await res.json();
      // Defensa extra: si por alguna razón el endpoint no filtró correctamente,
      // aplicamos filtro en cliente para mostrar solo pedidos asignados al empleado.
      const onlyAssigned = Array.isArray(data)
        ? data.filter((o: any) => String(o?.asignedEVzla ?? '') === String(empleadoId))
        : [];
      setOrders(onlyAssigned);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Obtener usuario y montar + primera carga
  useEffect(() => {
    setMounted(true);
    fetchOrders();
  }, []);

  /* Realtime Orders (solo pestaña pedidos) */
  const handleRealtimeOrdersUpdate = useCallback(() => {
    // Refresca pedidos siempre
    fetchOrders();
    // Si el usuario está mirando cajas o contenedores, refrescamos conteos indirectamente
    if (activeTab === 'cajas') {
      fetchBoxes();
    } else if (activeTab === 'contenedores') {
      fetchContainers();
    }
    // Si hay un modal de caja abierto, refrescar contenido específico
    if (modalVerPedidos.open && modalVerPedidos.boxId) {
      fetchOrdersByBoxId(modalVerPedidos.boxId);
    }
    if (modalVerCajas.open && modalVerCajas.containerId) {
      fetchBoxesByContainerId(modalVerCajas.containerId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, modalVerPedidos.open, modalVerPedidos.boxId, modalVerCajas.open, modalVerCajas.containerId]);

  // Obtener id del empleado para hook realtime
  const [empleadoId, setEmpleadoId] = useState<string | undefined>();
  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) setEmpleadoId(user.id);
      } catch (e) {
        console.warn('[Realtime Vzla] No se pudo obtener usuario para realtime');
      }
    })();
  }, []);

  useRealtimeVzla(handleRealtimeOrdersUpdate, empleadoId);

  // Realtime for client profile changes (to reflect clientName updates in list)
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`vzla-orders-clients-${empleadoId || 'all'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        fetchOrders();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [empleadoId]);

  // Realtime para cajas y contenedores: activo siempre que exista empleadoId
  const handleRealtimeBoxesUpdate = useCallback(() => {
    if (activeTab === 'cajas') fetchBoxes();
    if (modalVerPedidos.open && modalVerPedidos.boxId) fetchOrdersByBoxId(modalVerPedidos.boxId);
    // Si se está mostrando contenedor con cajas
    if (modalVerCajas.open && modalVerCajas.containerId) fetchBoxesByContainerId(modalVerCajas.containerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, modalVerPedidos.open, modalVerPedidos.boxId, modalVerCajas.open, modalVerCajas.containerId]);

  const handleRealtimeContainersUpdate = useCallback(() => {
    if (activeTab === 'contenedores') fetchContainers();
    // Si modal abierto de contenedor: refrescar cajas y pedidos de cajas
    if (modalVerCajas.open && modalVerCajas.containerId) fetchBoxesByContainerId(modalVerCajas.containerId);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, modalVerCajas.open, modalVerCajas.containerId]);

  useRealtimeVzlaBoxesContainers(handleRealtimeBoxesUpdate, handleRealtimeContainersUpdate, !!empleadoId);

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
      
      <main className={`transition-all duration-300 flex-1 pr-4 ${
        sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={0}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title={t('venezuela.pedidos.title')}
          subtitle={t('venezuela.pedidos.subtitle')}
          showTitleOnMobile
        />
        
  <div className="p-4 md:p-5 lg:p-6 space-y-6">
          {/* Header de la página (título duplicado removido; lo muestra el Header de arriba) */}
          <div className="space-y-4">
            
            {/* Tarjetas de estadísticas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm md:text-base font-medium text-yellow-700 dark:text-yellow-300">{t('venezuela.pedidos.stats.pending')}</p>
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
            {/* Modal Aviso (reutilizable) */}
            {modalAviso.open && (
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={closeModalAviso}>
                <div
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md mx-4 w-full transition-all ${isClosingModalAviso ? 'scale-95 opacity-0' : 'scale-100 opacity-100'} duration-200`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-800/40 rounded-md mt-0.5"><AlertTriangle className="h-5 w-5 text-yellow-700 dark:text-yellow-300" /></div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{modalAviso.title || 'Aviso'}</h3>
                      {modalAviso.description && (
                        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{modalAviso.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-5 flex justify-end gap-2">
                    <Button variant="default" size="sm" onClick={closeModalAviso}>
                      OK
                    </Button>
                  </div>
                </div>
              </div>
            )}

                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm md:text-base font-medium text-green-700 dark:text-green-300">{t('venezuela.pedidos.stats.reviewing')}</p>
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
                      <p className="text-sm md:text-base font-medium text-purple-700 dark:text-purple-300">{t('venezuela.pedidos.stats.quoted')}</p>
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
                      <p className="text-sm md:text-base font-medium text-blue-700 dark:text-blue-300">{t('venezuela.pedidos.stats.processing')}</p>
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
            <div className="pt-2">
              <div className="flex w-full rounded-lg border border-slate-200 bg-white/70 backdrop-blur px-1 py-1 shadow-sm gap-1">
                <Button
                  variant={activeTab === 'pedidos' ? 'default' : 'ghost'}
                  size="sm"
                  className={`flex-1 min-w-0 justify-center whitespace-nowrap truncate rounded-md transition-colors ${activeTab === 'pedidos' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setActiveTab('pedidos')}
                >
                  {t('venezuela.pedidos.tabs.ordersList')}
                </Button>
                <Button
                  variant={activeTab === 'cajas' ? 'default' : 'ghost'}
                  size="sm"
                  className={`flex-1 min-w-0 justify-center whitespace-nowrap truncate rounded-md transition-colors ${activeTab === 'cajas' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setActiveTab('cajas')}
                >
                  {t('venezuela.pedidos.tabs.boxes')}
                </Button>
                <Button
                  variant={activeTab === 'contenedores' ? 'default' : 'ghost'}
                  size="sm"
                  className={`flex-1 min-w-0 justify-center whitespace-nowrap truncate rounded-md transition-colors ${activeTab === 'contenedores' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setActiveTab('contenedores')}
                >
                  {t('venezuela.pedidos.tabs.containers')}
                </Button>
              </div>
            </div>
          </div>
          {activeTab === 'pedidos' && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader className="py-3">
                <div className="flex items-center justify-end">
                  <div className="w-full sm:w-auto flex items-center justify-end gap-2 md:gap-3 flex-wrap">
                    <Input
                      placeholder={t('venezuela.pedidos.searchPlaceholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 w-full sm:w-64 px-3"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter as any}>
                      <SelectTrigger className="h-10 w-full sm:w-56 px-3 whitespace-nowrap truncate">
                        <SelectValue placeholder={t('venezuela.pedidos.filters.status')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('venezuela.pedidos.filters.all')}</SelectItem>
                        <SelectItem value="pending">{t('venezuela.pedidos.filters.pending')}</SelectItem>
                        <SelectItem value="reviewing">{t('venezuela.pedidos.filters.reviewing')}</SelectItem>
                        <SelectItem value="quoted">{t('venezuela.pedidos.filters.quoted')}</SelectItem>
                        <SelectItem value="processing">{t('venezuela.pedidos.filters.processing')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}


          {/* Contenido por pestaña */}
          {activeTab === 'pedidos' && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent>
                {loading ? (
                  <div className="p-10 text-center text-sm text-slate-600">{t('venezuela.pedidos.loadingOrders')}</div>
                ) : error ? (
                  <div className="p-10 text-center text-sm text-red-600">{error}</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="p-10 text-center">
                    <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('venezuela.pedidos.emptyOrdersTitle')}</h3>
                    <p className="text-slate-600">{t('venezuela.pedidos.emptyOrdersDesc')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => { const total = sortedOrders.length; const { start, end } = getPageSlice(total, ordersPage); return sortedOrders.slice(start, end).map((order) => {
                      const stateNum = Number(order.state);
                      return (
                        <div
                          key={order.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md transition-all duration-300"
                        >
                          <div className="min-w-0 flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-lg"><Package className="h-5 w-5 text-blue-600" /></div>
                            <div className="min-w-0 space-y-1">
                              <h3 className="font-semibold text-slate-900 truncate">#ORD-{String(order.id)} • {order.clientName}</h3>
                              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                                <span className="truncate">{t('venezuela.pedidos.labels.quantity')}: {order.quantity}</span>
                                <span className="truncate">{t('venezuela.pedidos.labels.deliveryType')}: {order.deliveryType}</span>
                                <span className="truncate">{t('venezuela.pedidos.labels.shippingType')}: {order.shippingType}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                            {stateNum === 13 && (<Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:ring-1 hover:ring-emerald-200">{t('venezuela.pedidos.badges.delivered')}</Badge>)}
                            {stateNum === 12 && (<Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:ring-1 hover:ring-blue-200">{t('venezuela.pedidos.badges.readyToDeliver')}</Badge>)}
                            {stateNum === 11 && (<Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:ring-1 hover:ring-emerald-200">{t('venezuela.pedidos.badges.received')}</Badge>)}
                            {stateNum === 10 && (<Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 hover:ring-1 hover:ring-indigo-200">{t('venezuela.pedidos.badges.customs')}</Badge>)}
                            {stateNum === 9 && (<Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:ring-1 hover:ring-emerald-200">{t('venezuela.pedidos.badges.arrivedVzla')}</Badge>)}
                            {stateNum === 8 && (<Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:ring-1 hover:ring-emerald-200">{t('venezuela.pedidos.badges.onWayVzla')}</Badge>)}
                            {stateNum === 1 && (<Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 hover:ring-1 hover:ring-yellow-200">{t('venezuela.pedidos.badges.pending')}</Badge>)}
                            {stateNum === 2 && (<Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 hover:ring-1 hover:ring-green-200">{t('venezuela.pedidos.badges.reviewing')}</Badge>)}
                            {stateNum === 3 && (<Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-50 hover:border-purple-300 hover:ring-1 hover:ring-purple-200">{t('venezuela.pedidos.badges.quoted')}</Badge>)}
                            {stateNum === 4 && (<Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:ring-1 hover:ring-blue-200">{t('venezuela.pedidos.badges.processing')}</Badge>)}
                            {(stateNum >= 5 && stateNum <= 7) && (<Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:ring-1 hover:ring-gray-200">{t('venezuela.pedidos.badges.inProcess')}</Badge>)}

                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 uppercase"
                              onClick={() => {
                                if (order.pdfRoutes) {
                                  const win = window.open(order.pdfRoutes, '_blank');
                                  if (!win) {
                                    setModalAviso({ open: true, title: t('venezuela.pedidos.pdf.openError') || 'No se pudo abrir el PDF', description: t('venezuela.pedidos.pdf.notAvailableOrder') || 'Intenta nuevamente o verifica más tarde.' });
                                  }
                                } else {
                                  setModalAviso({ open: true, title: 'Sin PDF', description: 'No hay PDF disponible para este pedido.' });
                                }
                              }}
                            >
                              <Eye className="w-4 h-4" /> {t('admin.orders.actions.view')}
                            </Button>
                            <Button
                              size="icon"
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
                                      throw new Error(err.error || t('venezuela.pedidos.errors.updateOrder'));
                                    }
                                    await fetchOrders();
                                  } catch (err) {
                                    console.error(err);
                                    alert((err as Error).message || t('venezuela.pedidos.errors.sendToChina'));
                                  }
                                  return;
                                }
                                if (stateNum === 8) {
                                  try {
                                    const res = await fetch('/venezuela/pedidos/api/advance-state', {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ orderId: order.id, nextState: 9 })
                                    });
                                    if (!res.ok) {
                                      const err = await res.json().catch(() => ({}));
                                      throw new Error(err.error || t('venezuela.pedidos.errors.updateOrder'));
                                    }
                                    await fetchOrders();
                                  } catch (err) {
                                    console.error(err);
                                    alert((err as Error).message || t('venezuela.pedidos.errors.updateStatus'));
                                  }
                                  return;
                                }
                                if (stateNum === 9) {
                                  try {
                                    const res = await fetch('/venezuela/pedidos/api/advance-state', {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ orderId: order.id, nextState: 10 })
                                    });
                                    if (!res.ok) {
                                      const err = await res.json().catch(() => ({}));
                                      throw new Error(err.error || t('venezuela.pedidos.errors.updateOrder'));
                                    }
                                    await fetchOrders();
                                  } catch (err) {
                                    console.error(err);
                                    alert((err as Error).message || t('venezuela.pedidos.errors.updateStatus'));
                                  }
                                  return;
                                }
                                if (stateNum === 11) {
                                  try {
                                    const res = await fetch('/venezuela/pedidos/api/advance-state', {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ orderId: order.id, nextState: 12 })
                                    });
                                    if (!res.ok) {
                                      const err = await res.json().catch(() => ({}));
                                      throw new Error(err.error || t('venezuela.pedidos.errors.updateOrder'));
                                    }
                                    await fetchOrders();
                                  } catch (err) {
                                    console.error(err);
                                    alert((err as Error).message || t('venezuela.pedidos.errors.updateStatus'));
                                  }
                                  return;
                                }
                                if (stateNum === 12) {
                                  try {
                                    const res = await fetch('/venezuela/pedidos/api/advance-state', {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ orderId: order.id, nextState: 13 })
                                    });
                                    if (!res.ok) {
                                      const err = await res.json().catch(() => ({}));
                                      throw new Error(err.error || t('venezuela.pedidos.errors.updateOrder'));
                                    }
                                    await fetchOrders();
                                  } catch (err) {
                                    console.error(err);
                                    alert((err as Error).message || t('venezuela.pedidos.errors.updateStatus'));
                                  }
                                  return;
                                }
                              }}
                            >
                              {stateNum >= 13 ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : stateNum === 12 ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : stateNum === 11 ? (
                                <Package className="w-4 h-4" />
                              ) : stateNum === 9 ? (
                                <Package className="w-4 h-4" />
                              ) : stateNum === 8 ? (
                                <Package className="w-4 h-4" />
                              ) : stateNum === 10 ? (
                                <Clock className="w-4 h-4" />
                              ) : (stateNum >= 2 && stateNum <= 7) ? (
                                <Clock className="w-4 h-4" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    }); })()}
                  </div>
                )}
                {(() => { const total = sortedOrders.length; if (total===0) return null; const totalPages=Math.max(1, Math.ceil(total/ITEMS_PER_PAGE)); const { start, end } = getPageSlice(total, ordersPage); const pages=getVisiblePages(totalPages, ordersPage); return (
                  <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <p className="text-xs sm:text-sm text-slate-600">{t('admin.orders.pagination.showing', { defaultValue: 'Mostrando' })} {Math.min(total, start + 1)} {t('admin.orders.pagination.to', { defaultValue: 'a' })} {end} {t('admin.orders.pagination.of', { defaultValue: 'de' })} {total} {t('admin.orders.pagination.results', { defaultValue: 'resultados' })}</p>
                    <div className="flex items-center gap-1 justify-end flex-wrap">
                      <Button variant="outline" size="sm" disabled={ordersPage<=1} onClick={()=>setOrdersPage(p=>Math.max(1,p-1))}>{t('admin.orders.pagination.prev', { defaultValue: 'Anterior' })}</Button>
                      {pages[0] > 1 && (<><Button variant="outline" size="sm" onClick={()=>setOrdersPage(1)}>1</Button><span className="px-1 text-slate-400">…</span></>)}
                      {pages.map(p => (<Button key={p} variant={p===ordersPage? 'default':'outline'} size="sm" onClick={()=>setOrdersPage(p)}>{p}</Button>))}
                      {pages[pages.length-1] < totalPages && (<><span className="px-1 text-slate-400">…</span><Button variant="outline" size="sm" onClick={()=>setOrdersPage(totalPages)}>{totalPages}</Button></>)}
                      <Button variant="outline" size="sm" disabled={ordersPage>=totalPages} onClick={()=>setOrdersPage(p=>Math.min(totalPages,p+1))}>{t('admin.orders.pagination.next', { defaultValue: 'Siguiente' })}</Button>
                    </div>
                  </div>
                ); })()}
              </CardContent>
            </Card>
          )}

          {activeTab === 'cajas' && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Boxes className="h-5 w-5" />
                    {t('venezuela.pedidos.tabs.boxes')}
                  </CardTitle>
                  <div className="w-full sm:w-auto flex items-center justify-end gap-2 md:gap-3 flex-wrap">
                    <Input
                      placeholder={t('venezuela.pedidos.filters.searchBoxPlaceholder')}
                      value={filtroCaja}
                      onChange={(e) => setFiltroCaja(e.target.value)}
                      className="h-10 w-full sm:w-64 px-3"
                    />
                    {/* Botón de refrescar eliminado: realtime activo */}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {boxes.length === 0 ? (
                  <div className="text-center py-12">
                    <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">{t('venezuela.pedidos.emptyBoxesTitle')}</h3>
                    <p className="text-slate-500">{t('venezuela.pedidos.emptyBoxesDesc')}</p>
                  </div>
                ) : boxes.filter((b, idx) => {
                  if (!filtroCaja) return true;
                  const id = b.box_id ?? b.boxes_id ?? b.id ?? idx;
                  return String(id).toLowerCase().includes(filtroCaja.toLowerCase());
                }).length === 0 ? (
                  <div className="text-center py-12">
                    <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">{t('venezuela.pedidos.emptyBoxesSearchTitle')}</h3>
                    <p className="text-slate-500">{t('venezuela.pedidos.emptyBoxesSearchDesc')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const filtered = boxes.filter((b, idx) => {
                        if (!filtroCaja) return true;
                        const id = b.box_id ?? b.boxes_id ?? b.id ?? idx;
                        return String(id).toLowerCase().includes(filtroCaja.toLowerCase());
                      });
                      const total = filtered.length;
                      const { start, end } = getPageSlice(total, boxesPage);
                      return filtered.slice(start, end).map((box, idx) => {
                      const id = box.box_id ?? box.boxes_id ?? box.id ?? idx;
                      const created = box.creation_date ?? box.created_at ?? '';
                      const stateNum = (box.state ?? 1) as number;
                      const countKey = box.box_id ?? box.boxes_id ?? box.id ?? id;
                      return (
        <div key={`${id}`} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md transition-all duration-300 min-w-0 overflow-hidden flex-wrap gap-3 md:flex-nowrap">
          <div className="flex items-center gap-4 min-w-0">
                            <div className="p-3 bg-indigo-100 rounded-lg">
                              <Boxes className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 truncate">#BOX-{id}</h3>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><List className="h-3 w-3" />{t('venezuela.pedidos.labels.orders')} {orderCountsByBoxMain[countKey as any] ?? 0}</span>
                              </div>
                            </div>
                          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
                            <Badge className={`border ${
                              stateNum === 1
                                ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:ring-1 hover:ring-blue-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-blue-700/50 transition-colors'
                                : stateNum === 2
                                ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 hover:ring-1 hover:ring-green-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-green-700/50 transition-colors'
                                : stateNum === 5 || stateNum === 6
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:ring-1 hover:ring-emerald-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-emerald-700/50 transition-colors'
                                : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:ring-1 hover:ring-gray-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-gray-700/50 transition-colors'
                            }`}>
                              {stateNum === 1 ? t('venezuela.pedidos.boxesBadges.new') : stateNum === 2 ? t('venezuela.pedidos.boxesBadges.ready') : stateNum === 5 ? t('venezuela.pedidos.boxesBadges.received') : stateNum === 6 ? t('venezuela.pedidos.boxesBadges.completed') : t('venezuela.pedidos.boxesBadges.state', { num: stateNum })}
                            </Badge>
                            {/* Botón Recibido: visible solo cuando boxes.state === 5 */}
                            {stateNum === 5 && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={async () => {
                                  try {
                                    const res = await fetch('/venezuela/pedidos/api/advance-box', {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ boxId: box.box_id ?? box.boxes_id ?? box.id ?? id, nextState: 6 })
                                    });
                                    if (!res.ok) {
                                      const err = await res.json().catch(() => ({}));
                                      throw new Error(err.error || t('venezuela.pedidos.errors.updateBox'));
                                    }
                                    await Promise.all([fetchBoxes(), fetchOrders()]);
                                  } catch (e) {
                                    alert((e as Error).message || t('venezuela.pedidos.errors.boxUpdate'));
                                  }
                                }}
                                className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                title={t('venezuela.pedidos.tooltips.markBoxReceived')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              className=""
                              onClick={() => {
                                const boxId = box.box_id ?? box.boxes_id ?? box.id;
                                setModalVerPedidos({ open: true, boxId });
                                if (boxId !== undefined) fetchOrdersByBoxId(boxId as any);
                              }}
                            >
                              <List className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    }); })()}
                  </div>
                )}
                {(() => {
                  const filtered = boxes.filter((b, idx) => {
                    if (!filtroCaja) return true;
                    const id = b.box_id ?? b.boxes_id ?? b.id ?? idx;
                    return String(id).toLowerCase().includes(filtroCaja.toLowerCase());
                  });
                  const total = filtered.length;
                  if (total === 0) return null;
                  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
                  const { start, end } = getPageSlice(total, boxesPage);
                  const pages = getVisiblePages(totalPages, boxesPage);
                  return (
                    <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <p className="text-xs sm:text-sm text-slate-600">{t('admin.orders.pagination.showing', { defaultValue: 'Mostrando' })} {Math.min(total, start + 1)} {t('admin.orders.pagination.to', { defaultValue: 'a' })} {end} {t('admin.orders.pagination.of', { defaultValue: 'de' })} {total} {t('admin.orders.pagination.results', { defaultValue: 'resultados' })}</p>
                      <div className="flex items-center gap-1 justify-end flex-wrap">
                        <Button variant="outline" size="sm" disabled={boxesPage<=1} onClick={()=>setBoxesPage(p=>Math.max(1,p-1))}>{t('admin.orders.pagination.prev', { defaultValue: 'Anterior' })}</Button>
                        {pages[0] > 1 && (<><Button variant="outline" size="sm" onClick={()=>setBoxesPage(1)}>1</Button><span className="px-1 text-slate-400">…</span></>)}
                        {pages.map(p => (<Button key={p} variant={p===boxesPage? 'default':'outline'} size="sm" onClick={()=>setBoxesPage(p)}>{p}</Button>))}
                        {pages[pages.length-1] < totalPages && (<><span className="px-1 text-slate-400">…</span><Button variant="outline" size="sm" onClick={()=>setBoxesPage(totalPages)}>{totalPages}</Button></>)}
                        <Button variant="outline" size="sm" disabled={boxesPage>=totalPages} onClick={()=>setBoxesPage(p=>Math.min(totalPages,p+1))}>{t('admin.orders.pagination.next', { defaultValue: 'Siguiente' })}</Button>
                      </div>
                    </div>
                  );
                })()}
                {boxesLoading && (
                  <p className="text-center text-sm text-slate-500 mt-4">{t('venezuela.pedidos.loadingBoxes')}</p>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'contenedores' && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Boxes className="h-5 w-5" />
                    {t('venezuela.pedidos.tabs.containers')}
                  </CardTitle>
                  <div className="w-full sm:w-auto flex items-center justify-end gap-2 md:gap-3 flex-wrap">
                    <Input
                      placeholder={t('venezuela.pedidos.filters.searchContainerPlaceholder')}
                      value={filtroContenedor}
                      onChange={(e) => setFiltroContenedor(e.target.value)}
                      className="h-10 w-full sm:w-64 px-3"
                    />
                    {/* Botón de refrescar eliminado: realtime activo */}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {containers.length === 0 ? (
                  <div className="text-center py-12">
                    <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">{t('venezuela.pedidos.emptyContainersTitle')}</h3>
                    <p className="text-slate-500">{t('venezuela.pedidos.emptyContainersDesc')}</p>
                  </div>
                ) : containers.filter((c, idx) => {
                  if (!filtroContenedor) return true;
                  const id = c.container_id ?? c.containers_id ?? c.id ?? idx;
                  return String(id).toLowerCase().includes(filtroContenedor.toLowerCase());
                }).length === 0 ? (
                  <div className="text-center py-12">
                    <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">{t('venezuela.pedidos.emptyContainersSearchTitle')}</h3>
                    <p className="text-slate-500">{t('venezuela.pedidos.emptyContainersSearchDesc')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {(() => {
                      const filtered = containers.filter((c, idx) => {
                        if (!filtroContenedor) return true;
                        const id = c.container_id ?? c.containers_id ?? c.id ?? idx;
                        return String(id).toLowerCase().includes(filtroContenedor.toLowerCase());
                      });
                      const total = filtered.length;
                      const { start, end } = getPageSlice(total, containersPage);
                      return filtered.slice(start, end).map((container, idx) => {
                      const id = container.container_id ?? container.containers_id ?? container.id ?? idx;
                      const created = container.creation_date ?? container.created_at ?? '';
                      const stateNum = (container.state ?? 1) as number;
                      return (
                        <div key={`${id}`} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md transition-all duration-300 min-w-0">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-100 rounded-lg">
                              <Boxes className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-slate-900">#CONT-{id}</h3>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                            <Badge className={`border ${
                              stateNum === 1
                                ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:ring-1 hover:ring-blue-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-blue-700/50 transition-colors'
                                : stateNum === 2
                                ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 hover:ring-1 hover:ring-yellow-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-yellow-700/50 transition-colors'
                                : stateNum === 4
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:ring-1 hover:ring-emerald-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-emerald-700/50 transition-colors'
                                : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:ring-1 hover:ring-gray-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-gray-700/50 transition-colors'
                            }`}>
                              {stateNum === 1
                                ? t('venezuela.pedidos.containersBadges.new')
                                : stateNum === 2
                                ? t('venezuela.pedidos.containersBadges.inTransit')
                                : stateNum === 3
                                ? 'viajando'
                                : stateNum === 4
                                ? t('venezuela.pedidos.containersBadges.received')
                                : t('venezuela.pedidos.containersBadges.state', { num: stateNum })}
                            </Badge>
                            {/* Botón Recibido: visible solo cuando containers.state === 3 */}
                            {stateNum === 3 && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={async () => {
                                  try {
                                    const res = await fetch('/venezuela/pedidos/api/advance-container', {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ containerId: container.container_id ?? container.containers_id ?? container.id ?? id, nextState: 4 })
                                    });
                                    if (!res.ok) {
                                      const err = await res.json().catch(() => ({}));
                                      throw new Error(err.error || t('venezuela.pedidos.errors.updateContainer'));
                                    }
                                    await Promise.all([fetchContainers(), fetchBoxes(), fetchOrders()]);
                                  } catch (e) {
                                    alert((e as Error).message || t('venezuela.pedidos.errors.containerUpdate'));
                                  }
                                }}
                                className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                title={t('venezuela.pedidos.tooltips.markContainerReceived')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              className=""
                              onClick={() => {
                                const containerId = container.container_id ?? container.containers_id ?? container.id;
                                setModalVerCajas({ open: true, containerId });
                                if (containerId !== undefined) fetchBoxesByContainerId(containerId as any);
                              }}
                            >
                              <List className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    }); })()}
                  </div>
                )}
                {(() => {
                  const filtered = containers.filter((c, idx) => {
                    if (!filtroContenedor) return true;
                    const id = c.container_id ?? c.containers_id ?? c.id ?? idx;
                    return String(id).toLowerCase().includes(filtroContenedor.toLowerCase());
                  });
                  const total = filtered.length;
                  if (total === 0) return null;
                  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
                  const { start, end } = getPageSlice(total, containersPage);
                  const pages = getVisiblePages(totalPages, containersPage);
                  return (
                    <div className="mt-4 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <p className="text-xs sm:text-sm text-slate-600">{t('admin.orders.pagination.showing', { defaultValue: 'Mostrando' })} {Math.min(total, start + 1)} {t('admin.orders.pagination.to', { defaultValue: 'a' })} {end} {t('admin.orders.pagination.of', { defaultValue: 'de' })} {total} {t('admin.orders.pagination.results', { defaultValue: 'resultados' })}</p>
                      <div className="flex items-center gap-1 justify-end flex-wrap">
                        <Button variant="outline" size="sm" disabled={containersPage<=1} onClick={()=>setContainersPage(p=>Math.max(1,p-1))}>{t('admin.orders.pagination.prev', { defaultValue: 'Anterior' })}</Button>
                        {pages[0] > 1 && (<><Button variant="outline" size="sm" onClick={()=>setContainersPage(1)}>1</Button><span className="px-1 text-slate-400">…</span></>)}
                        {pages.map(p => (<Button key={p} variant={p===containersPage? 'default':'outline'} size="sm" onClick={()=>setContainersPage(p)}>{p}</Button>))}
                        {pages[pages.length-1] < totalPages && (<><span className="px-1 text-slate-400">…</span><Button variant="outline" size="sm" onClick={()=>setContainersPage(totalPages)}>{totalPages}</Button></>)}
                        <Button variant="outline" size="sm" disabled={containersPage>=totalPages} onClick={()=>setContainersPage(p=>Math.min(totalPages,p+1))}>{t('admin.orders.pagination.next', { defaultValue: 'Siguiente' })}</Button>
                      </div>
                    </div>
                  );
                })()}
                {containersLoading && (
                  <p className="text-center text-sm text-slate-500 mt-4">{t('venezuela.pedidos.loadingContainers')}</p>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Modales */}
          {modalVerPedidos.open && (
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setModalVerPedidos({ open: false })}>
              <div className="bg-white rounded-2xl p-6 max-w-3xl mx-4 w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{t('venezuela.pedidos.modalOrdersTitle', { boxId: String(modalVerPedidos.boxId ?? '') })}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setModalVerPedidos({ open: false })} className="h-8 w-8 p-0">✕</Button>
                </div>
                {ordersByBoxLoading ? (
                  <p className="text-center text-sm text-slate-500 py-6">{t('venezuela.pedidos.loadingOrders')}</p>
                ) : ordersByBox.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h4 className="text-base font-medium text-slate-900 mb-2">{t('venezuela.pedidos.modalOrdersEmptyTitle')}</h4>
                    <p className="text-slate-500">{t('venezuela.pedidos.modalOrdersEmptyDesc')}</p>
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
                          size="icon"
              onClick={() => {
                            if (o.pdfRoutes) {
                              const win = window.open(o.pdfRoutes, '_blank');
                if (!win) alert(t('venezuela.pedidos.pdf.openError'));
                            } else {
                alert(t('venezuela.pedidos.pdf.notAvailable'));
                            }
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {modalVerCajas.open && (
            <div className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setModalVerCajas({ open: false })}>
              <div className="bg-white rounded-2xl p-6 max-w-3xl mx-4 w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">{t('venezuela.pedidos.modalBoxesTitle', { containerId: String(modalVerCajas.containerId ?? '') })}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setModalVerCajas({ open: false })} className="h-8 w-8 p-0">✕</Button>
                </div>
                {boxesByContainerLoading ? (
                  <p className="text-center text-sm text-slate-500 py-6">{t('venezuela.pedidos.loadingBoxes')}</p>
                ) : boxesByContainer.length === 0 ? (
                  <div className="text-center py-12">
                    <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h4 className="text-base font-medium text-slate-900 mb-2">{t('venezuela.pedidos.modalBoxesEmptyTitle')}</h4>
                    <p className="text-slate-500">{t('venezuela.pedidos.modalBoxesEmptyDesc')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {boxesByContainer.map((box, idx) => {
                      const id = box.box_id ?? box.boxes_id ?? box.id ?? idx;
                      const created = box.creation_date ?? box.created_at ?? '';
                      const stateNum = (box.state ?? 1) as number;
                      return (
        <div key={`${id}`} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 min-w-0 overflow-hidden flex-wrap gap-3 md:flex-nowrap">
          <div className="flex items-center gap-4 min-w-0">
                            <div className="p-3 bg-indigo-100 rounded-lg">
                              <Boxes className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900 truncate">#BOX-{id}</h3>
                              </div>
                              <div className="flex items-center gap-4 text-xs text-slate-500">
                                <span className="flex items-center gap-1"><List className="h-3 w-3" />{t('venezuela.pedidos.labels.orders')} {orderCountsByBox[id as any] ?? 0}</span>
                              </div>
                            </div>
                          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0">
                            <Badge className={`border ${
                              stateNum === 1
                                ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:ring-1 hover:ring-blue-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-blue-700/50 transition-colors'
                                : stateNum === 2
                                ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 hover:ring-1 hover:ring-green-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-green-700/50 transition-colors'
                                : stateNum === 5 || stateNum === 6
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:ring-1 hover:ring-emerald-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-emerald-700/50 transition-colors'
                                : 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:ring-1 hover:ring-gray-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-gray-700/50 transition-colors'
                            }`}>
                              {stateNum === 1 ? t('venezuela.pedidos.boxesBadges.new') : stateNum === 2 ? t('venezuela.pedidos.boxesBadges.ready') : stateNum === 5 ? t('venezuela.pedidos.boxesBadges.received') : stateNum === 6 ? t('venezuela.pedidos.boxesBadges.completed') : t('venezuela.pedidos.boxesBadges.state', { num: stateNum })}
                            </Badge>
                            {/* Botón Recibido en modal: visible solo cuando boxes.state === 5 */}
                            {stateNum === 5 && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={async () => {
                                  try {
                                    const res = await fetch('/venezuela/pedidos/api/advance-box', {
                                      method: 'PATCH',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ boxId: box.box_id ?? box.boxes_id ?? box.id ?? id, nextState: 6 })
                                    });
                                    if (!res.ok) {
                                      const err = await res.json().catch(() => ({}));
                                      throw new Error(err.error || t('venezuela.pedidos.errors.updateBox'));
                                    }
                                    await Promise.all([
                                      modalVerCajas.containerId ? fetchBoxesByContainerId(modalVerCajas.containerId) : Promise.resolve(),
                                      fetchOrders()
                                    ]);
                                  } catch (e) {
                                    alert((e as Error).message || t('venezuela.pedidos.errors.boxUpdate'));
                                  }
                                }}
                                className="text-emerald-700 border-emerald-300 hover:bg-emerald-50"
                                title={t('venezuela.pedidos.tooltips.markBoxReceived')}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              className=""
                              onClick={() => {
                                const boxId = box.box_id ?? box.boxes_id ?? box.id;
                                setModalVerPedidos({ open: true, boxId });
                                if (boxId !== undefined) fetchOrdersByBoxId(boxId as any);
                              }}
                            >
                              <List className="h-4 w-4" />
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