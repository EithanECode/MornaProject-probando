
"use client";
import React, { useState, useEffect, useRef } from "react";
import Sidebar from '@/components/layout/Sidebar';
import '../../animations/animations.css';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
  Download,
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
  prioridad: 'baja' | 'media' | 'alta';
  proveedor?: string;
  especificaciones?: string;
}

// Datos de ejemplo mejorados
const pedidosEjemplo: Pedido[] = [
  {
    id: 1,
    cliente: "María González",
    producto: "iPhone 15 Pro Max",
    cantidad: 2,
    estado: "pendiente",
    cotizado: false,
    precio: null,
    fecha: "2024-01-15",
    prioridad: "alta",
    especificaciones: "256GB, Titanio Natural"
  },
  {
    id: 2,
    cliente: "Carlos Ruiz",
    producto: "MacBook Air M2",
    cantidad: 1,
    estado: "cotizado",
    cotizado: true,
    precio: 2500,
    fecha: "2024-01-14",
    prioridad: "media",
    especificaciones: "13\", 8GB RAM, 256GB SSD"
  },
  {
    id: 3,
    cliente: "Ana Martínez",
    producto: "AirPods Pro",
    cantidad: 3,
    estado: "pendiente",
    cotizado: false,
    precio: null,
    fecha: "2024-01-13",
    prioridad: "baja",
    especificaciones: "2da Generación"
  },
  {
    id: 4,
    cliente: "Luis Pérez",
    producto: "iPad Air",
    cantidad: 1,
    estado: "procesando",
    cotizado: true,
    precio: 1800,
    fecha: "2024-01-12",
    prioridad: "media",
    especificaciones: "10.9\", 64GB, WiFi"
  },
  {
    id: 5,
    cliente: "Patricia López",
    producto: "Samsung Galaxy S24",
    cantidad: 2,
    estado: "enviado",
    cotizado: true,
    precio: 3200,
    fecha: "2024-01-11",
    prioridad: "alta",
    especificaciones: "256GB, Negro"
  }
];

export default function PedidosChina() {
  const [pedidos, setPedidos] = useState<Pedido[]>(pedidosEjemplo);
  const [modalCotizar, setModalCotizar] = useState<{open: boolean, pedido?: Pedido, precioCotizacion?: number}>({open: false, precioCotizacion: 0});
  const [modalDetalle, setModalDetalle] = useState<{open: boolean, pedido?: Pedido}>({open: false});
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Filtros
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');

  // Refs para cerrar modales
  const modalCotizarRef = useRef<HTMLDivElement>(null);
  const modalDetalleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar modales al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalCotizar.open && modalCotizarRef.current && !modalCotizarRef.current.contains(event.target as Node)) {
        setModalCotizar({open: false});
      }
      if (modalDetalle.open && modalDetalleRef.current && !modalDetalleRef.current.contains(event.target as Node)) {
        setModalDetalle({open: false});
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [modalCotizar.open, modalDetalle.open]);

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
    const estadoOk = !filtroEstado || p.estado === filtroEstado;
    const clienteOk = !filtroCliente || p.cliente.toLowerCase().includes(filtroCliente.toLowerCase());
    const prioridadOk = !filtroPrioridad || p.prioridad === filtroPrioridad;
    return estadoOk && clienteOk && prioridadOk;
  });

  // Cotizar pedido
  const cotizarPedido = (id: number, precio: number) => {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, cotizado: true, estado: 'cotizado', precio } : p));
    setModalCotizar({open: false});
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

  const getPriorityColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'baja': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityText = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'Alta';
      case 'media': return 'Media';
      case 'baja': return 'Baja';
      default: return 'Desconocida';
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
        sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-24 w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={stats.pendientes}
          onMenuToggle={() => setSidebarExpanded(!sidebarExpanded)}
          title="Gestión de Pedidos"
          subtitle="Administra y cotiza pedidos de clientes"
        />
        
        <div className="p-6 space-y-8">
          {/* Header del Dashboard */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Gestión de Pedidos</h2>
                  <p className="text-blue-100 text-lg">Panel de Control - Empleado China</p>
                  <p className="text-blue-200 mt-2">Administra pedidos, cotizaciones y seguimiento</p>
                </div>
                <div className="hidden lg:flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{stats.pendientes}</div>
                    <p className="text-blue-100">Pendientes</p>
                  </div>
                  <div className="w-px h-16 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-4xl font-bold">{stats.totalCotizado.toLocaleString()}</div>
                    <p className="text-blue-100">Total Cotizado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas Principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">Pendientes</CardTitle>
                <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-900">{stats.pendientes}</div>
                <p className="text-xs text-blue-700">Esperando cotización</p>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(stats.pendientes / pedidos.length) * 100}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-800">Cotizados</CardTitle>
                <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-900">{stats.cotizados}</div>
                <p className="text-xs text-green-700">Precios enviados</p>
                <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: `${(stats.cotizados / pedidos.length) * 100}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">Procesando</CardTitle>
                <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                  <Truck className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-900">{stats.procesando}</div>
                <p className="text-xs text-purple-700">En producción</p>
                <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(stats.procesando / pedidos.length) * 100}%`}}></div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-800">Total Cotizado</CardTitle>
                <div className="p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-900">${(stats.totalCotizado / 1000).toFixed(1)}K</div>
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
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros y Búsqueda
              </CardTitle>
            </CardHeader>
            <CardContent>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700">Estado</label>
                   <select 
                     value={filtroEstado} 
                     onChange={(e) => setFiltroEstado(e.target.value)}
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="">Todos los estados</option>
                     <option value="pendiente">Pendientes</option>
                     <option value="cotizado">Cotizados</option>
                     <option value="procesando">Procesando</option>
                     <option value="enviado">Enviados</option>
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700">Prioridad</label>
                   <select 
                     value={filtroPrioridad} 
                     onChange={(e) => setFiltroPrioridad(e.target.value)}
                     className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="">Todas las prioridades</option>
                     <option value="alta">Alta</option>
                     <option value="media">Media</option>
                     <option value="baja">Baja</option>
                   </select>
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
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Actualizar
                  </Button>
                  <Button variant="outline" size="sm" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exportar
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
                          <Badge className={`${getPriorityColor(pedido.prioridad)} border`}>
                            {getPriorityText(pedido.prioridad)}
                          </Badge>
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
                          onClick={() => setModalDetalle({open: true, pedido})}
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
              className="bg-white rounded-2xl p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Cotizar Pedido</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalCotizar({open: false})}
                  className="h-8 w-8 p-0"
                >
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              <form onSubmit={e => {
                e.preventDefault();
                const precio = Number((e.target as any).precio.value);
                if (precio > 0 && modalCotizar.pedido) {
                  cotizarPedido(modalCotizar.pedido.id, precio);
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
                    onClick={() => setModalCotizar({open: false})}
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

        {/* Modal Detalle */}
        {modalDetalle.open && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-300">
            <div 
              ref={modalDetalleRef}
              className="bg-white rounded-2xl p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Detalles del Pedido</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setModalDetalle({open: false})}
                  className="h-8 w-8 p-0"
                >
                  <span className="text-2xl">×</span>
                </Button>
              </div>
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4 rounded-lg border border-slate-200">
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Información del Pedido
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-slate-700">ID del Pedido:</p>
                      <p className="text-slate-600">#{modalDetalle.pedido?.id}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Cliente:</p>
                      <p className="text-slate-600">{modalDetalle.pedido?.cliente}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Producto:</p>
                      <p className="text-slate-600">{modalDetalle.pedido?.producto}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Cantidad:</p>
                      <p className="text-slate-600">{modalDetalle.pedido?.cantidad}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Fecha:</p>
                      <p className="text-slate-600">{modalDetalle.pedido?.fecha ? new Date(modalDetalle.pedido.fecha).toLocaleDateString('es-ES') : 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Estado:</p>
                      <Badge className={`${getStatusColor(modalDetalle.pedido?.estado || '')} border`}>
                        {getStatusText(modalDetalle.pedido?.estado || '')}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Prioridad:</p>
                      <Badge className={`${getPriorityColor(modalDetalle.pedido?.prioridad || '')} border`}>
                        {getPriorityText(modalDetalle.pedido?.prioridad || '')}
                      </Badge>
                    </div>
                    <div>
                      <p className="font-medium text-slate-700">Especificaciones:</p>
                      <p className="text-slate-600">{modalDetalle.pedido?.especificaciones || 'N/A'}</p>
                    </div>
                    {modalDetalle.pedido?.precio && (
                      <div>
                        <p className="font-medium text-slate-700">Precio Cotizado:</p>
                        <p className="text-green-600 font-semibold">${modalDetalle.pedido.precio.toLocaleString()}</p>
                        <p className="text-slate-500 text-xs">Total: ${(modalDetalle.pedido.precio * modalDetalle.pedido.cantidad).toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
