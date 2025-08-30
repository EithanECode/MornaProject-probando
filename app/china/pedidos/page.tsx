"use client";
import React, { useState, useEffect, useRef } from "react";
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import Sidebar from '@/components/layout/Sidebar';
import '../../animations/animations.css';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
  Tag
} from 'lucide-react';

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
}

// Elimina los datos de ejemplo

export default function PedidosChina() {
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(false);
  // Mapear state numérico a texto usado en China
  function mapStateToEstado(state: number): Pedido['estado'] {
  if (state === 2) return 'pendiente';
  if (state === 3) return 'cotizado';
  if (state === 4) return 'procesando';
  // Por defecto, tratar otros estados >1 como "procesando"
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
          .filter((order: any) => typeof order.state === 'number' ? order.state > 1 : true)
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
        }))
      );
    } finally {
      setLoading(false);
    }
  }
  const [modalCotizar, setModalCotizar] = useState<{open: boolean, pedido?: Pedido, precioCotizacion?: number}>({open: false, precioCotizacion: 0});
  const [modalDetalle, setModalDetalle] = useState<{open: boolean, pedido?: Pedido}>({open: false});
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Estados para animaciones de salida
  const [isModalCotizarClosing, setIsModalCotizarClosing] = useState(false);
  const [isModalDetalleClosing, setIsModalDetalleClosing] = useState(false);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroCliente, setFiltroCliente] = useState('');

  // Refs para cerrar modales
  const modalCotizarRef = useRef<HTMLDivElement>(null);
  const modalDetalleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchPedidos();
  }, []);

  // Cerrar modales al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalCotizar.open && modalCotizarRef.current && !modalCotizarRef.current.contains(event.target as Node)) {
        closeModalCotizar();
      }
      if (modalDetalle.open && modalDetalleRef.current && !modalDetalleRef.current.contains(event.target as Node)) {
        closeModalDetalle();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [modalCotizar.open, modalDetalle.open]);

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
  setPedidos(prev => prev.map(p => p.id === pedido.id ? { ...p, cotizado: true, estado: 'cotizado', precio: precioUnitario, totalQuote: total } : p));
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
      case 'enviado': return 'Enviado';
      default: return 'Desconocido';
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
        userRole="china"
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={stats.pendientes}
          onMenuToggle={() => setSidebarExpanded(!sidebarExpanded)}
          title="Gestión de Pedidos"
          subtitle="Administra y cotiza pedidos de clientes"
        />
        
        <div className="p-4 md:p-5 lg:p-6 space-y-6 md:space-y-8">
          {/* Header del Dashboard */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-4 md:p-6 lg:p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">Gestión de Pedidos</h2>
                  <p className="text-blue-100 text-sm md:text-base lg:text-lg">Panel de Control - Empleado China</p>
                  <p className="text-blue-200 mt-2 text-xs md:text-sm">Administra pedidos, cotizaciones y seguimiento</p>
                </div>
                <div className="flex md:hidden lg:flex items-center space-x-4 md:space-x-6">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold">{stats.pendientes}</div>
                    <p className="text-blue-100 text-xs md:text-sm">Pendientes</p>
                  </div>
                  <div className="w-px h-12 md:h-16 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold">{stats.totalCotizado.toLocaleString()}</div>
                    <p className="text-blue-100 text-xs md:text-sm">Total Cotizado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas Principales */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-blue-800">Pendientes</CardTitle>
                <div className="p-1 md:p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                  <Clock className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-900">{stats.pendientes}</div>
                <p className="text-xs text-blue-700">Esperando cotización</p>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(stats.pendientes / pedidos.length) * 100}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-green-800">Cotizados</CardTitle>
                <div className="p-1 md:p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-green-900">{stats.cotizados}</div>
                <p className="text-xs text-green-700">Precios enviados</p>
                <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${(stats.cotizados / pedidos.length) * 100}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-purple-800">Procesando</CardTitle>
                <div className="p-1 md:p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                  <Truck className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-900">{stats.procesando}</div>
                <p className="text-xs text-purple-700">En producción</p>
                <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(stats.procesando / pedidos.length) * 100}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-orange-800">Total Cotizado</CardTitle>
                <div className="p-1 md:p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                  <DollarSign className="h-3 w-3 md:h-4 md:w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-orange-900">${(stats.totalCotizado / 1000).toFixed(1)}K</div>
                <p className="text-xs text-orange-700">Valor total</p>
                <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{width: `${(stats.totalCotizado / 10000) * 100}%`}}></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y Búsqueda */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl font-semibold flex items-center gap-2">
                <Filter className="h-4 w-4 md:h-5 md:w-5" />
                Filtros y Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
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
            </CardContent>
          </Card>

          {/* Lista de Pedidos */}
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
                           <h3 className="font-semibold text-slate-900">#{pedido.id}</h3>
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

                 {/* Modal Detalle desactivado: ahora el botón "Ver" abre el PDF en una nueva pestaña */}
         {false && modalDetalle.open && (
           <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
             {/* Modal Detalle comentado intencionalmente para reuso futuro */}
           </div>
        )}
      </main>
    </div>
  );
}
