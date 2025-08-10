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
  RefreshCw,
  Calendar,
  User,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  Plane,
  Ship,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// ✅ Importación de las librerías
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Order {
  id: string;
  client: string;
  status: 'pendiente-china' | 'pendiente-vzla' | 'esperando-pago' | 'en-transito' | 'entregado' | 'cancelado';
  assignedTo: 'china' | 'vzla';
  daysElapsed: number;
  description: string;
  priority: 'alta' | 'media' | 'baja';
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
  const [animateStats, setAnimateStats] = useState(false);

  const orders: Order[] = [
    { id: 'PED-001', client: 'Ana Pérez', status: 'pendiente-china', assignedTo: 'china', daysElapsed: 197, description: 'Electrónicos varios', priority: 'alta' },
    { id: 'PED-002', client: 'Carlos Ruiz', status: 'pendiente-vzla', assignedTo: 'vzla', daysElapsed: 198, description: 'Herramientas industriales', priority: 'media' },
    { id: 'PED-003', client: 'Lucía Méndez', status: 'esperando-pago', assignedTo: 'china', daysElapsed: 199, description: 'Ropa deportiva', priority: 'baja' },
    { id: 'PED-005', client: 'Empresa XYZ', status: 'en-transito', assignedTo: 'vzla', daysElapsed: 202, description: 'Maquinaria pesada', priority: 'alta' },
    { id: 'PED-006', client: 'Tiendas ABC', status: 'entregado', assignedTo: 'vzla', daysElapsed: 207, description: 'Productos de belleza', priority: 'media' },
    { id: 'PED-007', client: 'Juan Rodríguez', status: 'pendiente-china', assignedTo: 'china', daysElapsed: 0, description: 'Equipos médicos', priority: 'alta' },
    { id: 'PED-008', client: 'María González', status: 'en-transito', assignedTo: 'vzla', daysElapsed: 15, description: 'Materiales de construcción', priority: 'media' },
    { id: 'PED-009', client: 'Luis Martínez', status: 'esperando-pago', assignedTo: 'china', daysElapsed: 5, description: 'Juguetes educativos', priority: 'baja' },
    { id: 'PED-010', client: 'Carmen López', status: 'entregado', assignedTo: 'vzla', daysElapsed: 45, description: 'Artículos de cocina', priority: 'media' },
    { id: 'PED-011', client: 'Roberto Silva', status: 'pendiente-vzla', assignedTo: 'vzla', daysElapsed: 3, description: 'Equipos de oficina', priority: 'alta' }
  ];

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

  // ✅ Nueva función para exportar a PDF con un diseño limpio
  const handleExport = async () => {
    // 1. Crear el HTML de la tabla en memoria
    const pdfContent = document.createElement('div');
    pdfContent.style.width = '210mm'; // Ancho de una hoja A4
    pdfContent.style.padding = '10mm';

    const title = document.createElement('h1');
    title.innerText = 'Reporte de Pedidos';
    title.style.fontSize = '24px';
    title.style.marginBottom = '20px';
    pdfContent.appendChild(title);

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    // Encabezados
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

    // Cuerpo de la tabla
    const tbody = document.createElement('tbody');
    filteredOrders.forEach((order, index) => {
      const row = document.createElement('tr');
      row.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f3f4f6'; // Filas alternas
      row.style.border = '1px solid #e2e8f0';

      const rowData = [
        order.id,
        order.client,
        order.description,
        statusConfig[order.status].label,
        assignedConfig[order.assignedTo].label,
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

    // 2. Adjuntar temporalmente el elemento al DOM para que html2canvas lo procese
    document.body.appendChild(pdfContent);

    // 3. Convertir el contenido HTML a un canvas (imagen)
    const canvas = await html2canvas(pdfContent, { scale: 2 });
    
    // 4. Eliminar el elemento temporal del DOM
    document.body.removeChild(pdfContent);

    // 5. Crear el PDF a partir del canvas
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
    
    // 6. Guardar el archivo
    pdf.save("reporte_pedidos.pdf");
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
                {/* ✅ Botón de Exportar con la nueva funcionalidad */}
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
                          onClick={() => setSelectedOrder(order)}
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
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                Ver
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Edit className="w-4 h-4 mr-2" />
                                    Editar
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
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
    </div>
  );
}