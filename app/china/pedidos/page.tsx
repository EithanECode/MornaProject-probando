"use client";
import React, { useState, useEffect, useRef } from "react";
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

// Tipos
interface Pedido {
  id: number;
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
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  // Mapear state numérico a texto usado en China
  function mapStateToEstado(state: number): Pedido['estado'] {
    if (state >= 5) return 'enviado';
    if (state === 4) return 'procesando';
    if (state === 3) return 'cotizado';
    return 'pendiente';
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
      setPedidos(
        data
          .filter((order: any) => typeof order.state === 'number' ? order.state >= 4 : true)
          .map((order: any) => ({
          id: order.id,
          cliente: order.clientName || '',
          producto: order.productName || '',
          cantidad: order.quantity || 0,
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

  useEffect(() => {
    setMounted(true);
    fetchPedidos();
  }, []);

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

  // Crear registro en Supabase: tabla boxes
  const handleConfirmCrearCaja = async () => {
    try {
      setCreatingBox(true);
      const supabase = getSupabaseBrowserClient();
      const creation_date = new Date().toISOString();
      const { data, error } = await supabase
        .from('boxes')
        .insert([{ state: 1, creation_date }])
        .select();
      if (error) {
        console.error('Error al crear caja:', error);
        toast({
          title: 'No se pudo crear la caja',
          description: 'Intenta nuevamente en unos segundos.',
        });
        return;
      }
      // Éxito: cerrar modal (podemos mostrar toast si existe más adelante)
      closeModalCrearCaja();
      toast({
        title: 'Caja creada',
        description: 'La caja fue creada correctamente.',
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
        toast({ title: 'No se pudieron cargar las cajas', description: 'Reintenta más tarde.' });
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
      const { error } = await supabase
        .from('containers')
        .insert([{ state: 1, creation_date }]);
      if (error) {
        console.error('Error al crear contenedor:', error);
        toast({ title: 'No se pudo crear el contenedor', description: 'Intenta nuevamente en unos segundos.' });
        return;
      }
      closeModalCrearContenedor();
      toast({ title: 'Contenedor creado', description: 'El contenedor fue creado correctamente.' });
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
        toast({ title: 'No se pudieron cargar los contenedores', description: 'Reintenta más tarde.' });
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
        toast({ title: 'No se pudieron cargar las cajas', description: 'Intenta nuevamente.' });
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
        toast({ title: 'No se pudieron cargar los pedidos', description: 'Intenta nuevamente.' });
        return;
      }
      const mapped: Pedido[] = (data || []).map((order: any) => ({
        id: order.id,
        cliente: order.clientName || order.client || '—',
        producto: order.productName || order.product || '—',
        cantidad: Number(order.quantity || 0),
        estado: mapStateToEstado(Number(order.state || 2)),
        cotizado: Number(order.state) === 3 || (!!order.totalQuote && Number(order.totalQuote) > 0),
        precio: order.totalQuote ? Number(order.totalQuote) / Math.max(1, Number(order.quantity || 1)) : null,
        fecha: order.created_at || order.creation_date || new Date().toISOString(),
        especificaciones: order.specifications || '',
        pdfRoutes: order.pdfRoutes || '',
        deliveryType: order.deliveryType || '',
        shippingType: order.shippingType || '',
        totalQuote: order.totalQuote ?? null,
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
      toast({ title: 'Contenedor inválido', description: 'No se pudo determinar el ID del contenedor.' });
      return;
    }
    try {
      const supabase = getSupabaseBrowserClient();
      // 1) Actualizar la caja: asignar contenedor y cambiar state=2 (empaquetada)
      const { error: boxUpdateError } = await supabase
        .from('boxes')
        .update({ container_id: containerId, state: 2 })
        .eq('box_id', boxId);
      if (boxUpdateError) {
        console.error('Error asignando contenedor:', boxUpdateError);
        toast({ title: 'No se pudo asignar el contenedor', description: 'Intenta nuevamente.' });
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
      toast({ title: 'Caja asignada', description: `La caja #BOX-${boxId} fue asignada al contenedor #CONT-${containerId}.` });
      // Actualizar UI local
      setBoxes(prev => prev.map(b => {
        const id = b.box_id ?? b.boxes_id ?? b.id;
        if (String(id) === String(boxId)) return { ...b, container_id: containerId, state: 2 };
        return b;
      }));
      closeModalEmpaquetarCaja();
    } catch (e) {
      console.error(e);
      toast({ title: 'Error inesperado', description: 'Reintenta más tarde.' });
    }
  };

  // Desempaquetar caja: quitar de contenedor, resetear estado y liberar pedidos
  const handleUnpackBox = async (boxId: number | string, options?: { containerId?: number | string }) => {
    try {
      const supabase = getSupabaseBrowserClient();
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
        toast({ title: 'No se pudo desempaquetar', description: 'Intenta nuevamente.' });
        return;
      }
      toast({ title: 'Caja desempaquetada', description: `Se liberaron los pedidos y la caja #BOX-${boxId}.` });
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
      toast({ title: 'Error inesperado', description: 'Reintenta más tarde.' });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cotizado': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'procesando': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'enviado': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'cotizado': return 'Cotizado';
      case 'procesando': return 'Procesando';
  case 'enviado': return 'Esperando envío';
      default: return 'Desconocido';
    }
  };

  // Asignar pedido a caja (empaquetar)
  const handleSelectCajaForPedido = async (pedidoId: number, box: BoxItem) => {
    const boxId = box.box_id ?? box.boxes_id ?? box.id;
    if (!boxId) {
      toast({ title: 'Caja inválida', description: 'No se pudo determinar el ID de la caja.' });
      return;
    }
    try {
      const supabase = getSupabaseBrowserClient();
      // Si la caja ya está empaquetada (state=2), el pedido debe pasar a state=7 (en contenedor)
      const boxStateNum = (box.state ?? 1) as number;
      const nextOrderState = boxStateNum === 2 ? 7 : 6;
      const { error } = await supabase
        .from('orders')
        .update({ box_id: boxId, state: nextOrderState })
        .eq('id', pedidoId);
      if (error) {
        console.error('Error asignando caja:', error);
        toast({ title: 'No se pudo asignar la caja', description: 'Intenta nuevamente.' });
        return;
      }
  toast({ title: 'Pedido asignado', description: `El pedido #ORD-${pedidoId} fue asignado a la caja ${boxId}.` });
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
      toast({ title: 'Error inesperado', description: 'Reintenta más tarde.' });
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
        toast({ title: 'No se pudo desempaquetar', description: 'Intenta nuevamente.' });
        return;
      }
      const boxId = (orderRow as any)?.box_id as number | string | null;
      if (!boxId) {
        toast({ title: 'Pedido sin caja', description: 'Este pedido no tiene caja asignada.' });
        return;
      }
      // Limpiar relación y bajar a estado 5
      const { error: updErr } = await supabase
        .from('orders')
        .update({ box_id: null, state: 5 })
        .eq('id', pedidoId);
      if (updErr) {
        console.error('Error al desempaquetar pedido:', updErr);
        toast({ title: 'No se pudo desempaquetar', description: 'Intenta nuevamente.' });
        return;
      }
      toast({ title: 'Pedido desempaquetado', description: `El pedido #ORD-${pedidoId} fue liberado de la caja.` });
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
      toast({ title: 'Error inesperado', description: 'Reintenta más tarde.' });
    }
  };



  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
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
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={stats.pendientes}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Gestión de Pedidos"
          subtitle="Administra y cotiza pedidos de clientes"
        />
        
        <div className="p-4 md:p-5 lg:p-6 space-y-6">
          {/* Header de la página */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-4 md:p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Pedidos</h1>
                <p className="text-orange-100 mt-1 text-sm md:text-base">Administra y cotiza pedidos de clientes</p>
              </div>
              <div className="grid grid-cols-2 md:flex md:items-center md:space-x-4 gap-4">
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{stats.pendientes}</p>
                  <p className="text-xs md:text-sm text-orange-100">PENDIENTES</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{stats.cotizados}</p>
                  <p className="text-xs md:text-sm text-orange-100">COTIZADOS</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{stats.procesando}</p>
                  <p className="text-xs md:text-sm text-orange-100">PROCESANDO</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{stats.enviados}</p>
                  <p className="text-xs md:text-sm text-orange-100">ENVIADOS</p>
                </div>
              </div>
            </div>
          </div>





          {/* Tabs: Lista de pedidos | Cajas | Contenedores */}
          <div className="flex justify-start">
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

          {/* Filtros y Búsqueda (debajo de pestañas) */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4 md:h-5 md:w-5" />
                Filtros y Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeTab === 'pedidos' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Estado</label>
                    <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos</SelectItem>
                        <SelectItem value="pendiente">Pendientes</SelectItem>
                        <SelectItem value="cotizado">Cotizados</SelectItem>
                        <SelectItem value="procesando">Procesando</SelectItem>
                        <SelectItem value="enviado">Enviados</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Buscar Cliente</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar por cliente..."
                        value={filtroCliente}
                        onChange={(e) => setFiltroCliente(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ) : activeTab === 'cajas' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2 md:col-span-1">
                    <label className="text-sm font-medium text-slate-700">Buscar Caja</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar por caja (ID)..."
                        value={filtroCaja}
                        onChange={(e) => setFiltroCaja(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="space-y-2 md:col-span-1">
                    <label className="text-sm font-medium text-slate-700">Buscar Contenedor</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar por contenedor (ID)..."
                        value={filtroContenedor}
                        onChange={(e) => setFiltroContenedor(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {activeTab === 'pedidos' && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl font-semibold flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Lista de Pedidos
                  </CardTitle>
                  <div className="flex items-center">
                    <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={fetchPedidos} disabled={loading}>
                      <RefreshCw className="h-4 w-4" />
                      {loading ? 'Actualizando...' : 'Actualizar'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pedidosFiltrados.map((pedido) => (
                    <div key={pedido.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">#ORD-{pedido.id}</h3>
                          </div>
                          <p className="text-sm text-slate-600">{pedido.producto}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
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
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(pedido.estado)} border`}>
                          {getStatusText(pedido.estado)}
                        </Badge>
                        {pedido.precio && (
                          <div className="text-right">
                            <p className="text-sm font-semibold text-green-600">${pedido.precio.toLocaleString()}</p>
                            <p className="text-xs text-slate-500">Total: ${(pedido.precio * pedido.cantidad).toLocaleString()}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
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
                              Empaquetar
                            </Button>
                          )}
                          {pedido.estado === 'enviado' && (pedido.numericState ?? 0) >= 6 && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex items-center gap-1 text-amber-700 border-amber-300 hover:bg-amber-50"
                              onClick={() => handleUnpackOrder(pedido.id)}
                            >
                              Desempaquetar
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
                            Ver
                          </Button>
                          {pedido.estado === 'pendiente' ? (
                            <Button
                              onClick={() => setModalCotizar({open: true, pedido})}
                              size="sm"
                              className="flex items-center gap-1 bg-orange-600 hover:bg-orange-700"
                            >
                              <Calculator className="h-4 w-4" />
                              Cotizar
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setModalCotizar({open: true, pedido})}
                              className="flex items-center gap-1"
                            >
                              <Pencil className="h-4 w-4" />
                              Editar
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {pedidosFiltrados.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron pedidos</h3>
                      <p className="text-slate-500">Intenta ajustar los filtros de búsqueda</p>
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
                    Cajas
                  </CardTitle>
                  <div className="flex items-center">
                    <Button
                      size="sm"
                      className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                      onClick={() => setModalCrearCaja({ open: true })}
                    >
                      <Plus className="h-4 w-4" />
                      Crear cajas
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {boxes.length === 0 ? (
                  <div className="text-center py-12">
                    <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No hay cajas creadas</h3>
                    <p className="text-slate-500">Crea tu primera caja con el botón de arriba.</p>
                  </div>
                ) : cajasFiltradas.length === 0 ? (
                  <div className="text-center py-12">
                    <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron cajas</h3>
                    <p className="text-slate-500">Intenta ajustar la búsqueda por ID.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cajasFiltradas.map((box, idx) => {
                      const id = box.boxes_id ?? box.id ?? box.box_id ?? idx;
                      const boxKey = box.box_id ?? box.boxes_id ?? box.id ?? id;
                      const created = box.creation_date ?? box.created_at ?? '';
                      const stateNum = (box.state ?? 1) as number;
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
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {created ? new Date(created).toLocaleString('es-ES') : '—'}
                              </span>
                              <span className="flex items-center gap-1">
                                <List className="h-3 w-3" />
                                Pedidos: {orderCountsByBoxMain[boxKey as any] ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`border ${stateNum === 1 ? 'bg-blue-100 text-blue-800 border-blue-200' : stateNum === 2 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                            {stateNum === 1 ? 'Nueva' : stateNum === 2 ? 'Empaquetada' : `Estado ${stateNum}`}
                          </Badge>
                          {stateNum !== 2 && (
                          <Button
                            size="sm"
                            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => {
                              const currentBoxId = box.box_id ?? box.boxes_id ?? box.id;
                              setModalEmpaquetarCaja({ open: true, boxId: currentBoxId });
                              if (containers.length === 0) fetchContainers();
                            }}
                          >
                            <Boxes className="h-4 w-4" />
                            Empaquetar
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
                            Desempaquetar
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
                            Ver pedidos
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => setModalEliminarCaja({ open: true, box })}
                          >
                            <Trash2 className="h-4 w-4" />
                            Eliminar caja
                          </Button>
                        </div>
                      </div>
                    );})}
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
                    <div className="flex items-center">
                      <Button
                        size="sm"
                        className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700"
                        onClick={() => setModalCrearContenedor({ open: true })}
                      >
                        <Plus className="h-4 w-4" />
                        Crear contenedor
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {containers.length === 0 ? (
                    <div className="text-center py-12">
                      <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No hay contenedores creados</h3>
                      <p className="text-slate-500">Crea tu primer contenedor con el botón de arriba.</p>
                    </div>
                  ) : containers.filter((c, idx) => {
                      if (!filtroContenedor) return true;
                      const id = c.container_id ?? c.containers_id ?? c.id ?? idx;
                      return String(id).toLowerCase().includes(filtroContenedor.toLowerCase());
                    }).length === 0 ? (
                    <div className="text-center py-12">
                      <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 mb-2">No se encontraron contenedores</h3>
                      <p className="text-slate-500">Intenta ajustar la búsqueda por ID.</p>
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
                                  <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {created ? new Date(created).toLocaleString('es-ES') : '—'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={`border ${stateNum === 1 ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                {stateNum === 1 ? 'Nuevo' : `Estado ${stateNum}`}
                              </Badge>
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
                                <List className="h-4 w-4" />
                                Ver cajas
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-1 text-red-600 border-red-300 hover:bg-red-50"
                                onClick={() => setModalEliminarContenedor({ open: true, container })}
                              >
                                <Trash2 className="h-4 w-4" />
                                Eliminar contenedor
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
        </div>

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
                <h3 className="text-xl font-bold text-slate-900">Cotizar Pedido</h3>
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
                    Resumen del Pedido
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-slate-700">Cliente:</p>
                      <p className="text-slate-600">{modalCotizar.pedido?.cliente}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Producto:</p>
                      <p className="text-slate-600">{modalCotizar.pedido?.producto}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Cantidad:</p>
                      <p className="text-slate-600">{modalCotizar.pedido?.cantidad}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Especificaciones:</p>
                      <p className="text-slate-600">{modalCotizar.pedido?.especificaciones || 'N/A'}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Precio unitario de la Cotización *</label>
                                     <div className="relative">
                     <span className="absolute left-3 top-3 text-slate-500">$</span>
                     <input
                       type="number"
                       name="precio"
                       required
                       min="0"
                       step="0.01"
                       className="w-full pl-8 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                       placeholder="0.00"
                       onChange={e => {
                         const precio = Number(e.target.value);
                         setModalCotizar(prev => ({...prev, precioCotizacion: precio}));
                       }}
                     />
                   </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-slate-700">Total a Pagar</label>
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
                     Cancelar
                   </Button>
                  <Button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Enviar Cotización
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
                <h3 className="text-lg font-bold text-slate-900">Seleccionar contenedor para la caja #BOX-{String(modalEmpaquetarCaja.boxId ?? '')}</h3>
                <Button variant="ghost" size="sm" onClick={closeModalEmpaquetarCaja} className="h-8 w-8 p-0">
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              {containersLoading ? (
                <p className="text-center text-sm text-slate-500 py-6">Cargando contenedores...</p>
              ) : containers.length === 0 ? (
                <div className="text-center py-12">
                  <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-base font-medium text-slate-900 mb-2">No hay contenedores disponibles</h4>
                  <p className="text-slate-500">Crea un contenedor desde la pestaña Contenedores para poder empaquetar.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {containers.map((container, idx) => {
                    const id = container.container_id ?? container.containers_id ?? container.id ?? idx;
                    const created = container.creation_date ?? container.created_at ?? '';
                    const stateNum = (container.state ?? 1) as number;
                    return (
                      <div key={`${id}`} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-indigo-100 rounded-lg">
                            <Boxes className="h-5 w-5 text-indigo-600" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-slate-900">#CONT-{id}</h3>
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
                          <Badge className={`border ${stateNum === 1 ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                            {stateNum === 1 ? 'Nuevo' : `Estado ${stateNum}`}
                          </Badge>
                          <Button
                            size="sm"
                            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => modalEmpaquetarCaja.boxId && handleSelectContenedorForCaja(modalEmpaquetarCaja.boxId, container)}
                          >
                            Seleccionar
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
                <h3 className="text-lg font-bold text-slate-900">Crear contenedor</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModalCrearContenedor}
                  className="h-8 w-8 p-0"
                >
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              <p className="text-slate-600 mb-6">¿Deseas crear un nuevo contenedor?</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeModalCrearContenedor} disabled={creatingContainer}>Cancelar</Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleConfirmCrearContenedor} disabled={creatingContainer}>
                  {creatingContainer ? 'Creando...' : 'Aceptar'}
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
                <h3 className="text-lg font-bold text-slate-900">Cajas del contenedor #CONT-{String(modalVerPedidosCont.containerId ?? '')}</h3>
                <Button variant="ghost" size="sm" onClick={closeModalVerPedidosCont} className="h-8 w-8 p-0">
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              {boxesByContainerLoading ? (
                <p className="text-center text-sm text-slate-500 py-6">Cargando cajas...</p>
              ) : boxesByContainer.length === 0 ? (
                <div className="text-center py-12">
                  <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-base font-medium text-slate-900 mb-2">No hay cajas asociadas a este contenedor</h4>
                  <p className="text-slate-500">Cuando asignes cajas a este contenedor, aparecerán aquí.</p>
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
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {created ? new Date(created).toLocaleString('es-ES') : '—'}
                              </span>
                              <span className="flex items-center gap-1">
                                <List className="h-3 w-3" />
                                Pedidos: {orderCountsByBox[id as any] ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={`border ${stateNum === 1 ? 'bg-blue-100 text-blue-800 border-blue-200' : stateNum === 2 ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                            {stateNum === 1 ? 'Nueva' : stateNum === 2 ? 'Empaquetada' : `Estado ${stateNum}`}
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
                            Desempaquetar
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
                <h3 className="text-lg font-bold text-slate-900">Eliminar contenedor</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModalEliminarContenedor}
                  className="h-8 w-8 p-0"
                >
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              <p className="text-slate-600 mb-6">¿Seguro que deseas eliminar el contenedor #CONT-{String(modalEliminarContenedor.container?.containers_id ?? modalEliminarContenedor.container?.id ?? modalEliminarContenedor.container?.container_id ?? '')}? Esta acción no se puede deshacer.</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeModalEliminarContenedor} disabled={deletingContainer}>Cancelar</Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  disabled={deletingContainer}
                  onClick={async () => {
                    try {
                      setDeletingContainer(true);
                      const supabase = getSupabaseBrowserClient();
                      const id = modalEliminarContenedor.container?.container_id ?? modalEliminarContenedor.container?.containers_id ?? modalEliminarContenedor.container?.id;
                      if (!id) {
                        toast({ title: 'No se pudo eliminar', description: 'ID de contenedor no válido.' });
                        return;
                      }
                      const { error } = await supabase
                        .from('containers')
                        .delete()
                        .eq('container_id', id);
                      if (error) {
                        console.error('Error al eliminar contenedor:', error);
                        toast({ title: 'No se pudo eliminar el contenedor', description: 'Intenta nuevamente.' });
                        return;
                      }
                      toast({ title: 'Contenedor eliminado', description: 'El contenedor fue eliminado correctamente.' });
                      closeModalEliminarContenedor();
                      fetchContainers();
                    } finally {
                      setDeletingContainer(false);
                    }
                  }}
                >
                  {deletingContainer ? 'Eliminando...' : 'Eliminar'}
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
                <h3 className="text-lg font-bold text-slate-900">Crear caja</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModalCrearCaja}
                  className="h-8 w-8 p-0"
                >
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              <p className="text-slate-600 mb-6">¿Deseas crear una nueva caja?</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeModalCrearCaja} disabled={creatingBox}>Cancelar</Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleConfirmCrearCaja} disabled={creatingBox}>
                  {creatingBox ? 'Creando...' : 'Aceptar'}
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
                <h3 className="text-lg font-bold text-slate-900">Pedidos de la caja #BOX-{String(modalVerPedidos.boxId ?? '')}</h3>
                <Button variant="ghost" size="sm" onClick={closeModalVerPedidos} className="h-8 w-8 p-0">
                  <span className="text-2xl">×</span>
                </Button>
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
                  {ordersByBox.map((pedido) => (
                    <div key={pedido.id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-lg">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-slate-900">#ORD-{pedido.id}</h3>
                          </div>
                          <p className="text-sm text-slate-600">{pedido.producto}</p>
                          <div className="flex items-center gap-4 text-xs text-slate-500">
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
                      <div className="flex items-center gap-3">
                        <Badge className={`${getStatusColor(pedido.estado)} border`}>
                          {getStatusText(pedido.estado)}
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
                          Ver
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
                <h3 className="text-lg font-bold text-slate-900">Seleccionar caja para el pedido #ORD-{modalEmpaquetar?.pedidoId}</h3>
                <Button variant="ghost" size="sm" onClick={closeModalEmpaquetar} className="h-8 w-8 p-0">
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              {boxesLoading ? (
                <p className="text-center text-sm text-slate-500 py-6">Cargando cajas...</p>
              ) : boxes.length === 0 ? (
                <div className="text-center py-12">
                  <Boxes className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                  <h4 className="text-base font-medium text-slate-900 mb-2">No hay cajas disponibles</h4>
                  <p className="text-slate-500">Crea una caja desde la pestaña Cajas para poder empaquetar.</p>
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
                            {stateNum === 1 ? 'Nueva' : stateNum === 2 ? 'Empaquetada' : `Estado ${stateNum}`}
                          </Badge>
                          <Button
                            size="sm"
                            className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700"
                            onClick={() => modalEmpaquetar?.pedidoId && handleSelectCajaForPedido(modalEmpaquetar.pedidoId, box)}
                          >
                            Seleccionar
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
                <h3 className="text-lg font-bold text-slate-900">Eliminar caja</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeModalEliminarCaja}
                  className="h-8 w-8 p-0"
                >
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              <p className="text-slate-600 mb-6">¿Seguro que deseas eliminar la caja #BOX-{String(modalEliminarCaja.box?.boxes_id ?? modalEliminarCaja.box?.id ?? modalEliminarCaja.box?.box_id ?? '')}? Esta acción no se puede deshacer.</p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={closeModalEliminarCaja} disabled={deletingBox}>Cancelar</Button>
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
                        toast({ title: 'No se pudo eliminar', description: 'ID de caja no válido.' });
                        return;
                      }
                      const { error } = await supabase
                        .from('boxes')
                        .delete()
                        .eq('box_id', id);
                      if (error) {
                        console.error('Error al eliminar caja:', error);
                        toast({ title: 'No se pudo eliminar la caja', description: 'Intenta nuevamente.' });
                        return;
                      }
                      toast({ title: 'Caja eliminada', description: 'La caja fue eliminada correctamente.' });
                      closeModalEliminarCaja();
                      fetchBoxes();
                    } finally {
                      setDeletingBox(false);
                    }
                  }}
                >
                  {deletingBox ? 'Eliminando...' : 'Eliminar'}
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
