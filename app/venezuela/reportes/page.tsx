"use client";
import React, { useState } from 'react';
import { useEffect } from 'react';
import { getMetricasPorMes, getMetricasSatisfaccionCliente, getReportesSatisfaccionPorMes, getMetricasPorPedido, MetricasPorPedido } from './backend';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Users, Package, Download, Filter, TrendingUp, Clock, CheckCircle, Eye, X, Star, FileText, ShoppingCart, Heart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const Reportes = () => {
  const [metricasSatisfaccion, setMetricasSatisfaccion] = useState({ promedioGeneral: 0, totalResenas: 0, cincoEstrellas: 0, satisfechos: 0 });
  // ...ya existe una declaración de ReporteSatisfaccion, eliminada duplicidad
  const [reportesSatisfaccion, setReportesSatisfaccion] = useState<ReporteSatisfaccion[]>([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  type MetricasMes = {
    id: number;
    mes: string;
    totalPedidos: number;
    completados: number;
    pendientes: number;
    satisfaccion: number;
    ingresos: number;
    fechaGeneracion: string;
  };
  const [metricasMeses, setMetricasMeses] = useState<MetricasMes[]>([]);
  const { theme } = useTheme();
  const [activeFilter, setActiveFilter] = useState('mes');
  const [selectedMonth, setSelectedMonth] = useState('2024-08');
  const [selectedEmployee, setSelectedEmployee] = useState('todos');
  const [modalOpen, setModalOpen] = useState(false);
  type ReporteMensual = {
    id: number;
    mes: string;
    totalPedidos: number;
    completados: number;
    pendientes: number;
    satisfaccion: number;
    ingresos: number;
    fechaGeneracion: string;
  };
  // Definición de ReportePedido agregada para evitar error de tipo
  type ReportePedido = {
    id: number;
    numeroPedido: string;
    cliente: string;
    fechaPedido: string;
    estado: string;
    valor: number;
    tiempoEntrega: string;
    satisfaccion: number;
  };
  type ReporteSatisfaccion = {
    id: number;
    periodo: string;
    promedioGeneral: number;
    totalReseñas: number;
    comentariosDestacados: string[];
    distribucion: { [estrella: string]: number };
  };
  type Reporte = ReporteMensual | ReportePedido | ReporteSatisfaccion;
  const [selectedReport, setSelectedReport] = useState<Reporte | null>(null);

  // Métricas clave dinámicas para el filtro 'mes' y 'pedido'
  const [metricasPedido, setMetricasPedido] = useState<MetricasPorPedido | null>(null);
  useEffect(() => {
    if (activeFilter === 'mes') {
      getMetricasPorMes().then((res) => {
        if (Array.isArray(res)) {
          setMetricasMeses(res);
        } else {
          setMetricasMeses(Object.values(res));
        }
      }).catch(console.error);
    } else if (activeFilter === 'satisfaccion') {
      getMetricasSatisfaccionCliente().then(setMetricasSatisfaccion).catch(console.error);
      getReportesSatisfaccionPorMes().then(setReportesSatisfaccion).catch(console.error);
    } else if (activeFilter === 'pedido') {
      getMetricasPorPedido().then(setMetricasPedido).catch(console.error);
    }
  }, [activeFilter]);

  // Los reportesPedidos deben venir de la base de datos en el futuro, por ahora solo se usan las métricas clave
  // Renderizar métricas clave para el filtro 'pedido'
  const renderMetricasPedido = () => {
    if (!metricasPedido) return null;
    const metricas = [
      { label: 'Total Pedidos', value: metricasPedido.totalPedidos, icon: Package, color: 'text-blue-600' },
      { label: 'Entregados', value: metricasPedido.entregados, icon: CheckCircle, color: 'text-green-600' },
      { label: 'En Tránsito', value: metricasPedido.enTransito, icon: Clock, color: 'text-orange-600' },
      { label: 'Valor Promedio', value: `$${metricasPedido.valorPromedio}`, icon: TrendingUp, color: 'text-purple-600' }
    ];
    return metricas.map(({ label, value, icon: Icon, color }, index) => (
      <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Icon className={`mx-auto mb-2 ${color}`} size={24} />
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      </div>
    ));
  };

  // Datos para reportes de satisfacción
  // ...eliminado: los datos hardcodeados, ahora solo se usa el estado reportesSatisfaccion

  // Datos para gráficos
  const datosGraficos = {
    mes: [...metricasMeses]
      .sort((a, b) => new Date(a.fechaGeneracion).getTime() - new Date(b.fechaGeneracion).getTime())
      .map(mes => ({ mes: mes.mes.charAt(0).toUpperCase() + mes.mes.slice(1), pedidos: mes.totalPedidos })),
    satisfaccion: reportesSatisfaccion.length > 0
      ? Object.entries(reportesSatisfaccion[0].distribucion).map(([estrella, cantidad]) => ({
          estrella: `${estrella}⭐`,
          cantidad: cantidad as number
        }))
      : []
  };

  const obtenerDatosReporte = () => {
    switch (activeFilter) {
      case 'mes':
        return metricasMeses;
  case 'pedido': return []; // Los reportesPedidos se integrarán con datos reales en el siguiente paso
      case 'satisfaccion': return reportesSatisfaccion;
      default: return [];
    }
  };

  const abrirModal = (reporte: Reporte) => {
    setSelectedReport(reporte);
    setModalOpen(true);
  };

  const exportarPDF = (reporte: Reporte) => {
    // Simulación de exportación a PDF
    let contenido = `Reporte Detallado\n================\n\n`;
    if (activeFilter === 'mes' && 'mes' in reporte) {
      contenido += `Período: ${reporte.mes}\nTotal Pedidos: ${reporte.totalPedidos}\nCompletados: ${reporte.completados}\nPendientes: ${reporte.pendientes}\nSatisfacción: ${reporte.satisfaccion}/5\nIngresos: $${reporte.ingresos}\n`;
    } else if (activeFilter === 'pedido' && 'numeroPedido' in reporte) {
      contenido += `Número: ${reporte.numeroPedido}\nCliente: ${reporte.cliente}\nFecha: ${reporte.fechaPedido}\nEstado: ${reporte.estado}\nValor: $${reporte.valor}\nSatisfacción: ${reporte.satisfaccion}/5\n`;
    } else if (activeFilter === 'satisfaccion' && 'periodo' in reporte) {
      contenido += `Período: ${reporte.periodo}\nPromedio: ${reporte.promedioGeneral}/5\nTotal Reseñas: ${reporte.totalReseñas}\nComentarios: ${reporte.comentariosDestacados.join(', ')}\n`;
    }
    contenido += `\nGenerado el: ${new Date().toLocaleDateString()}`;

    // Crear y descargar archivo
    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-${reporte.id}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const exportarGeneral = () => {
    const datos = obtenerDatosReporte();
    let contenido = `Reporte General - ${activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}\n=====================================================`;
    contenido += '\n\n';
    contenido += datos.map((item: any) => {
      if (activeFilter === 'mes' && 'mes' in item) {
        return `${item.mes}:\n- Pedidos: ${item.totalPedidos}\n- Completados: ${item.completados}\n- Satisfacción: ${item.satisfaccion}/5\n- Ingresos: $${item.ingresos}`;
      } else if (activeFilter === 'pedido' && 'numeroPedido' in item) {
        return `${item.numeroPedido}:\n- Cliente: ${item.cliente}\n- Estado: ${item.estado}\n- Valor: $${item.valor}\n- Satisfacción: ${item.satisfaccion}/5`;
      } else if (activeFilter === 'satisfaccion' && 'periodo' in item) {
        return `${item.periodo}:\n- Promedio: ${item.promedioGeneral}/5\n- Total Reseñas: ${item.totalReseñas}\n- Principales comentarios: ${item.comentariosDestacados.join(', ')}`;
      }
      return '';
    }).join('\n');
    contenido += `\n\nGenerado el: ${new Date().toLocaleDateString()}`;

    const blob = new Blob([contenido], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte-general-${activeFilter}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const renderModal = () => {
    if (!modalOpen || !selectedReport) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto ${theme === 'dark' ? 'bg-zinc-900' : 'bg-white'}`}>
          <div className="sticky top-0 bg-inherit border-b p-4 flex justify-between items-center">
            <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              Detalles del Reporte
            </h3>
            <button 
              onClick={() => setModalOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-6">
            {activeFilter === 'mes' && selectedReport && 'mes' in selectedReport && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-300">Período</h4>
                    <p className="text-2xl font-bold text-blue-600">{selectedReport.mes}</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-300">Ingresos</h4>
                    <p className="text-2xl font-bold text-green-600">${selectedReport.ingresos}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Package className="mx-auto mb-2 text-gray-600" size={24} />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedReport.totalPedidos}</p>
                    <p className="text-sm text-gray-600">Total Pedidos</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <CheckCircle className="mx-auto mb-2 text-green-600" size={24} />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedReport.completados}</p>
                    <p className="text-sm text-gray-600">Completados</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Star className="mx-auto mb-2 text-yellow-500" size={24} />
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{selectedReport.satisfaccion}</p>
                    <p className="text-sm text-gray-600">Satisfacción</p>
                  </div>
                </div>
              </div>
            )}

            {activeFilter === 'pedido' && selectedReport && 'numeroPedido' in selectedReport && (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Información del Pedido</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-gray-700 dark:text-gray-300"><strong>Número:</strong> {selectedReport.numeroPedido}</div>
                    <div className="text-gray-700 dark:text-gray-300"><strong>Cliente:</strong> {selectedReport.cliente}</div>
                    <div className="text-gray-700 dark:text-gray-300"><strong>Fecha:</strong> {selectedReport.fechaPedido}</div>
                    <div className="text-gray-700 dark:text-gray-300">
                      <strong>Estado:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                        selectedReport.estado === 'Entregado' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                          : selectedReport.estado === 'En Tránsito'
                          ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}>
                        {selectedReport.estado}
                      </span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-300"><strong>Valor:</strong> ${selectedReport.valor}</div>
                    <div className="text-gray-700 dark:text-gray-300"><strong>Tiempo Entrega:</strong> {selectedReport.tiempoEntrega}</div>
                  </div>
                </div>
                {selectedReport.satisfaccion > 0 && (
                  <div className="flex items-center justify-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="text-center">
                      <div className="flex justify-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={20} 
                            className={i < selectedReport.satisfaccion ? 'text-yellow-400 fill-current' : 'text-gray-300'} 
                          />
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Satisfacción del Cliente</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeFilter === 'satisfaccion' && selectedReport && 'periodo' in selectedReport && (
              <div className="space-y-4">
                <div className="text-center bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Promedio General</h4>
                  <p className="text-4xl font-bold text-yellow-600">{selectedReport.promedioGeneral}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">de 5 estrellas</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h4 className="font-medium mb-3 text-gray-900 dark:text-white">Distribución de Calificaciones</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedReport.distribucion).reverse().map(([estrella, cantidad]) => (
                      <div key={estrella} className="flex items-center gap-3">
                        <span className="w-8 text-sm text-gray-700 dark:text-gray-300">{estrella}⭐</span>
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
                            style={{ width: `${(typeof cantidad === 'number' && selectedReport.totalReseñas ? (cantidad / selectedReport.totalReseñas) * 100 : 0)}%` }}
                          ></div>
                        </div>
                        <span className="w-8 text-sm text-right text-gray-700 dark:text-gray-300">{cantidad as number}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Comentarios Destacados</h4>
                  <ul className="space-y-1 text-sm">
                    {selectedReport.comentariosDestacados.map((comentario: string, index: number) => (
                      <li key={index} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                        {comentario}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          
          <div className="sticky bottom-0 bg-inherit border-t p-4">
            <button 
              onClick={() => exportarPDF(selectedReport)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download size={20} />
              Exportar como PDF
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={
      `min-h-screen flex overflow-x-hidden transition-colors duration-300 ` +
      (theme === 'dark' ? 'bg-[#18181b]' : 'bg-gray-50')
    }>
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} userRole="venezuela" />
      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-20 w-[calc(100%-5rem)]'}`}>
        {/* Header */}
        <header className={
          `sticky top-0 z-40 border-b border-slate-200 backdrop-blur-sm transition-colors duration-300 ` +
          (theme === 'dark' ? 'bg-slate-900/80' : 'bg-white/80')
        }>
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className={
                `text-2xl font-bold ` +
                (theme === 'dark' ? 'text-white' : 'text-slate-900')
              }>Reportes</h1>
              <p className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>Analiza el rendimiento y métricas de tu operación</p>
            </div>
            <button 
              onClick={exportarGeneral}
              className="flex items-center gap-2 bg-[#202841] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
            >
              <Download size={20} />
              Exportar
            </button>
          </div>
        </header>

        <div className="p-6 flex flex-col gap-8">
          {/* Filtros */}
          <Card className={
            `rounded-lg shadow-lg border-0 backdrop-blur-sm p-0 mb-6 transition-colors duration-300 ` +
            (theme === 'dark' ? 'bg-zinc-900/80' : 'bg-white/70')
          }>
            <CardHeader className="pb-0">
              <div className="flex items-center gap-2 mb-4">
                <Filter size={20} className="text-gray-600" />
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-black'}>Tipo de Reporte</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-6">
              <div className="flex flex-wrap gap-3">
                {[
                  { key: 'mes', label: 'Por Mes', icon: Calendar, color: 'bg-blue-500' },
                  { key: 'pedido', label: 'Por Pedido', icon: ShoppingCart, color: 'bg-green-500' },
                  { key: 'satisfaccion', label: 'Satisfacción Cliente', icon: Heart, color: 'bg-purple-500' }
                ].map(({ key, label, icon: Icon, color }) => (
                      <button
                        key={key}
                        onClick={() => setActiveFilter(key)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all transform hover:scale-105 ${
                          activeFilter === key
                        ? `${color} text-white shadow-lg`
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                    <Icon size={18} />
                    <span>{label}</span>
                      </button>
                    ))}
              </div>
            </CardContent>
          </Card>

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card className={
              `rounded-lg shadow-lg border-0 backdrop-blur-sm p-0 transition-colors duration-300 ` +
              (theme === 'dark' ? 'bg-zinc-900/80' : 'bg-white/70')
            }>
              <CardHeader className="pb-0">
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-black'}>
                  {activeFilter === 'mes' ? 'Tendencia Mensual' : activeFilter === 'pedido' ? 'Estados de Pedidos' : 'Distribución de Satisfacción'}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={300}>
                  {activeFilter === 'mes' ? (
                    <LineChart data={datosGraficos.mes}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" stroke="#666" />
                    <YAxis stroke="#666" />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="pedidos" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                      />
                    </LineChart>
                  ) : (
                    <BarChart data={datosGraficos.satisfaccion}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="estrella" stroke="#666" />
                      <YAxis stroke="#666" />
                      <Tooltip />
                      <Bar dataKey="cantidad" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                  </BarChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className={
              `rounded-lg shadow-lg border-0 backdrop-blur-sm p-0 transition-colors duration-300 ` +
              (theme === 'dark' ? 'bg-zinc-900/80' : 'bg-white/70')
            }>
              <CardHeader className="pb-0">
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-black'}>Métricas Clave</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-4 h-[300px] content-center">
                  {activeFilter === 'mes' && metricasMeses.length > 0 && (() => {
                    const totalPedidos = metricasMeses.reduce((acc, mes) => acc + mes.totalPedidos, 0);
                    const completados = metricasMeses.reduce((acc, mes) => acc + mes.completados, 0);
                    const ingresos = metricasMeses.reduce((acc, mes) => acc + mes.ingresos, 0);
                    // Satisfacción promedio ponderada por cantidad de pedidos con reputación
                    const totalSatisfaccion = metricasMeses.reduce((acc, mes) => acc + (mes.satisfaccion * mes.totalPedidos), 0);
                    const totalPedidosConReputacion = metricasMeses.reduce((acc, mes) => acc + (mes.satisfaccion > 0 ? mes.totalPedidos : 0), 0);
                    const satisfaccionPromedio = totalPedidosConReputacion > 0 ? (totalSatisfaccion / totalPedidosConReputacion).toFixed(2) : '0';
                    return [
                      { label: 'Pedidos Totales', value: totalPedidos, icon: Package, color: 'text-blue-600' },
                      { label: 'Completados', value: completados, icon: CheckCircle, color: 'text-green-600' },
                      { label: 'Satisfacción', value: `${satisfaccionPromedio}/5`, icon: Star, color: 'text-yellow-600' },
                      { label: 'Ingresos', value: `$${ingresos}`, icon: TrendingUp, color: 'text-purple-600' }
                    ].map(({ label, value, icon: Icon, color }, index) => (
                      <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Icon className={`mx-auto mb-2 ${color}`} size={24} />
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
                      </div>
                    ));
                  })()}
                  
                  {activeFilter === 'pedido' && renderMetricasPedido()}
                  
                  {activeFilter === 'satisfaccion' && [
                    { label: 'Promedio General', value: `${metricasSatisfaccion.promedioGeneral}/5`, icon: Star, color: 'text-yellow-600' },
                    { label: 'Total Reseñas', value: metricasSatisfaccion.totalResenas, icon: Users, color: 'text-blue-600' },
                    { label: '5 Estrellas', value: metricasSatisfaccion.cincoEstrellas, icon: Heart, color: 'text-green-600' },
                    { label: 'Satisfacción', value: `${metricasSatisfaccion.satisfechos}%`, icon: CheckCircle, color: 'text-purple-600' }
                  ].map(({ label, value, icon: Icon, color }, index) => (
                    <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <Icon className={`mx-auto mb-2 ${color}`} size={24} />
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Reportes */}
          <Card className={
            `rounded-lg shadow-lg border-0 backdrop-blur-sm p-0 transition-colors duration-300 ` +
            (theme === 'dark' ? 'bg-zinc-900/80' : 'bg-white/70')
          }>
            <CardHeader className="pb-0">
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-black'}>
                Lista de Reportes - {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {activeFilter === 'satisfaccion'
                  ? reportesSatisfaccion.map((reporte: any) => (
                      <div 
                        key={reporte.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <Heart className="text-purple-600" size={20} />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {reporte.periodo}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {reporte.promedioGeneral}/5 ⭐ • {reporte.totalReseñas} reseñas
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => abrirModal(reporte)}
                          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Eye size={16} />
                          Ver Detalles
                        </button>
                      </div>
                    ))
                  : obtenerDatosReporte().map((reporte: any) => (
                      <div 
                        key={reporte.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            {activeFilter === 'mes' && <Calendar className="text-blue-600" size={20} />}
                            {activeFilter === 'pedido' && <ShoppingCart className="text-green-600" size={20} />}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {activeFilter === 'mes' && 'mes' in reporte && reporte.mes}
                              {activeFilter === 'pedido' && 'numeroPedido' in reporte && reporte.numeroPedido}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {activeFilter === 'mes' && 'mes' in reporte && `${reporte.totalPedidos} pedidos • ${reporte.satisfaccion}/5 ⭐ • ${reporte.ingresos}`}
                              {activeFilter === 'pedido' && 'numeroPedido' in reporte && `${reporte.cliente} • ${reporte.estado} • ${reporte.valor} • ${reporte.satisfaccion > 0 ? `${reporte.satisfaccion}/5 ⭐` : 'Sin calificar'}`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => abrirModal(reporte)}
                          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                          <Eye size={16} />
                          Ver Detalles
                        </button>
                      </div>
                    ))
                }
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      {renderModal()}
    </div>
  );
}

export default Reportes;