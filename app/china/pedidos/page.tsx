"use client";
import React, { useState, useEffect, useRef } from "react";
import { useTranslation } from '@/hooks/useTranslation';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import '../../animations/animations.css';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';

import {
  Calculator,
  Eye,
  Pencil,
  BarChart3,
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  FileText,
  Flag,
  Search,
  Filter,
  Plus,
  RefreshCw,
  MoreHorizontal,
  User,
  Calendar,
  Tag,
  Trash2,
  List
} from 'lucide-react';
import { Boxes } from 'lucide-react';

// NUEVO: importar contexto y hook realtime
import { useChinaContext } from '@/lib/ChinaContext';
import { useRealtimeChina } from '@/hooks/use-realtime-china';
import { getSupabaseBrowserClient as _getClient } from '@/lib/supabase/client';

// Tipos
interface Pedido {
  id: number;
  clientId?: string;
  cliente: string;
  producto: string;
  cantidad: number;
  estado: 'pendiente' | 'cotizado' | 'procesando' | 'enviado';
  cotizado: boolean;
  precio: number | null;
  fecha: string;
  prioridad?: 'baja' | 'media' | 'alta';
  proveedor?: string;
  especificaciones?: string;
  // Ruta del PDF asociada al pedido
  pdfRoutes?: string;
  deliveryType?: string;
  shippingType?: string;
  totalQuote?: number | null;
  numericState?: number;
}

interface BoxItem {
  boxes_id?: number | string;
  id?: number | string;
  box_id?: number | string;
  container_id?: number | string;
  state?: number;
  creation_date?: string;
  created_at?: string;
  [key: string]: any;
}

interface ContainerItem {
  containers_id?: number | string;
  id?: number | string;
  container_id?: number | string;
  state?: number;
  creation_date?: string;
  created_at?: string;
  [key: string]: any;
}

// Elimina los datos de ejemplo

export default function PedidosChina() {
  const { t } = useTranslation();
  // NUEVO: obtener chinaId del contexto
  const { chinaId } = useChinaContext();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  // Mapear state numérico a texto usado en China
  function mapStateToEstado(state: number): Pedido['estado'] {
    // Rango solicitado para la vista China:
    // 2: pendiente
    // 3-4: procesando (3 se mostrará como cotizado donde aplique)
    // 5-8: enviado
    if (state >= 5 && state <= 8) return 'enviado';
    if (state === 4) return 'procesando';
    if (state === 3) return 'cotizado';
    if (state === 2) return 'pendiente';
    // Fallback: cualquier otro se considera pendiente aquí
    return 'pendiente';
  }

  // Badges estandarizados para pedidos según estado numérico
  function getOrderBadge(stateNum?: number) {
    const s = Number(stateNum ?? 0);
    // Colores utilitarios tailwind para Badges
    const base = 'border';
    if (s <= 0 || isNaN(s)) return { label: t('chinese.ordersPage.badges.unknown'), className: `${base} bg-gray-100 text-gray-800 border-gray-200` };
    if (s === 3) return { label: t('chinese.ordersPage.badges.quoted'), className: `${base} bg-blue-100 text-blue-800 border-blue-200` };
    if (s === 4) return { label: t('chinese.ordersPage.badges.processing'), className: `${base} bg-purple-100 text-purple-800 border-purple-200` };
    if (s === 5) return { label: t('chinese.ordersPage.badges.readyToPack'), className: `${base} bg-amber-100 text-amber-800 border-amber-200` };
    if (s === 6) return { label: t('chinese.ordersPage.badges.inBox'), className: `${base} bg-indigo-100 text-indigo-800 border-indigo-200` };
  if (s === 7 || s === 8) return { label: t('chinese.ordersPage.badges.inContainer'), className: `${base} bg-cyan-100 text-cyan-800 border-cyan-200` };
  if (s >= 9) return { label: t('chinese.ordersPage.badges.shippedVzla'), className: `${base} bg-green-100 text-green-800 border-green-200` };
    return { label: t('chinese.ordersPage.badges.state', { num: s }), className: `${base} bg-gray-100 text-gray-800 border-gray-200` };
  }

  // Badges estandarizados para cajas
  function getBoxBadge(stateNum?: number) {
    const s = Number(stateNum ?? 0);
    const base = 'border';
    if (s <= 1) return { label: t('chinese.ordersPage.boxBadges.new'), className: `${base} bg-blue-100 text-blue-800 border-blue-200` };
    if (s === 2) return { label: t('chinese.ordersPage.boxBadges.packed'), className: `${base} bg-green-100 text-green-800 border-green-200` };
    if (s === 3) return { label: t('chinese.ordersPage.boxBadges.inContainer'), className: `${base} bg-cyan-100 text-cyan-800 border-cyan-200` };
    if (s >= 4) return { label: t('chinese.ordersPage.boxBadges.shipped'), className: `${base} bg-gray-100 text-gray-800 border-gray-200` };
    return { label: t('chinese.ordersPage.boxBadges.state', { num: s }), className: `${base} bg-gray-100 text-gray-800 border-gray-200` };
  }

  // Badges estandarizados para contenedores
  function getContainerBadge(stateNum?: number) {
    const s = Number(stateNum ?? 0);
    const base = 'border';
    if (s <= 1) return { label: t('chinese.ordersPage.containerBadges.new'), className: `${base} bg-blue-100 text-blue-800 border-blue-200` };
    if (s === 2) return { label: t('chinese.ordersPage.containerBadges.loading'), className: `${base} bg-amber-100 text-amber-800 border-amber-200` };
    if (s >= 3) return { label: t('chinese.ordersPage.containerBadges.shipped'), className: `${base} bg-gray-100 text-gray-800 border-gray-200` };
    return { label: t('chinese.ordersPage.containerBadges.state', { num: s }), className: `${base} bg-gray-100 text-gray-800 border-gray-200` };
  }

  // Fetch pedidos reales filtrando por asignedEChina
  async function fetchPedidos() {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      const empleadoId = user?.id;
      if (!empleadoId) {
        setPedidos([]);
        setLoading(false);
        return;
      }
      const res = await fetch(`/china/pedidos/api/orders?asignedEChina=${empleadoId}`);
      const data = await res.json();
      if (!Array.isArray(data)) {
        setPedidos([]);
        setLoading(false);
        return;
      }
      console.debug('[PedidosChina] fetched raw orders count:', data.length);
      setPedidos(
        data
          // Antes filtraba state>=4 lo que ocultaba pedidos tempranos. Se elimina para mostrar todos los asignados.
          .map((order: any) => ({
          id: order.id,
          clientId: order.client_id,
          cliente: order.clientName || '',
          producto: order.productName || '',
          cantidad: order.quantity || 0,
            // Ocultamos state 1 desde la perspectiva China (solo mostrar a partir de 2)
            estado: mapStateToEstado(order.state),
            cotizado: order.state === 3 || (!!order.totalQuote && Number(order.totalQuote) > 0),
            precio: order.totalQuote ? Number(order.totalQuote) / Math.max(1, Number(order.quantity || 1)) : null,
          fecha: order.created_at || '',
          especificaciones: order.specifications || '',
          pdfRoutes: order.pdfRoutes || '',
            deliveryType: order.deliveryType || '',
            shippingType: order.shippingType || '',
            totalQuote: order.totalQuote ?? null,
            numericState: typeof order.state === 'number' ? order.state : undefined,
        }))
      );
    } finally {
      setLoading(false);
    }
  }
  const [modalCotizar, setModalCotizar] = useState<{open: boolean, pedido?: Pedido, precioCotizacion?: number}>({open: false, precioCotizacion: 0});
  const [modalDetalle, setModalDetalle] = useState<{open: boolean, pedido?: Pedido}>({open: false});
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'pedidos' | 'cajas' | 'contenedores'>('pedidos');
  const [creatingBox, setCreatingBox] = useState(false);
  const [boxes, setBoxes] = useState<BoxItem[]>([]);
  const [boxesLoading, setBoxesLoading] = useState(false);
  const [orderCountsByBoxMain, setOrderCountsByBoxMain] = useState<Record<string | number, number>>({});
  const [deletingBox, setDeletingBox] = useState(false);
  const [ordersByBox, setOrdersByBox] = useState<Pedido[]>([]);
  const [ordersByBoxLoading, setOrdersByBoxLoading] = useState(false);

  // Contenedores
  const [creatingContainer, setCreatingContainer] = useState(false);
  const [containers, setContainers] = useState<ContainerItem[]>([]);
  const [containersLoading, setContainersLoading] = useState(false);
  const [deletingContainer, setDeletingContainer] = useState(false);
  const [boxesByContainer, setBoxesByContainer] = useState<BoxItem[]>([]);
  const [boxesByContainerLoading, setBoxesByContainerLoading] = useState(false);
  const [orderCountsByBox, setOrderCountsByBox] = useState<Record<string | number, number>>({});

  // Estados para animaciones de salida
  const [isModalCotizarClosing, setIsModalCotizarClosing] = useState(false);
  const [isModalDetalleClosing, setIsModalDetalleClosing] = useState(false);
  const [isModalCrearCajaClosing, setIsModalCrearCajaClosing] = useState(false);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroCaja, setFiltroCaja] = useState('');
  const [filtroContenedor, setFiltroContenedor] = useState('');

  // Refs para cerrar modales
  const modalCotizarRef = useRef<HTMLDivElement>(null);
  const modalDetalleRef = useRef<HTMLDivElement>(null);
  const modalCrearCajaRef = useRef<HTMLDivElement>(null);
  const [modalCrearCaja, setModalCrearCaja] = useState<{open: boolean}>({ open: false });
  const modalEliminarCajaRef = useRef<HTMLDivElement>(null);
  const [modalEliminarCaja, setModalEliminarCaja] = useState<{ open: boolean; box?: BoxItem }>({ open: false });
  const [isModalEliminarCajaClosing, setIsModalEliminarCajaClosing] = useState(false);
  const modalVerPedidosRef = useRef<HTMLDivElement>(null);
  const [modalVerPedidos, setModalVerPedidos] = useState<{ open: boolean; boxId?: number | string }>({ open: false });
  const [isModalVerPedidosClosing, setIsModalVerPedidosClosing] = useState(false);
  // Campo temporal para el nombre de la caja (solo UI por ahora)
  const [newBoxName, setNewBoxName] = useState('');
  // Campo para el nombre del contenedor (requerido)
  const [newContainerName, setNewContainerName] = useState('');
  // Modal Empaquetar
  const modalEmpaquetarRef = useRef<HTMLDivElement>(null);
  const [modalEmpaquetar, setModalEmpaquetar] = useState<{ open: boolean; pedidoId?: number }>() as any;
  const [isModalEmpaquetarClosing, setIsModalEmpaquetarClosing] = useState(false);

  // Modal Empaquetar Caja (asignar contenedor)
  const modalEmpaquetarCajaRef = useRef<HTMLDivElement>(null);
  const [modalEmpaquetarCaja, setModalEmpaquetarCaja] = useState<{ open: boolean; boxId?: number | string }>({ open: false });
  const [isModalEmpaquetarCajaClosing, setIsModalEmpaquetarCajaClosing] = useState(false);

  // Modales Contenedores
  const modalCrearContenedorRef = useRef<HTMLDivElement>(null);
  const [modalCrearContenedor, setModalCrearContenedor] = useState<{ open: boolean }>({ open: false });
  const [isModalCrearContenedorClosing, setIsModalCrearContenedorClosing] = useState(false);
  const modalEliminarContenedorRef = useRef<HTMLDivElement>(null);
  const [modalEliminarContenedor, setModalEliminarContenedor] = useState<{ open: boolean; container?: ContainerItem }>({ open: false });
  const [isModalEliminarContenedorClosing, setIsModalEliminarContenedorClosing] = useState(false);
  const modalVerPedidosContRef = useRef<HTMLDivElement>(null);
  const [modalVerPedidosCont, setModalVerPedidosCont] = useState<{ open: boolean; containerId?: number | string }>({ open: false });
  const [isModalVerPedidosContClosing, setIsModalVerPedidosContClosing] = useState(false);
  // Modal Enviar Contenedor (capturar tracking y enviar)
  const modalEnviarContenedorRef = useRef<HTMLDivElement>(null);
  const [modalEnviarContenedor, setModalEnviarContenedor] = useState<{ open: boolean; container?: ContainerItem }>({ open: false });
  const [isModalEnviarContenedorClosing, setIsModalEnviarContenedorClosing] = useState(false);
  const [sendTrackingLink, setSendTrackingLink] = useState('');
  const [sendTrackingNumber, setSendTrackingNumber] = useState('');
  const [sendCourierCompany, setSendCourierCompany] = useState('');
  const [sendEtaDate, setSendEtaDate] = useState('');
  const [sendingContainer, setSendingContainer] = useState(false);
  const [containerSendInfo, setContainerSendInfo] = useState<Record<string | number, { trackingNumber: string; courierCompany: string; etaDate: string }>>({});
  // Refs para condiciones en handlers realtime sin rehacer canales
  const activeTabRef = useRef(activeTab);
  const modalEmpaquetarRefState = useRef(modalEmpaquetar?.open);
  const modalEmpaquetarCajaRefState = useRef(modalEmpaquetarCaja.open);
  const modalVerPedidosRefState = useRef(modalVerPedidos.open);
  const modalVerPedidosContRefState = useRef(modalVerPedidosCont.open);
  // Refs para IDs actuales usados por modales abiertos (para refrescar en realtime)
  const modalVerPedidosBoxIdRef = useRef<number | string | undefined>(undefined);
  const modalVerPedidosContIdRef = useRef<number | string | undefined>(undefined);

  useEffect(() => { activeTabRef.current = activeTab; }, [activeTab]);
  useEffect(() => { modalEmpaquetarRefState.current = modalEmpaquetar?.open; }, [modalEmpaquetar?.open]);
  useEffect(() => { modalEmpaquetarCajaRefState.current = modalEmpaquetarCaja.open; }, [modalEmpaquetarCaja.open]);
  useEffect(() => { modalVerPedidosRefState.current = modalVerPedidos.open; }, [modalVerPedidos.open]);
  useEffect(() => { modalVerPedidosContRefState.current = modalVerPedidosCont.open; }, [modalVerPedidosCont.open]);
  useEffect(() => { modalVerPedidosBoxIdRef.current = modalVerPedidos.boxId; }, [modalVerPedidos.boxId]);
  useEffect(() => { modalVerPedidosContIdRef.current = modalVerPedidosCont.containerId; }, [modalVerPedidosCont.containerId]);

  useEffect(() => {
  setMounted(true);
  fetchPedidos();
  }, []);

  // NUEVO: suscripción realtime (refetch cuando evento relevante)
  useRealtimeChina(() => {
    // Evitar refetch si todavía no hay chinaId
    if (!chinaId) return;
    fetchPedidos();
  }, chinaId);

  // Realtime para boxes y containers (suscripción única con debounce)
  useEffect(() => {
    const supabase = _getClient();

    let boxesTimer: any = null;
    let containersTimer: any = null;
    const debounce = (which: 'boxes' | 'containers', fn: () => void) => {
      if (which === 'boxes') {
        if (boxesTimer) clearTimeout(boxesTimer);
        boxesTimer = setTimeout(fn, 120);
      } else {
        if (containersTimer) clearTimeout(containersTimer);
        containersTimer = setTimeout(fn, 150);
      }
    };

    const boxesChannel = supabase
      .channel('china-boxes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'boxes' }, () => {
        const tab = activeTabRef.current;
        const needsBoxes = tab === 'cajas' || modalEmpaquetarRefState.current || modalEmpaquetarCajaRefState.current || modalVerPedidosRefState.current;
        const needsContainers = tab === 'contenedores' || modalVerPedidosContRefState.current;
        if (needsBoxes) debounce('boxes', fetchBoxes);
        if (needsContainers) debounce('containers', fetchContainers);
        // Si hay modales dependientes abiertos, refrescarlos también
        if (modalVerPedidosRefState.current && modalVerPedidosBoxIdRef.current !== undefined) {
          debounce('boxes', () => fetchOrdersByBoxId(modalVerPedidosBoxIdRef.current as any));
        }
        if (modalVerPedidosContRefState.current && modalVerPedidosContIdRef.current !== undefined) {
          debounce('containers', () => fetchBoxesByContainerId(modalVerPedidosContIdRef.current as any));
        }
      })
      .subscribe();

    const containersChannel = supabase
      .channel('china-containers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'containers' }, () => {
        const tab = activeTabRef.current;
        const needsContainers = tab === 'contenedores' || modalEmpaquetarCajaRefState.current || modalVerPedidosContRefState.current;
        const needsBoxes = tab === 'cajas' || modalVerPedidosRefState.current || modalEmpaquetarRefState.current;
        if (needsContainers) debounce('containers', fetchContainers);
        if (needsBoxes) debounce('boxes', fetchBoxes);
        // Actualizar vistas de detalle si están abiertas
        if (modalVerPedidosRefState.current && modalVerPedidosBoxIdRef.current !== undefined) {
          debounce('boxes', () => fetchOrdersByBoxId(modalVerPedidosBoxIdRef.current as any));
        }
        if (modalVerPedidosContRefState.current && modalVerPedidosContIdRef.current !== undefined) {
          debounce('containers', () => fetchBoxesByContainerId(modalVerPedidosContIdRef.current as any));
        }
      })
      .subscribe();

    // Orders (para actualizar conteos de pedidos en cajas y refrescar lista principal si procede)
    const ordersChannel = supabase
      .channel('china-orders-counts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        const tab = activeTabRef.current;
        // Siempre refrescar pedidos para que las estadísticas y listados estén al día en tiempo real
        debounce('boxes', fetchPedidos);
        // Actualizar conteos por caja si tenemos cajas cargadas
        // Se hace un fetchBoxes ligero sólo si estamos viendo cajas o modales que dependen
        const needsBoxCounts = tab === 'cajas' || modalVerPedidosRefState.current || modalEmpaquetarRefState.current || modalEmpaquetarCajaRefState.current;
        if (needsBoxCounts) {
          debounce('boxes', fetchBoxes); // fetchBoxes recalcula conteos
        }
        // Si estamos viendo un contenedor y los pedidos cambian (p.ej asignaciones que mueven box state), podemos querer refrescar boxes por contenedor
        if (modalVerPedidosContRefState.current) {
          debounce('containers', fetchContainers);
        }
        // Refrescar contenido de modales abiertos
        if (modalVerPedidosRefState.current && modalVerPedidosBoxIdRef.current !== undefined) {
          debounce('boxes', () => fetchOrdersByBoxId(modalVerPedidosBoxIdRef.current as any));
        }
        if (modalVerPedidosContRefState.current && modalVerPedidosContIdRef.current !== undefined) {
          debounce('containers', () => fetchBoxesByContainerId(modalVerPedidosContIdRef.current as any));
        }
      })
      .subscribe();

    return () => {
      if (boxesTimer) clearTimeout(boxesTimer);
      if (containersTimer) clearTimeout(containersTimer);
  supabase.removeChannel(boxesChannel);
  supabase.removeChannel(containersChannel);
  supabase.removeChannel(ordersChannel);
    };
  }, []);

  // Realtime para nombres/atributos de clientes: refetch cuando cambien
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    let timer: any = null;
    const debounce = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        fetchPedidos();
      }, 120);
    };
    const channel = supabase
      .channel('china-clients-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        // Si hay pedidos visibles, un cambio en clientes puede afectar nombres mostrados
        debounce();
      })
      .subscribe();

    return () => {
      if (timer) clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  // Scroll lock cuando cualquier modal está abierto
  const anyModalOpen = [
    modalCotizar.open,
    modalDetalle.open,
    modalCrearCaja.open,
    modalEliminarCaja.open,
    modalVerPedidos.open,
    modalEmpaquetar?.open,
    modalEmpaquetarCaja.open,
    modalCrearContenedor.open,
    modalEliminarContenedor.open,
  modalVerPedidosCont.open,
  modalEnviarContenedor.open,
  ].some(Boolean);

  useEffect(() => {
    if (anyModalOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [anyModalOpen]);

  // Cargar cajas cuando se entra a la pestaña Cajas
  useEffect(() => {
    if (activeTab === 'cajas') {
      fetchBoxes();
    }
    if (activeTab === 'contenedores') {
      fetchContainers();
    }
  }, [activeTab]);

  // Cerrar modales al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalCotizar.open && modalCotizarRef.current && !modalCotizarRef.current.contains(event.target as Node)) {
        closeModalCotizar();
      }
      if (modalDetalle.open && modalDetalleRef.current && !modalDetalleRef.current.contains(event.target as Node)) {
        closeModalDetalle();
      }
      if (modalCrearCaja.open && modalCrearCajaRef.current && !modalCrearCajaRef.current.contains(event.target as Node)) {
        closeModalCrearCaja();
      }
      if (modalVerPedidos.open && modalVerPedidosRef.current && !modalVerPedidosRef.current.contains(event.target as Node)) {
        setIsModalVerPedidosClosing(true);
        setTimeout(() => {
          setModalVerPedidos({ open: false });
          setIsModalVerPedidosClosing(false);
          setOrdersByBox([]);
        }, 300);
      }
    if (modalVerPedidosCont.open && modalVerPedidosContRef.current && !modalVerPedidosContRef.current.contains(event.target as Node)) {
        setIsModalVerPedidosContClosing(true);
        setTimeout(() => {
          setModalVerPedidosCont({ open: false });
          setIsModalVerPedidosContClosing(false);
          setBoxesByContainer([]);
          setOrderCountsByBox({});
        }, 300);
      }
      if (modalEmpaquetar?.open && modalEmpaquetarRef.current && !modalEmpaquetarRef.current.contains(event.target as Node)) {
        setIsModalEmpaquetarClosing(true);
        setTimeout(() => {
          setModalEmpaquetar({ open: false });
          setIsModalEmpaquetarClosing(false);
        }, 300);
      }
      if (modalEmpaquetarCaja.open && modalEmpaquetarCajaRef.current && !modalEmpaquetarCajaRef.current.contains(event.target as Node)) {
        setIsModalEmpaquetarCajaClosing(true);
        setTimeout(() => {
          setModalEmpaquetarCaja({ open: false });
          setIsModalEmpaquetarCajaClosing(false);
        }, 300);
      }
      if (modalCrearContenedor.open && modalCrearContenedorRef.current && !modalCrearContenedorRef.current.contains(event.target as Node)) {
        closeModalCrearContenedor();
      }
      if (modalEliminarContenedor.open && modalEliminarContenedorRef.current && !modalEliminarContenedorRef.current.contains(event.target as Node)) {
        closeModalEliminarContenedor();
      }
      if (modalEnviarContenedor.open && modalEnviarContenedorRef.current && !modalEnviarContenedorRef.current.contains(event.target as Node)) {
        closeModalEnviarContenedor();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [
    modalCotizar.open,
    modalDetalle.open,
    modalCrearCaja.open,
    modalEliminarCaja.open,
    modalVerPedidos.open,
    modalEmpaquetar?.open,
    modalCrearContenedor.open,
    modalEliminarContenedor.open,
    modalVerPedidosCont.open,
  ]);

  // Funciones para cerrar modales con animación
  const closeModalCotizar = () => {
    setIsModalCotizarClosing(true);
    setTimeout(() => {
      setModalCotizar({open: false});
      setIsModalCotizarClosing(false);
    }, 300);
  };

  const closeModalDetalle = () => {
    setIsModalDetalleClosing(true);
    setTimeout(() => {
      setModalDetalle({open: false});
      setIsModalDetalleClosing(false);
    }, 300);
  };
  const closeModalCrearCaja = () => {
    setIsModalCrearCajaClosing(true);
    setTimeout(() => {
      setModalCrearCaja({open: false});
      setIsModalCrearCajaClosing(false);
    }, 300);
  };
  const closeModalEliminarCaja = () => {
    setIsModalEliminarCajaClosing(true);
    setTimeout(() => {
      setModalEliminarCaja({ open: false });
      setIsModalEliminarCajaClosing(false);
    }, 300);
  };
  const closeModalVerPedidos = () => {
    setIsModalVerPedidosClosing(true);
    setTimeout(() => {
      setModalVerPedidos({ open: false });
      setIsModalVerPedidosClosing(false);
      setOrdersByBox([]);
    }, 300);
  };

  const closeModalVerPedidosCont = () => {
    setIsModalVerPedidosContClosing(true);
    setTimeout(() => {
      setModalVerPedidosCont({ open: false });
      setIsModalVerPedidosContClosing(false);
  setBoxesByContainer([]);
  setOrderCountsByBox({});
    }, 300);
  };

  const closeModalEmpaquetar = () => {
    setIsModalEmpaquetarClosing(true);
    setTimeout(() => {
      setModalEmpaquetar({ open: false });
      setIsModalEmpaquetarClosing(false);
    }, 300);
  };

  const closeModalEmpaquetarCaja = () => {
    setIsModalEmpaquetarCajaClosing(true);
    setTimeout(() => {
      setModalEmpaquetarCaja({ open: false });
      setIsModalEmpaquetarCajaClosing(false);
    }, 300);
  };

  const closeModalCrearContenedor = () => {
    setIsModalCrearContenedorClosing(true);
    setTimeout(() => {
      setModalCrearContenedor({ open: false });
      setIsModalCrearContenedorClosing(false);
    }, 300);
  };

  const closeModalEliminarContenedor = () => {
    setIsModalEliminarContenedorClosing(true);
    setTimeout(() => {
      setModalEliminarContenedor({ open: false });
      setIsModalEliminarContenedorClosing(false);
    }, 300);
  };
  const closeModalEnviarContenedor = () => {
    setIsModalEnviarContenedorClosing(true);
    setTimeout(() => {
      setModalEnviarContenedor({ open: false });
      setIsModalEnviarContenedorClosing(false);
      setSendTrackingLink('');
      setSendTrackingNumber('');
      setSendCourierCompany('');
      setSendEtaDate('');
    }, 300);
  };

  // Crear registro en Supabase: tabla boxes
  const handleConfirmCrearCaja = async () => {
    try {
      // Requerir nombre de la caja
      if (!newBoxName.trim()) {
        toast({
          title: t('chinese.ordersPage.toasts.notAllowedTitle', { defaultValue: 'No permitido' }),
          description: t('chinese.ordersPage.modals.createBox.boxNameRequired', { defaultValue: 'El nombre de la caja es obligatorio.' }),
        });
        return;
      }
      setCreatingBox(true);
      const supabase = getSupabaseBrowserClient();
      const creation_date = new Date().toISOString();
      const { data, error } = await supabase
        .from('boxes')
        // Guardar también el nombre de la caja (obligatorio)
        .insert([{ state: 1, creation_date, name: newBoxName.trim() }])
        .select();
      if (error) {
        console.error('Error al crear caja:', error);
        toast({
          title: t('chinese.ordersPage.toasts.createBoxErrorTitle'),
          description: t('chinese.ordersPage.toasts.tryAgainSeconds'),
        });
        return;
      }
      // Éxito: cerrar modal (podemos mostrar toast si existe más adelante)
      closeModalCrearCaja();
      toast({
        title: t('chinese.ordersPage.toasts.boxCreatedTitle'),
        description: t('chinese.ordersPage.toasts.boxCreatedDesc'),
      });
      // Refrescar listado de cajas
      fetchBoxes();
    } finally {
      setCreatingBox(false);
    }
  };

  // Cargar lista de cajas
  async function fetchBoxes() {
    setBoxesLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('boxes')
        .select('*');
      if (error) {
        console.error('Error al obtener cajas:', error);
  toast({ title: t('chinese.ordersPage.toasts.loadBoxesErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgainLater') });
        return;
      }
      const list = (data || []) as BoxItem[];
      // Ordenar por fecha (creation_date o created_at) descendente
      list.sort((a, b) => {
        const da = new Date((a.creation_date ?? a.created_at ?? '') as string).getTime() || 0;
        const db = new Date((b.creation_date ?? b.created_at ?? '') as string).getTime() || 0;
        return db - da;
      });
      setBoxes(list);

      // Calcular conteo de pedidos por caja para la lista principal
      const ids = list
        .map((b) => b.box_id ?? b.boxes_id ?? (b as any).id)
        .filter((v): v is number | string => v !== undefined && v !== null);
      if (ids.length > 0) {
        const { data: ordersData, error: ordersErr } = await supabase
          .from('orders')
          .select('id, box_id')
          .in('box_id', ids);
        if (!ordersErr) {
          const counts: Record<string | number, number> = {};
          (ordersData || []).forEach((row: any) => {
            const key = row.box_id as string | number;
            counts[key] = (counts[key] || 0) + 1;
          });
          setOrderCountsByBoxMain(counts);
        } else {
          console.error('Error al obtener conteo de pedidos por caja (lista):', ordersErr);
          setOrderCountsByBoxMain({});
        }
      } else {
        setOrderCountsByBoxMain({});
      }
    } finally {
      setBoxesLoading(false);
    }
  }

  // Crear registro en Supabase: tabla containers
  const handleConfirmCrearContenedor = async () => {
    try {
      setCreatingContainer(true);
      const supabase = getSupabaseBrowserClient();
      const creation_date = new Date().toISOString();
      // Validación: requerir nombre
      if (!newContainerName.trim()) {
        toast({
          title: t('chinese.ordersPage.toasts.notAllowedTitle', { defaultValue: 'No permitido' }),
          description: t('chinese.ordersPage.modals.createContainer.containerNameRequired', { defaultValue: 'El nombre del contenedor es obligatorio.' }),
        });
        return;
      }
      const { error } = await supabase
        .from('containers')
        .insert([{ state: 1, creation_date, name: newContainerName.trim() }]);
      if (error) {
        console.error('Error al crear contenedor:', error);
  toast({ title: t('chinese.ordersPage.toasts.createContainerErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgainSeconds') });
        return;
      }
      closeModalCrearContenedor();
  toast({ title: t('chinese.ordersPage.toasts.containerCreatedTitle'), description: t('chinese.ordersPage.toasts.containerCreatedDesc') });
      fetchContainers();
    } finally {
      setCreatingContainer(false);
    }
  };

  // Cargar lista de contenedores
  async function fetchContainers() {
    setContainersLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('containers')
        .select('*');
      if (error) {
        console.error('Error al obtener contenedores:', error);
  toast({ title: t('chinese.ordersPage.toasts.loadContainersErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgainLater') });
        return;
      }
      const list = (data || []) as ContainerItem[];
      list.sort((a, b) => {
        const da = new Date((a.creation_date ?? a.created_at ?? '') as string).getTime() || 0;
        const db = new Date((b.creation_date ?? b.created_at ?? '') as string).getTime() || 0;
        return db - da;
      });
      setContainers(list);
    } finally {
      setContainersLoading(false);
    }
  }

  // Cargar cajas por container_id
  async function fetchBoxesByContainerId(containerId: number | string) {
    setBoxesByContainerLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('boxes')
        .select('*')
        .eq('container_id', containerId);
      if (error) {
        console.error('Error al obtener cajas del contenedor:', error);
  toast({ title: t('chinese.ordersPage.toasts.loadBoxesErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgain') });
        return;
      }
      const list = (data || []) as BoxItem[];
      list.sort((a, b) => {
        const da = new Date((a.creation_date ?? a.created_at ?? '') as string).getTime() || 0;
        const db = new Date((b.creation_date ?? b.created_at ?? '') as string).getTime() || 0;
        return db - da;
      });
      setBoxesByContainer(list);

      // Obtener conteo de pedidos por caja para las cajas listadas
      const ids = list
        .map((b) => b.box_id ?? b.boxes_id ?? (b as any).id)
        .filter((v): v is number | string => v !== undefined && v !== null);
      if (ids.length > 0) {
        const { data: ordersData, error: ordersErr } = await supabase
          .from('orders')
          .select('id, box_id')
          .in('box_id', ids);
        if (ordersErr) {
          console.error('Error al obtener conteo de pedidos por caja:', ordersErr);
        } else {
          const counts: Record<string | number, number> = {};
          (ordersData || []).forEach((row: any) => {
            const key = row.box_id as string | number;
            counts[key] = (counts[key] || 0) + 1;
          });
          setOrderCountsByBox(counts);
        }
      } else {
        setOrderCountsByBox({});
      }
    } finally {
      setBoxesByContainerLoading(false);
    }
  }

  // Cargar pedidos por box_id
  async function fetchOrdersByBoxId(boxId: number | string) {
    setOrdersByBoxLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('box_id', boxId);
      if (error) {
        console.error('Error al obtener pedidos de la caja:', error);
  toast({ title: t('chinese.ordersPage.toasts.loadOrdersErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgain') });
        return;
      }
      const mapped: Pedido[] = (data || []).map((order: any) => ({
        id: order.id,
        cliente: order.clientName || order.client || '—',
        producto: order.productName || order.product || '—',
        cantidad: Number(order.quantity || 0),
  // Si viene null/undefined asumimos 2, y ocultamos state 1
  estado: mapStateToEstado(Number(order.state || 2)),
        cotizado: Number(order.state) === 3 || (!!order.totalQuote && Number(order.totalQuote) > 0),
        precio: order.totalQuote ? Number(order.totalQuote) / Math.max(1, Number(order.quantity || 1)) : null,
        fecha: order.created_at || order.creation_date || new Date().toISOString(),
        especificaciones: order.specifications || '',
        pdfRoutes: order.pdfRoutes || '',
        deliveryType: order.deliveryType || '',
        shippingType: order.shippingType || '',
        totalQuote: order.totalQuote ?? null,
        numericState: typeof order.state === 'number' ? order.state : Number(order.state || 0),
      }));
      setOrdersByBox(mapped);
    } finally {
      setOrdersByBoxLoading(false);
    }
  }

  // Asignar caja a contenedor
  const handleSelectContenedorForCaja = async (boxId: number | string, container: ContainerItem) => {
    const containerId = container.container_id ?? container.containers_id ?? container.id;
    if (!containerId) {
      toast({ title: t('chinese.ordersPage.toasts.invalidContainerTitle'), description: t('chinese.ordersPage.toasts.invalidContainerDesc') });
      return;
    }
    try {
      const supabase = getSupabaseBrowserClient();
      // No permitir asignar a contenedor enviado
      const contStateNum = (container.state ?? 1) as number;
      if (contStateNum >= 3) {
        toast({ title: t('chinese.ordersPage.toasts.notAllowedTitle'), description: t('chinese.ordersPage.toasts.assignToShippedContainerDesc') });
        return;
      }
      // Regla: No permitir empaquetar una caja vacía
      try {
        const { data: anyOrder, error: countErr } = await supabase
          .from('orders')
          .select('id')
          .eq('box_id', boxId)
          .limit(1);
        if (countErr) {
          console.error('Error verificando pedidos de la caja:', countErr);
        }
        if (!anyOrder || anyOrder.length === 0) {
          toast({
            title: t('chinese.ordersPage.toasts.notAllowedTitle', { defaultValue: 'No permitido' }),
            description: t('chinese.ordersPage.toasts.packEmptyBoxNotAllowed', { defaultValue: 'No puedes empaquetar una caja vacía. Agrega pedidos primero.' }),
          });
          return;
        }
      } catch (e) {
        console.error('Fallo verificando si la caja está vacía:', e);
        toast({ title: t('chinese.ordersPage.toasts.unexpectedErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgainLater') });
        return;
      }
      // 1) Actualizar la caja: asignar contenedor y cambiar state=2 (empaquetada)
      const { error: boxUpdateError } = await supabase
        .from('boxes')
        .update({ container_id: containerId, state: 2 })
        .eq('box_id', boxId);
      if (boxUpdateError) {
        console.error('Error asignando contenedor:', boxUpdateError);
        toast({ title: t('chinese.ordersPage.toasts.assignContainerErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgain') });
        return;
      }
      // 2) Mover todos los pedidos de esa caja a state=7
      const { error: ordersUpdateError } = await supabase
        .from('orders')
        .update({ state: 7 })
        .eq('box_id', boxId);
      if (ordersUpdateError) {
        console.error('Error actualizando pedidos a estado 7:', ordersUpdateError);
      }
      // 3) Asegurar que el contenedor pase a estado 2 al cargarse una caja
      const { error: contStateErr } = await supabase
        .from('containers')
        .update({ state: 2 })
        .eq('container_id', containerId);
      if (contStateErr) {
        console.error('Error actualizando contenedor a estado 2:', contStateErr);
      }
  toast({ title: t('chinese.ordersPage.toasts.boxAssignedTitle'), description: t('chinese.ordersPage.toasts.boxAssignedDesc', { boxId: boxId, containerId: containerId }) });
      // Actualizar UI local
      setBoxes(prev => prev.map(b => {
        const id = b.box_id ?? b.boxes_id ?? b.id;
        if (String(id) === String(boxId)) return { ...b, container_id: containerId, state: 2 };
        return b;
      }));
      setContainers(prev => prev.map(c => {
        const cid = c.container_id ?? c.containers_id ?? c.id;
        if (String(cid) === String(containerId)) return { ...c, state: 2 };
        return c;
      }));
      closeModalEmpaquetarCaja();
    } catch (e) {
  console.error(e);
  toast({ title: t('chinese.ordersPage.toasts.unexpectedErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgainLater') });
    }
  };

  // Desempaquetar caja: quitar de contenedor, resetear estado y liberar pedidos
  const handleUnpackBox = async (boxId: number | string, options?: { containerId?: number | string }) => {
    try {
      const supabase = getSupabaseBrowserClient();
      // Si la caja pertenece a un contenedor enviado, bloquear
      const contId = options?.containerId;
      if (contId !== undefined) {
        const { data: contRow, error: contErr } = await supabase
          .from('containers')
          .select('state')
          .eq('container_id', contId)
          .maybeSingle();
        if (contErr) {
          console.error('Error verificando contenedor:', contErr);
        }
        const contState = (contRow?.state ?? 1) as number;
        if (contState >= 3) {
          toast({ title: t('chinese.ordersPage.toasts.notAllowedTitle'), description: t('chinese.ordersPage.toasts.unpackBoxFromShippedContainerDesc') });
          return;
        }
      }
      // 1) Actualizar pedidos: remover box_id y regresar a estado 5 (enviado)
      const { error: ordersErr } = await supabase
        .from('orders')
        .update({ box_id: null, state: 5 })
        .eq('box_id', boxId);
      if (ordersErr) {
        console.error('Error al desasignar pedidos de la caja:', ordersErr);
      }
      // 2) Actualizar caja: quitar container y regresar a estado 1 (nueva)
      const { error: boxErr } = await supabase
        .from('boxes')
        .update({ container_id: null, state: 1 })
        .eq('box_id', boxId);
      if (boxErr) {
        console.error('Error al actualizar caja a estado 1:', boxErr);
  toast({ title: t('chinese.ordersPage.toasts.unassignErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgain') });
        return;
      }
  toast({ title: t('chinese.ordersPage.toasts.boxUnpackedTitle'), description: t('chinese.ordersPage.toasts.boxUnpackedDesc', { boxId }) });
      // Actualizar estado local de cajas
      setBoxes(prev => prev.map(b => {
        const id = b.box_id ?? b.boxes_id ?? b.id;
        if (String(id) === String(boxId)) return { ...b, container_id: undefined, state: 1 };
        return b;
      }));
      // Resetear conteos en listas
      setOrderCountsByBoxMain(prev => ({ ...prev, [boxId as any]: 0 }));
      setOrderCountsByBox(prev => ({ ...prev, [boxId as any]: 0 }));
      // Si estamos en el modal de contenedor, refrescar la lista o remover la caja de la vista
      if (options?.containerId) {
        await fetchBoxesByContainerId(options.containerId);
      }
      // Refrescar pedidos para reflejar estado 5
      fetchPedidos();
    } catch (e) {
      console.error(e);
  toast({ title: t('chinese.ordersPage.toasts.unexpectedErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgainLater') });
    }
  };

  // Enviar contenedor: guardar tracking y cambiar estado a 3 (con cascadas)
  const handleSendContainer = async (container: ContainerItem, details?: { trackingNumber: string; courierCompany: string; etaDate: string; trackingLink?: string }): Promise<boolean> => {
    const stateNum = (container.state ?? 1) as number;
    if (stateNum !== 2) return false;
    const containerId = container.container_id ?? container.containers_id ?? container.id;
    if (!containerId) return false;
    try {
      const supabase = getSupabaseBrowserClient();
      const baseDetails: any = details
        ? { tracking_number: details.trackingNumber, tracking_company: details.courierCompany, ...(details.trackingLink ? { tracking_link: details.trackingLink } : {}) }
        : {};
      // Intento 1: usar 'arrive-data'
      let updateErr: any = null;
      if (details) {
        const payload1: any = { ...baseDetails, ['arrive-data']: details.etaDate, state: 3 };
        const res1 = await supabase.from('containers').update(payload1).eq('container_id', containerId);
        updateErr = res1.error;
        // Intento 2: fallback a arrive_date si columna con guion no existe
        if (updateErr && (updateErr.code === '42703' || /arrive-data/.test(updateErr.message || '') || /column .* does not exist/i.test(updateErr.message || ''))) {
          const payload2: any = { ...baseDetails, arrive_date: details.etaDate, state: 3 };
          const res2 = await supabase.from('containers').update(payload2).eq('container_id', containerId);
          updateErr = res2.error;
        }
        // Si el problema era tracking_link inexistente, reintentar sin él
        if (updateErr && /tracking_link/.test(updateErr.message || '')) {
          const baseWithoutLink = { ...baseDetails };
          delete (baseWithoutLink as any).tracking_link;
          const payloadRetry: any = { ...baseWithoutLink, arrive_date: details.etaDate, state: 3 };
          const resRetry = await supabase.from('containers').update(payloadRetry).eq('container_id', containerId);
          updateErr = resRetry.error;
        }
        // Si aún falla (p.ej. RLS en columnas de tracking), al menos cambiar el estado
        if (updateErr) {
          const resState = await supabase.from('containers').update({ state: 3 }).eq('container_id', containerId);
          if (resState.error) throw resState.error;
          toast({ title: t('chinese.ordersPage.toasts.containerSentTitle'), description: t('chinese.ordersPage.toasts.partialTrackingSave', { defaultValue: 'Estado cambiado, pero no se guardaron datos de tracking. Revisa políticas/columnas.' }) });
          updateErr = null;
        }
      } else {
        const { error } = await supabase.from('containers').update({ state: 3 }).eq('container_id', containerId);
        updateErr = error;
      }
      if (updateErr) throw updateErr;

      // Cascadas: cajas->4, pedidos->9
      const { data: boxRows } = await supabase.from('boxes').select('box_id').eq('container_id', containerId);
      const boxIds = (boxRows || []).map((r: any) => r.box_id).filter((v: any) => v != null);
      if (boxIds.length > 0) {
        await supabase.from('boxes').update({ state: 4 }).in('box_id', boxIds as any);
        await supabase.from('orders').update({ state: 9 }).in('box_id', boxIds as any);
      }

  toast({ title: t('chinese.ordersPage.toasts.containerSentTitle') });

      // Actualizar UI local
      setContainers(prev => prev.map(c => {
        const cid = c.container_id ?? c.containers_id ?? c.id;
        if (String(cid) === String(containerId)) return { ...c, state: 3 } as any;
        return c;
      }));
      setBoxes(prev => prev.map(b => {
        if (String((b as any).container_id) === String(containerId)) return { ...b, state: 4 } as any;
        return b;
      }));
      setBoxesByContainer(prev => prev.map(b => {
        if (String((b as any).container_id) === String(containerId)) return { ...b, state: 4 } as any;
        return b;
      }));
  return true;
    } catch (e: any) {
      console.error(e);
      toast({ title: t('chinese.ordersPage.toasts.sendErrorTitle'), description: e?.message || t('chinese.ordersPage.toasts.tryAgainLater') });
  return false;
    }
  };

  // Stats
  const stats = {
    pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
    cotizados: pedidos.filter(p => p.estado === 'cotizado').length,
    procesando: pedidos.filter(p => p.estado === 'procesando').length,
    enviados: pedidos.filter(p => p.estado === 'enviado').length,
    totalCotizado: pedidos.filter(p => p.precio).reduce((acc, p) => acc + (p.precio || 0), 0),
    esteMes: pedidos.length
  };

  const pedidosFiltrados = pedidos.filter(p => {
    const estadoOk = filtroEstado === 'todos' || p.estado === filtroEstado;
    const clienteOk = !filtroCliente || p.cliente.toLowerCase().includes(filtroCliente.toLowerCase());
    return estadoOk && clienteOk;
  });

  // Filtrado de cajas por ID mostrado
  const cajasFiltradas = boxes.filter((box, idx) => {
    if (!filtroCaja) return true;
    const id = box.boxes_id ?? box.id ?? box.box_id ?? idx;
    return String(id).toLowerCase().includes(filtroCaja.toLowerCase());
  });

  // Cotizar pedido
  const cotizarPedido = async (pedido: Pedido, precioUnitario: number) => {
    const supabase = getSupabaseBrowserClient();
    const total = Number(precioUnitario) * Number(pedido.cantidad || 0);

    // 1) Actualizar totalQuote en la tabla orders
    const { error: updateError } = await supabase
      .from('orders')
      .update({ totalQuote: total, state: 3 })
      .eq('id', pedido.id);
    if (updateError) {
      alert('Error al actualizar la cotización en la base de datos.');
      console.error('Error update totalQuote:', updateError);
      return;
    }
  // Actualizar estado local y cerrar modal (sin PDF)
  setPedidos(prev => prev.map(p => p.id === pedido.id ? { ...p, cotizado: true, estado: 'cotizado', precio: precioUnitario, totalQuote: total, numericState: 3 } : p));
  setModalCotizar({ open: false });
  setIsModalCotizarClosing(false);
  };

  // getStatusColor/Text ya no se usan; sustituido por getOrderBadge basado en estado numérico

  // Asignar pedido a caja (empaquetar)
  const handleSelectCajaForPedido = async (pedidoId: number, box: BoxItem) => {
    const boxId = box.box_id ?? box.boxes_id ?? box.id;
    if (!boxId) {
      toast({ title: t('chinese.ordersPage.toasts.invalidBoxTitle'), description: t('chinese.ordersPage.toasts.invalidBoxDesc') });
      return;
    }
    try {
      const supabase = getSupabaseBrowserClient();
      // No permitir empaquetar en cajas enviadas o contenedores enviados
      const boxStateNumCheck = (box.state ?? 1) as number;
      if (boxStateNumCheck >= 3) {
        toast({ title: t('chinese.ordersPage.toasts.notAllowedTitle'), description: t('chinese.ordersPage.toasts.packInShippedBoxDesc') });
        return;
      }
      if ((box as any)?.container_id) {
        const { data: contRow, error: contErr } = await supabase
          .from('containers')
          .select('state')
          .eq('container_id', (box as any).container_id)
          .maybeSingle();
        if (contErr) {
          console.error('Error verificando contenedor:', contErr);
        }
        const contState = (contRow?.state ?? 1) as number;
        if (contState >= 3) {
          toast({ title: t('chinese.ordersPage.toasts.notAllowedTitle'), description: t('chinese.ordersPage.toasts.packInBoxOfShippedContainerDesc') });
          return;
        }
      }
      // Si la caja ya está empaquetada (state=2), el pedido debe pasar a state=7 (en contenedor)
      const boxStateNum = (box.state ?? 1) as number;
      const nextOrderState = boxStateNum === 2 ? 7 : 6;
      const { error } = await supabase
        .from('orders')
        .update({ box_id: boxId, state: nextOrderState })
        .eq('id', pedidoId);
  if (error) {
    console.error('Error asignando caja:', error);
    toast({ title: t('chinese.ordersPage.toasts.assignBoxErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgain') });
        return;
      }
  toast({ title: t('chinese.ordersPage.toasts.orderAssignedTitle'), description: t('chinese.ordersPage.toasts.orderAssignedDesc', { orderId: pedidoId, boxId: boxId }) });
  // Reflejar inmediatamente en UI que el pedido pasó a estado 6
  setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, numericState: nextOrderState } : p));

      // Incrementar conteo local de pedidos por caja en la lista principal
      setOrderCountsByBoxMain(prev => ({
        ...prev,
        [boxId as any]: (prev[boxId as any] || 0) + 1,
      }));

      // Si el modal de cajas por contenedor está abierto y la caja pertenece a ese contenedor, actualizar también ese contador
      const containerIdOfBox = (box as any)?.container_id;
      setOrderCountsByBox(prev => {
        // Solo tocar si el modal está abierto y corresponde al contenedor de la caja
        if (modalVerPedidosCont.open && modalVerPedidosCont.containerId && containerIdOfBox && String(modalVerPedidosCont.containerId) === String(containerIdOfBox)) {
          return {
            ...prev,
            [boxId as any]: (prev[boxId as any] || 0) + 1,
          };
        }
        return prev;
      });
      closeModalEmpaquetar();
    } catch (e) {
      console.error(e);
  toast({ title: t('chinese.ordersPage.toasts.unexpectedErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgainLater') });
    }
  };

  // Desempaquetar pedido individual: remover de caja y regresar a estado 5
  const handleUnpackOrder = async (pedidoId: number) => {
    try {
      const supabase = getSupabaseBrowserClient();
      // Obtener box_id actual del pedido para ajustar conteos
      const { data: orderRow, error: fetchErr } = await supabase
        .from('orders')
        .select('id, box_id')
        .eq('id', pedidoId)
        .single();
      if (fetchErr) {
        console.error('No se pudo obtener el pedido para desempaquetar:', fetchErr);
        toast({ title: t('chinese.ordersPage.toasts.unassignErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgain') });
        return;
      }
      const boxId = (orderRow as any)?.box_id as number | string | null;
      if (!boxId) {
        toast({ title: t('chinese.ordersPage.toasts.orderWithoutBoxTitle'), description: t('chinese.ordersPage.toasts.orderWithoutBoxDesc') });
        return;
      }
      // Si la caja está dentro de un contenedor enviado o la caja fue enviada, bloquear
      const { data: boxRow, error: boxErr } = await supabase
        .from('boxes')
        .select('state, container_id')
        .eq('box_id', boxId)
        .maybeSingle();
      if (boxErr) {
        console.error('Error verificando caja:', boxErr);
      }
      const bState = (boxRow?.state ?? 1) as number;
      if (bState >= 3) {
        toast({ title: t('chinese.ordersPage.toasts.notAllowedTitle'), description: t('chinese.ordersPage.toasts.unpackOrdersFromShippedBoxDesc') });
        return;
      }
      if (boxRow?.container_id) {
        const { data: cRow, error: cErr } = await supabase
          .from('containers')
          .select('state')
          .eq('container_id', boxRow.container_id)
          .maybeSingle();
        if (cErr) {
          console.error('Error verificando contenedor:', cErr);
        }
        const cState = (cRow?.state ?? 1) as number;
        if (cState >= 3) {
          toast({ title: t('chinese.ordersPage.toasts.notAllowedTitle'), description: t('chinese.ordersPage.toasts.unpackOrdersFromShippedContainerDesc') });
          return;
        }
      }
      // Limpiar relación y bajar a estado 5
      const { error: updErr } = await supabase
        .from('orders')
        .update({ box_id: null, state: 5 })
        .eq('id', pedidoId);
      if (updErr) {
        console.error('Error al desempaquetar pedido:', updErr);
        toast({ title: t('chinese.ordersPage.toasts.unassignErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgain') });
        return;
      }
  toast({ title: t('chinese.ordersPage.toasts.orderUnassignedTitle'), description: t('chinese.ordersPage.toasts.orderUnassignedDesc', { orderId: pedidoId }) });
      // Actualizar UI: estado del pedido
      setPedidos(prev => prev.map(p => p.id === pedidoId ? { ...p, numericState: 5 } : p));
      // Ajustar conteo local de la caja en vistas principales
      setOrderCountsByBoxMain(prev => {
        if (boxId === null || boxId === undefined) return prev;
        const current = prev[boxId as any] || 0;
        return { ...prev, [boxId as any]: Math.max(0, current - 1) };
      });
      setOrderCountsByBox(prev => {
        if (boxId === null || boxId === undefined) return prev;
        const current = prev[boxId as any] || 0;
        return { ...prev, [boxId as any]: Math.max(0, current - 1) };
      });
      // Si el modal de pedidos por caja está abierto para esa caja, refrescar
      if (modalVerPedidos.open && modalVerPedidos.boxId && String(modalVerPedidos.boxId) === String(boxId)) {
        await fetchOrdersByBoxId(modalVerPedidos.boxId);
      }
    } catch (e) {
      console.error(e);
  toast({ title: t('chinese.ordersPage.toasts.unexpectedErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgainLater') });
    }
  };



  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('chinese.ordersPage.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar
        isExpanded={sidebarExpanded}
        setIsExpanded={setSidebarExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        userRole="china"
      />
      
      <main
        className={`flex-1 transition-all duration-300 px-2 sm:px-4 lg:px-6 ${
          sidebarExpanded ? 'lg:ml-72' : 'lg:ml-24'
        }`}
      >
        <Header 
          notifications={stats.pendientes}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title={t('chinese.ordersPage.title')}
          subtitle={t('chinese.ordersPage.subtitle')}
          showTitleOnMobile
        />
        
  <div className="p-4 md:p-5 lg:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Estadísticas en tarjetas (como Venezuela) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm md:text-base font-medium text-yellow-700 dark:text-yellow-300">{t('chinese.ordersPage.stats.pending')}</p>
                    <p className="text-2xl md:text-3xl font-bold text-yellow-800 dark:text-yellow-200">{stats.pendientes}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-800/30 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-700">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm md:text-base font-medium text-purple-700 dark:text-purple-300">{t('chinese.ordersPage.stats.quoted')}</p>
                    <p className="text-2xl md:text-3xl font-bold text-purple-800 dark:text-purple-200">{stats.cotizados}</p>
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
                    <p className="text-sm md:text-base font-medium text-blue-700 dark:text-blue-300">{t('chinese.ordersPage.stats.processing')}</p>
                    <p className="text-2xl md:text-3xl font-bold text-blue-800 dark:text-blue-200">{stats.procesando}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-800/30 rounded-lg flex items-center justify-center">
                    <Truck className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm md:text-base font-medium text-green-700 dark:text-green-300">{t('chinese.ordersPage.stats.shipped')}</p>
                    <p className="text-2xl md:text-3xl font-bold text-green-800 dark:text-green-200">{stats.enviados}</p>
                  </div>
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-800/30 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>





          {/* Tabs: Lista de pedidos | Cajas | Contenedores */}
          <div className="flex justify-start">
            <div className="w-full">
              <div className="flex w-full gap-1 rounded-lg border border-slate-200 bg-white/70 backdrop-blur px-1 py-1 shadow-sm">
                <Button
                  variant={activeTab === 'pedidos' ? 'default' : 'ghost'}
                  size="sm"
                  className={`flex-1 min-w-0 justify-center rounded-md transition-colors whitespace-nowrap truncate text-[11px] xs:text-xs sm:text-sm px-2 py-2 ${activeTab === 'pedidos' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setActiveTab('pedidos')}
                >
                  {t('chinese.ordersPage.tabs.ordersList')}
                </Button>
                <Button
                  variant={activeTab === 'cajas' ? 'default' : 'ghost'}
                  size="sm"
                  className={`flex-1 min-w-0 justify-center rounded-md transition-colors whitespace-nowrap truncate text-[11px] xs:text-xs sm:text-sm px-2 py-2 ${activeTab === 'cajas' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setActiveTab('cajas')}
                >
                  {t('chinese.ordersPage.tabs.boxes')}
                </Button>
                <Button
                  variant={activeTab === 'contenedores' ? 'default' : 'ghost'}
                  size="sm"
                  className={`flex-1 min-w-0 justify-center rounded-md transition-colors whitespace-nowrap truncate text-[11px] xs:text-xs sm:text-sm px-2 py-2 ${activeTab === 'contenedores' ? 'bg-slate-900 text-white hover:bg-slate-800' : 'text-slate-700 hover:bg-slate-100'}`}
                  onClick={() => setActiveTab('contenedores')}
                >
                  {t('chinese.ordersPage.tabs.containers')}
                </Button>
              </div>
            </div>
          </div>

          {/* Barra compacta y alineada a la derecha */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader className="py-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-lg font-semibold">
                  <span className="flex items-center gap-2">
                    {activeTab === 'pedidos' && <Package className="h-4 w-4" />}
                    {activeTab === 'cajas' && <Boxes className="h-4 w-4" />}
                    {activeTab === 'contenedores' && <Boxes className="h-4 w-4" />}
                    <span>{activeTab === 'pedidos' ? t('chinese.ordersPage.tabs.ordersList') : activeTab === 'cajas' ? t('chinese.ordersPage.tabs.boxes') : t('chinese.ordersPage.tabs.containers')}</span>
                  </span>
                </CardTitle>
                <div className="w-full sm:w-auto grid grid-cols-1 sm:flex sm:items-center sm:justify-end gap-2 md:gap-3">
                  {activeTab === 'pedidos' && (
                    <>
                      <Input
                        placeholder={t('chinese.ordersPage.filters.searchClientPlaceholder')}
                        value={filtroCliente}
                        onChange={(e) => setFiltroCliente(e.target.value)}
                        className="h-10 w-full sm:w-64 px-3"
                      />
                      <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                        <SelectTrigger className="h-10 w-full sm:w-56 px-3 whitespace-nowrap truncate">
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">{t('chinese.ordersPage.filters.all')}</SelectItem>
                          <SelectItem value="pendiente">{t('chinese.ordersPage.filters.pending')}</SelectItem>
                          <SelectItem value="cotizado">{t('chinese.ordersPage.filters.quoted')}</SelectItem>
                          <SelectItem value="procesando">{t('chinese.ordersPage.filters.processing')}</SelectItem>
                          <SelectItem value="enviado">{t('chinese.ordersPage.filters.shipped')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </>
                  )}
                  {activeTab === 'cajas' && (
                    <Input
                      placeholder={t('chinese.ordersPage.filters.searchBoxPlaceholder')}
                      value={filtroCaja}
                      onChange={(e) => setFiltroCaja(e.target.value)}
                      className="h-10 w-full sm:w-64 px-3"
                    />
                  )}
                  {activeTab === 'contenedores' && (
                    <Input
                      placeholder={t('chinese.ordersPage.filters.searchContainerPlaceholder')}
                      value={filtroContenedor}
                      onChange={(e) => setFiltroContenedor(e.target.value)}
                      className="h-10 w-full sm:w-64 px-3"
                    />
                  )}
                </div>
              </div>
            </CardHeader>
          </Card>

          {activeTab === 'pedidos' && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardContent>
                <div className="space-y-4">
                  {pedidosFiltrados.map((pedido) => (
                    <div
                      key={pedido.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md transition-all duration-300"
                    >
                      {/* Columna izquierda */}
                      <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                        <div className="p-3 bg-blue-100 rounded-lg shrink-0">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="space-y-1 w-full min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">#ORD-{pedido.id}</h3>
                            {/* Badge estado principal: forzamos 'Pendiente' explícito para state 2 */}
                            {pedido.numericState === 2 ? (
                              <Badge className={`hidden sm:inline-block border bg-yellow-100 text-yellow-800 border-yellow-200`}>{t('chinese.ordersPage.filters.pending')}</Badge>
                            ) : (
                              <Badge className={`hidden sm:inline-block ${getOrderBadge(pedido.numericState).className}`}>{getOrderBadge(pedido.numericState).label}</Badge>
                            )}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 truncate max-w-full">{pedido.producto}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] sm:text-xs text-slate-500">
                            <span className="flex items-center gap-1 min-w-[110px]">
                              <User className="h-3 w-3" /> {pedido.cliente}
                            </span>
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" /> {t('chinese.ordersPage.orders.qtyShort')}: {pedido.cantidad}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> {new Date(pedido.fecha).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          {pedido.precio && (
                            <div className="sm:hidden mt-1 text-[11px] text-green-700 font-medium">
                              ${pedido.precio.toLocaleString()} · Total ${(pedido.precio * pedido.cantidad).toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* Columna derecha / acciones */}
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                        <div className="hidden sm:block">
                          {pedido.numericState === 2 ? (
                            <Badge className={`border bg-yellow-100 text-yellow-800 border-yellow-200`}>{t('chinese.ordersPage.filters.pending')}</Badge>
                          ) : (
                            <Badge className={`${getOrderBadge(pedido.numericState).className}`}>{getOrderBadge(pedido.numericState).label}</Badge>
                          )}
                        </div>
                        {pedido.precio && (
                          <div className="hidden sm:block text-right">
                            <p className="text-sm font-semibold text-green-600 leading-tight">${pedido.precio.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 leading-tight">Total: {(pedido.precio * pedido.cantidad).toLocaleString()}</p>
                          </div>
                        )}
                        <div className="flex w-full sm:w-auto flex-wrap items-center gap-2 justify-end sm:justify-end">
                          {pedido.estado === 'enviado' && (pedido.numericState ?? 0) < 6 && (
                            <Button
                              size="sm"
                              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
                              onClick={() => {
                                setModalEmpaquetar({ open: true, pedidoId: pedido.id });
                                if (boxes.length === 0) fetchBoxes();
                              }}
                            >
                              <Boxes className="h-4 w-4" />
                              <span className="hidden sm:inline">{t('chinese.ordersPage.orders.pack')}</span>
                            </Button>
                          )}
                          {pedido.estado === 'enviado' && (pedido.numericState ?? 0) >= 6 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-amber-700 border-amber-300 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={(pedido.numericState ?? 0) >= 9}
                              onClick={() => {
                                if ((pedido.numericState ?? 0) >= 9) return;
                                handleUnpackOrder(pedido.id);
                              }}
                            >
                              <span className="hidden sm:inline">{t('chinese.ordersPage.orders.unpack')}</span>
                              <Boxes className="h-4 w-4 sm:hidden" aria-label="Desempaquetar" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (pedido.pdfRoutes) {
                                const bust = pedido.pdfRoutes.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
                                window.open(pedido.pdfRoutes + bust, '_blank', 'noopener,noreferrer');
                              } else {
                                alert('No hay PDF disponible para este pedido.');
                              }
                            }}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('chinese.ordersPage.orders.view')}</span>
                          </Button>
                          {pedido.estado === 'pendiente' ? (
                            <Button
                              onClick={() => setModalCotizar({ open: true, pedido })}
                              size="sm"
                              className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700"
                            >
                              <Calculator className="h-4 w-4" />
                              <span className="hidden sm:inline">{t('chinese.ordersPage.orders.quote')}</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setModalCotizar({ open: true, pedido })}
                              className="flex items-center gap-1"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="hidden sm:inline">{t('chinese.ordersPage.orders.editQuote')}</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {pedidosFiltrados.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">{t('chinese.ordersPage.orders.notFoundTitle')}</h3>
                      <p className="text-slate-500">{t('chinese.ordersPage.orders.notFoundSubtitle')}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'cajas' && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Boxes className="h-5 w-5" />
                    {t('chinese.ordersPage.boxes.title')}
                  </CardTitle>
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                      onClick={() => setModalCrearCaja({ open: true })}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden sm:inline">{t('chinese.ordersPage.boxes.create')}</span>
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {boxes.length === 0 ? (
                  <div className="text-center py-12">
                    <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">{t('chinese.ordersPage.boxes.noneTitle')}</h3>
                    <p className="text-slate-500">{t('chinese.ordersPage.boxes.noneSubtitle')}</p>
                  </div>
                ) : cajasFiltradas.length === 0 ? (
                  <div className="text-center py-12">
                    <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">{t('chinese.ordersPage.boxes.notFoundTitle')}</h3>
                    <p className="text-slate-500">{t('chinese.ordersPage.boxes.notFoundSubtitle')}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cajasFiltradas.map((box, idx) => {
                      const id = box.boxes_id ?? box.id ?? box.box_id ?? idx;
                      const boxKey = box.box_id ?? box.boxes_id ?? box.id ?? id;
                      const created = box.creation_date ?? box.created_at ?? '';
                      const stateNum = (box.state ?? 1) as number;
                      return (
                      <div key={`${id}`} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md transition-all duration-300">
                        <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                          <div className="p-3 bg-indigo-100 rounded-lg shrink-0">
                            <Boxes className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="space-y-1 w-full min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-semibold text-slate-900 text-sm sm:text-base">#BOX-{id}</h3>
                              {box?.name && (
                                <span className="text-xs sm:text-sm text-slate-600 truncate max-w-full">{String((box as any).name)}</span>
                              )}
                              <Badge className={`hidden sm:inline-block ${getBoxBadge(stateNum).className}`}>{getBoxBadge(stateNum).label}</Badge>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] sm:text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" /> {created ? new Date(created).toLocaleString('es-ES') : '—'}
                              </span>
                              <span className="flex items-center gap-1">
                                <List className="h-3 w-3" /> {t('chinese.ordersPage.boxes.ordersCount')} {orderCountsByBoxMain[boxKey as any] ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex w-full sm:w-auto flex-wrap items-center gap-2 sm:gap-3 justify-end sm:justify-end">
                          <div className="sm:hidden">
                            <Badge className={`${getBoxBadge(stateNum).className}`}>{getBoxBadge(stateNum).label}</Badge>
                          </div>
              {stateNum === 1 && (
                            <Button
                              size="sm"
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={(orderCountsByBoxMain[boxKey as any] ?? 0) <= 0}
                              onClick={() => {
                                const currentBoxId = box.box_id ?? box.boxes_id ?? box.id;
                                setModalEmpaquetarCaja({ open: true, boxId: currentBoxId });
                                if (containers.length === 0) fetchContainers();
                              }}
                            >
                              <Boxes className="h-4 w-4" />
                              <span className="hidden sm:inline">{t('chinese.ordersPage.boxes.pack')}</span>
                            </Button>
                          )}
                          {stateNum === 2 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                              onClick={() => {
                                const currentBoxId = box.box_id ?? box.boxes_id ?? box.id;
                                if (currentBoxId !== undefined) {
                                  handleUnpackBox(currentBoxId as any);
                                }
                              }}
                            >
                              <span className="hidden sm:inline">{t('chinese.ordersPage.boxes.unpack')}</span>
                              <Boxes className="h-4 w-4 sm:hidden" aria-label="Desempaquetar" />
                            </Button>
                          )}
                          {stateNum >= 3 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-amber-700 border-amber-300 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled
                            >
                              <span className="hidden sm:inline">{t('chinese.ordersPage.boxes.unpack')}</span>
                              <Boxes className="h-4 w-4 sm:hidden" aria-label="Desempaquetar" />
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => {
                              const boxId = box.box_id ?? box.boxes_id ?? box.id;
                              setModalVerPedidos({ open: true, boxId });
                              if (boxId !== undefined) fetchOrdersByBoxId(boxId);
                            }}
                          >
                            <List className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('chinese.ordersPage.boxes.viewOrders')}</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={(box.state ?? 1) >= 3}
                            onClick={() => {
                              const st = (box.state ?? 1) as number;
                              if (st >= 3) {
                                toast({ title: t('chinese.ordersPage.toasts.notAllowedTitle'), description: t('chinese.ordersPage.toasts.deleteShippedBoxDesc') });
                                return;
                              }
                              setModalEliminarCaja({ open: true, box });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('chinese.ordersPage.boxes.delete')}</span>
                          </Button>
                        </div>
                      </div>
                    );})}
                  </div>
                )}
                {boxesLoading && (
                  <p className="text-center text-sm text-slate-500 mt-4">{t('chinese.ordersPage.boxes.loading')}</p>
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
                      {t('chinese.ordersPage.containers.title')}
                    </CardTitle>
                    <div className="flex items-center">
                      <Button
                        size="sm"
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                        onClick={() => setModalCrearContenedor({ open: true })}
                      >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">{t('chinese.ordersPage.containers.create')}</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {containers.length === 0 ? (
                    <div className="text-center py-12">
                      <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">{t('chinese.ordersPage.containers.noneTitle')}</h3>
                      <p className="text-slate-500">{t('chinese.ordersPage.containers.noneSubtitle')}</p>
                    </div>
                  ) : containers.filter((c, idx) => {
                      if (!filtroContenedor) return true;
                      const id = c.container_id ?? c.containers_id ?? c.id ?? idx;
                      return String(id).toLowerCase().includes(filtroContenedor.toLowerCase());
                    }).length === 0 ? (
                    <div className="text-center py-12">
                      <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">{t('chinese.ordersPage.containers.notFoundTitle')}</h3>
                      <p className="text-slate-500">{t('chinese.ordersPage.containers.notFoundSubtitle')}</p>
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
                          <div key={`${id}`} className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md transition-all duration-300">
                            <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                              <div className="p-3 bg-indigo-100 rounded-lg shrink-0">
                                <Boxes className="h-5 w-5 text-indigo-600" />
                              </div>
                              <div className="space-y-1 w-full min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-semibold text-slate-900 text-sm sm:text-base">#CONT-{id}</h3>
                                  {container?.name && (
                                    <span className="text-xs sm:text-sm text-slate-600 truncate max-w-full">{String((container as any).name)}</span>
                                  )}
                                  <Badge className={`hidden sm:inline-block ${getContainerBadge(stateNum).className}`}>{getContainerBadge(stateNum).label}</Badge>
                                </div>
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] sm:text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> {created ? new Date(created).toLocaleString('es-ES') : '—'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex w-full sm:w-auto flex-wrap items-center gap-2 sm:gap-3 justify-end sm:justify-end">
                              <div className="sm:hidden">
                                <Badge className={`${getContainerBadge(stateNum).className}`}>{getContainerBadge(stateNum).label}</Badge>
                              </div>
                              <Button
                                size="sm"
                                className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={stateNum !== 2}
                                onClick={() => {
                                  const id = container.container_id ?? container.containers_id ?? container.id;
                                  if (id !== undefined && (containerSendInfo as any)[id]) {
                                    const saved = (containerSendInfo as any)[id];
                                    setSendTrackingNumber(saved.trackingNumber);
                                    setSendCourierCompany(saved.courierCompany);
                                    setSendEtaDate(saved.etaDate);
                                  } else {
                                    setSendTrackingNumber('');
                                    setSendCourierCompany('');
                                    setSendEtaDate('');
                                  }
                                  setModalEnviarContenedor({ open: true, container });
                                }}
                              >
                                <Truck className="h-4 w-4" /> <span className="hidden sm:inline">{t('chinese.ordersPage.containers.send')}</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1"
                                onClick={() => {
                                  const containerId = container.container_id ?? container.containers_id ?? container.id;
                                  setModalVerPedidosCont({ open: true, containerId });
                                  if (containerId !== undefined) fetchBoxesByContainerId(containerId as any);
                                }}
                              >
                                <List className="h-4 w-4" /> <span className="hidden sm:inline">{t('chinese.ordersPage.containers.viewBoxes')}</span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={(container.state ?? 1) >= 3}
                                onClick={() => {
                                  const st = (container.state ?? 1) as number;
                                  if (st >= 3) {
                                    toast({ title: t('chinese.ordersPage.toasts.notAllowedTitle'), description: t('chinese.ordersPage.toasts.deleteShippedContainerDesc') });
                                    return;
                                  }
                                  setModalEliminarContenedor({ open: true, container });
                                }}
                              >
                                <Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">{t('chinese.ordersPage.containers.delete')}</span>
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {containersLoading && (
                    <p className="text-center text-sm text-slate-500 mt-4">{t('chinese.ordersPage.containers.loading')}</p>
                  )}
                </CardContent>
              </Card>
            )}
        </div>

        {/* Modal Enviar Contenedor: tracking + confirm */}
        {modalEnviarContenedor.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div
              ref={modalEnviarContenedorRef}
              className={`bg-white rounded-2xl p-6 max-w-md mx-4 w-full transition-all duration-300 ${
                isModalEnviarContenedorClosing
                  ? 'translate-y-full scale-95 opacity-0'
                  : 'animate-in slide-in-from-bottom-4 duration-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">{t('chinese.ordersPage.modals.sendContainer.title')}</h3>
                <Button variant="ghost" size="sm" onClick={closeModalEnviarContenedor} className="h-8 w-8 p-0">
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              <p className="text-slate-600 mb-4">{t('chinese.ordersPage.modals.sendContainer.subtitle')}</p>
              {/* Helper local para validar URL */}
              {/** Nota: validación simple usando URL constructor */}
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const urlOk = (() => { try { new URL(sendTrackingLink); return true; } catch { return false; } })();
                  if (!modalEnviarContenedor.container) return;
                  if (!sendTrackingLink.trim() || !urlOk || !sendTrackingNumber.trim() || !sendCourierCompany.trim() || !sendEtaDate.trim()) {
                    if (!urlOk) {
                      toast({ title: t('chinese.ordersPage.toasts.notAllowedTitle'), description: t('chinese.ordersPage.modals.sendContainer.invalidTrackingLink', { defaultValue: 'El enlace de tracking no es válido.' }) });
                    }
                    return;
                  }
                  setSendingContainer(true);
                  const ok = await handleSendContainer(modalEnviarContenedor.container, {
                    trackingLink: sendTrackingLink.trim(),
                    trackingNumber: sendTrackingNumber.trim(),
                    courierCompany: sendCourierCompany.trim(),
                    etaDate: sendEtaDate,
                  });
                  setSendingContainer(false);
                  if (ok) {
                    const id = modalEnviarContenedor.container.container_id ?? modalEnviarContenedor.container.containers_id ?? modalEnviarContenedor.container.id;
                    if (id !== undefined) {
                      setContainerSendInfo(prev => ({
                        ...prev,
                        [id as any]: {
                          trackingNumber: sendTrackingNumber.trim(),
                          courierCompany: sendCourierCompany.trim(),
                          etaDate: sendEtaDate,
                        },
                      }));
                    }
                    closeModalEnviarContenedor();
                  }
                }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">{t('chinese.ordersPage.modals.sendContainer.trackingLink')}</label>
                  <Input
                    value={sendTrackingLink}
                    onChange={(e) => setSendTrackingLink(e.target.value)}
                    placeholder={t('chinese.ordersPage.modals.sendContainer.trackingLinkPlaceholder')}
                    type="url"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">{t('chinese.ordersPage.modals.sendContainer.trackingNumber')}</label>
                  <Input
                    value={sendTrackingNumber}
                    onChange={(e) => setSendTrackingNumber(e.target.value.slice(0,50))}
                    placeholder={t('chinese.ordersPage.modals.sendContainer.trackingNumberPlaceholder')}
                    maxLength={50}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">{t('chinese.ordersPage.modals.sendContainer.courierCompany')}</label>
                  <Input
                    value={sendCourierCompany}
                    onChange={(e) => setSendCourierCompany(e.target.value.slice(0,50))}
                    placeholder={t('chinese.ordersPage.modals.sendContainer.courierCompanyPlaceholder')}
                    maxLength={50}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">{t('chinese.ordersPage.modals.sendContainer.etaDate')}</label>
                  <Input
                    type="date"
                    value={sendEtaDate}
                    onChange={(e) => setSendEtaDate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button type="button" variant="outline" onClick={closeModalEnviarContenedor} disabled={sendingContainer}>
                    {t('chinese.ordersPage.modals.sendContainer.cancel')}
                  </Button>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={
                    sendingContainer ||
                    !sendTrackingLink.trim() ||
                    (() => { try { new URL(sendTrackingLink); return false; } catch { return true; } })() ||
                    !sendTrackingNumber.trim() ||
                    !sendCourierCompany.trim() ||
                    !sendEtaDate.trim()
                  }>
                    {sendingContainer ? t('chinese.ordersPage.modals.sendContainer.sending') : t('chinese.ordersPage.modals.sendContainer.confirm')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

                 {/* Modal Cotizar */}
         {modalCotizar.open && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
             <div 
               ref={modalCotizarRef}
               className={`bg-white rounded-2xl p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${
                 isModalCotizarClosing 
                   ? 'translate-y-full scale-95 opacity-0' 
                   : 'animate-in slide-in-from-bottom-4 duration-300'
               }`}
             >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">{t('chinese.ordersPage.modals.quote.title')}</h3>
                                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={closeModalCotizar}
                   className="h-8 w-8 p-0"
                 >
                   <span className="text-2xl">×</span>
                 </Button>
              </div>
              <form onSubmit={e => {
                e.preventDefault();
                const precio = Number((e.target as any).precio.value);
                if (precio > 0 && modalCotizar.pedido) {
                  cotizarPedido(modalCotizar.pedido, precio);
                }
              }} className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    {t('chinese.ordersPage.modals.quote.summaryTitle')}
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-slate-700">{t('chinese.ordersPage.modals.quote.client')}</p>
                      <p className="text-slate-600">{modalCotizar.pedido?.cliente}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{t('chinese.ordersPage.modals.quote.product')}</p>
                      <p className="text-slate-600">{modalCotizar.pedido?.producto}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{t('chinese.ordersPage.modals.quote.quantity')}</p>
                      <p className="text-slate-600">{modalCotizar.pedido?.cantidad}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">{t('chinese.ordersPage.modals.quote.specifications')}</p>
                      <p className="text-slate-600">{modalCotizar.pedido?.especificaciones || t('chinese.ordersPage.modals.quote.specificationsNA')}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">{t('chinese.ordersPage.modals.quote.unitPriceLabel')}</label>
                                     <div className="relative">
                     <span className="absolute left-3 top-3 text-slate-500">$</span>
                     <input
                       type="number"
                       name="precio"
                       required
                       min="0"
                       step="0.01"
                       className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder={t('chinese.ordersPage.modals.quote.unitPricePlaceholder')}
                       onChange={e => {
                         const precio = Number(e.target.value);
                         setModalCotizar(prev => ({...prev, precioCotizacion: precio}));
                       }}
                     />
                   </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">{t('chinese.ordersPage.modals.quote.totalToPay')}</label>
                  <div className="px-4 py-3 border border-slate-200 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 text-lg font-bold text-green-600">
                    ${((modalCotizar.precioCotizacion || 0) * (modalCotizar.pedido?.cantidad || 0)).toLocaleString()}
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                                     <Button
                     type="button"
                     variant="outline"
                     onClick={closeModalCotizar}
                   >
                     {t('chinese.ordersPage.modals.quote.cancel')}
                   </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {t('chinese.ordersPage.modals.quote.sendQuote')}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Empaquetar Caja: seleccionar contenedor */}
        {modalEmpaquetarCaja.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div
              ref={modalEmpaquetarCajaRef}
              className={`bg-white rounded-2xl p-6 max-w-2xl mx-4 w-full max-h-[85vh] overflow-y-auto transition-all duration-300 ${
                isModalEmpaquetarCajaClosing ? 'translate-y-full scale-95 opacity-0' : 'animate-in slide-in-from-bottom-4 duration-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">{t('chinese.ordersPage.modals.selectContainerForBox.title', { id: String(modalEmpaquetarCaja.boxId ?? '') })}</h3>
                <Button variant="ghost" size="sm" onClick={closeModalEmpaquetarCaja} className="h-8 w-8 p-0">
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              {containersLoading ? (
                <p className="text-center text-sm text-slate-500 py-6">{t('chinese.ordersPage.modals.selectContainerForBox.loading')}</p>
              ) : containers.length === 0 ? (
                <div className="text-center py-12">
                  <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-base font-medium text-slate-900 mb-2">{t('chinese.ordersPage.modals.selectContainerForBox.noneTitle')}</h4>
                  <p className="text-slate-500">{t('chinese.ordersPage.modals.selectContainerForBox.noneSubtitle')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {containers.map((container, idx) => {
                    const id = container.container_id ?? container.containers_id ?? container.id ?? idx;
                    const created = container.creation_date ?? container.created_at ?? '';
                    const stateNum = (container.state ?? 1) as number;
                    return (
                      <div key={`${id}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
                        <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                          <div className="p-3 bg-indigo-100 rounded-lg">
                            <Boxes className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">#CONT-{id}</h3>
                              {container?.name && (
                                <span className="text-xs text-slate-600 truncate max-w-full">{String((container as any).name)}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {created ? new Date(created).toLocaleString('es-ES') : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`${getContainerBadge(stateNum).className}`}>
                            {getContainerBadge(stateNum).label}
                          </Badge>
                          <Button
                            size="sm"
                            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={stateNum >= 3}
                            onClick={() => modalEmpaquetarCaja.boxId && handleSelectContenedorForCaja(modalEmpaquetarCaja.boxId, container)}
                          >
                            {t('chinese.ordersPage.modals.selectContainerForBox.select')}
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
        {/* Modal Crear Contenedor */}
        {modalCrearContenedor.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div
              ref={modalCrearContenedorRef}
              className={`bg-white rounded-2xl p-6 max-w-md mx-4 w-full transition-all duration-300 ${
                isModalCrearContenedorClosing
                  ? 'translate-y-full scale-95 opacity-0'
                  : 'animate-in slide-in-from-bottom-4 duration-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">{t('chinese.ordersPage.modals.createContainer.title')}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModalCrearContenedor}
                  className="h-8 w-8 p-0"
                >
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              <p className="text-slate-600 mb-4">{t('chinese.ordersPage.modals.createContainer.question')}</p>
              {/* Nombre del contenedor (requerido) */}
              <div className="mb-6">
                <label htmlFor="newContainerName" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('chinese.ordersPage.modals.createContainer.containerNameLabel', { defaultValue: 'Nombre del contenedor' })}
                </label>
                <Input
                  id="newContainerName"
                  placeholder={t('chinese.ordersPage.modals.createContainer.containerNamePlaceholder', { defaultValue: 'Ej. CONT-Agosto-01' })}
                  value={newContainerName}
                  onChange={(e) => setNewContainerName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeModalCrearContenedor} disabled={creatingContainer}>{t('chinese.ordersPage.modals.createContainer.cancel')}</Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleConfirmCrearContenedor} disabled={creatingContainer || !newContainerName.trim()}>
                  {creatingContainer ? t('chinese.ordersPage.modals.createContainer.creating') : t('chinese.ordersPage.modals.createContainer.accept')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ver Cajas del Contenedor */}
        {modalVerPedidosCont.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div
              ref={modalVerPedidosContRef}
              className={`bg-white rounded-2xl p-6 max-w-3xl mx-4 w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${
                isModalVerPedidosContClosing ? 'translate-y-full scale-95 opacity-0' : 'animate-in slide-in-from-bottom-4 duration-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">{t('chinese.ordersPage.modals.containerBoxes.title', { id: String(modalVerPedidosCont.containerId ?? '') })}</h3>
                <Button variant="ghost" size="sm" onClick={closeModalVerPedidosCont} className="h-8 w-8 p-0">
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              {boxesByContainerLoading ? (
                <p className="text-center text-sm text-slate-500 py-6">{t('chinese.ordersPage.modals.containerBoxes.loading')}</p>
              ) : boxesByContainer.length === 0 ? (
                <div className="text-center py-12">
                  <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-base font-medium text-slate-900 mb-2">{t('chinese.ordersPage.modals.containerBoxes.noneTitle')}</h4>
                  <p className="text-slate-500">{t('chinese.ordersPage.modals.containerBoxes.noneSubtitle')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {boxesByContainer.map((box, idx) => {
                    const id = box.box_id ?? box.boxes_id ?? box.id ?? idx;
                    const created = box.creation_date ?? box.created_at ?? '';
                    const stateNum = (box.state ?? 1) as number;
                    return (
                      <div key={`${id}`} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
                        <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                          <div className="p-3 bg-indigo-100 rounded-lg">
                            <Boxes className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">#BOX-{id}</h3>
                              {box?.name && (
                                <span className="text-xs text-slate-600 truncate max-w-full">{String((box as any).name)}</span>
                              )}
                              {box?.name && (
                                <span className="text-xs text-slate-600 truncate max-w-full">{String((box as any).name)}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {created ? new Date(created).toLocaleString('es-ES') : '—'}
                              </span>
                              <span className="flex items-center gap-1">
                                <List className="h-3 w-3" />
                                {t('chinese.ordersPage.boxes.ordersCount')} {orderCountsByBox[id as any] ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge className={`${getBoxBadge(stateNum).className}`}>
                            {getBoxBadge(stateNum).label}
                          </Badge>
                          {stateNum === 2 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                              onClick={() => {
                                const boxId = box.box_id ?? box.boxes_id ?? box.id;
                                const containerId = modalVerPedidosCont.containerId;
                                handleUnpackBox(boxId as any, { containerId });
                              }}
                            >
                              <Boxes className="h-4 w-4 sm:hidden" aria-label="Desempaquetar" />
                              <span className="hidden sm:inline">{t('chinese.ordersPage.boxes.unpack')}</span>
                            </Button>
                          )}
                          {stateNum >= 3 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-amber-700 border-amber-300 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled
                            >
                              <Boxes className="h-4 w-4 sm:hidden" />
                              <span className="hidden sm:inline">{t('chinese.ordersPage.boxes.unpack')}</span>
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => {
                              const boxId = box.box_id ?? box.boxes_id ?? box.id;
                              setModalVerPedidos({ open: true, boxId });
                              if (boxId !== undefined) fetchOrdersByBoxId(boxId);
                            }}
                          >
                            <List className="h-4 w-4" />
                            <span className="hidden sm:inline">{t('chinese.ordersPage.boxes.viewOrders')}</span>
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

        {/* Modal Eliminar Contenedor */}
        {modalEliminarContenedor.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div
              ref={modalEliminarContenedorRef}
              className={`bg-white rounded-2xl p-6 max-w-md mx-4 w-full transition-all duration-300 ${
                isModalEliminarContenedorClosing
                  ? 'translate-y-full scale-95 opacity-0'
                  : 'animate-in slide-in-from-bottom-4 duration-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">{t('chinese.ordersPage.modals.deleteContainer.title')}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModalEliminarContenedor}
                  className="h-8 w-8 p-0"
                >
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              <p className="text-slate-600 mb-6">{t('chinese.ordersPage.modals.deleteContainer.question', { id: String(modalEliminarContenedor.container?.containers_id ?? modalEliminarContenedor.container?.id ?? modalEliminarContenedor.container?.container_id ?? '') })}</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeModalEliminarContenedor} disabled={deletingContainer}>{t('chinese.ordersPage.modals.deleteContainer.cancel')}</Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deletingContainer}
                  onClick={async () => {
                    try {
                      setDeletingContainer(true);
                      const supabase = getSupabaseBrowserClient();
                      const id = modalEliminarContenedor.container?.container_id ?? modalEliminarContenedor.container?.containers_id ?? modalEliminarContenedor.container?.id;
                      if (!id) {
                        toast({ title: t('chinese.ordersPage.toasts.deleteErrorTitle'), description: t('chinese.ordersPage.toasts.invalidContainerIdDesc') });
                        return;
                      }
                      const { error } = await supabase
                        .from('containers')
                        .delete()
                        .eq('container_id', id);
                      if (error) {
                        console.error('Error al eliminar contenedor:', error);
                        toast({ title: t('chinese.ordersPage.toasts.deleteContainerErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgain') });
                        return;
                      }
                      toast({ title: t('chinese.ordersPage.toasts.containerDeletedTitle'), description: t('chinese.ordersPage.toasts.containerDeletedDesc') });
                      closeModalEliminarContenedor();
                      fetchContainers();
                    } finally {
                      setDeletingContainer(false);
                    }
                  }}
                >
                  {deletingContainer ? t('chinese.ordersPage.modals.deleteContainer.deleting') : t('chinese.ordersPage.modals.deleteContainer.delete')}
                </Button>
              </div>
            </div>
          </div>
        )}
                 {/* Modal Detalle desactivado: ahora el botón "Ver" abre el PDF en una nueva pestaña */}
         {false && modalDetalle.open && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
             {/* Modal Detalle comentado intencionalmente para reuso futuro */}
           </div>
        )}

        {/* Modal Crear Caja */}
        {modalCrearCaja.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div
              ref={modalCrearCajaRef}
              className={`bg-white rounded-2xl p-6 max-w-md mx-4 w-full transition-all duration-300 ${
                isModalCrearCajaClosing
                  ? 'translate-y-full scale-95 opacity-0'
                  : 'animate-in slide-in-from-bottom-4 duration-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">{t('chinese.ordersPage.modals.createBox.title')}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModalCrearCaja}
                  className="h-8 w-8 p-0"
                >
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              <p className="text-slate-600 mb-4">{t('chinese.ordersPage.modals.createBox.question')}</p>
              {/* Nombre de la caja (requerido) */}
              <div className="mb-6">
                <label htmlFor="newBoxName" className="block text-sm font-medium text-slate-700 mb-1">
                  {t('chinese.ordersPage.modals.createBox.boxNameLabel', { defaultValue: 'Nombre de la caja' })}
                </label>
                <Input
                  id="newBoxName"
                  placeholder={t('chinese.ordersPage.modals.createBox.boxNamePlaceholder', { defaultValue: 'Ej. Electrónica lote A' })}
                  value={newBoxName}
                  onChange={(e) => setNewBoxName(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeModalCrearCaja} disabled={creatingBox}>{t('chinese.ordersPage.modals.createBox.cancel')}</Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleConfirmCrearCaja} disabled={creatingBox || !newBoxName.trim()}>
                  {creatingBox ? t('chinese.ordersPage.modals.createBox.creating') : t('chinese.ordersPage.modals.createBox.accept')}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Ver Pedidos de Caja */}
        {modalVerPedidos.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div
              ref={modalVerPedidosRef}
              className={`bg-white rounded-2xl p-6 max-w-3xl mx-4 w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ${
                isModalVerPedidosClosing ? 'translate-y-full scale-95 opacity-0' : 'animate-in slide-in-from-bottom-4 duration-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">{t('chinese.ordersPage.modals.boxOrders.title', { id: String(modalVerPedidos.boxId ?? '') })}</h3>
                <Button variant="ghost" size="sm" onClick={closeModalVerPedidos} className="h-8 w-8 p-0">
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              {ordersByBoxLoading ? (
                <p className="text-center text-sm text-slate-500 py-6">{t('chinese.ordersPage.modals.boxOrders.loading')}</p>
              ) : ordersByBox.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-base font-medium text-slate-900 mb-2">{t('chinese.ordersPage.modals.boxOrders.noneTitle')}</h4>
                  <p className="text-slate-500">{t('chinese.ordersPage.modals.boxOrders.noneSubtitle')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ordersByBox.map((pedido) => (
                    <div key={pedido.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
                      <div className="flex items-start sm:items-center gap-4 w-full sm:w-auto">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">#ORD-{pedido.id}</h3>
                          </div>
                          <p className="text-sm text-slate-600">{pedido.producto}</p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {pedido.cliente}
                            </span>
                            <span className="flex items-center gap-1">
                              <Tag className="h-3 w-3" />
                              Cantidad: {pedido.cantidad}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(pedido.fecha).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Badge className={`${getOrderBadge(pedido.numericState).className}`}>
                          {getOrderBadge(pedido.numericState).label}
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (pedido.pdfRoutes) {
                              const bust = pedido.pdfRoutes.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`;
                              window.open(pedido.pdfRoutes + bust, '_blank', 'noopener,noreferrer');
                            } else {
                              toast({ title: 'Sin PDF', description: 'No hay PDF disponible para este pedido.' });
                            }
                          }}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">{t('chinese.ordersPage.orders.view')}</span>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Empaquetar: seleccionar caja */}
        {modalEmpaquetar?.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div
              ref={modalEmpaquetarRef}
              className={`bg-white rounded-2xl p-6 max-w-2xl mx-4 w-full max-h-[85vh] overflow-y-auto transition-all duration-300 ${
                isModalEmpaquetarClosing ? 'translate-y-full scale-95 opacity-0' : 'animate-in slide-in-from-bottom-4 duration-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">{t('chinese.ordersPage.modals.selectBoxForOrder.title', { id: modalEmpaquetar?.pedidoId })}</h3>
                <Button variant="ghost" size="sm" onClick={closeModalEmpaquetar} className="h-8 w-8 p-0">
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              {boxesLoading ? (
                <p className="text-center text-sm text-slate-500 py-6">{t('chinese.ordersPage.modals.selectBoxForOrder.loading')}</p>
              ) : boxes.length === 0 ? (
                <div className="text-center py-12">
                  <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-base font-medium text-slate-900 mb-2">{t('chinese.ordersPage.modals.selectBoxForOrder.noneTitle')}</h4>
                  <p className="text-slate-500">{t('chinese.ordersPage.modals.selectBoxForOrder.noneSubtitle')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {boxes.map((box, idx) => {
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
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {created ? new Date(created).toLocaleString('es-ES') : '—'}
                              </span>
                            </div>
                          </div>
                        </div>
            <div className="flex items-center gap-3">
                          <Badge className={`border ${stateNum === 1 ? 'bg-blue-100 text-blue-800 border-blue-200' : stateNum === 2 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                            {stateNum === 1 ? t('chinese.ordersPage.boxBadges.new') : stateNum === 2 ? t('chinese.ordersPage.boxBadges.packed') : t('chinese.ordersPage.boxBadges.state', { num: stateNum })}
                          </Badge>
                          <Button
                            size="sm"
              className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={stateNum >= 3}
                            onClick={() => modalEmpaquetar?.pedidoId && handleSelectCajaForPedido(modalEmpaquetar.pedidoId, box)}
                          >
                            {t('chinese.ordersPage.modals.selectBoxForOrder.select')}
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

        {/* Modal Eliminar Caja */}
        {modalEliminarCaja.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div
              ref={modalEliminarCajaRef}
              className={`bg-white rounded-2xl p-6 max-w-md mx-4 w-full transition-all duration-300 ${
                isModalEliminarCajaClosing
                  ? 'translate-y-full scale-95 opacity-0'
                  : 'animate-in slide-in-from-bottom-4 duration-300'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">{t('chinese.ordersPage.modals.deleteBox.title')}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModalEliminarCaja}
                  className="h-8 w-8 p-0"
                >
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              <p className="text-slate-600 mb-6">{t('chinese.ordersPage.modals.deleteBox.question', { id: String(modalEliminarCaja.box?.boxes_id ?? modalEliminarCaja.box?.id ?? modalEliminarCaja.box?.box_id ?? '') })}</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeModalEliminarCaja} disabled={deletingBox}>{t('chinese.ordersPage.modals.deleteBox.cancel')}</Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deletingBox}
                  onClick={async () => {
                    // Ejecutar borrado en Supabase
                    try {
                      setDeletingBox(true);
                      const supabase = getSupabaseBrowserClient();
                      const id = modalEliminarCaja.box?.box_id ?? modalEliminarCaja.box?.boxes_id ?? modalEliminarCaja.box?.id;
                      if (!id) {
                        toast({ title: t('chinese.ordersPage.toasts.deleteErrorTitle'), description: t('chinese.ordersPage.toasts.invalidBoxIdDesc') });
                        return;
                      }
                      const { error } = await supabase
                        .from('boxes')
                        .delete()
                        .eq('box_id', id);
                      if (error) {
                        console.error('Error al eliminar caja:', error);
                        toast({ title: t('chinese.ordersPage.toasts.deleteBoxErrorTitle'), description: t('chinese.ordersPage.toasts.tryAgain') });
                        return;
                      }
                      toast({ title: t('chinese.ordersPage.toasts.boxDeletedTitle'), description: t('chinese.ordersPage.toasts.boxDeletedDesc') });
                      closeModalEliminarCaja();
                      fetchBoxes();
                    } finally {
                      setDeletingBox(false);
                    }
                  }}
                >
                  {deletingBox ? t('chinese.ordersPage.modals.deleteBox.deleting') : t('chinese.ordersPage.modals.deleteBox.delete')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
  <Toaster />
    </div>
  );
}
