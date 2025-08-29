"use client";

// Force dynamic rendering to avoid SSR issues with html2canvas
export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { default as dynamicImport } from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Download,
  RefreshCw,
  Calendar,
  User,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Plane,
  X,
  Link,
  Ship,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
// jsPDF se importará dinámicamente para evitar errores de SSR
// html2canvas se importará dinámicamente para evitar errores de SSR

// Lazy load components pesados
const LazyExportButton = dynamicImport(() => Promise.resolve(({ onClick }: { onClick: () => void }) => (
  <Button variant="outline" size="sm" onClick={onClick}>
    <Download className="w-4 h-4 mr-2" />
    Exportar a PDF
  </Button>
)), { ssr: false });

interface Order {
  id: string;
  client: string;
  status: 'pendiente-china' | 'pendiente-vzla' | 'esperando-pago' | 'en-transito' | 'entregado' | 'cancelado';
  assignedTo: 'china' | 'vzla';
  daysElapsed: number;
  description: string;
  priority: 'alta' | 'media' | 'baja';
  documents?: { type: 'link' | 'image'; url: string; label: string }[];
}

// Memoizar las configuraciones para evitar recreaciones
const STATUS_CONFIG = {
  'pendiente-china': { label: 'Pendiente Cotización China', color: 'bg-yellow-700 border-yellow-800', icon: AlertCircle },
  'pendiente-vzla': { label: 'Pendiente Cotización Vzla', color: 'bg-yellow-700 border-yellow-800', icon: AlertCircle },
  'esperando-pago': { label: 'Esperando Pago Cliente', color: 'bg-orange-700 border-orange-800', icon: Clock },
  'en-transito': { label: 'En Tránsito a Vzla', color: 'bg-blue-800 border-blue-900', icon: Plane },
  'entregado': { label: 'Entregado', color: 'bg-green-800 border-green-900', icon: CheckCircle },
  'cancelado': { label: 'Cancelado', color: 'bg-red-800 border-red-900', icon: AlertCircle }
} as const;

const ASSIGNED_CONFIG = {
  'china': { label: 'China', color: 'bg-red-800 border-red-900' },
  'vzla': { label: 'Vzla', color: 'bg-blue-800 border-blue-900' }
} as const;

// Light theme colors
const STATUS_CONFIG_LIGHT = {
  'pendiente-china': { label: 'Pendiente Cotización China', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
  'pendiente-vzla': { label: 'Pendiente Cotización Vzla', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
  'esperando-pago': { label: 'Esperando Pago Cliente', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Clock },
  'en-transito': { label: 'En Tránsito a Vzla', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Plane },
  'entregado': { label: 'Entregado', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  'cancelado': { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle }
} as const;

const ASSIGNED_CONFIG_LIGHT = {
  'china': { label: 'China', color: 'bg-red-100 text-red-800 border-red-200' },
  'vzla': { label: 'Vzla', color: 'bg-blue-100 text-blue-800 border-blue-200' }
} as const;

// Hook personalizado para manejar el filtrado y paginación
const useOrdersFilter = (orders: Order[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = useMemo(() => {
    return filteredOrders.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredOrders, startIndex, itemsPerPage]);

  const stats = useMemo(() => ({
    total: orders.length,
    pendientes: orders.filter(o => o.status.includes('pendiente')).length,
    enTransito: orders.filter(o => o.status === 'en-transito').length,
    entregados: orders.filter(o => o.status === 'entregado').length
  }), [orders]);

  return {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    filteredOrders,
    paginatedOrders,
    totalPages,
    startIndex,
    stats
  };
};

export default function PedidosPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Order | null>(null);
  const [animateStats, setAnimateStats] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Initial orders data
  const [orders, setOrders] = useState<Order[]>([
    { id: 'PED-001', client: 'Ana Pérez', status: 'pendiente-china', assignedTo: 'china', daysElapsed: 197, description: 'Electrónicos varios', priority: 'alta', documents: [{ type: 'link', url: 'https://example.com/cotizacion-1', label: 'Cotización inicial' }] },
    { id: 'PED-002', client: 'Carlos Ruiz', status: 'pendiente-vzla', assignedTo: 'vzla', daysElapsed: 198, description: 'Herramientas industriales', priority: 'media' },
    { id: 'PED-003', client: 'Lucía Méndez', status: 'esperando-pago', assignedTo: 'china', daysElapsed: 199, description: 'Ropa deportiva', priority: 'baja', documents: [{ type: 'link', url: 'https://example.com/factura-3', label: 'Factura proforma' }] },
    { id: 'PED-005', client: 'Empresa XYZ', status: 'en-transito', assignedTo: 'vzla', daysElapsed: 202, description: 'Maquinaria pesada', priority: 'alta', documents: [{ type: 'image', url: 'https://via.placeholder.com/150', label: 'Foto de carga' }] },
    { id: 'PED-006', client: 'Tiendas ABC', status: 'entregado', assignedTo: 'vzla', daysElapsed: 207, description: 'Productos de belleza', priority: 'media' },
    { id: 'PED-007', client: 'Juan Rodríguez', status: 'pendiente-china', assignedTo: 'china', daysElapsed: 0, description: 'Equipos médicos', priority: 'alta' },
    { id: 'PED-008', client: 'María González', status: 'en-transito', assignedTo: 'vzla', daysElapsed: 15, description: 'Materiales de construcción', priority: 'media' },
    { id: 'PED-009', client: 'Luis Martínez', status: 'esperando-pago', assignedTo: 'china', daysElapsed: 5, description: 'Juguetes educativos', priority: 'baja' },
    { id: 'PED-010', client: 'Carmen López', status: 'entregado', assignedTo: 'vzla', daysElapsed: 45, description: 'Artículos de cocina', priority: 'media' },
    { id: 'PED-011', client: 'Roberto Silva', status: 'pendiente-vzla', assignedTo: 'vzla', daysElapsed: 3, description: 'Equipos de oficina', priority: 'alta' }
  ]);

  useEffect(() => { setMounted(true); }, []);

  // Usar el hook personalizado
  const {
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    currentPage,
    setCurrentPage,
    filteredOrders,
    paginatedOrders,
    totalPages,
    startIndex,
    stats
  } = useOrdersFilter(orders);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateStats(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Memoizar la función de exportación
  const handleExport = useCallback(async () => {
    const pdfContent = document.createElement('div');
    pdfContent.style.width = '210mm';
    pdfContent.style.padding = '10mm';

    const title = document.createElement('h1');
    title.innerText = 'Reporte de Pedidos';
    title.style.fontSize = '24px';
    title.style.marginBottom = '20px';
    pdfContent.appendChild(title);

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = ["ID", "Cliente", "Descripción", "Estado", "Asignado a", "Tiempo (días)"];
    headers.forEach(text => {
      const th = document.createElement('th');
      th.innerText = text;
      th.style.padding = '8px';
      th.style.backgroundColor = '#1e3a8a';
      th.style.color = 'white';
      th.style.border = '1px solid #1e3a8a';
      th.style.textAlign = 'left';
      headerRow.appendChild(th);
    });
    thead.appendChild(headerRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    filteredOrders.forEach((order, index) => {
      const row = document.createElement('tr');
      row.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f3f4f6';
      row.style.border = '1px solid #e2e8f0';

      const rowData = [
        order.id,
        order.client,
        order.description,
        STATUS_CONFIG[order.status].label,
        ASSIGNED_CONFIG[order.assignedTo].label,
        `${order.daysElapsed} días`
      ];

      rowData.forEach(text => {
        const td = document.createElement('td');
        td.innerText = text;
        td.style.padding = '8px';
        td.style.border = '1px solid #e2e8f0';
        td.style.fontSize = '12px';
        row.appendChild(td);
      });
      tbody.appendChild(row);
    });
    table.appendChild(tbody);
    pdfContent.appendChild(table);

    document.body.appendChild(pdfContent);

            const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(pdfContent, { scale: 2 });
    
    document.body.removeChild(pdfContent);

    const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    
    const finalWidth = imgWidth * ratio;
    const finalHeight = imgHeight * ratio;
    
    const x = (pdfWidth - finalWidth) / 2;
    const y = 10;
    
    pdf.addImage(imgData, 'PNG', x, y, finalWidth, finalHeight);
    
    pdf.save("reporte_pedidos.pdf");
  }, [filteredOrders]);

  // Funciones para manejo de modales y datos
  const handleOpenEditModal = (order: Order) => {
    setEditFormData(order);
    setIsEditModalOpen(true);
    setSelectedOrder(null);
  };

  const handleUpdateOrder = () => {
    if (editFormData) {
      const updatedOrders = orders.map(order => 
        order.id === editFormData.id ? editFormData : order
      );
      setOrders(updatedOrders);
      
      setSelectedOrder(editFormData);
      
      setIsEditModalOpen(false);
      setEditFormData(null);
    }
  };

  const handleDeleteOrder = () => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el pedido ${selectedOrder?.id}?`)) {
      const updatedOrders = orders.filter(order => order.id !== selectedOrder?.id);
      setOrders(updatedOrders);
      setSelectedOrder(null);
    }
  };

  // Determinar qué configuración de colores usar
  const statusConfig = mounted && theme === 'dark' ? STATUS_CONFIG : STATUS_CONFIG_LIGHT;
  const assignedConfig = mounted && theme === 'dark' ? ASSIGNED_CONFIG : ASSIGNED_CONFIG_LIGHT;

  // Memoizar las tarjetas de estadísticas
  const statsCards = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Pedidos</p>
              <p className={`text-3xl font-bold transition-all duration-1000 ${animateStats ? 'scale-100' : 'scale-0'}`}>
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 animate-bounce" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Pendientes</p>
              <p className={`text-3xl font-bold transition-all duration-1000 delay-200 ${animateStats ? 'scale-100' : 'scale-0'}`}>
                {stats.pendientes}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">En Tránsito</p>
              <p className={`text-3xl font-bold transition-all duration-1000 delay-400 ${animateStats ? 'scale-100' : 'scale-0'}`}>
                {stats.enTransito}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Plane className="w-6 h-6 animate-bounce" style={{ animationDuration: '2s' }} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Entregados</p>
              <p className={`text-3xl font-bold transition-all duration-1000 delay-600 ${animateStats ? 'scale-100' : 'scale-0'}`}>
                {stats.entregados}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ), [stats, animateStats]);

  // Memoizar el renderizado de las filas de la tabla
  const tableRows = useMemo(() => (
    paginatedOrders.map((order) => {
      const status = statusConfig[order.status];
      const assigned = assignedConfig[order.assignedTo];
      const StatusIcon = status.icon;
      
      return (
        <tr 
          key={order.id}
          className={`border-b border-slate-100 hover:bg-blue-900/60 transition-all duration-200 cursor-pointer group text-slate-900 dark:text-white`}
        >
          <td className="py-4 px-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <span className="font-medium">{order.id}</span>
            </div>
          </td>
          <td className="py-4 px-6">
            <div>
              <p className="font-medium">{order.client}</p>
              <p className="text-sm">{order.description}</p>
            </div>
          </td>
          <td className="py-4 px-6">
            <Badge className={`${status.color} border text-slate-900 dark:text-white`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status.label}
            </Badge>
          </td>
          <td className="py-4 px-6">
            <Badge className={`${assigned.color} border text-slate-900 dark:text-white`}>
              {assigned.label}
            </Badge>
          </td>
          <td className="py-4 px-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{order.daysElapsed} días</span>
            </div>
          </td>
          <td className="py-4 px-6">
            <div className="flex items-center space-x-2">
              <Button 
                size="sm" 
                variant="outline"
                className="bg-white/50 border-slate-200 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
                onClick={() => setSelectedOrder(order)}
              >
                <Eye className="w-4 h-4 mr-1" />
                Ver
              </Button>
            </div>
          </td>
        </tr>
      );
    })
  ), [paginatedOrders, statusConfig, assignedConfig]);

  return (
    <div
      className={
        `min-h-screen flex overflow-x-hidden ` +
        (mounted && theme === 'dark'
          ? 'bg-slate-900'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50')
      }
    >
      {/* Sidebar */}
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} userRole="admin" />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-20 w-[calc(100%-5rem)]'}`}>
        {/* Header */}
        <header className={mounted && theme === 'dark' ? 'bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40' : 'bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40'}>
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className={`text-2xl font-bold ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Gestión de Pedidos</h1>
                <p className={mounted && theme === 'dark' ? 'text-sm text-slate-300' : 'text-sm text-slate-600'}>Administra y da seguimiento a todos los pedidos</p>
              </div>
              <div className="flex items-center space-x-4">
                <LazyExportButton onClick={handleExport} />
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Pedido
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className={mounted && theme === 'dark' ? 'p-6 space-y-6 bg-slate-900' : 'p-6 space-y-6'}>
          {/* Stats Cards */}
          {statsCards}

          {/* Table Card */}
          <Card className={mounted && theme === 'dark' ? 'shadow-lg border-0 bg-slate-800/80 backdrop-blur-sm' : 'shadow-lg border-0 bg-white/70 backdrop-blur-sm'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className={mounted && theme === 'dark' ? 'text-xl font-bold text-white' : 'text-xl font-bold text-slate-900'}>Lista de Pedidos</CardTitle>
                  <CardDescription className={mounted && theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>
                    {filteredOrders.length} pedidos encontrados
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className={mounted && theme === 'dark' ? 'absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4' : 'absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4'} />
                    <Input
                      placeholder="Buscar pedidos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-10 w-64 focus:border-blue-500 focus:ring-blue-500 ${mounted && theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400' : 'bg-white/50 border-slate-200'}`}
                    />
                  </div>
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className={`w-48 ${mounted && theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white/50 border-slate-200'}`}>
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pendiente-china">Pendiente China</SelectItem>
                      <SelectItem value="pendiente-vzla">Pendiente Vzla</SelectItem>
                      <SelectItem value="esperando-pago">Esperando Pago</SelectItem>
                      <SelectItem value="en-transito">En Tránsito</SelectItem>
                      <SelectItem value="entregado">Entregado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className={mounted && theme === 'dark' ? 'w-full bg-slate-800' : 'w-full'}>
                  <thead>
                    <tr className={mounted && theme === 'dark' ? 'border-b border-slate-700' : 'border-b border-slate-200'}>
                      <th className={mounted && theme === 'dark' ? 'text-left py-4 px-6 font-semibold text-white' : 'text-left py-4 px-6 font-semibold text-slate-900'}>Tiempo Transcurrido</th>
                      <th className={mounted && theme === 'dark' ? 'text-left py-4 px-6 font-semibold text-white' : 'text-left py-4 px-6 font-semibold text-slate-900'}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows}
                  </tbody>
                </table>
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className={mounted && theme === 'dark' ? 'flex items-center justify-between mt-6 pt-6 border-t border-slate-700' : 'flex items-center justify-between mt-6 pt-6 border-t border-slate-200'}>
                  <div className={mounted && theme === 'dark' ? 'text-sm text-slate-300' : 'text-sm text-slate-600'}>
                    Mostrando {startIndex + 1} a {Math.min(startIndex + 8, filteredOrders.length)} de {filteredOrders.length} resultados
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={mounted && theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 hover:border-blue-800' : 'bg-white/50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Anterior
                    </Button>
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className={currentPage === page 
                            ? "bg-blue-600 text-white" 
                            : mounted && theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 hover:border-blue-800' : 'bg-white/50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={mounted && theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 hover:border-blue-800' : 'bg-white/50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'}
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Modal de Detalles del Pedido */}
      <Dialog open={!!selectedOrder && !isEditModalOpen && !isDocumentsModalOpen} onOpenChange={() => setSelectedOrder(null)}>
        {selectedOrder && (
          <DialogContent
            className={mounted && theme === 'dark' ? 'sm:max-w-[700px] bg-slate-900 p-0 rounded-lg shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95' : 'sm:max-w-[700px] bg-white p-0 rounded-lg shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'}
          >
            <div className="flex flex-col md:flex-row">
              {/* Sección izquierda - Detalles del pedido */}
              <div className={mounted && theme === 'dark' ? 'md:w-2/3 p-8 border-b md:border-b-0 md:border-r border-slate-700' : 'md:w-2/3 p-8 border-b md:border-b-0 md:border-r border-gray-200'}>
                <DialogHeader>
                  <DialogTitle className={mounted && theme === 'dark' ? 'text-2xl font-bold text-white' : 'text-2xl font-bold text-slate-900'}>
                    Detalles del Pedido: {selectedOrder.id}
                  </DialogTitle>
                  <DialogDescription className={mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-500'}>
                    Información detallada sobre el pedido y su estado actual.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-4">
                  {/* Detalles de la tarjeta */}
                  <div className="flex items-center space-x-3">
                    <div className={mounted && theme === 'dark' ? 'w-10 h-10 rounded-full bg-blue-900 flex items-center justify-center' : 'w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center'}>
                      <Package className={mounted && theme === 'dark' ? 'w-5 h-5 text-blue-300' : 'w-5 h-5 text-blue-600'} />
                    </div>
                    <div>
                      <p className={mounted && theme === 'dark' ? 'font-semibold text-lg text-white' : 'font-semibold text-lg text-slate-900'}>Cliente</p>
                      <p className={mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>{selectedOrder.client}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={mounted && theme === 'dark' ? 'w-10 h-10 rounded-full bg-purple-900 flex items-center justify-center' : 'w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center'}>
                      <MapPin className={mounted && theme === 'dark' ? 'w-5 h-5 text-purple-300' : 'w-5 h-5 text-purple-600'} />
                    </div>
                    <div>
                      <p className={mounted && theme === 'dark' ? 'font-semibold text-lg text-white' : 'font-semibold text-lg text-slate-900'}>Asignado a</p>
                      <Badge className={`${assignedConfig[selectedOrder.assignedTo].color} border`}>
                        {assignedConfig[selectedOrder.assignedTo].label}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={mounted && theme === 'dark' ? 'w-10 h-10 rounded-full bg-green-900 flex items-center justify-center' : 'w-10 h-10 rounded-full bg-green-100 flex items-center justify-center'}>
                      <Clock className={mounted && theme === 'dark' ? 'w-5 h-5 text-green-300' : 'w-5 h-5 text-green-600'} />
                    </div>
                    <div>
                      <p className={mounted && theme === 'dark' ? 'font-semibold text-lg text-white' : 'font-semibold text-lg text-slate-900'}>Tiempo Transcurrido</p>
                      <p className={mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>{selectedOrder.daysElapsed} días</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={mounted && theme === 'dark' ? 'w-10 h-10 rounded-full bg-orange-900 flex items-center justify-center' : 'w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center'}>
                      <Calendar className={mounted && theme === 'dark' ? 'w-5 h-5 text-orange-300' : 'w-5 h-5 text-orange-600'} />
                    </div>
                    <div>
                      <p className={mounted && theme === 'dark' ? 'font-semibold text-lg text-white' : 'font-semibold text-lg text-slate-900'}>Estado Actual</p>
                      <Badge className={`${statusConfig[selectedOrder.status].color} border`}>
                        {
                          (() => {
                            const StatusIcon = statusConfig[selectedOrder.status].icon;
                            return <StatusIcon className="w-3 h-3 mr-1" />;
                          })()
                        }
                        {statusConfig[selectedOrder.status].label}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-8">
                  <p className={mounted && theme === 'dark' ? 'font-semibold text-xl text-white' : 'font-semibold text-xl text-slate-900'}>Descripción del Pedido</p>
                  <p className={mounted && theme === 'dark' ? 'mt-2 text-slate-300' : 'mt-2 text-gray-600'}>{selectedOrder.description}</p>
                </div>
              </div>

              {/* Sección derecha - Historial y Acciones */}
              <div className={mounted && theme === 'dark' ? 'md:w-1/3 p-8 bg-slate-800 flex flex-col justify-between' : 'md:w-1/3 p-8 bg-gray-50 flex flex-col justify-between'}>
                <div>
                  <h3 className={mounted && theme === 'dark' ? 'font-bold text-lg text-white' : 'font-bold text-lg text-slate-900'}>Historial del Pedido</h3>
                  <div className="mt-4 space-y-4">
                    {/* Placeholder para el historial */}
                    <div className={mounted && theme === 'dark' ? 'flex items-center' : 'flex items-center'}>
                      <div className={mounted && theme === 'dark' ? 'w-2 h-2 rounded-full bg-blue-400 mr-4' : 'w-2 h-2 rounded-full bg-blue-500 mr-4'}></div>
                      <span className={mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>Creado por {selectedOrder.client} ({selectedOrder.daysElapsed} días)</span>
                    </div>
                    <div className={mounted && theme === 'dark' ? 'flex items-center' : 'flex items-center'}>
                      <div className={mounted && theme === 'dark' ? 'w-2 h-2 rounded-full bg-yellow-400 mr-4' : 'w-2 h-2 rounded-full bg-yellow-500 mr-4'}></div>
                      <span className={mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>En espera de cotización</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col space-y-2">
                  <Button 
                    className={mounted && theme === 'dark' ? 'w-full bg-blue-600 text-white hover:bg-blue-700' : 'w-full bg-blue-600 text-white hover:bg-blue-700'}
                    onClick={() => handleOpenEditModal(selectedOrder)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button 
                    className={mounted && theme === 'dark' ? 'w-full bg-red-600 text-white hover:bg-red-700' : 'w-full bg-red-600 text-white hover:bg-red-700'}
                    onClick={handleDeleteOrder}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                  <Button
                    className={mounted && theme === 'dark' ? 'w-full bg-slate-700 text-slate-200 hover:bg-slate-600' : 'w-full bg-gray-200 text-gray-700 hover:bg-gray-300'}
                    onClick={() => setIsDocumentsModalOpen(true)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Documentos
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
      
      {/* Modal para Actualizar Pedido */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        {editFormData && (
          <DialogContent className={mounted && theme === 'dark' ? 'sm:max-w-[500px] bg-slate-900 border-slate-700' : 'sm:max-w-[500px]'}>
            <DialogHeader>
              <DialogTitle className={mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}>Actualizar Pedido: {editFormData.id}</DialogTitle>
              <DialogDescription className={mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-500'}>
                Modifica los detalles del pedido a continuación.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className={mounted && theme === 'dark' ? 'text-right text-slate-200' : 'text-right'}>Cliente</Label>
                <Input 
                  id="client" 
                  value={editFormData.client}
                  onChange={(e) => setEditFormData({ ...editFormData, client: e.target.value })}
                  className={`col-span-3 ${mounted && theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-100' : ''}`}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className={mounted && theme === 'dark' ? 'text-right text-slate-200' : 'text-right'}>Descripción</Label>
                <Input 
                  id="description" 
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className={`col-span-3 ${mounted && theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-100' : ''}`}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className={mounted && theme === 'dark' ? 'text-right text-slate-200' : 'text-right'}>Estado</Label>
                <Select 
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value as Order['status'] })}
                >
                  <SelectTrigger className={`col-span-3 ${mounted && theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-100' : ''}`}>
                    <SelectValue placeholder="Selecciona un estado" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(statusConfig).map(statusKey => (
                      <SelectItem key={statusKey} value={statusKey}>{statusConfig[statusKey as Order['status']].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="assignedTo" className={mounted && theme === 'dark' ? 'text-right text-slate-200' : 'text-right'}>Asignado a</Label>
                <Select 
                  value={editFormData.assignedTo}
                  onValueChange={(value) => setEditFormData({ ...editFormData, assignedTo: value as Order['assignedTo'] })}
                >
                  <SelectTrigger className={`col-span-3 ${mounted && theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-100' : ''}`}>
                    <SelectValue placeholder="Selecciona una ubicación" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(assignedConfig).map(assignedKey => (
                      <SelectItem key={assignedKey} value={assignedKey}>{assignedConfig[assignedKey as Order['assignedTo']].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="daysElapsed" className={mounted && theme === 'dark' ? 'text-right text-slate-200' : 'text-right'}>Días Transcurridos</Label>
                <Input 
                  id="daysElapsed" 
                  type="number"
                  value={editFormData.daysElapsed}
                  onChange={(e) => setEditFormData({ ...editFormData, daysElapsed: parseInt(e.target.value) || 0 })}
                  className={`col-span-3 ${mounted && theme === 'dark' ? 'bg-slate-800 border-slate-600 text-slate-100' : ''}`}
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleUpdateOrder}>Guardar cambios</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Modal para Ver Documentos */}
      <Dialog open={isDocumentsModalOpen} onOpenChange={setIsDocumentsModalOpen}>
        {selectedOrder && (
          <DialogContent className={mounted && theme === 'dark' ? 'sm:max-w-[500px] bg-slate-900 border-slate-700' : 'sm:max-w-[500px]'}>
            <DialogHeader>
              <DialogTitle className={mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}>Documentos del Pedido: {selectedOrder.id}</DialogTitle>
              <DialogDescription className={mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-500'}>
                Accede a las fotos y enlaces de este pedido.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedOrder.documents && selectedOrder.documents.length > 0 ? (
                selectedOrder.documents.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {doc.type === 'image' && (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className={`flex items-center space-x-2 hover:underline ${mounted && theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                        <img src={doc.url} alt={doc.label} className="w-16 h-16 object-cover rounded-lg" />
                        <span>{doc.label}</span>
                      </a>
                    )}
                    {doc.type === 'link' && (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className={`flex items-center space-x-2 hover:underline ${mounted && theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                        <Link className="w-5 h-5" />
                        <span>{doc.label}</span>
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className={mounted && theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}>No hay documentos para este pedido.</p>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}