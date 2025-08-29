"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import "../animations/animations.css";
import { useState, useEffect } from "react";
import { useChinaContext } from '@/lib/ChinaContext';
import { useTheme } from "next-themes";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  ShoppingCart,
  Truck,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  DollarSign,
  MapPin,
  FileText,
  Flag,
  MessageSquare,
  Star,
  Phone,
  Users,
  TrendingUp,
  Calculator,
  Eye,
  Send,
  RefreshCw,
  Download,
  Share2,
  Edit,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  Zap
} from "lucide-react";
import Link from "next/link";

// Tipos
interface PendingOrder {
  id: string;
  clientName: string;
  clientId: string;
  product: string;
  description: string;
  quantity: number;
  specifications: string;
  supplier: string;
  receivedDate: string;
  status: 'pending' | 'processing' | 'shipped' | 'completed';
  priority: 'low' | 'medium' | 'high';
  estimatedDelivery?: string;
  finalPrice?: number;
  currency?: 'USD' | 'CNY';
}

interface ProcessingOrder {
  id: string;
  clientName: string;
  clientId: string;
  product: string;
  quantity: number;
  supplier: string;
  processingTime: string;
  status: 'processing' | 'quality_check' | 'packaging' | 'ready_to_ship';
  priority: 'low' | 'medium' | 'high';
  estimatedCompletion: string;
}

interface WarehouseItem {
  id: string;
  product: string;
  quantity: number;
  supplier: string;
  location: string;
  lastUpdated: string;
  status: 'available' | 'reserved' | 'low_stock' | 'out_of_stock';
}

export default function ChinaDashboard() {
  // Pedidos asignados al empleado China autenticado
  const { data: chinaOrders, loading: ordersLoading, error: ordersError } = require('@/hooks/use-china-orders').useChinaOrders();
  // Obtener información de los clientes
  const { data: clientsInfo } = require('@/hooks/use-clients-info').useClientsInfo();
  // Nombres de los clientes de los 3 pedidos más recientes
  const pedidosRecientes = (chinaOrders ?? []).slice(-3).reverse();
  const nombresClientesRecientes = pedidosRecientes.map((order: any) =>
    clientsInfo?.find((client: any) => client.user_id === order.client_id)?.name ?? order.client_id
  );

  // Obtener el id del empleado de China autenticado
  const { chinaId } = useChinaContext();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  
  // Variables de pedidos
  const totalPedidos = chinaOrders?.length ?? 0;
  const pedidosPendientes = chinaOrders?.filter((order: any) => order.state === 1).length ?? 0;
  const pedidosEnProceso = chinaOrders?.filter((order: any) => order.state === 2).length ?? 0;
  const pedidosEnviados = chinaOrders?.filter((order: any) => order.state === 3).length ?? 0;
  const reputaciones = chinaOrders?.map((order: any) => order.reputation).filter((r: number | undefined) => typeof r === 'number') ?? [];
  const promedioReputacion = reputaciones.length > 0 ? (reputaciones.reduce((acc: number, r: number) => acc + r, 0) / reputaciones.length) : 0;
  const sumaPresupuestos = chinaOrders?.reduce((acc: number, order: any) => acc + (order.estimatedBudget || 0), 0) ?? 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Datos mock específicos para China
  const PENDING_ORDERS: PendingOrder[] = [
    {
      id: 'ORD-2024-001',
      clientName: 'María González',
      clientId: 'CL-001',
      product: 'iPhone 15 Pro Max',
      description: 'iPhone 15 Pro Max 256GB Titanio Natural',
      quantity: 1,
      specifications: 'Color: Titanio Natural, Almacenamiento: 256GB',
      supplier: 'Apple Store',
      receivedDate: '2024-01-15 10:30',
      status: 'pending',
      priority: 'high'
    },
    {
      id: 'ORD-2024-002',
      clientName: 'Carlos Pérez',
      clientId: 'CL-002',
      product: 'MacBook Air M2',
      description: 'MacBook Air M2 13" 8GB RAM 256GB SSD',
      quantity: 1,
      specifications: 'Procesador: M2, RAM: 8GB, SSD: 256GB',
      supplier: 'Apple Store',
      receivedDate: '2024-01-15 14:20',
      status: 'processing',
      priority: 'medium'
    },
    {
      id: 'ORD-2024-003',
      clientName: 'Ana Rodríguez',
      clientId: 'CL-003',
      product: 'AirPods Pro',
      description: 'AirPods Pro 2da Generación',
      quantity: 2,
      specifications: 'Con cancelación de ruido activa',
      supplier: 'Apple Store',
      receivedDate: '2024-01-15 16:45',
      status: 'shipped',
      priority: 'low',
      estimatedDelivery: '2024-02-15',
      finalPrice: 450,
      currency: 'USD'
    }
  ];

  const PROCESSING_ORDERS: ProcessingOrder[] = [
    {
      id: 'PROC-001',
      clientName: 'Luis Martínez',
      clientId: 'CL-004',
      product: 'Samsung Galaxy S24',
      quantity: 1,
      supplier: 'Samsung Store',
      processingTime: '2.3 días',
      status: 'quality_check',
      priority: 'high',
      estimatedCompletion: '2024-01-18'
    },
    {
      id: 'PROC-002',
      clientName: 'Patricia López',
      clientId: 'CL-005',
      product: 'iPad Air',
      quantity: 2,
      supplier: 'Apple Store',
      processingTime: '1.8 días',
      status: 'packaging',
      priority: 'medium',
      estimatedCompletion: '2024-01-17'
    }
  ];

  const WAREHOUSE_ITEMS: WarehouseItem[] = [
    {
      id: 'WH-001',
      product: 'iPhone 15 Pro',
      quantity: 25,
      supplier: 'Apple Store',
      location: 'Sección A-1',
      lastUpdated: '2024-01-15 09:30',
      status: 'available'
    },
    {
      id: 'WH-002',
      product: 'MacBook Air M2',
      quantity: 8,
      supplier: 'Apple Store',
      location: 'Sección B-3',
      lastUpdated: '2024-01-15 14:20',
      status: 'low_stock'
    },
    {
      id: 'WH-003',
      product: 'AirPods Pro',
      quantity: 0,
      supplier: 'Apple Store',
      location: 'Sección C-2',
      lastUpdated: '2024-01-15 16:45',
      status: 'out_of_stock'
    }
  ];

  // Estadísticas
  const stats = {
    pendingOrders: PENDING_ORDERS.filter(o => o.status === 'pending').length,
    processingOrders: PENDING_ORDERS.filter(o => o.status === 'processing').length + PROCESSING_ORDERS.length,
    shippedOrders: PENDING_ORDERS.filter(o => o.status === 'shipped').length,
    totalProducts: WAREHOUSE_ITEMS.reduce((sum, item) => sum + item.quantity, 0),
    averageProcessingTime: "2.3 días",
    warehouseCapacity: "85%",
    dailyEfficiency: "94%",
    monthlyRevenue: 125000,
    activeSuppliers: 28,
    qualityScore: "98.5%",
    onTimeDelivery: "96%",
    returnRate: "1.2%"
  };



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'quality_check': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'packaging': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ready_to_ship': return 'bg-green-100 text-green-800 border-green-200';
      case 'shipped': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'reserved': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'low_stock': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'out_of_stock': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'quality_check': return 'Control Calidad';
      case 'packaging': return 'Empaquetando';
      case 'ready_to_ship': return 'Listo Enviar';
      case 'shipped': return 'Enviado';
      case 'completed': return 'Completado';
      case 'available': return 'Disponible';
      case 'reserved': return 'Reservado';
      case 'low_stock': return 'Stock Bajo';
      case 'out_of_stock': return 'Sin Stock';
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
        sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-24 w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={stats.pendingOrders + stats.processingOrders}
          onMenuToggle={() => setSidebarExpanded(!sidebarExpanded)}
          title="Panel China"
          subtitle="Gestión de pedidos, procesamiento y logística"
        />
        
        <div className="p-6 space-y-8">
          {/* Header del Dashboard con Bienvenida */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">¡Bienvenido de vuelta!</h2>
                  <p className="text-blue-100 text-lg">Panel de Control - Empleado China</p>
                  <p className="text-blue-200 mt-2">Gestiona pedidos, procesamiento y logística desde un solo lugar</p>
                </div>
                                 <div className="hidden lg:flex items-center space-x-6">
                   <div className="text-center">
                     <div className="text-4xl font-bold">{totalPedidos}</div>
                     <p className="text-blue-100">Pedidos Activos</p>
                   </div>
                 </div>
              </div>
            </div>
          </div>

          {/* Dashboard Principal */}
          <div className="space-y-8">
            {/* Estadísticas Principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">Pedidos Pendientes</CardTitle>
                  <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">{pedidosPendientes}</div>
                  <p className="text-xs text-blue-700">Esperando procesamiento</p>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(pedidosPendientes / totalPedidos) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">En Procesamiento</CardTitle>
                  <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">{pedidosEnProceso}</div>
                  <p className="text-xs text-green-700">En producción</p>
                  <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: `${(pedidosEnProceso / totalPedidos) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-purple-800">Enviados</CardTitle>
                  <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Truck className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">{pedidosEnviados}</div>
                  <p className="text-xs text-purple-700">En tránsito</p>
                  <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(pedidosEnviados / totalPedidos) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-orange-800">Calidad</CardTitle>
                  <div className="p-2 bg-orange-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-900">{(promedioReputacion*100)/5}%</div>
                  <p className="text-xs text-orange-700">Score promedio</p>
                  <div className="mt-2 w-full bg-orange-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{width: `${(promedioReputacion*100)/5}%`}}></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Acciones Rápidas */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Acciones Rápidas</CardTitle>
                <p className="text-sm text-slate-600">Accede rápidamente a las funciones más utilizadas</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Link href="/china/pedidos">
                    <Button variant="outline" className="h-24 flex flex-col gap-3 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 group w-full">
                      <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <Package className="h-8 w-8 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">Nuevo Pedido</span>
                    </Button>
                  </Link>
                  <Link href="/china/pedidos">
                    <Button variant="outline" className="h-24 flex flex-col gap-3 hover:bg-green-50 hover:border-green-300 transition-all duration-300 group w-full">
                      <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                        <Clock className="h-8 w-8 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">Procesar Pedido</span>
                    </Button>
                  </Link>
                  <Link href="/china/pedidos">
                    <Button variant="outline" className="h-24 flex flex-col gap-3 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300 group w-full">
                      <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                        <Truck className="h-8 w-8 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium">Preparar Envío</span>
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Pedidos Recientes y Información del Almacén */}
            <div className="grid grid-cols-1 gap-6">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold">Pedidos Recientes</CardTitle>
                  <p className="text-sm text-slate-600">Últimos pedidos procesados</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pedidosRecientes.length === 0 ? (
                      <div className="text-center text-slate-500">No hay pedidos para mostrar</div>
                    ) : (
                      pedidosRecientes.map((order: any, idx: number) => (
                        <div key={order.id} className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 rounded-lg">
                              <Package className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900">{order.id}</p>
                              <p className="text-xs text-slate-600">{order.productName}</p>
                              <p className="text-xs text-slate-500">Cliente: {nombresClientesRecientes[idx]}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`border`}>
                              Estado: {order.state}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
