"use client";
import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  Search, Filter, RefreshCw, Boxes, Package, List, CheckCircle, Calendar, Eye, Calculator, Pencil, Tag, User, Plus, Truck, Trash2, AlertTriangle, DollarSign
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useTranslation } from '@/hooks/useTranslation';
import { Toaster } from '@/components/ui/toaster';

// Componente embebido (sin Sidebar/Header) replicando funcionalidades clave de la página China.

interface Pedido {
  id: number;
  cliente: string;
  producto: string;
  cantidad: number;
  estado: 'pendiente' | 'cotizado' | 'procesando' | 'enviado';
  cotizado: boolean;
  precio: number | null;
  fecha: string;
  pdfRoutes?: string;
  deliveryType?: string;
  shippingType?: string;
  totalQuote?: number | null;
  numericState?: number;
}
interface BoxItem { boxes_id?: number | string; id?: number | string; box_id?: number | string; container_id?: number | string | null; state?: number; creation_date?: string; created_at?: string; }
interface ContainerItem { containers_id?: number | string; id?: number | string; container_id?: number | string; state?: number; creation_date?: string; created_at?: string; }

function mapStateToEstado(state: number): Pedido['estado'] {
  if (state >= 5) return 'enviado';
  if (state === 4) return 'procesando';
  if (state === 3) return 'cotizado';
  return 'pendiente';
}
function getOrderBadge(stateNum?: number) {
  const s = Number(stateNum ?? 0); const base = 'border';
  if (s <= 0 || isNaN(s)) return { label: 'unknown', className: `${base} bg-gray-100 text-gray-800 border-gray-200` };
  if (s === 3) return { label: 'quoted', className: `${base} bg-blue-100 text-blue-800 border-blue-200` };
  if (s === 4) return { label: 'processing', className: `${base} bg-purple-100 text-purple-800 border-purple-200` };
  if (s === 5) return { label: 'readyToPack', className: `${base} bg-amber-100 text-amber-800 border-amber-200` };
  if (s === 6) return { label: 'inBox', className: `${base} bg-indigo-100 text-indigo-800 border-indigo-200` };
  if (s === 7) return { label: 'inContainer', className: `${base} bg-cyan-100 text-cyan-800 border-cyan-200` };
  if (s >= 9) return { label: 'shippedVzla', className: `${base} bg-green-100 text-green-800 border-green-200` };
  return { label: `state:${s}`, className: `${base} bg-gray-100 text-gray-800 border-gray-200` };
}
function getBoxBadge(stateNum?: number) {
  const s = Number(stateNum ?? 0); const base='border';
  if (s <= 1) return { label: 'new', className: `${base} bg-blue-100 text-blue-800 border-blue-200` };
  if (s === 2) return { label: 'packed', className: `${base} bg-green-100 text-green-800 border-green-200` };
  if (s === 3) return { label: 'inContainer', className: `${base} bg-cyan-100 text-cyan-800 border-cyan-200` };
  if (s >= 4) return { label: 'shipped', className: `${base} bg-gray-100 text-gray-800 border-gray-200` };
  return { label: `state:${s}`, className: `${base} bg-gray-100 text-gray-800 border-gray-200` };
}
function getContainerBadge(stateNum?: number) {
  const s = Number(stateNum ?? 0); const base='border';
  if (s <= 1) return { label: 'new', className: `${base} bg-blue-100 text-blue-800 border-blue-200` };
  if (s === 2) return { label: 'loading', className: `${base} bg-amber-100 text-amber-800 border-amber-200` };
  if (s >= 3) return { label: 'shipped', className: `${base} bg-gray-100 text-gray-800 border-gray-200` };
  return { label: `state:${s}`, className: `${base} bg-gray-100 text-gray-800 border-gray-200` };
}

export default function ChinaOrdersTabContent() {
  const { t } = useTranslation();
  const [activeSubTab, setActiveSubTab] = useState<'pedidos' | 'cajas' | 'contenedores'>('pedidos');
  const [mounted, setMounted] = useState(false);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loadingPedidos, setLoadingPedidos] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCliente, setFiltroCliente] = useState('');

  // Modales pedidos
  const [modalCotizar, setModalCotizar] = useState<{open:boolean; pedido?: Pedido; precioCotizacion?: number}>({open:false, precioCotizacion:0});
  const [modalEmpaquetarPedido, setModalEmpaquetarPedido] = useState<{open:boolean; pedidoId?: number}>({open:false});
  const [isClosingModalCotizar, setIsClosingModalCotizar] = useState(false);
  const [isClosingModalEmpaquetarPedido, setIsClosingModalEmpaquetarPedido] = useState(false);
  const modalCotizarRef = useRef<HTMLDivElement>(null);
  const modalEmpaquetarPedidoRef = useRef<HTMLDivElement>(null);

  // Cajas
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [boxesLoading, setBoxesLoading] = useState(false);
  const [filtroCaja, setFiltroCaja] = useState('');
  const [orderCountsByBoxMain, setOrderCountsByBoxMain] = useState<Record<string | number, number>>({});
  const [ordersByBox, setOrdersByBox] = useState<Pedido[]>([]);
  const [ordersByBoxLoading, setOrdersByBoxLoading] = useState(false);
  const [modalVerPedidosCaja, setModalVerPedidosCaja] = useState<{open:boolean; boxId?: number | string}>({open:false});
  const [modalCrearCaja, setModalCrearCaja] = useState<{open:boolean}>({open:false});
  const [modalEliminarCaja, setModalEliminarCaja] = useState<{open:boolean; box?: BoxItem}>({open:false});
  const [modalEmpaquetarCaja, setModalEmpaquetarCaja] = useState<{open:boolean; boxId?: number | string}>({open:false});
  const [creatingBox, setCreatingBox] = useState(false);
  const [deletingBox, setDeletingBox] = useState(false);
  const [isClosingModalCrearCaja, setIsClosingModalCrearCaja] = useState(false);
  const [isClosingModalEliminarCaja, setIsClosingModalEliminarCaja] = useState(false);
  const [isClosingModalEmpaquetarCaja, setIsClosingModalEmpaquetarCaja] = useState(false);
  const modalCrearCajaRef = useRef<HTMLDivElement>(null);
  const modalEliminarCajaRef = useRef<HTMLDivElement>(null);
  const modalEmpaquetarCajaRef = useRef<HTMLDivElement>(null);

  // Contenedores
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [containersLoading, setContainersLoading] = useState(false);
  const [filtroContenedor, setFiltroContenedor] = useState('');
  const [boxesByContainer, setBoxesByContainer] = useState<BoxItem[]>([]);
  const [boxesByContainerLoading, setBoxesByContainerLoading] = useState(false);
  const [orderCountsByBox, setOrderCountsByBox] = useState<Record<string | number, number>>({});
  const [modalVerCajasCont, setModalVerCajasCont] = useState<{open:boolean; containerId?: number | string}>({open:false});
  const [modalCrearContenedor, setModalCrearContenedor] = useState<{open:boolean}>({open:false});
  const [modalEliminarContenedor, setModalEliminarContenedor] = useState<{open:boolean; container?: ContainerItem}>({open:false});
  const [creatingContainer, setCreatingContainer] = useState(false);
  const [deletingContainer, setDeletingContainer] = useState(false);
  const [isClosingModalCrearContenedor, setIsClosingModalCrearContenedor] = useState(false);
  const [isClosingModalEliminarContenedor, setIsClosingModalEliminarContenedor] = useState(false);
  const modalCrearContenedorRef = useRef<HTMLDivElement>(null);
  const modalEliminarContenedorRef = useRef<HTMLDivElement>(null);
  const modalVerCajasContRef = useRef<HTMLDivElement>(null);

  // Cerrar modales clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (modalCotizar.open && modalCotizarRef.current && !modalCotizarRef.current.contains(e.target as Node)) closeModalCotizar();
      if (modalEmpaquetarPedido.open && modalEmpaquetarPedidoRef.current && !modalEmpaquetarPedidoRef.current.contains(e.target as Node)) closeModalEmpaquetarPedido();
      if (modalCrearCaja.open && modalCrearCajaRef.current && !modalCrearCajaRef.current.contains(e.target as Node)) closeModalCrearCaja();
      if (modalEliminarCaja.open && modalEliminarCajaRef.current && !modalEliminarCajaRef.current.contains(e.target as Node)) closeModalEliminarCaja();
      if (modalEmpaquetarCaja.open && modalEmpaquetarCajaRef.current && !modalEmpaquetarCajaRef.current.contains(e.target as Node)) closeModalEmpaquetarCaja();
      if (modalCrearContenedor.open && modalCrearContenedorRef.current && !modalCrearContenedorRef.current.contains(e.target as Node)) closeModalCrearContenedor();
      if (modalEliminarContenedor.open && modalEliminarContenedorRef.current && !modalEliminarContenedorRef.current.contains(e.target as Node)) closeModalEliminarContenedor();
      if (modalVerCajasCont.open && modalVerCajasContRef.current && !modalVerCajasContRef.current.contains(e.target as Node)) setModalVerCajasCont({open:false});
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [modalCotizar.open, modalEmpaquetarPedido.open, modalCrearCaja.open, modalEliminarCaja.open, modalEmpaquetarCaja.open, modalCrearContenedor.open, modalEliminarContenedor.open, modalVerCajasCont.open]);

  useEffect(()=>{ setMounted(true); fetchPedidos(); },[]);
  useEffect(()=>{ if(activeSubTab==='cajas') fetchBoxes(); if(activeSubTab==='contenedores') fetchContainers(); },[activeSubTab]);

  async function fetchPedidos(){
    setLoadingPedidos(true);
    try{
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      const empleadoId = user?.id; if(!empleadoId){ setPedidos([]); return; }
      const res = await fetch(`/china/pedidos/api/orders?asignedEChina=${empleadoId}`);
      const data = await res.json();
      if(!Array.isArray(data)){ setPedidos([]); return; }
      setPedidos(
        data.map((order:any)=>({
          id: order.id,
          cliente: order.clientName || '',
          producto: order.productName || '',
          cantidad: order.quantity || 0,
          estado: mapStateToEstado(order.state),
          cotizado: order.state === 3 || (!!order.totalQuote && Number(order.totalQuote) > 0),
          precio: order.totalQuote ? Number(order.totalQuote)/Math.max(1,Number(order.quantity||1)) : null,
          fecha: order.created_at || '',
          pdfRoutes: order.pdfRoutes || '',
          deliveryType: order.deliveryType || '',
          shippingType: order.shippingType || '',
          totalQuote: order.totalQuote ?? null,
          numericState: typeof order.state === 'number'? order.state : undefined,
        }))
      );
    } finally { setLoadingPedidos(false); }
  }

  // ================== CAJAS ==================
  async function handleConfirmCrearCaja(){
    try{
      setCreatingBox(true);
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('boxes').insert([{ state:1, creation_date: new Date().toISOString() }]);
      if(error) throw error;
      toast({ title:'Caja creada', description:'La caja fue creada correctamente.' });
      closeModalCrearCaja();
      fetchBoxes();
    } catch(e:any){ console.error(e); toast({ title:'No se pudo crear', description:'Intenta más tarde.'}); } finally { setCreatingBox(false);} }

  async function handleDeleteCaja(){
    if(!modalEliminarCaja.box) return;
    try{
      setDeletingBox(true);
      const supabase = getSupabaseBrowserClient();
      const id = modalEliminarCaja.box.box_id ?? modalEliminarCaja.box.boxes_id ?? modalEliminarCaja.box.id;
      if(!id){ toast({ title:'ID inválido'}); return; }
      const { error } = await supabase.from('boxes').delete().eq('box_id', id);
      if(error) throw error;
      toast({ title:'Caja eliminada'});
      closeModalEliminarCaja();
      fetchBoxes();
    } catch(e:any){ console.error(e); toast({ title:'Error eliminando', description:'Reintenta'});} finally { setDeletingBox(false);} }

  async function fetchBoxes(){
    setBoxesLoading(true);
    try{
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.from('boxes').select('*'); if(error) throw error;
      const list=(data||[]) as BoxItem[];
      list.sort((a,b)=>{ const da=new Date((a.creation_date??a.created_at??'') as string).getTime()||0; const db=new Date((b.creation_date??b.created_at??'') as string).getTime()||0; return db-da;});
      setBoxes(list);
      const ids = list.map(b=>b.box_id ?? b.boxes_id ?? (b as any).id).filter(v=>v!=null);
      if(ids.length>0){
        const { data: ordersData } = await supabase.from('orders').select('id, box_id').in('box_id', ids as any);
        const counts: Record<string|number,number>={}; (ordersData||[]).forEach(r=>{ counts[r.box_id as any]=(counts[r.box_id as any]||0)+1; });
        setOrderCountsByBoxMain(counts);
      } else setOrderCountsByBoxMain({});
    } catch(e){ console.error(e);} finally { setBoxesLoading(false);} }

  async function fetchOrdersByBoxId(boxId:number|string){
    setOrdersByBoxLoading(true);
    try{
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.from('orders').select('*').eq('box_id', boxId); if(error) throw error;
      const mapped:Pedido[] = (data||[]).map((o:any)=>({ id:o.id, cliente:o.clientName||o.client||'—', producto:o.productName||o.product||'—', cantidad:Number(o.quantity||0), estado: mapStateToEstado(Number(o.state||2)), cotizado:Number(o.state)===3 || (!!o.totalQuote && Number(o.totalQuote)>0), precio:o.totalQuote?Number(o.totalQuote)/Math.max(1,Number(o.quantity||1)):null, fecha:o.created_at||o.creation_date||new Date().toISOString(), pdfRoutes:o.pdfRoutes||'', deliveryType:o.deliveryType||'', shippingType:o.shippingType||'', totalQuote:o.totalQuote ?? null, numericState: typeof o.state==='number'? o.state : Number(o.state||0) }));
      setOrdersByBox(mapped);
    } catch(e){ console.error(e);} finally { setOrdersByBoxLoading(false);} }

  // ================== CONTENEDORES ==================
  async function handleConfirmCrearContenedor(){
    try{
      setCreatingContainer(true);
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.from('containers').insert([{ state:1, creation_date:new Date().toISOString() }]);
      if(error) throw error;
      toast({ title:'Contenedor creado'});
      closeModalCrearContenedor();
      fetchContainers();
    } catch(e:any){ console.error(e); toast({ title:'No se pudo crear contenedor' }); } finally { setCreatingContainer(false);} }

  async function handleDeleteContenedor(){
    if(!modalEliminarContenedor.container) return;
    try{ setDeletingContainer(true); const supabase = getSupabaseBrowserClient(); const id = modalEliminarContenedor.container.container_id ?? modalEliminarContenedor.container.containers_id ?? modalEliminarContenedor.container.id; if(!id){ toast({ title:'ID inválido'}); return;} const { error } = await supabase.from('containers').delete().eq('container_id', id); if(error) throw error; toast({ title:'Contenedor eliminado'}); closeModalEliminarContenedor(); fetchContainers(); } catch(e:any){ console.error(e); toast({ title:'Error eliminando'});} finally { setDeletingContainer(false);} }

  async function fetchContainers(){
    setContainersLoading(true);
    try{ const supabase = getSupabaseBrowserClient(); const { data, error } = await supabase.from('containers').select('*'); if(error) throw error; const list=(data||[]) as ContainerItem[]; list.sort((a,b)=>{ const da=new Date((a.creation_date??a.created_at??'') as string).getTime()||0; const db=new Date((b.creation_date??b.created_at??'') as string).getTime()||0; return db-da;}); setContainers(list); } catch(e){ console.error(e);} finally { setContainersLoading(false);} }

  async function fetchBoxesByContainerId(containerId:number|string){
    setBoxesByContainerLoading(true);
    try{ const supabase = getSupabaseBrowserClient(); const { data, error } = await supabase.from('boxes').select('*').eq('container_id', containerId); if(error) throw error; const list=(data||[]) as BoxItem[]; list.sort((a,b)=>{ const da=new Date((a.creation_date??a.created_at??'') as string).getTime()||0; const db=new Date((b.creation_date??b.created_at??'') as string).getTime()||0; return db-da;}); setBoxesByContainer(list); const ids = list.map(b=>b.box_id ?? b.boxes_id ?? (b as any).id).filter(v=>v!=null); if(ids.length>0){ const { data: ordersData } = await supabase.from('orders').select('id, box_id').in('box_id', ids as any); const counts: Record<string|number,number>={}; (ordersData||[]).forEach(r=>{ counts[r.box_id as any]=(counts[r.box_id as any]||0)+1; }); setOrderCountsByBox(counts);} else setOrderCountsByBox({}); } catch(e){ console.error(e);} finally { setBoxesByContainerLoading(false);} }

  // ================== ACCIONES ==================
  async function handleSelectCajaForPedido(pedidoId:number, box:BoxItem){
    const boxId = box.box_id ?? box.boxes_id ?? box.id; if(!boxId){ toast({ title:'Caja inválida'}); return; }
    try{ const supabase = getSupabaseBrowserClient(); const boxStateNum=(box.state??1) as number; if(boxStateNum>=3){ toast({ title:'No permitido', description:'Caja enviada'}); return;} if((box as any).container_id){ const { data:cRow } = await supabase.from('containers').select('state').eq('container_id',(box as any).container_id).maybeSingle(); const contState=(cRow?.state??1) as number; if(contState>=3){ toast({ title:'No permitido', description:'Contenedor enviado'}); return;} }
      const nextOrderState = boxStateNum===2?7:6;
      const { error } = await supabase.from('orders').update({ box_id: boxId, state: nextOrderState }).eq('id', pedidoId); if(error) throw error;
      toast({ title:'Pedido asignado', description:`Pedido #ORD-${pedidoId} -> caja ${boxId}` });
      setPedidos(prev=>prev.map(p=>p.id===pedidoId?{...p, numericState:nextOrderState, estado: mapStateToEstado(nextOrderState)}:p));
      setOrderCountsByBoxMain(prev=>({ ...prev, [boxId as any]: (prev[boxId as any]||0)+1 }));
      closeModalEmpaquetarPedido();
    } catch(e:any){ console.error(e); toast({ title:'Error asignando'});} }

  async function handleUnpackOrder(pedidoId:number){
    try{ const supabase = getSupabaseBrowserClient(); const { data: row } = await supabase.from('orders').select('box_id').eq('id', pedidoId).maybeSingle(); const boxId = (row as any)?.box_id; if(!boxId){ toast({ title:'Sin caja'}); return; } const { data: boxRow } = await supabase.from('boxes').select('state, container_id').eq('box_id', boxId).maybeSingle(); const bState=(boxRow?.state??1) as number; if(bState>=3){ toast({ title:'No permitido', description:'Caja enviada'}); return;} if(boxRow?.container_id){ const { data: contRow } = await supabase.from('containers').select('state').eq('container_id', boxRow.container_id).maybeSingle(); if((contRow?.state??1)>=3){ toast({ title:'No permitido', description:'Contenedor enviado'}); return;} }
      const { error } = await supabase.from('orders').update({ box_id:null, state:5 }).eq('id', pedidoId); if(error) throw error; toast({ title:'Pedido desempaquetado'}); setPedidos(prev=>prev.map(p=>p.id===pedidoId?{...p, numericState:5, estado: mapStateToEstado(5)}:p)); setOrderCountsByBoxMain(prev=>{ if(boxId==null) return prev; return { ...prev, [boxId]: Math.max(0,(prev[boxId]||0)-1) }; }); if(modalVerPedidosCaja.open && String(modalVerPedidosCaja.boxId)===String(boxId)) fetchOrdersByBoxId(boxId); }
    catch(e:any){ console.error(e); toast({ title:'Error desempaquetando'});} }

  async function handleSelectContenedorForCaja(boxId:number|string, container:ContainerItem){
    const containerId = container.container_id ?? container.containers_id ?? container.id; if(!containerId){ toast({ title:'Contenedor inválido'}); return; }
    try{ const supabase = getSupabaseBrowserClient(); if((container.state??1)>=3){ toast({ title:'No permitido', description:'Contenedor enviado'}); return; }
      const { error: boxErr } = await supabase.from('boxes').update({ container_id: containerId, state:2 }).eq('box_id', boxId); if(boxErr) throw boxErr;
      const { error: ordersErr } = await supabase.from('orders').update({ state:7 }).eq('box_id', boxId); if(ordersErr) console.error(ordersErr);
      const { error: contUpdateErr } = await supabase.from('containers').update({ state:2 }).eq('container_id', containerId); if(contUpdateErr) console.error(contUpdateErr);
      toast({ title:'Caja asignada', description:`Caja #BOX-${boxId} -> contenedor #CONT-${containerId}` });
      setBoxes(prev=>prev.map(b=>{ const id=b.box_id ?? b.boxes_id ?? b.id; if(String(id)===String(boxId)) return { ...b, container_id: containerId, state:2 }; return b;}));
      setContainers(prev=>prev.map(c=>{ const cid=c.container_id ?? c.containers_id ?? c.id; if(String(cid)===String(containerId)) return { ...c, state:2 }; return c; }));
      closeModalEmpaquetarCaja();
    } catch(e:any){ console.error(e); toast({ title:'Error asignando contenedor'});} }

  async function handleUnpackBox(boxId:number|string, options?:{ containerId?: number|string }){
    try{ const supabase = getSupabaseBrowserClient(); if(options?.containerId){ const { data: cont } = await supabase.from('containers').select('state').eq('container_id', options.containerId).maybeSingle(); if((cont?.state??1)>=3){ toast({ title:'No permitido', description:'Contenedor enviado'}); return; } }
      await supabase.from('orders').update({ box_id:null, state:5 }).eq('box_id', boxId);
      const { error } = await supabase.from('boxes').update({ container_id:null, state:1 }).eq('box_id', boxId); if(error) throw error;
      toast({ title:'Caja desempaquetada'});
      setBoxes(prev=>prev.map(b=>{ const id=b.box_id ?? b.boxes_id ?? b.id; if(String(id)===String(boxId)) return { ...b, container_id:null, state:1 }; return b;}));
      setOrderCountsByBoxMain(prev=>({ ...prev, [boxId]:0 }));
      if(options?.containerId) fetchBoxesByContainerId(options.containerId);
      fetchPedidos();
    } catch(e:any){ console.error(e); toast({ title:'Error desempaquetando caja'});} }

  async function handleSendContainer(container:ContainerItem){
    const stateNum = (container.state??1) as number; if(stateNum!==2) return; const containerId = container.container_id ?? container.containers_id ?? container.id; if(!containerId) return;
    try{ const supabase = getSupabaseBrowserClient();
      const { error: contErr } = await supabase.from('containers').update({ state:3 }).eq('container_id', containerId); if(contErr) throw contErr;
      const { data: boxRows } = await supabase.from('boxes').select('box_id').eq('container_id', containerId);
      const boxIds = (boxRows||[]).map(r=>r.box_id).filter((v:any)=>v!=null);
      if(boxIds.length>0){ await supabase.from('boxes').update({ state:4 }).in('box_id', boxIds as any); await supabase.from('orders').update({ state:9 }).in('box_id', boxIds as any); }
      toast({ title:'Contenedor enviado'});
      setContainers(prev=>prev.map(c=>{ const cid=c.container_id ?? c.containers_id ?? c.id; if(String(cid)===String(containerId)) return { ...c, state:3 }; return c;}));
      setBoxes(prev=>prev.map(b=>{ if(String((b as any).container_id)===String(containerId)) return { ...b, state:4 }; return b;}));
    } catch(e:any){ console.error(e); toast({ title:'No se pudo enviar contenedor'});} }

  // ================== COTIZAR ==================
  async function cotizarPedido(pedido:Pedido, precioUnit:number){
    try{ const supabase = getSupabaseBrowserClient(); const total = Number(precioUnit)*Number(pedido.cantidad||0); const { error } = await supabase.from('orders').update({ totalQuote: total, state:3 }).eq('id', pedido.id); if(error) throw error; setPedidos(prev=>prev.map(p=>p.id===pedido.id?{...p, cotizado:true, precio:precioUnit, totalQuote: total, numericState:3, estado:'cotizado'}:p)); toast({ title:'Pedido cotizado'}); closeModalCotizar(); } catch(e:any){ console.error(e); toast({ title:'Error al cotizar'});} }

  // ================== MODALES CLOSE HELPERS ==================
  function closeModalCotizar(){ setIsClosingModalCotizar(true); setTimeout(()=>{ setModalCotizar({open:false}); setIsClosingModalCotizar(false); },200);} 
  function closeModalEmpaquetarPedido(){ setIsClosingModalEmpaquetarPedido(true); setTimeout(()=>{ setModalEmpaquetarPedido({open:false}); setIsClosingModalEmpaquetarPedido(false); },200);} 
  function closeModalCrearCaja(){ setIsClosingModalCrearCaja(true); setTimeout(()=>{ setModalCrearCaja({open:false}); setIsClosingModalCrearCaja(false); },200);} 
  function closeModalEliminarCaja(){ setIsClosingModalEliminarCaja(true); setTimeout(()=>{ setModalEliminarCaja({open:false}); setIsClosingModalEliminarCaja(false); },200);} 
  function closeModalEmpaquetarCaja(){ setIsClosingModalEmpaquetarCaja(true); setTimeout(()=>{ setModalEmpaquetarCaja({open:false}); setIsClosingModalEmpaquetarCaja(false); },200);} 
  function closeModalCrearContenedor(){ setIsClosingModalCrearContenedor(true); setTimeout(()=>{ setModalCrearContenedor({open:false}); setIsClosingModalCrearContenedor(false); },200);} 
  function closeModalEliminarContenedor(){ setIsClosingModalEliminarContenedor(true); setTimeout(()=>{ setModalEliminarContenedor({open:false}); setIsClosingModalEliminarContenedor(false); },200);} 

  // (Antiguas funciones básicas reemplazadas por versiones extendidas arriba)

  const pedidosFiltrados = pedidos.filter(p => {
    const estadoOk = filtroEstado === 'todos' || p.estado === filtroEstado;
    const clienteOk = !filtroCliente || p.cliente.toLowerCase().includes(filtroCliente.toLowerCase());
    return estadoOk && clienteOk;
  });
  // Local helpers to map badge state to translated text
  const getOrderBadgeLabel = (stateNum?: number) => {
    const s = Number(stateNum ?? 0);
    if (s <= 0 || isNaN(s)) return t('admin.orders.china.badges.unknown');
    if (s === 3) return t('admin.orders.china.badges.quoted');
    if (s === 4) return t('admin.orders.china.badges.processing');
    if (s === 5) return t('admin.orders.china.badges.readyToPack');
    if (s === 6) return t('admin.orders.china.badges.inBox');
    if (s === 7) return t('admin.orders.china.badges.inContainer');
    if (s >= 9) return t('admin.orders.china.badges.shippedVzla');
    return t('admin.orders.china.badges.state', { num: s });
  };
  const getBoxBadgeLabel = (stateNum?: number) => {
    const s = Number(stateNum ?? 0);
    if (s <= 1) return t('admin.orders.china.boxBadges.new');
    if (s === 2) return t('admin.orders.china.boxBadges.packed');
    if (s === 3) return t('admin.orders.china.boxBadges.inContainer');
    if (s >= 4) return t('admin.orders.china.boxBadges.shipped');
    return t('admin.orders.china.boxBadges.state', { num: s });
  };
  const getContainerBadgeLabel = (stateNum?: number) => {
    const s = Number(stateNum ?? 0);
    if (s <= 1) return t('admin.orders.china.containerBadges.new');
    if (s === 2) return t('admin.orders.china.containerBadges.loading');
    if (s >= 3) return t('admin.orders.china.containerBadges.shipped');
    return t('admin.orders.china.containerBadges.state', { num: s });
  };

  const stats = {
    pendientes: pedidos.filter(p=>p.estado==='pendiente').length,
    cotizados: pedidos.filter(p=>p.estado==='cotizado').length,
    procesando: pedidos.filter(p=>p.estado==='procesando').length,
    enviados: pedidos.filter(p=>p.estado==='enviado').length,
    totalCotizado: pedidos.filter(p=>p.precio).reduce((a,p)=> a + (p.precio||0), 0)
  };

  if(!mounted) return null;

  return (
    <>
    <div className="space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-6">
        <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm md:text-base font-medium text-yellow-700 dark:text-yellow-300">{t('admin.orders.china.stats.pending')}</p>
                <p className="text-2xl md:text-3xl font-bold text-yellow-800 dark:text-yellow-200">{stats.pendientes}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-800/30 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm md:text-base font-medium text-blue-700 dark:text-blue-300">{t('admin.orders.china.stats.quoted')}</p>
                <p className="text-2xl md:text-3xl font-bold text-blue-800 dark:text-blue-200">{stats.cotizados}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-800/30 rounded-lg flex items-center justify-center">
                <Calculator className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm md:text-base font-medium text-purple-700 dark:text-purple-300">{t('admin.orders.china.stats.processing')}</p>
                <p className="text-2xl md:text-3xl font-bold text-purple-800 dark:text-purple-200">{stats.procesando}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-800/30 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm md:text-base font-medium text-green-700 dark:text-green-300">{t('admin.orders.china.stats.shipped')}</p>
                <p className="text-2xl md:text-3xl font-bold text-green-800 dark:text-green-200">{stats.enviados}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-800/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200 dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-emerald-700 shadow-lg hover:shadow-xl transition-all duration-300 hidden md:block">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm md:text-base font-medium text-emerald-700 dark:text-emerald-300">{t('admin.orders.china.stats.totalQuoted', { defaultValue: 'TOTAL QUOTED' })}</p>
                <p className="text-xl md:text-2xl font-bold text-emerald-800 dark:text-emerald-200">${stats.totalCotizado.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 md:w-12 md:h-12 bg-emerald-100 dark:bg-emerald-800/30 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 md:w-6 md:h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sub-tabs */}
      <div className="flex justify-start">
        <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/60 backdrop-blur px-1 py-1 shadow-sm">
          {(['pedidos','cajas','contenedores'] as const).map(tab => {
            const label = tab === 'pedidos'
              ? t('admin.orders.china.tabs.ordersList')
              : tab === 'cajas'
              ? t('admin.orders.china.boxes.title')
              : t('admin.orders.china.containers.title');
            return (
              <Button key={tab} variant={activeSubTab===tab? 'default':'ghost'} size="sm" onClick={()=>setActiveSubTab(tab)} className={`rounded-md ${activeSubTab===tab? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900':'text-slate-700 dark:text-slate-300'}`}>{label}</Button>
            );
          })}
        </div>
      </div>

  {/* Toolbar unificada pedidos: se mueve al header de la lista */}

      {activeSubTab==='pedidos' && (
        <Card className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2"><Package className="h-5 w-5" />{t('admin.orders.china.orders.listTitle')}</CardTitle>
              <div className="w-full sm:w-auto flex items-center justify-end gap-2 md:gap-3 flex-wrap">
                <Input value={filtroCliente} onChange={e=>{ setFiltroCliente(e.target.value); }} placeholder={t('admin.orders.china.filters.searchClientPlaceholder')} className="h-10 w-56 md:w-64 px-3" />
                <Select value={filtroEstado} onValueChange={setFiltroEstado as any}>
                  <SelectTrigger className="h-10 w-48 md:w-56 px-3 whitespace-nowrap truncate"><SelectValue placeholder={t('admin.orders.china.filters.status')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">{t('admin.orders.china.filters.all')}</SelectItem>
                    <SelectItem value="pendiente">{t('admin.orders.china.filters.pending')}</SelectItem>
                    <SelectItem value="cotizado">{t('admin.orders.china.filters.quoted')}</SelectItem>
                    <SelectItem value="procesando">{t('admin.orders.china.filters.processing')}</SelectItem>
                    <SelectItem value="enviado">{t('admin.orders.china.filters.shipped')}</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" onClick={fetchPedidos} disabled={loadingPedidos} className="h-10 flex items-center gap-1"><RefreshCw className="h-4 w-4" />{loadingPedidos ? t('admin.orders.china.orders.refreshing') : t('admin.orders.china.orders.refresh')}</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loadingPedidos ? (<div className="py-12 text-center text-sm">{t('common.loading')}</div>) : pedidosFiltrados.length===0 ? (<div className="py-12 text-center text-sm">{t('admin.orders.china.orders.notFoundTitle')}</div>) : (
              <div className="space-y-3">
        {pedidosFiltrados.map(p=>{ const badge=getOrderBadge(p.numericState); return (
                  <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-800/40 rounded-lg"><Package className="h-5 w-5 text-blue-600 dark:text-blue-300" /></div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">#ORD-{p.id}</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">{p.producto}</p>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1"><User className="h-3 w-3" />{p.cliente}</span>
                          <span className="flex items-center gap-1"><Tag className="h-3 w-3" />{t('admin.orders.china.orders.qtyLabel')} {p.cantidad}</span>
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{p.fecha? new Date(p.fecha).toLocaleDateString('es-ES'):'—'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
          <Badge className={badge.className}>{getOrderBadgeLabel(p.numericState)}</Badge>
                      {p.precio && (<div className="text-right"><p className="text-sm font-semibold text-green-600 dark:text-green-400">${p.precio.toLocaleString()}</p><p className="text-[10px] text-slate-500">Total ${(p.precio*p.cantidad).toLocaleString()}</p></div>)}
                      <div className="flex items-center gap-2">
                        {p.estado==='enviado' && (p.numericState??0) < 6 && (
                          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={()=>{ setModalEmpaquetarPedido({open:true, pedidoId: p.id}); if(boxes.length===0) fetchBoxes(); }}>{t('admin.orders.china.orders.pack')}</Button>
                        )}
                        {p.estado==='enviado' && (p.numericState??0) >=6 && (
                          <Button variant="outline" size="sm" disabled={(p.numericState??0)>=9} onClick={()=>{ if((p.numericState??0)<9) handleUnpackOrder(p.id); }}>{t('admin.orders.china.orders.unpack')}</Button>
                        )}
                        <Button variant="outline" size="sm" onClick={()=>{ if(p.pdfRoutes){ const bust=p.pdfRoutes.includes('?')?`&t=${Date.now()}`:`?t=${Date.now()}`; window.open(p.pdfRoutes+bust,'_blank','noopener,noreferrer'); } else toast({ title: t('admin.orders.china.orders.pdfMissingToastTitle') }); }}><Eye className="h-4 w-4" /></Button>
                        {p.estado==='pendiente' ? (
                          <Button size="sm" className="bg-orange-600 hover:bg-orange-700" onClick={()=>setModalCotizar({open:true, pedido:p, precioCotizacion:p.precio||0})}><Calculator className="h-4 w-4" /></Button>
                        ) : (
                          <Button variant="outline" size="sm" onClick={()=>setModalCotizar({open:true, pedido:p, precioCotizacion:p.precio||0})}><Pencil className="h-4 w-4" /></Button>
                        )}
                      </div>
                    </div>
                  </div>
                );})}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cajas */}
      {activeSubTab==='cajas' && (
        <Card className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2"><Boxes className="h-5 w-5" />{t('admin.orders.china.boxes.title')}</CardTitle>
              <div className="w-full sm:w-auto flex items-center justify-end gap-2 md:gap-3 flex-wrap">
        <Input value={filtroCaja} onChange={e=>setFiltroCaja(e.target.value)} placeholder={t('admin.orders.china.filters.searchBoxPlaceholder')} className="h-10 w-56 md:w-64 px-3" />
        <Button size="sm" variant="outline" onClick={fetchBoxes} disabled={boxesLoading} className="h-10"><RefreshCw className="h-4 w-4" />{boxesLoading ? t('admin.orders.china.orders.refreshing') : t('admin.orders.china.orders.refresh')}</Button>
        <Button size="sm" className="h-10 bg-orange-600 hover:bg-orange-700" onClick={()=>setModalCrearCaja({open:true})}><Plus className="h-4 w-4" />{t('admin.orders.china.boxes.create')}</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
      {boxes.length===0 ? (<div className="py-10 text-center text-sm">{t('admin.orders.china.boxes.noneTitle')}</div>) : boxes.filter((b,idx)=>{ if(!filtroCaja) return true; const id=b.box_id ?? b.boxes_id ?? b.id ?? idx; return String(id).toLowerCase().includes(filtroCaja.toLowerCase()); }).length===0 ? (<div className="py-10 text-center text-sm">{t('admin.orders.china.boxes.notFoundTitle')}</div>) : (
              <div className="space-y-3">
        {boxes.filter((b,idx)=>{ if(!filtroCaja) return true; const id=b.box_id ?? b.boxes_id ?? b.id ?? idx; return String(id).toLowerCase().includes(filtroCaja.toLowerCase()); }).map((box,idx)=>{ const id=box.box_id ?? box.boxes_id ?? box.id ?? idx; const created=box.creation_date ?? box.created_at ?? ''; const stateNum=(box.state??1) as number; const countKey = box.box_id ?? box.boxes_id ?? box.id ?? id; const badge=getBoxBadge(stateNum); return (
                  <div key={id as any} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-100 dark:bg-indigo-800/40 rounded-lg"><Boxes className="h-5 w-5 text-indigo-600 dark:text-indigo-300" /></div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">#BOX-{id}</h3>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{created? new Date(created).toLocaleString('es-ES'):'—'}</span>
                          <span className="flex items-center gap-1"><List className="h-3 w-3" />Pedidos: {orderCountsByBoxMain[countKey as any] ?? 0}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
          <Badge className={badge.className}>{getBoxBadgeLabel(stateNum)}</Badge>
                      {stateNum===1 && (<Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={()=>{ const currentBoxId=box.box_id ?? box.boxes_id ?? box.id; setModalEmpaquetarCaja({open:true, boxId: currentBoxId}); if(containers.length===0) fetchContainers(); }}>{t('admin.orders.china.boxes.pack')}</Button>)}
                      {stateNum===2 && (<Button variant="outline" size="sm" onClick={()=>{ const currentBoxId=box.box_id ?? box.boxes_id ?? box.id; if(currentBoxId!==undefined) handleUnpackBox(currentBoxId as any); }}>{t('admin.orders.china.boxes.unpack')}</Button>)}
                      {stateNum>=3 && (<Button variant="outline" size="sm" disabled>{t('admin.orders.china.boxes.unpack')}</Button>)}
                      <Button variant="outline" size="sm" onClick={()=>{ const boxId=box.box_id ?? box.boxes_id ?? box.id; setModalVerPedidosCaja({open:true, boxId}); if(boxId!==undefined) fetchOrdersByBoxId(boxId); }}>{t('admin.orders.china.boxes.viewOrders')}</Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-50" disabled={(box.state??1)>=3} onClick={()=>{ if((box.state??1)>=3){ toast({ title: t('admin.orders.china.toasts.notAllowedTitle'), description: t('admin.orders.china.toasts.boxUnpackNotAllowedDesc') }); return;} setModalEliminarCaja({open:true, box}); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ); })}
              </div>
            )}
            {boxesLoading && <p className="text-center text-sm mt-4">{t('admin.orders.china.boxes.loading')}</p>}
          </CardContent>
        </Card>
      )}

      {/* Contenedores */}
      {activeSubTab==='contenedores' && (
        <Card className="bg-white/80 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold flex items-center gap-2"><Boxes className="h-5 w-5" />{t('admin.orders.china.containers.title')}</CardTitle>
              <div className="w-full sm:w-auto flex items-center justify-end gap-2 md:gap-3 flex-wrap">
        <Input value={filtroContenedor} onChange={e=>setFiltroContenedor(e.target.value)} placeholder={t('admin.orders.china.filters.searchContainerPlaceholder')} className="h-10 w-56 md:w-64 px-3" />
        <Button size="sm" variant="outline" onClick={fetchContainers} disabled={containersLoading} className="h-10"><RefreshCw className="h-4 w-4" />{containersLoading ? t('admin.orders.china.orders.refreshing') : t('admin.orders.china.orders.refresh')}</Button>
        <Button size="sm" className="h-10 bg-orange-600 hover:bg-orange-700" onClick={()=>setModalCrearContenedor({open:true})}><Plus className="h-4 w-4" />{t('admin.orders.china.containers.create')}</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
      {containers.length===0 ? (<div className="py-10 text-center text-sm">{t('admin.orders.china.containers.noneTitle')}</div>) : containers.filter((c,idx)=>{ if(!filtroContenedor) return true; const id=c.container_id ?? c.containers_id ?? c.id ?? idx; return String(id).toLowerCase().includes(filtroContenedor.toLowerCase()); }).length===0 ? (<div className="py-10 text-center text-sm">{t('admin.orders.china.containers.notFoundTitle')}</div>) : (
              <div className="space-y-3">
        {containers.filter((c,idx)=>{ if(!filtroContenedor) return true; const id=c.container_id ?? c.containers_id ?? c.id ?? idx; return String(id).toLowerCase().includes(filtroContenedor.toLowerCase()); }).map((container,idx)=>{ const id=container.container_id ?? container.containers_id ?? container.id ?? idx; const created=container.creation_date ?? container.created_at ?? ''; const stateNum=(container.state??1) as number; const badge=getContainerBadge(stateNum); return (
                  <div key={id as any} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-100 dark:bg-indigo-800/40 rounded-lg"><Boxes className="h-5 w-5 text-indigo-600 dark:text-indigo-300" /></div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-slate-900 dark:text-white">#CONT-{id}</h3>
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400"><span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{created? new Date(created).toLocaleString('es-ES'):'—'}</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
          <Badge className={badge.className}>{getContainerBadgeLabel(stateNum)}</Badge>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={stateNum!==2} onClick={()=>handleSendContainer(container)}><Truck className="h-4 w-4" />{t('admin.orders.china.containers.send')}</Button>
                      <Button variant="outline" size="sm" onClick={()=>{ const containerId = container.container_id ?? container.containers_id ?? container.id; setModalVerCajasCont({open:true, containerId}); if(containerId!==undefined) fetchBoxesByContainerId(containerId); }}>{t('admin.orders.china.containers.viewBoxes')}</Button>
                      <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-50" disabled={(container.state??1)>=3} onClick={()=>{ if((container.state??1)>=3){ toast({ title: t('admin.orders.china.toasts.notAllowedTitle'), description: t('admin.orders.china.toasts.containerSendNotAllowedDesc') }); return;} setModalEliminarContenedor({open:true, container}); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ); })}
              </div>
            )}
            {containersLoading && <p className="text-center text-sm mt-4">{t('admin.orders.china.containers.loading')}</p>}
          </CardContent>
        </Card>
      )}

  {/* Modales - Ver pedidos de una caja */}
      {modalVerPedidosCaja.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-3xl mx-4 w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('admin.orders.china.modals.boxOrders.title', { id: String(modalVerPedidosCaja.boxId ?? '') })}</h3><Button variant="ghost" size="sm" onClick={()=>setModalVerPedidosCaja({open:false})} className="h-8 w-8 p-0">✕</Button></div>
            {ordersByBoxLoading ? <p className="text-center text-sm text-slate-500 py-6">{t('admin.orders.china.modals.boxOrders.loading')}</p> : ordersByBox.length===0 ? (
              <div className="text-center py-12"><Package className="h-12 w-12 text-slate-400 mx-auto mb-4" /><p className="text-slate-500 dark:text-slate-400">{t('admin.orders.china.modals.boxOrders.noneTitle')}</p></div>
            ) : (
              <div className="space-y-3">
        {ordersByBox.map(o=>{ const badge=getOrderBadge(o.numericState); return (
                  <div key={o.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
                    <div className="space-y-1"><p className="font-semibold text-slate-900 dark:text-white">#{o.id} {o.producto}</p><p className="text-xs text-slate-500 dark:text-slate-400">{o.cliente}</p></div>
          <Badge className={badge.className}>{getOrderBadgeLabel(o.numericState)}</Badge>
                  </div>
                ); })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modales - Ver cajas de contenedor */}
      {modalVerCajasCont.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div ref={modalVerCajasContRef} className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-3xl mx-4 w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('admin.orders.china.modals.containerBoxes.title', { id: String(modalVerCajasCont.containerId ?? '') })}</h3><Button variant="ghost" size="sm" onClick={()=>setModalVerCajasCont({open:false})} className="h-8 w-8 p-0">✕</Button></div>
            {boxesByContainerLoading ? <p className="text-center text-sm text-slate-500 py-6">{t('admin.orders.china.modals.containerBoxes.loading')}</p> : boxesByContainer.length===0 ? (
              <div className="text-center py-12"><Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" /><p className="text-slate-500 dark:text-slate-400">{t('admin.orders.china.modals.containerBoxes.noneTitle')}</p></div>
            ) : (
              <div className="space-y-3">
                {boxesByContainer.map((box,idx)=>{ const id = box.box_id ?? box.boxes_id ?? box.id ?? idx; const created = box.creation_date ?? box.created_at ?? ''; const stateNum=(box.state ?? 1) as number; const badge=getBoxBadge(stateNum); return (
                  <div key={id as any} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
                    <div className="space-y-1"><p className="font-semibold text-slate-900 dark:text-white">#BOX-{id}</p><p className="text-xs text-slate-500 dark:text-slate-400">{created ? new Date(created).toLocaleString('es-ES') : '—'}</p></div>
                    <div className="flex items-center gap-3">
                      <Badge className={badge.className}>{badge.label}</Badge>
                      {stateNum===2 && (<Button variant="outline" size="sm" onClick={()=>{ const boxId=box.box_id ?? box.boxes_id ?? box.id; const containerId=modalVerCajasCont.containerId; handleUnpackBox(boxId as any,{ containerId}); }}>{t('admin.orders.china.boxes.unpack')}</Button>)}
                      {stateNum>=3 && (<Button variant="outline" size="sm" disabled>{t('admin.orders.china.boxes.unpack')}</Button>)}
                      <Button variant="outline" size="sm" onClick={()=>{ const boxId=box.box_id ?? box.boxes_id ?? box.id; setModalVerPedidosCaja({open:true, boxId}); if(boxId!==undefined) fetchOrdersByBoxId(boxId); }}>{t('admin.orders.china.boxes.viewOrders')}</Button>
                    </div>
                  </div>
                ); })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Cotizar */}
      {modalCotizar.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div ref={modalCotizarRef} className={`bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-lg mx-4 w-full transition-all ${isClosingModalCotizar? 'scale-95 opacity-0' : 'scale-100 opacity-100'} duration-200`}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('admin.orders.china.modals.quote.title')}</h3><Button variant="ghost" size="sm" onClick={closeModalCotizar} className="h-8 w-8 p-0">✕</Button></div>
            <form onSubmit={e=>{ e.preventDefault(); const precio=Number((e.target as any).precio.value); if(precio>0 && modalCotizar.pedido) cotizarPedido(modalCotizar.pedido, precio); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm"><div><p className="font-medium">{t('admin.orders.china.modals.quote.client')}</p><p>{modalCotizar.pedido?.cliente}</p></div><div><p className="font-medium">{t('admin.orders.china.modals.quote.product')}</p><p>{modalCotizar.pedido?.producto}</p></div><div><p className="font-medium">{t('admin.orders.china.modals.quote.quantity')}</p><p>{modalCotizar.pedido?.cantidad}</p></div><div><p className="font-medium">{t('admin.orders.table.status')}</p><p>{modalCotizar.pedido?.estado}</p></div></div>
              <div><label className="text-sm font-medium">{t('admin.orders.china.modals.quote.unitPriceLabel')}</label><div className="relative mt-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">$</span><input name="precio" type="number" required min="0" step="0.01" defaultValue={modalCotizar.precioCotizacion} onChange={e=>setModalCotizar(prev=>({...prev, precioCotizacion:Number(e.target.value)}))} className="w-full pl-7 pr-3 py-2 rounded-md border border-slate-300 bg-white dark:bg-slate-800" /></div></div>
              <div className="text-sm"><p className="font-medium">{t('admin.orders.china.modals.quote.totalToPay')}</p><p className="text-green-600 dark:text-green-400 font-semibold text-lg">${((modalCotizar.precioCotizacion||0)*(modalCotizar.pedido?.cantidad||0)).toLocaleString()}</p></div>
              <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={closeModalCotizar}>{t('admin.orders.china.modals.quote.cancel')}</Button><Button type="submit" className="bg-blue-600 hover:bg-blue-700">{t('admin.orders.china.modals.quote.sendQuote')}</Button></div>
            </form>
          </div>
        </div>
      )}

      {/* Modal seleccionar caja para pedido */}
      {modalEmpaquetarPedido.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div ref={modalEmpaquetarPedidoRef} className={`bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl mx-4 w-full max-h-[85vh] overflow-y-auto transition-all ${isClosingModalEmpaquetarPedido? 'scale-95 opacity-0' : 'scale-100 opacity-100'} duration-200`}>
    <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold text-slate-900 dark:text-white">{t('admin.orders.china.modals.selectBoxForOrder.title', { id: String(modalEmpaquetarPedido.pedidoId ?? '') })}</h3><Button variant="ghost" size="sm" onClick={closeModalEmpaquetarPedido} className="h-8 w-8 p-0">✕</Button></div>
    {boxesLoading ? (<p className="text-center text-sm py-6">{t('admin.orders.china.modals.selectBoxForOrder.loading')}</p>) : boxes.length===0 ? (<div className="text-center py-12"><Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" /><p className="text-sm text-slate-500">{t('admin.orders.china.modals.selectBoxForOrder.noneTitle')}</p></div>) : (
              <div className="space-y-3">{boxes.map((box,idx)=>{ const id=box.box_id ?? box.boxes_id ?? box.id ?? idx; const created=box.creation_date ?? box.created_at ?? ''; const stateNum=(box.state??1) as number; return (
                <div key={id as any} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
                  <div className="space-y-1"><p className="font-semibold text-slate-900 dark:text-white">#BOX-{id}</p><p className="text-xs text-slate-500 dark:text-slate-400">{created? new Date(created).toLocaleString('es-ES'):'—'}</p></div>
      <div className="flex items-center gap-3"><Badge className={`border ${stateNum===1?'bg-blue-100 text-blue-800 border-blue-200': stateNum===2? 'bg-green-100 text-green-800 border-green-200':'bg-gray-100 text-gray-800 border-gray-200'}`}>{stateNum===1?t('admin.orders.china.boxesStatus.new'): stateNum===2? t('admin.orders.china.boxesStatus.ready'):t('admin.orders.china.boxesStatus.state', { num: stateNum })}</Badge><Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={()=> modalEmpaquetarPedido.pedidoId && handleSelectCajaForPedido(modalEmpaquetarPedido.pedidoId, box)}>{t('admin.orders.china.modals.selectBoxForOrder.select')}</Button></div>
  <div className="flex items-center gap-3"><Badge className={`border ${stateNum===1?'bg-blue-100 text-blue-800 border-blue-200': stateNum===2? 'bg-green-100 text-green-800 border-green-200':'bg-gray-100 text-gray-800 border-gray-200'}`}>{getBoxBadgeLabel(stateNum)}</Badge><Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={()=> modalEmpaquetarPedido.pedidoId && handleSelectCajaForPedido(modalEmpaquetarPedido.pedidoId, box)}>{t('admin.orders.china.modals.selectBoxForOrder.select')}</Button></div>
                </div>
              ); })}</div>
            )}
          </div>
        </div>
      )}

      {/* Modal crear caja */}
      {modalCrearCaja.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div ref={modalCrearCajaRef} className={`bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md mx-4 w-full transition-all ${isClosingModalCrearCaja? 'scale-95 opacity-0':'scale-100 opacity-100'} duration-200`}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">{t('admin.orders.china.modals.createBox.title')}</h3><Button variant="ghost" size="sm" onClick={closeModalCrearCaja} className="h-8 w-8 p-0">✕</Button></div>
            <p className="text-sm mb-6">{t('admin.orders.china.modals.createBox.question')}</p>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={closeModalCrearCaja} disabled={creatingBox}>{t('admin.orders.china.modals.createBox.cancel')}</Button><Button className="bg-blue-600 hover:bg-blue-700" disabled={creatingBox} onClick={handleConfirmCrearCaja}>{creatingBox? t('admin.orders.china.modals.createBox.creating') : t('admin.orders.china.modals.createBox.accept')}</Button></div>
          </div>
        </div>
      )}

      {/* Modal eliminar caja */}
      {modalEliminarCaja.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div ref={modalEliminarCajaRef} className={`bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md mx-4 w-full transition-all ${isClosingModalEliminarCaja? 'scale-95 opacity-0':'scale-100 opacity-100'} duration-200`}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">{t('admin.orders.china.modals.deleteBox.title')}</h3><Button variant="ghost" size="sm" onClick={closeModalEliminarCaja} className="h-8 w-8 p-0">✕</Button></div>
            <p className="text-sm mb-6">{t('admin.orders.china.modals.deleteBox.question', { id: String(modalEliminarCaja.box?.box_id ?? modalEliminarCaja.box?.boxes_id ?? modalEliminarCaja.box?.id ?? '') })}</p>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={closeModalEliminarCaja} disabled={deletingBox}>{t('admin.orders.china.modals.deleteBox.cancel')}</Button><Button className="bg-red-600 hover:bg-red-700" disabled={deletingBox} onClick={handleDeleteCaja}>{deletingBox? t('admin.orders.china.modals.deleteBox.deleting') : t('admin.orders.china.modals.deleteBox.delete')}</Button></div>
          </div>
        </div>
      )}

      {/* Modal asignar contenedor a caja */}
      {modalEmpaquetarCaja.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div ref={modalEmpaquetarCajaRef} className={`bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-2xl mx-4 w-full max-h-[85vh] overflow-y-auto transition-all ${isClosingModalEmpaquetarCaja? 'scale-95 opacity-0':'scale-100 opacity-100'} duration-200`}>
    <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">{t('admin.orders.china.modals.selectContainerForBox.title', { id: String(modalEmpaquetarCaja.boxId ?? '') })}</h3><Button variant="ghost" size="sm" onClick={closeModalEmpaquetarCaja} className="h-8 w-8 p-0">✕</Button></div>
    {containersLoading ? (<p className="text-center text-sm py-6">{t('admin.orders.china.modals.selectContainerForBox.loading')}</p>) : containers.length===0 ? (<div className="py-12 text-center"><Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" /><p className="text-sm">{t('admin.orders.china.modals.selectContainerForBox.noneTitle')}</p></div>) : (
              <div className="space-y-3">{containers.map((container,idx)=>{ const id=container.container_id ?? container.containers_id ?? container.id ?? idx; const created = container.creation_date ?? container.created_at ?? ''; const stateNum=(container.state??1) as number; return (
                <div key={id as any} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-600">
  <div className="space-y-1"><p className="font-semibold">#CONT-{id}</p><p className="text-xs text-slate-500">{created? new Date(created).toLocaleString('es-ES'):'—'}</p></div>
  <div className="flex items-center gap-3"><Badge className={getContainerBadge(stateNum).className}>{getContainerBadgeLabel(stateNum)}</Badge><Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={()=> modalEmpaquetarCaja.boxId && handleSelectContenedorForCaja(modalEmpaquetarCaja.boxId, container)}>{t('admin.orders.china.modals.selectContainerForBox.select')}</Button></div>
                </div>
              ); })}</div>
            )}
          </div>
        </div>
      )}

      {/* Modal crear contenedor */}
      {modalCrearContenedor.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div ref={modalCrearContenedorRef} className={`bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md mx-4 w-full transition-all ${isClosingModalCrearContenedor? 'scale-95 opacity-0':'scale-100 opacity-100'} duration-200`}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">{t('admin.orders.china.modals.createContainer.title')}</h3><Button variant="ghost" size="sm" onClick={closeModalCrearContenedor} className="h-8 w-8 p-0">✕</Button></div>
            <p className="text-sm mb-6">{t('admin.orders.china.modals.createContainer.question')}</p>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={closeModalCrearContenedor} disabled={creatingContainer}>{t('admin.orders.china.modals.createContainer.cancel')}</Button><Button className="bg-blue-600 hover:bg-blue-700" disabled={creatingContainer} onClick={handleConfirmCrearContenedor}>{creatingContainer? t('admin.orders.china.modals.createContainer.creating') : t('admin.orders.china.modals.createContainer.accept')}</Button></div>
          </div>
        </div>
      )}

      {/* Modal eliminar contenedor */}
      {modalEliminarContenedor.open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div ref={modalEliminarContenedorRef} className={`bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md mx-4 w-full transition-all ${isClosingModalEliminarContenedor? 'scale-95 opacity-0':'scale-100 opacity-100'} duration-200`}>
            <div className="flex items-center justify-between mb-4"><h3 className="text-lg font-bold">{t('admin.orders.china.modals.deleteContainer.title')}</h3><Button variant="ghost" size="sm" onClick={closeModalEliminarContenedor} className="h-8 w-8 p-0">✕</Button></div>
            <p className="text-sm mb-6">{t('admin.orders.china.modals.deleteContainer.question', { id: String(modalEliminarContenedor.container?.container_id ?? modalEliminarContenedor.container?.containers_id ?? modalEliminarContenedor.container?.id ?? '') })}</p>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={closeModalEliminarContenedor} disabled={deletingContainer}>{t('admin.orders.china.modals.deleteContainer.cancel')}</Button><Button className="bg-red-600 hover:bg-red-700" disabled={deletingContainer} onClick={handleDeleteContenedor}>{deletingContainer? t('admin.orders.china.modals.deleteContainer.deleting') : t('admin.orders.china.modals.deleteContainer.delete')}</Button></div>
          </div>
        </div>
      )}
  </div>
  <Toaster />
  </>
  );
}
