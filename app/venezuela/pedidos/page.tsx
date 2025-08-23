'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import '../../animations/animations.css';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  Eye,
  Search,
  Filter,
  RefreshCw,
  Send,
  Clock,
  AlertTriangle
} from 'lucide-react';
// ...existing code...


// Tipos para los pedidos reales
interface Order {
  id: string;
  quantity: number;
  productName: string;
  deliveryType: string;
  shippingType: string;
  state: number;
  clientName: string;
  client_id: string;
  description?: string;
}


export default function VenezuelaPedidosPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para obtener pedidos (puede ser llamada desde useEffect y desde el botón)
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      const empleadoId = user?.id;
      if (!empleadoId) throw new Error('No se pudo obtener el usuario logueado');
      const res = await fetch(`/venezuela/pedidos/api/orders?asignedEVzla=${empleadoId}`);
      if (!res.ok) throw new Error('Error al obtener pedidos');
      const data = await res.json();
      setOrders(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchOrders();
  }, []);

  // Filtros: búsqueda y estado
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.id !== undefined && order.id !== null && order.id.toString().toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'pending' && order.state === 1) ||
      (statusFilter === 'reviewing' && order.state === 2) ||
      (statusFilter === 'quoted' && order.state === 3) ||
      (statusFilter === 'sent' && order.state === 4);
    return matchesSearch && matchesStatus;
  });

  if (!mounted) return null;

  return (
    <div className={`min-h-screen flex overflow-x-hidden ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <Sidebar 
        isExpanded={sidebarExpanded} 
        setIsExpanded={setSidebarExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        userRole="venezuela"
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-24 w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={0}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Revisar Pedidos"
          subtitle="Revisa y envía pedidos a China para cotización"
        />
        
        <div className="p-6 space-y-6">
          {/* Header de la página */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Revisar Pedidos</h1>
                <p className="text-orange-100 mt-1">Revisa y envía pedidos a China para cotización</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{orders.filter(o => o.state === 1).length}</p>
                  <p className="text-sm text-orange-100">PENDIENTES</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{orders.filter(o => o.state === 2).length}</p>
                  <p className="text-sm text-orange-100">REVISANDO</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{orders.filter(o => o.state === 3).length}</p>
                  <p className="text-sm text-orange-100">COTIZADOS</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{orders.filter(o => o.state === 4).length}</p>
                  <p className="text-sm text-orange-100">ENVIADOS</p>
                </div>
              </div>
            </div>
          </div>

          {/* Filtros y búsqueda */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por cliente, producto o ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="reviewing">Revisando</SelectItem>
                      <SelectItem value="quoted">Cotizado</SelectItem>
                      <SelectItem value="sent">Enviado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="flex items-center gap-2" onClick={fetchOrders} disabled={loading}>
                    <RefreshCw className="w-4 h-4" />
                    {loading ? 'Actualizando...' : 'Actualizar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Lista de Pedidos desde backend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {loading ? (
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                <CardContent className="p-12 text-center">Cargando pedidos...</CardContent>
              </Card>
            ) : error ? (
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                <CardContent className="p-12 text-center text-red-600">{error}</CardContent>
              </Card>
            ) : filteredOrders.length === 0 ? (
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay pedidos para revisar</h3>
                  <p className="text-slate-600">Todos los pedidos han sido procesados o no hay coincidencias con los filtros.</p>
                </CardContent>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{order.productName}</CardTitle>
                        <p className="text-sm text-slate-600">{order.id} - {order.clientName}</p>
                      </div>
                      <div className="flex gap-2">
                        {order.state === 1 && (
                          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">PENDIENTE</Badge>
                        )}
                        {order.state === 2 && (
                          <Badge className="bg-green-100 text-green-800 border-green-200">REVISANDO</Badge>
                        )}
                        {order.state === 3 && (
                          <Badge className="bg-purple-100 text-purple-800 border-purple-200">COTIZADO</Badge>
                        )}
                        {order.state === 4 && (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200">ENVIADO</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Cantidad:</span>
                        <span className="font-medium">{order.quantity}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Tipo de Entrega:</span>
                        <span className="font-medium">
                          {order.deliveryType === 'office' && 'Oficina'}
                          {order.deliveryType === 'warehouse' && 'Almacén'}
                          {order.deliveryType !== 'office' && order.deliveryType !== 'warehouse' && order.deliveryType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Tipo de Envío:</span>
                        <span className="font-medium">
                          {order.shippingType === 'doorToDoor' && 'Puerta A Puerta'}
                          {order.shippingType === 'maritime' && 'Marítimo'}
                          {order.shippingType === 'air' && 'Aéreo'}
                          {order.shippingType !== 'doorToDoor' && order.shippingType !== 'maritime' && order.shippingType !== 'air' && order.shippingType}
                        </span>
                      </div>
                      {/* Asignado EVzla removido */}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="bg-blue-600 gap-x-1 text-white hover:bg-blue-700 hover:text-white card-animate-liftbounce flex-1"
                        variant="outline"
                        size="sm"
                        onClick={async () => {
                          const numeroPedido = order.id;
                          const fechaPedidoLegible = new Date().toLocaleDateString('es-ES');
                          const newOrderData = {
                            client_id: order.client_id, // Usar el client_id real
                            client_name: order.clientName,
                            deliveryType: order.deliveryType,
                            deliveryVenezuela: order.deliveryType,
                            productName: order.productName,
                            quantity: order.quantity,
                            estimatedBudget: '-',
                            description: '-',
                            specifications: '-',
                            requestType: 'normal',
                            productUrl: '',
                            productImage: null,
                          };
                          // PDF profesional con layout corporativo y SSR compatible
                          const { jsPDF } = await import('jspdf');
                          const autoTable = (await import('jspdf-autotable')).default;
                          const doc = new jsPDF();
                          // Layout y colores
                          const pageWidth = doc.internal.pageSize.getWidth();
                          const pageHeight = doc.internal.pageSize.height;
                          const margin = 15;
                          const colors = {
                            primary: [22, 120, 187] as [number, number, number],
                            secondary: [44, 62, 80] as [number, number, number],
                            light: [245, 248, 255] as [number, number, number],
                            border: [180, 200, 220] as [number, number, number],
                            text: [33, 37, 41] as [number, number, number]
                          };
                          // Datos para la tabla
                          const estadoTexto =
                            order.state === 4 ? 'Enviado' :
                            order.state === 1 ? 'Pendiente' :
                            order.state === 2 ? 'Revisando' :
                            order.state === 3 ? 'Cotizado' :
                            `${order.state}`;

                          let tipoEntregaTexto = '-';
                          if (order.deliveryType === 'warehouse') tipoEntregaTexto = 'Almacén';
                          else if (order.deliveryType === 'office') tipoEntregaTexto = 'Oficina';
                          else if (order.deliveryType === 'express') tipoEntregaTexto = 'Express';
                          else if (order.deliveryType) tipoEntregaTexto = order.deliveryType;

                          const pedidoTable = [
                            ['ID del Pedido', `${numeroPedido}`],
                            ['Cliente ID', `${order.client_id || '-'}`],
                            ['Nombre de Usuario', `${order.clientName || '-'}`],
                            ['Nombre del Pedido', `${order.productName}`],
                            ['Cantidad', `${order.quantity}`],
                            ['Fecha', `${fechaPedidoLegible}`],
                            ['Tipo de Envío', `${
                              order.shippingType === 'doorToDoor' ? 'Puerta A Puerta' :
                              order.shippingType === 'maritime' ? 'Marítimo' :
                              order.shippingType === 'air' ? 'Aéreo' :
                              order.shippingType === 'express' ? 'Express' :
                              order.shippingType === 'pickup' ? 'Recoger en sitio' :
                              order.shippingType === 'warehouse' ? 'Almacén' :
                              order.shippingType === 'office' ? 'Oficina' :
                              order.shippingType || '-'
                            }`],
                            ['Tipo de Entrega', tipoEntregaTexto],
                            ['Estado del Pedido', estadoTexto],
                            ['Descripción', order.description && order.description.trim() !== '' ? order.description : '-'],
                          ];
                          if (newOrderData.requestType === 'link') {
                            pedidoTable.push(['URL', newOrderData.productUrl || '-']);
                          }
                          // === ENCABEZADO PROFESIONAL ===
                          doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
                          doc.rect(0, 0, pageWidth, 35, 'F');
                          doc.setFontSize(12);
                          doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
                          doc.setFont('helvetica', 'bold');
                          doc.setFillColor(255, 255, 255);
                          doc.roundedRect(margin, 8, 20, 20, 2, 2, 'F');
                          doc.text('PITA', margin + 10, 20, { align: 'center' });
                          doc.setFontSize(24);
                          doc.setTextColor(255, 255, 255);
                          doc.text('RESUMEN DE PEDIDO', pageWidth / 2, 22, { align: 'center' });
                          doc.setFontSize(10);
                          doc.setTextColor(255, 255, 255);
                          doc.text(`Pedido: #${numeroPedido}`, pageWidth - margin, 15, { align: 'right' });
                          doc.text(`Fecha: ${fechaPedidoLegible}`, pageWidth - margin, 21, { align: 'right' });
                          let currentY = 50;
                          // === MANEJO POR TIPO DE PEDIDO ===
                          if (newOrderData.requestType === 'photo' && newOrderData.productImage) {
                            // Imagen y tabla lado a lado
                            const imgWidth = 80;
                            const imgHeight = 80;
                            const imgX = margin;
                            doc.setFillColor(240, 240, 240);
                            doc.roundedRect(imgX - 2, currentY - 2, imgWidth + 4, imgHeight + 4, 3, 3, 'F');
                            doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
                            doc.setLineWidth(1);
                            doc.roundedRect(imgX, currentY, imgWidth, imgHeight, 2, 2, 'D');
                            if (newOrderData.productImage) {
                              const imgData = await new Promise<string>((resolve) => {
                                const reader = new FileReader();
                                reader.onload = (e) => resolve(e.target?.result as string);
                                reader.readAsDataURL(newOrderData.productImage as unknown as Blob);
                              });
                              doc.addImage(imgData, 'JPEG', imgX, currentY, imgWidth, imgHeight);
                            }
                            // Se elimina el texto "Imagen del Producto" para un diseño más limpio
                            const tableStartX = imgX + imgWidth + 15;
                            const tableWidth = pageWidth - tableStartX - margin;
                            autoTable(doc, {
                              head: [['Campo', 'Valor']],
                              body: pedidoTable,
                              startY: currentY,
                              margin: { left: tableStartX, right: margin },
                              tableWidth: tableWidth,
                              theme: 'grid',
                              headStyles: {
                                fillColor: colors.primary,
                                textColor: [255, 255, 255] as [number, number, number],
                                fontStyle: 'bold',
                                fontSize: 12,
                                halign: 'center',
                                cellPadding: 3
                              },
                              bodyStyles: {
                                fontSize: 10,
                                cellPadding: 3,
                                textColor: colors.text as [number, number, number]
                              },
                              alternateRowStyles: {
                                fillColor: colors.light as [number, number, number]
                              },
                              columnStyles: {
                                0: { cellWidth: 50, fontStyle: 'bold', textColor: colors.secondary as [number, number, number] },
                                1: { cellWidth: tableWidth - 50 }
                              }
                            });
                          } else if (newOrderData.requestType === 'link') {
                            // Tabla ocupando todo el ancho
                            doc.setFillColor(colors.light[0], colors.light[1], colors.light[2]);
                            doc.rect(margin, currentY, pageWidth - (margin * 2), 12, 'F');
                            doc.setFontSize(14);
                            doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
                            doc.text('DETALLES DEL PEDIDO', margin + 5, currentY + 8);
                            currentY += 20;
                            autoTable(doc, {
                              head: [['Campo', 'Información']],
                              body: pedidoTable,
                              startY: currentY,
                              margin: { left: margin, right: margin },
                              theme: 'striped',
                              headStyles: {
                                fillColor: colors.primary,
                                textColor: [255, 255, 255] as [number, number, number],
                                fontStyle: 'bold',
                                fontSize: 12,
                                halign: 'center',
                                cellPadding: 4
                              },
                              bodyStyles: {
                                fontSize: 11,
                                cellPadding: 4,
                                textColor: colors.text as [number, number, number]
                              },
                              alternateRowStyles: {
                                fillColor: colors.light as [number, number, number]
                              },
                              columnStyles: {
                                0: { cellWidth: 60, fontStyle: 'bold', textColor: colors.secondary as [number, number, number] },
                                1: { cellWidth: pageWidth - (margin * 2) - 60 }
                              }
                            });
                            // Destacar la URL si existe
                            if (newOrderData.productUrl) {
                              // Mejorar la sección de URL para que se vea integrada y profesional
                              // @ts-ignore
                              const finalY = (doc as any).lastAutoTable?.finalY + 12;
                              doc.setFontSize(10);
                              doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
                              doc.text('URL del Producto:', margin, finalY + 6);
                              doc.setFontSize(10);
                              doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
                              const urlText = doc.splitTextToSize(newOrderData.productUrl, pageWidth - (margin * 2));
                              doc.text(urlText, margin, finalY + 14);
                            }
                          } else {
                            // Tabla ocupando todo el ancho (pedido normal)
                            autoTable(doc, {
                              head: [['Campo', 'Información']],
                              body: pedidoTable,
                              startY: currentY,
                              margin: { left: margin, right: margin },
                              theme: 'striped',
                              headStyles: {
                                fillColor: colors.primary,
                                textColor: [255, 255, 255] as [number, number, number],
                                fontStyle: 'bold',
                                fontSize: 12,
                                halign: 'center',
                                cellPadding: 4
                              },
                              bodyStyles: {
                                fontSize: 11,
                                cellPadding: 4,
                                textColor: colors.text as [number, number, number]
                              },
                              alternateRowStyles: {
                                fillColor: colors.light as [number, number, number]
                              },
                              columnStyles: {
                                0: { cellWidth: 60, fontStyle: 'bold', textColor: colors.secondary as [number, number, number] },
                                1: { cellWidth: pageWidth - (margin * 2) - 60 }
                              }
                            });
                          }
                          // === FOOTER PROFESIONAL ===
                          const footerY = pageHeight - 25;
                          // Footer profesional, compacto y alineado
                          doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
                          doc.setLineWidth(0.5);
                          doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);
                          doc.setFontSize(9);
                          doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
                          doc.text('PITA | Sistema de Logística y Pedidos', pageWidth / 2, footerY, { align: 'center' });
                          doc.setFontSize(8);
                          doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
                          doc.text('info@pita.com   |   +58 424-1234567   |   www.pita.com', pageWidth / 2, footerY + 7, { align: 'center' });
                          doc.setFontSize(7);
                          doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
                          doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, margin, footerY + 13);
                          doc.text(`Página 1 de 1`, pageWidth - margin, footerY + 13, { align: 'right' });
                          // Abrir PDF en nueva pestaña
                          const pdfBlob = doc.output('blob');
                          const pdfUrl = URL.createObjectURL(pdfBlob);
                          window.open(pdfUrl, '_blank');
                        }}
                      >
                        <Eye className="w-4 h-4" /> Ver
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1"
                        disabled={order.state === 3 || order.state === 4}
                        onClick={async () => {
                          if (order.state === 3 || order.state === 4) return;
                          try {
                            const res = await fetch('/venezuela/pedidos/api/send-to-china', {
                              method: 'PATCH',
                              headers: { 'Content-Type': 'application/json' },
                              body: JSON.stringify({ orderId: order.id })
                            });
                            if (!res.ok) throw new Error('Error al enviar a China');
                            await fetchOrders();
                          } catch (err) {
                            alert('No se pudo enviar a China');
                          }
                        }}
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Enviar a China
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Estado vacío */}
          {filteredOrders.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay pedidos para revisar</h3>
                <p className="text-slate-600">Todos los pedidos han sido procesados o no hay coincidencias con los filtros.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
} 