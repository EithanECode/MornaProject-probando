// src/app/pedidos/page.tsx
"use client";

import { useState, useEffect } from 'react';
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
  Calendar,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Plane,
  MapPin,
  X,
  Link,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Order {
  id: string;
  client: string;
  status: 'pendiente-china' | 'pendiente-vzla' | 'esperando-pago' | 'en-transito' | 'entregado' | 'cancelado';
  assignedTo: 'china' | 'vzla';
  daysElapsed: number;
  description: string;
  documents?: { type: 'link' | 'image'; url: string; label: string }[];
}

const statusConfig = {
  'pendiente-china': { label: 'Pendiente Cotización China', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
  'pendiente-vzla': { label: 'Pendiente Cotización Vzla', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: AlertCircle },
  'esperando-pago': { label: 'Esperando Pago Cliente', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: Clock },
  'en-transito': { label: 'En Tránsito a Vzla', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Plane },
  'entregado': { label: 'Entregado', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
  'cancelado': { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle }
};

const assignedConfig = {
  'china': { label: 'China', color: 'bg-red-100 text-red-800 border-red-200' },
  'vzla': { label: 'Vzla', color: 'bg-blue-100 text-blue-800 border-blue-200' }
};

export default function PedidosPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [animateStats, setAnimateStats] = useState(false);
  
  const [editFormData, setEditFormData] = useState<Order | null>(null);

  const [orders, setOrders] = useState<Order[]>([
    { id: 'PED-001', client: 'Ana Pérez', status: 'pendiente-china', assignedTo: 'china', daysElapsed: 197, description: 'Electrónicos varios', documents: [{ type: 'link', url: 'https://example.com/cotizacion-1', label: 'Cotización inicial' }] },
    { id: 'PED-002', client: 'Carlos Ruiz', status: 'pendiente-vzla', assignedTo: 'vzla', daysElapsed: 198, description: 'Herramientas industriales' },
    { id: 'PED-003', client: 'Lucía Méndez', status: 'esperando-pago', assignedTo: 'china', daysElapsed: 199, description: 'Ropa deportiva', documents: [{ type: 'link', url: 'https://example.com/factura-3', label: 'Factura proforma' }] },
    { id: 'PED-005', client: 'Empresa XYZ', status: 'en-transito', assignedTo: 'vzla', daysElapsed: 202, description: 'Maquinaria pesada', documents: [{ type: 'image', url: 'https://via.placeholder.com/150', label: 'Foto de carga' }] },
    { id: 'PED-006', client: 'Tiendas ABC', status: 'entregado', assignedTo: 'vzla', daysElapsed: 207, description: 'Productos de belleza' },
    { id: 'PED-007', client: 'Juan Rodríguez', status: 'pendiente-china', assignedTo: 'china', daysElapsed: 0, description: 'Equipos médicos' },
    { id: 'PED-008', client: 'María González', status: 'en-transito', assignedTo: 'vzla', daysElapsed: 15, description: 'Materiales de construcción' },
    { id: 'PED-009', client: 'Luis Martínez', status: 'esperando-pago', assignedTo: 'china', daysElapsed: 5, description: 'Juguetes educativos' },
    { id: 'PED-010', client: 'Carmen López', status: 'entregado', assignedTo: 'vzla', daysElapsed: 45, description: 'Artículos de cocina' },
    { id: 'PED-011', client: 'Roberto Silva', status: 'pendiente-vzla', assignedTo: 'vzla', daysElapsed: 3, description: 'Equipos de oficina' }
  ]);

  useEffect(() => {
    setAnimateStats(true);
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
              order.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = async () => {
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
        statusConfig[order.status].label,
        assignedConfig[order.assignedTo].label,
        `${order.daysElapsed} días`,
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

    const canvas = await html2canvas(pdfContent, { scale: 2 });
    
    document.body.removeChild(pdfContent);

    const imgData = canvas.toDataURL('image/png');
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
  };

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

  const itemsPerPage = 8;
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  const stats = {
    total: orders.length,
    pendientes: orders.filter(o => o.status.includes('pendiente')).length,
    enTransito: orders.filter(o => o.status === 'en-transito').length,
    entregados: orders.filter(o => o.status === 'entregado').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      {/* Sidebar */}
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-72' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestión de Pedidos</h1>
                <p className="text-sm text-slate-600">Administra y da seguimiento a todos los pedidos</p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar a PDF
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Pedido
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Stats Cards */}
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

          {/* Table Card */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold text-slate-900">Lista de Pedidos</CardTitle>
                  <CardDescription className="text-slate-600">
                    {filteredOrders.length} pedidos encontrados
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar pedidos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64 bg-white/50 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  
                  {/* Status Filter */}
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48 bg-white/50 border-slate-200">
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
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-4 px-6 font-semibold text-slate-900">ID Pedido</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-900">Cliente</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-900">Estado</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-900">Asignado a</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-900">Tiempo Transcurrido</th>
                      <th className="text-left py-4 px-6 font-semibold text-slate-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedOrders.map((order, index) => {
                      const status = statusConfig[order.status];
                      const assigned = assignedConfig[order.assignedTo];
                      const StatusIcon = status.icon;
                      
                      return (
                        <tr 
                          key={order.id}
                          className="border-b border-slate-100 hover:bg-slate-50/50 transition-all duration-200 cursor-pointer"
                        >
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                <Package className="w-4 h-4 text-white" />
                              </div>
                              <span className="font-medium text-slate-900">{order.id}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div>
                              <p className="font-medium text-slate-900">{order.client}</p>
                              <p className="text-sm text-slate-500">{order.description}</p>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={`${status.color} border`}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <Badge className={`${assigned.color} border`}>
                              {assigned.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-600">{order.daysElapsed} días</span>
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
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    Mostrando {startIndex + 1} a {Math.min(startIndex + itemsPerPage, filteredOrders.length)} de {filteredOrders.length} resultados
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="bg-white/50 border-slate-200 hover:bg-blue-50 hover:border-blue-300"
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
                            : "bg-white/50 border-slate-200 hover:bg-blue-50 hover:border-blue-300"
                          }
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
                      className="bg-white/50 border-slate-200 hover:bg-blue-50 hover:border-blue-300"
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
            className="sm:max-w-[700px] bg-white p-0 rounded-lg shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
          >
            <div className="flex flex-col md:flex-row">
              {/* Sección izquierda - Detalles del pedido */}
              <div className="md:w-2/3 p-8 border-b md:border-b-0 md:border-r border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-slate-900">
                    Detalles del Pedido: {selectedOrder.id}
                  </DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Información detallada sobre el pedido y su estado actual.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-6 space-y-4">
                  {/* Detalles de la tarjeta */}
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-slate-900">Cliente</p>
                      <p className="text-gray-600">{selectedOrder.client}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-slate-900">Asignado a</p>
                      <Badge className={`${assignedConfig[selectedOrder.assignedTo].color} border`}>
                        {assignedConfig[selectedOrder.assignedTo].label}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-slate-900">Tiempo Transcurrido</p>
                      <p className="text-gray-600">{selectedOrder.daysElapsed} días</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-lg text-slate-900">Estado Actual</p>
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
                  <p className="font-semibold text-xl text-slate-900">Descripción del Pedido</p>
                  <p className="mt-2 text-gray-600">{selectedOrder.description}</p>
                </div>
              </div>

              {/* Sección derecha - Historial y Acciones */}
              <div className="md:w-1/3 p-8 bg-gray-50 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">Historial del Pedido</h3>
                  <div className="mt-4 space-y-4">
                    {/* Placeholder para el historial */}
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mr-4"></div>
                      <span className="text-gray-600">Creado por Ana Pérez (2 días)</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mr-4"></div>
                      <span className="text-gray-600">En espera de cotización</span>
                    </div>
                    {/* Más pasos del historial */}
                  </div>
                </div>

                <div className="mt-8 flex flex-col space-y-2">
                  <Button 
                    className="w-full bg-blue-600 text-white hover:bg-blue-700"
                    onClick={() => handleOpenEditModal(selectedOrder)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Actualizar
                  </Button>
                  <Button 
                    className="w-full bg-red-600 text-white hover:bg-red-700"
                    onClick={handleDeleteOrder}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Eliminar
                  </Button>
                  <Button
                    className="w-full bg-gray-200 text-gray-700 hover:bg-gray-300"
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Actualizar Pedido: {editFormData.id}</DialogTitle>
              <DialogDescription>
                Modifica los detalles del pedido a continuación.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">Cliente</Label>
                <Input 
                  id="client" 
                  value={editFormData.client}
                  onChange={(e) => setEditFormData({ ...editFormData, client: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">Descripción</Label>
                <Input 
                  id="description" 
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Estado</Label>
                <Select 
                  value={editFormData.status}
                  onValueChange={(value) => setEditFormData({ ...editFormData, status: value as Order['status'] })}
                >
                  <SelectTrigger className="col-span-3">
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
                <Label htmlFor="assignedTo" className="text-right">Asignado a</Label>
                <Select 
                  value={editFormData.assignedTo}
                  onValueChange={(value) => setEditFormData({ ...editFormData, assignedTo: value as Order['assignedTo'] })}
                >
                  <SelectTrigger className="col-span-3">
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
                <Label htmlFor="daysElapsed" className="text-right">Días Transcurridos</Label>
                <Input 
                  id="daysElapsed" 
                  type="number"
                  value={editFormData.daysElapsed}
                  onChange={(e) => setEditFormData({ ...editFormData, daysElapsed: parseInt(e.target.value) || 0 })}
                  className="col-span-3"
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Documentos del Pedido: {selectedOrder.id}</DialogTitle>
              <DialogDescription>
                Accede a las fotos y enlaces de este pedido.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {selectedOrder.documents && selectedOrder.documents.length > 0 ? (
                selectedOrder.documents.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {doc.type === 'image' && (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-600 hover:underline">
                        <img src={doc.url} alt={doc.label} className="w-16 h-16 object-cover rounded-lg" />
                        <span>{doc.label}</span>
                      </a>
                    )}
                    {doc.type === 'link' && (
                      <a href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-600 hover:underline">
                        <Link className="w-5 h-5" />
                        <span>{doc.label}</span>
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No hay documentos para este pedido.</p>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}