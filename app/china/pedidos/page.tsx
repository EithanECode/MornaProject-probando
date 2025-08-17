
"use client";
import React, { useState } from "react";
import Sidebar from '@/components/layout/Sidebar';
import '../../animations/animations.css';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator,Eye,Pencil, 
  
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
  Flag
} from 'lucide-react';

// Datos de ejemplo, en el futuro se obtendrán del backend
const pedidosEjemplo = [
  {
    id: 1,
    cliente: "María González",
    producto: "iPhone 15 Pro",
    cantidad: 2,
    estado: "pendiente",
    cotizado: false,
    precio: null,
    fecha: "2024-01-15"
  },
  {
    id: 2,
    cliente: "Carlos Ruiz",
    producto: "MacBook Air M2",
    cantidad: 1,
    estado: "cotizado",
    cotizado: true,
    precio: 2500,
    fecha: "2024-01-14"
  },
  {
    id: 3,
    cliente: "Ana Martínez",
    producto: "AirPods Pro",
    cantidad: 3,
    estado: "pendiente",
    cotizado: false,
    precio: null,
    fecha: "2024-01-13"
  },
];

export default function PedidosChina() {
  const [pedidos, setPedidos] = useState(pedidosEjemplo);
  const [modalCotizar, setModalCotizar] = useState<{open: boolean, pedido?: any, precioCotizacion?: number}>({open: false, precioCotizacion: 0});
  const [modalDetalle, setModalDetalle] = useState<{open: boolean, pedido?: any}>({open: false});

  // Stats
  const stats = {
    pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
    cotizados: pedidos.filter(p => p.estado === 'cotizado').length,
    totalCotizado: pedidos.filter(p => p.precio).reduce((acc, p) => acc + (p.precio || 0), 0),
    esteMes: pedidos.length
  };

  // Filtros (preparados para backend)
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroCliente, setFiltroCliente] = useState('');

  const pedidosFiltrados = pedidos.filter(p => {
    const estadoOk = !filtroEstado || p.estado === filtroEstado;
    const clienteOk = !filtroCliente || p.cliente.toLowerCase().includes(filtroCliente.toLowerCase());
    return estadoOk && clienteOk;
  });

  // Cotizar pedido (simulado)
  const cotizarPedido = (id: number, precio: number) => {
    setPedidos(pedidos.map(p => p.id === id ? { ...p, cotizado: true, estado: 'cotizado', precio } : p));
    setModalCotizar({open: false});
  };

  // Estado local y persistencia para el sidebar
  const [sidebarExpanded, setSidebarExpanded] = React.useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebarExpandedChina');
      return saved ? JSON.parse(saved) : true;
    }
    return true;
  });

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarExpandedChina', JSON.stringify(sidebarExpanded));
    }
  }, [sidebarExpanded]);

  return (
    <div className="min-h-screen flex overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} userRole="china" />
      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-20 w-[calc(100%-5rem)]'}`}> 
        <Header notifications={stats.pendientes} onMenuToggle={() => setSidebarExpanded(!sidebarExpanded)} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Título y badge */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">Pedidos y Cotizaciones</h1>
            </div>
            <Badge variant="outline" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Panel China
            </Badge>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="flex items-center bg-gradient-to-r from-blue-500 to-blue-700 rounded-lg shadow p-6 card-animate-liftbounce">
              <div className="flex items-center">
                <Clock className="h-6 w-6 text-yellow-300" />
                <div className="ml-4">
      <p className="text-lg font-bold text-white">Pendientes</p>
      <p className="text-2xl font-bold text-white">{stats.pendientes}</p>
                </div>
              </div>
            </Card>
            <Card className="flex items-center bg-gradient-to-r from-orange-500 to-orange-700 rounded-lg shadow p-6 card-animate-liftbounce">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-blue-300" />
                <div className="ml-4">
      <p className="text-lg font-bold text-white">Cotizados</p>
      <p className="text-2xl font-bold text-white">{stats.cotizados}</p>
                </div>
              </div>
            </Card>
            <Card className="flex items-center bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg shadow p-6 card-animate-liftbounce">
              <div className="flex items-center">
                <DollarSign className="h-6 w-6 text-blue-300" />
                <div className="ml-4">
      <p className="text-lg font-bold text-white">Total</p>
      <p className="text-2xl font-bold text-white">${stats.totalCotizado.toLocaleString()}</p>
                </div>
              </div>
            </Card>
  <Card className="bg-gradient-to-r from-green-500 to-green-700 rounded-lg shadow p-6 card-animate-liftbounce">
              <div className="flex items-center">
                <div className="flex items-center">
                  <BarChart3 className="h-6 w-6 text-yellow-300"  />
                </div>
                <div className="ml-4">
      <p className="text-lg font-bold text-white">Este Mes</p>
      <p className="text-2xl font-bold text-white">{stats.esteMes}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Filtros */}
          <div className="bg-white rounded-lg shadow mb-6 p-4 flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md text-sm font-ace-sans focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="">Todos</option>
                <option value="pendiente">Pendientes</option>
                <option value="cotizado">Cotizados</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar Cliente</label>
              <input type="text" value={filtroCliente} onChange={e => setFiltroCliente(e.target.value)} placeholder="Buscar por cliente..." className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-orange-600 focus:border-orange-600" />
            </div>
          </div>

          {/* Tabla de pedidos */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Lista de Pedidos</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">Producto</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">Cantidad</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">Fecha</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">Precio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-950 uppercase tracking-wider">Acciones</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pedidosFiltrados.map(pedido => (
                    <tr key={pedido.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">{pedido.cliente.charAt(0)}</span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{pedido.cliente}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pedido.producto}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pedido.cantidad}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(pedido.fecha).toLocaleDateString('es-ES')}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {pedido.estado === 'pendiente' && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>}
                        {pedido.estado === 'cotizado' && <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">Cotizado</span>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pedido.precio ? `$${pedido.precio.toLocaleString()}` : '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Button  className="bg-blue-600 gap-x-1 text-white hover:bg-blue-700 hover:text-white card-animate-liftbounce" variant="outline" onClick={() => setModalDetalle({open: true, pedido})}>
                            <Eye className="h-4 w-4" /> Ver
                          </Button>
                          {pedido.estado === 'pendiente' ? (
                            <Button className="bg-orange-600 gap-x-1 text-white hover:bg-orange-700 hover:text-white card-animate-liftbounce" variant="outline" onClick={() => setModalCotizar({open: true, pedido})}>
                              <Calculator className="h-4 w-4" /> Cotizar
                            </Button>
                          ) : (
                            <Button className="bg-green-600 gap-x-1 text-white hover:bg-green-700 hover:text-white card-animate-liftbounce" variant="outline" onClick={() => setModalCotizar({open: true, pedido})}>
                             <Pencil className="h-4 w-4" /> Editar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Modal Cotizar */}
          {modalCotizar.open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Cotizar Pedido</h3>
                  <button onClick={() => setModalCotizar({open: false})} className="text-gray-400 hover:text-gray-600">
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                <form onSubmit={e => {
                  e.preventDefault();
                  const precio = Number((e.target as any).precio.value);
                  if (precio > 0) cotizarPedido(modalCotizar.pedido.id, precio);
                }} className="space-y-6">
                  <div className="bg-gray-50 p-4 rounded-lg flex gap-6 items-center">
                    <div className="text-sm space-y-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Resumen del Pedido</h4>
                      <p><span className="font-medium">Cliente:</span> {modalCotizar.pedido.cliente}</p>
                      <p><span className="font-medium">Producto:</span> {modalCotizar.pedido.producto}</p>
                      <p><span className="font-medium">Cantidad:</span> {modalCotizar.pedido.cantidad}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Precio unitario de la Cotización *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">$</span>
                      <input type="number" name="precio" required min="0" step="0.01" className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder="0.00" onChange={e => {
                        const precio = Number(e.target.value);
                        setModalCotizar(modalCotizar => ({...modalCotizar, precioCotizacion: precio}));
                      }} />
                    </div>
                  </div>
                  {/* Total a pagar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Total a Pagar</label>
                    <div className="px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-lg font-bold text-green-600">
                      ${((modalCotizar.precioCotizacion || 0) * modalCotizar.pedido.cantidad).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex justify-end space-x-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setModalCotizar({open: false})}>Cancelar</Button>
                    <Button type="submit" className="bg-blue-600 text-white hover:bg-blue-700">Enviar Cotización</Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal Detalle */}
          {modalDetalle.open && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-2xl mx-4 w-300 overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Detalles del Pedido</h3>
                  <button onClick={() => setModalDetalle({open: false})} className="text-gray-400 hover:text-gray-600">
                    <span className="text-2xl">×</span>
                  </button>
                </div>
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>

                      <div className="space-y-2 text-sm">
                        <p><span className="font-medium">Producto:</span> {modalDetalle.pedido.producto}</p>
                        <p><span className="font-medium">Cantidad:</span> {modalDetalle.pedido.cantidad}</p>
                        <p><span className="font-medium">Fecha:</span> {new Date(modalDetalle.pedido.fecha).toLocaleDateString('es-ES')}</p>
                        <p><span className="font-medium">Estado:</span> {modalDetalle.pedido.estado}</p>
                        {modalDetalle.pedido.precio && <p><span className="font-medium">Precio Cotizado:</span> ${modalDetalle.pedido.precio.toLocaleString()}</p>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
