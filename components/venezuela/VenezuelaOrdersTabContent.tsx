"use client";
import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';
import {
  Search, Filter, Clock, AlertTriangle, Package, Send, Eye, CheckCircle, Boxes, Calendar, List
} from 'lucide-react';

// Nota: Este componente es una versión reducida de la página original de Venezuela
// para mostrarse dentro de la pestaña del Admin. No incluye Sidebar ni Header.

interface Order {
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
  box_id?: string | number | null;
}

interface BoxItem { boxes_id?: number | string; id?: number | string; box_id?: number | string; container_id?: number | string | null; state?: number; creation_date?: string; created_at?: string }
interface ContainerItem { containers_id?: number | string; id?: number | string; container_id?: number | string; state?: number; creation_date?: string; created_at?: string }

export default function VenezuelaOrdersTabContent() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeSubTab, setActiveSubTab] = useState<'pedidos' | 'cajas' | 'contenedores'>(() => 'pedidos');

  // Cajas
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [boxesLoading, setBoxesLoading] = useState(false);
  const [filtroCaja, setFiltroCaja] = useState('');
  const [orderCountsByBoxMain, setOrderCountsByBoxMain] = useState<Record<string | number, number>>({});
  const [ordersByBox, setOrdersByBox] = useState<Order[]>([]);
  const [ordersByBoxLoading, setOrdersByBoxLoading] = useState(false);
  const [modalVerPedidos, setModalVerPedidos] = useState<{ open: boolean; boxId?: number | string }>({ open: false });

  // Contenedores
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [containersLoading, setContainersLoading] = useState(false);
  const [filtroContenedor, setFiltroContenedor] = useState('');
  const [boxesByContainer, setBoxesByContainer] = useState<BoxItem[]>([]);
  const [boxesByContainerLoading, setBoxesByContainerLoading] = useState(false);
  const [orderCountsByBox, setOrderCountsByBox] = useState<Record<string | number, number>>({});
  const [modalVerCajas, setModalVerCajas] = useState<{ open: boolean; containerId?: number | string }>({ open: false });

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

  useEffect(() => { setMounted(true); fetchOrders(); }, []);

  // Cargar cajas / contenedores al cambiar sub-tab
  useEffect(() => {
    if (activeSubTab === 'cajas') fetchBoxes();
    if (activeSubTab === 'contenedores') fetchContainers();
  }, [activeSubTab]);

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
      const ids = list.map(b => b.box_id ?? b.boxes_id ?? (b as any).id).filter(v => v !== undefined && v !== null);
      if (ids.length > 0) {
        const { data: ordersData, error: err2 } = await supabase.from('orders').select('id, box_id').in('box_id', ids as any);
        if (!err2) {
          const counts: Record<string | number, number> = {};
          (ordersData || []).forEach((row: any) => { const key = row.box_id as string | number; counts[key] = (counts[key] || 0) + 1; });
          setOrderCountsByBoxMain(counts);
        } else setOrderCountsByBoxMain({});
      } else setOrderCountsByBoxMain({});
    } catch (e) {
      console.error('Error fetchBoxes:', e);
    } finally { setBoxesLoading(false); }
  };

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
    } catch (e) { console.error('Error fetchContainers:', e); } finally { setContainersLoading(false); }
  };

  const fetchOrdersByBoxId = async (boxId: number | string) => {
    setOrdersByBoxLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.from('orders').select('*').eq('box_id', boxId);
      if (error) throw error;
      const mapped: Order[] = (data || []).map((o: any) => ({
        id: String(o.id), quantity: Number(o.quantity || 0), productName: o.productName || o.product || '—',
        deliveryType: o.deliveryType || '', shippingType: o.shippingType || '', state: Number(o.state || 0),
        clientName: o.clientName || o.client || '—', client_id: o.client_id || '', description: o.specifications || '', pdfRoutes: o.pdfRoutes || '', box_id: o.box_id
      }));
      setOrdersByBox(mapped);
    } catch (e) { console.error('Error fetchOrdersByBoxId:', e); } finally { setOrdersByBoxLoading(false); }
  };

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
          (ordersData || []).forEach((row: any) => { const key = row.box_id as string | number; counts[key] = (counts[key] || 0) + 1; });
          setOrderCountsByBox(counts);
        } else setOrderCountsByBox({});
      } else setOrderCountsByBox({});
    } catch (e) { console.error('Error fetchBoxesByContainerId:', e); } finally { setBoxesByContainerLoading(false); }
  };
  if (!mounted) return null;

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

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const wa = a.state === 1 ? 0 : 1;
    const wb = b.state === 1 ? 0 : 1;
    if (wa !== wb) return wa - wb;
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm md:text-base font-medium text-yellow-700 dark:text-yellow-300">{t('venezuela.pedidos.stats.pending')}</p>
                <p className="text-2xl md:text-3xl font-bold text-yellow-800 dark:text-yellow-200">{orders.filter(o => o.state === 1).length}</p>
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
                <p className="text-sm md:text-base font-medium text-green-700 dark:text-green-300">{t('venezuela.pedidos.stats.reviewing')}</p>
                <p className="text-2xl md:text-3xl font-bold text-green-800 dark:text-green-200">{orders.filter(o => o.state === 2).length}</p>
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
                <p className="text-2xl md:text-3xl font-bold text-purple-800 dark:text-purple-200">{orders.filter(o => o.state === 3).length}</p>
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
                <p className="text-2xl md:text-3xl font-bold text-blue-800 dark:text-blue-200">{orders.filter(o => o.state === 4).length}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-800/30 rounded-lg flex items-center justify-center">
                <Send className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs internos */}
      <div className="w-full">
        <div className="flex w-full gap-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 backdrop-blur px-1 py-1 shadow-sm">
          {(['pedidos','cajas','contenedores'] as const).map(tab => (
            <Button
              key={tab}
              variant={activeSubTab === tab ? 'default' : 'ghost'}
              size="sm"
              className={`flex-1 min-w-0 justify-center truncate rounded-md transition-colors ${activeSubTab === tab ? 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white' : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700/60'}`}
              onClick={() => setActiveSubTab(tab)}
            >
              {tab === 'pedidos' && t('venezuela.pedidos.tabs.ordersList')}
              {tab === 'cajas' && t('venezuela.pedidos.tabs.boxes')}
              {tab === 'contenedores' && t('venezuela.pedidos.tabs.containers')}
            </Button>
          ))}
        </div>
      </div>

  {/* Toolbar pedidos unificada se integra en el encabezado del listado */}

      {/* Contenido principal según sub-tab */}
      {activeSubTab === 'pedidos' && (
        <div className="space-y-4">
          <Card className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
            <CardHeader className="pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="text-lg font-semibold">{t('venezuela.pedidos.tabs.ordersList')}</CardTitle>
                <div className="w-full sm:w-auto flex items-center justify-end gap-2 md:gap-3 flex-wrap">
                  <Input placeholder={t('venezuela.pedidos.searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="h-10 w-full sm:w-64 px-3" />
                  <Select value={statusFilter} onValueChange={setStatusFilter as any}>
                    <SelectTrigger className="h-10 w-full sm:w-56 px-3 whitespace-nowrap truncate">
                      <SelectValue placeholder={t('chinese.ordersPage.filters.status')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('chinese.ordersPage.filters.all')}</SelectItem>
                      <SelectItem value="pending">{t('venezuela.pedidos.statusExtended.pending')}</SelectItem>
                      <SelectItem value="reviewing">{t('venezuela.pedidos.statusExtended.reviewing')}</SelectItem>
                      <SelectItem value="quoted">{t('venezuela.pedidos.statusExtended.quoted')}</SelectItem>
                      <SelectItem value="processing">{t('venezuela.pedidos.statusExtended.processing')}</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Removed refresh button per request */}
                </div>
              </div>
            </CardHeader>
          </Card>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          {loading ? (
            <Card className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardContent className="p-12 text-center">{t('venezuela.pedidos.loadingOrders')}</CardContent>
            </Card>
          ) : error ? (
            <Card className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardContent className="p-12 text-center text-red-600">{error}</CardContent>
            </Card>
          ) : filteredOrders.length === 0 ? (
            <Card className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{t('venezuela.pedidos.emptyOrdersTitle')}</h3>
                <p className="text-slate-600 dark:text-slate-400">{t('venezuela.pedidos.emptyOrdersDesc')}</p>
              </CardContent>
            </Card>
          ) : (
            sortedOrders.map(order => {
              const stateNum = Number(order.state);
              return (
                <Card key={order.id} className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg dark:text-white">{order.productName}</CardTitle>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{order.id} - {order.clientName}</p>
                      </div>
                      <div className="flex gap-2 flex-wrap justify-end">
                        {stateNum === 13 && (<Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:ring-1 hover:ring-emerald-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-emerald-700/50">{t('admin.orders.status.entregado')}</Badge>)}
                        {stateNum === 12 && (<Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:ring-1 hover:ring-blue-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-blue-700/50">READY</Badge>)}
                        {stateNum === 11 && (<Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:ring-1 hover:ring-emerald-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-emerald-700/50">RECEIVED</Badge>)}
                        {stateNum === 10 && (<Badge className="bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 hover:ring-1 hover:ring-indigo-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-indigo-700/50">CUSTOMS</Badge>)}
                        {stateNum === 9 && (<Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:ring-1 hover:ring-emerald-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-emerald-700/50">ARRIVED</Badge>)}
                        {stateNum === 8 && (<Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 hover:ring-1 hover:ring-emerald-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-emerald-700/50">IN TRANSIT</Badge>)}
                        {stateNum === 1 && (<Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 hover:ring-1 hover:ring-yellow-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-yellow-700/50">{t('venezuela.pedidos.statusExtended.pending')}</Badge>)}
                        {stateNum === 2 && (<Badge className="bg-green-100 text-green-800 border-green-200 hover:bg-green-50 hover:border-green-300 hover:ring-1 hover:ring-green-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-green-700/50">{t('venezuela.pedidos.statusExtended.reviewing')}</Badge>)}
                        {stateNum === 3 && (<Badge className="bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-50 hover:border-purple-300 hover:ring-1 hover:ring-purple-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-purple-700/50">{t('venezuela.pedidos.statusExtended.quoted')}</Badge>)}
                        {stateNum === 4 && (<Badge className="bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-50 hover:border-blue-300 hover:ring-1 hover:ring-blue-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-blue-700/50">{t('venezuela.pedidos.statusExtended.processing')}</Badge>)}
                        {(stateNum >= 5 && stateNum <= 7) && (<Badge className="bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:ring-1 hover:ring-gray-200 dark:hover:brightness-125 dark:hover:ring-1 dark:hover:ring-gray-700/50">IN PROCESS</Badge>)}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between"><span>{t('admin.orders.form.quantity')}:</span><span className="font-medium">{order.quantity}</span></div>
                      <div className="flex items-center justify-between"><span>{t('admin.orders.form.deliveryType')}:</span><span className="font-medium">{order.deliveryType}</span></div>
                      <div className="flex items-center justify-between"><span>{t('admin.orders.pdf.shippingType')}:</span><span className="font-medium">{order.shippingType}</span></div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="bg-blue-600 gap-x-1 text-white hover:bg-blue-700 hover:text-white card-animate-liftbounce flex-1"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (order.pdfRoutes) {
                            const win = window.open(order.pdfRoutes, '_blank');
                            if (!win) alert('No se pudo abrir el PDF');
                          } else {
                            alert('No hay PDF disponible');
                          }
                        }}
                      >
                        <Eye className="w-4 h-4" /> {t('admin.orders.actions.view')}
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={loading || ![1,8,11,12].includes(stateNum)}
                        onClick={async () => {
                          const advance = async (url: string, body: any) => {
                            const res = await fetch(url, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                            if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err.error || 'Error'); }
                            await fetchOrders();
                          };
                          try {
                            if (stateNum === 1) return advance('/venezuela/pedidos/api/send-to-china', { orderId: order.id });
                            if (stateNum === 8) return advance('/venezuela/pedidos/api/advance-state', { orderId: order.id, nextState: 9 });
                            if (stateNum === 9) return advance('/venezuela/pedidos/api/advance-state', { orderId: order.id, nextState: 10 });
                            if (stateNum === 11) return advance('/venezuela/pedidos/api/advance-state', { orderId: order.id, nextState: 12 });
                            if (stateNum === 12) return advance('/venezuela/pedidos/api/advance-state', { orderId: order.id, nextState: 13 });
                          } catch (e:any) { alert(e.message || 'Error'); }
                        }}
                      >
                        {stateNum >= 13 ? (<><CheckCircle className="w-4 h-4 mr-2" />{t('admin.orders.status.entregado')}</>) : stateNum === 12 ? (<><CheckCircle className="w-4 h-4 mr-2" />{t('admin.orders.status.entregado')}</>) : stateNum === 11 ? (<><Package className="w-4 h-4 mr-2" />RECEIVED</>) : stateNum === 9 ? (<><Package className="w-4 h-4 mr-2" />RECEIVED</>) : stateNum === 8 ? (<><Package className="w-4 h-4 mr-2" />IN TRANSIT</>) : stateNum === 10 ? (<><Clock className="w-4 h-4 mr-2" />CUSTOMS</>) : (stateNum >= 2 && stateNum <= 7) ? (<><Clock className="w-4 h-4 mr-2" />WAITING</>) : (<><Send className="w-4 h-4 mr-2" />{t('venezuela.pedidos.actions.send')}</>)}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        </div>
      )}

      {activeSubTab === 'cajas' && (
        <Card className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Boxes className="h-5 w-5" /> {t('venezuela.pedidos.tabs.boxes')}
              </CardTitle>
              <div className="w-full sm:w-auto flex items-center justify-end gap-2 md:gap-3 flex-wrap">
                <Input value={filtroCaja} onChange={(e)=>setFiltroCaja(e.target.value)} placeholder={t('chinese.ordersPage.filters.searchBoxPlaceholder')} className="h-10 w-full sm:w-64 px-3" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {boxes.length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-500">{t('venezuela.pedidos.emptyBoxesTitle')}</div>
            ) : boxes.filter((b, idx) => { if (!filtroCaja) return true; const id = b.box_id ?? b.boxes_id ?? b.id ?? idx; return String(id).toLowerCase().includes(filtroCaja.toLowerCase()); }).length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-500">{t('venezuela.pedidos.emptyBoxesDesc')}</div>
            ) : (
              <div className="space-y-3">
                {boxes.filter((b, idx) => { if (!filtroCaja) return true; const id = b.box_id ?? b.boxes_id ?? b.id ?? idx; return String(id).toLowerCase().includes(filtroCaja.toLowerCase()); }).map((box, idx) => {
                  const id = box.box_id ?? box.boxes_id ?? box.id ?? idx;
                  const created = box.creation_date ?? box.created_at ?? '';
                  const stateNum = (box.state ?? 1) as number;
                  const countKey = box.box_id ?? box.boxes_id ?? box.id ?? id;
                  return (
                    <div key={`${id}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md transition-all duration-300">
                      <div className="min-w-0 flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 rounded-lg"><Boxes className="h-5 w-5 text-indigo-600" /></div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-slate-900 truncate">#BOX-{id}</h3>
                          <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{created ? new Date(created).toLocaleString('es-ES') : '—'}</span>
                            <span className="flex items-center gap-1"><List className="h-3 w-3" />{t('venezuela.pedidos.labels.ordersCount')} {orderCountsByBoxMain[countKey as any] ?? 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                        <Badge className={`border ${stateNum === 1 ? 'bg-blue-100 text-blue-800 border-blue-200' : stateNum === 2 ? 'bg-green-100 text-green-800 border-green-200' : (stateNum === 5 || stateNum === 6) ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>{stateNum === 1 ? t('venezuela.pedidos.boxesStatus.new') : stateNum === 2 ? t('venezuela.pedidos.boxesStatus.packed') : stateNum === 5 ? 'Container received' : stateNum === 6 ? 'Received' : `State ${stateNum}`}</Badge>
                        {stateNum === 5 && (
                          <Button variant="outline" size="sm" onClick={async () => { try { const res = await fetch('/venezuela/pedidos/api/advance-box', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boxId: box.box_id ?? box.boxes_id ?? box.id ?? id, nextState: 6 }) }); if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err.error || 'Error'); } await Promise.all([fetchBoxes(), fetchOrders()]); } catch (e) { alert((e as Error).message); } }} className="flex items-center gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"><CheckCircle className="h-4 w-4" />RECEIVED</Button>
                        )}
                        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => { const boxId = box.box_id ?? box.boxes_id ?? box.id; setModalVerPedidos({ open: true, boxId }); if (boxId !== undefined) fetchOrdersByBoxId(boxId as any); }}><List className="h-4 w-4" />{t('venezuela.pedidos.actions.viewOrders')}</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {boxesLoading && <p className="text-center text-sm text-slate-500 mt-4">{t('venezuela.pedidos.loadingBoxes')}</p>}
          </CardContent>
        </Card>
      )}

      {activeSubTab === 'contenedores' && (
        <Card className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Boxes className="h-5 w-5" /> {t('venezuela.pedidos.tabs.containers')}
              </CardTitle>
              <div className="w-full sm:w-auto flex items-center justify-end gap-2 md:gap-3 flex-wrap">
                <Input value={filtroContenedor} onChange={(e)=>setFiltroContenedor(e.target.value)} placeholder={t('chinese.ordersPage.filters.searchContainerPlaceholder')} className="h-10 w-full sm:w-64 px-3" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {containers.length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-500">{t('venezuela.pedidos.emptyContainersTitle')}</div>
            ) : containers.filter((c, idx) => { if (!filtroContenedor) return true; const id = c.container_id ?? c.containers_id ?? c.id ?? idx; return String(id).toLowerCase().includes(filtroContenedor.toLowerCase()); }).length === 0 ? (
              <div className="text-center py-10 text-sm text-slate-500">{t('venezuela.pedidos.emptyContainersDesc')}</div>
            ) : (
              <div className="space-y-3">
        {containers.filter((c, idx) => { if (!filtroContenedor) return true; const id = c.container_id ?? c.containers_id ?? c.id ?? idx; return String(id).toLowerCase().includes(filtroContenedor.toLowerCase()); }).map((container, idx) => {
                  const id = container.container_id ?? container.containers_id ?? container.id ?? idx;
                  const created = container.creation_date ?? container.created_at ?? '';
                  const stateNum = (container.state ?? 1) as number;
                  return (
          <div key={`${id}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md transition-all duration-300">
            <div className="min-w-0 flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 rounded-lg"><Boxes className="h-5 w-5 text-indigo-600" /></div>
                        <div className="space-y-1">
              <h3 className="font-semibold text-slate-900 truncate">#CONT-{id}</h3>
              <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{created ? new Date(created).toLocaleString('es-ES') : '—'}</span>
                          </div>
                        </div>
                      </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
                        <Badge className={`border ${stateNum === 1 ? 'bg-blue-100 text-blue-800 border-blue-200' : stateNum === 4 ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>{stateNum === 1 ? t('venezuela.pedidos.containersStatus.new') : stateNum === 4 ? 'Received' : `State ${stateNum}`}</Badge>
                        {stateNum === 3 && (
                          <Button variant="outline" size="sm" onClick={async () => { try { const res = await fetch('/venezuela/pedidos/api/advance-container', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ containerId: container.container_id ?? container.containers_id ?? container.id ?? id, nextState: 4 }) }); if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err.error || 'No se pudo actualizar el contenedor'); } await Promise.all([fetchContainers(), fetchBoxes(), fetchOrders()]); } catch (e) { alert((e as Error).message); } }} className="flex items-center gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"><CheckCircle className="h-4 w-4" />Recibido</Button>
                        )}
                        <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => { const containerId = container.container_id ?? container.containers_id ?? container.id; setModalVerCajas({ open: true, containerId }); if (containerId !== undefined) fetchBoxesByContainerId(containerId as any); }}><List className="h-4 w-4" />{t('venezuela.pedidos.actions.viewBoxes')}</Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {containersLoading && <p className="text-center text-sm text-slate-500 mt-4">{t('venezuela.pedidos.loadingContainers')}</p>}
          </CardContent>
        </Card>
      )}

      {/* Modales */}
      {modalVerPedidos.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-3xl mx-4 w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('venezuela.pedidos.modalOrdersTitle', { boxId: String(modalVerPedidos.boxId ?? '') })}</h3>
              <Button variant="ghost" size="sm" onClick={() => setModalVerPedidos({ open: false })} className="h-8 w-8 p-0">✕</Button>
            </div>
            {ordersByBoxLoading ? (
              <p className="text-center text-sm text-slate-500 py-6">{t('venezuela.pedidos.loadingOrders')}</p>
            ) : ordersByBox.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h4 className="text-base font-medium text-slate-900 dark:text-white mb-2">{t('venezuela.pedidos.modalOrdersEmptyTitle')}</h4>
                <p className="text-slate-500 dark:text-slate-400">{t('venezuela.pedidos.modalOrdersEmptyDesc')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {ordersByBox.map((o) => (
                  <div key={o.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-800/40 rounded-lg"><Package className="h-5 w-5 text-blue-600 dark:text-blue-300" /></div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">#ORD-{o.id}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{o.productName}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => { if (o.pdfRoutes) { const win = window.open(o.pdfRoutes, '_blank'); if (!win) alert('No se pudo abrir el PDF'); } else { alert('No hay PDF disponible'); } }} className="flex items-center gap-1"><Eye className="h-4 w-4" /> {t('admin.orders.actions.view')}</Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {modalVerCajas.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-3xl mx-4 w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('venezuela.pedidos.modalBoxesTitle', { containerId: String(modalVerCajas.containerId ?? '') })}</h3>
              <Button variant="ghost" size="sm" onClick={() => setModalVerCajas({ open: false })} className="h-8 w-8 p-0">✕</Button>
            </div>
            {boxesByContainerLoading ? (
              <p className="text-center text-sm text-slate-500 py-6">{t('venezuela.pedidos.loadingBoxes')}</p>
            ) : boxesByContainer.length === 0 ? (
              <div className="text-center py-12">
                <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h4 className="text-base font-medium text-slate-900 dark:text-white mb-2">{t('venezuela.pedidos.modalBoxesEmptyTitle')}</h4>
                <p className="text-slate-500 dark:text-slate-400">{t('venezuela.pedidos.modalBoxesEmptyDesc')}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {boxesByContainer.map((box, idx) => {
                  const id = box.box_id ?? box.boxes_id ?? box.id ?? idx;
                  const created = box.creation_date ?? box.created_at ?? '';
                  const stateNum = (box.state ?? 1) as number;
                  return (
                    <div key={`${id}`} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-indigo-100 dark:bg-indigo-800/40 rounded-lg"><Boxes className="h-5 w-5 text-indigo-600 dark:text-indigo-300" /></div>
                        <div className="space-y-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white">#BOX-{id}</h3>
                          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{created ? new Date(created).toLocaleString('es-ES') : '—'}</span>
                            <span className="flex items-center gap-1"><List className="h-3 w-3" />{t('venezuela.pedidos.labels.ordersCount')} {orderCountsByBox[id as any] ?? 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`border ${stateNum === 1 ? 'bg-blue-100 text-blue-800 border-blue-200' : stateNum === 2 ? 'bg-green-100 text-green-800 border-green-200' : (stateNum === 5 || stateNum === 6) ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>{stateNum === 1 ? t('venezuela.pedidos.boxesStatus.new') : stateNum === 2 ? t('venezuela.pedidos.boxesStatus.packed') : stateNum === 5 ? 'Container received' : stateNum === 6 ? 'Received' : `State ${stateNum}`}</Badge>
                        {stateNum === 5 && (
                          <Button variant="outline" size="sm" onClick={async () => { try { const res = await fetch('/venezuela/pedidos/api/advance-box', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ boxId: box.box_id ?? box.boxes_id ?? box.id ?? id, nextState: 6 }) }); if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err.error || 'No se pudo actualizar la caja'); } await Promise.all([ modalVerCajas.containerId ? fetchBoxesByContainerId(modalVerCajas.containerId) : Promise.resolve(), fetchOrders() ]); } catch (e) { alert((e as Error).message); } }} className="flex items-center gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50"><CheckCircle className="h-4 w-4" />Recibido</Button>
                        )}
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
  );
}
