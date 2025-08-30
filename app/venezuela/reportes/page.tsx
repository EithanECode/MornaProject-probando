"use client";

// Force dynamic rendering
export const dynamic = 'force-dynamic';
import React, { useState } from 'react';
import { useEffect } from 'react';
import { getMetricasPorMes, getMetricasSatisfaccionCliente, getReportesSatisfaccionPorMes, getMetricasPorPedido, MetricasPorPedido } from './backend';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Calendar, Users, Package, Download, Filter, TrendingUp, Clock, CheckCircle, Eye, X, Star, FileText, ShoppingCart, Heart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const Reportes = () => {
  const [metricasSatisfaccion, setMetricasSatisfaccion] = useState({ promedioGeneral: 0, totalResenas: 0, cincoEstrellas: 0, satisfechos: 0 });
  // ...ya existe una declaración de ReporteSatisfaccion, eliminada duplicidad
  const [reportesSatisfaccion, setReportesSatisfaccion] = useState<ReporteSatisfaccion[]>([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  type MetricasMes = {
    id: number;
    mes: string;
    totalPedidos: number;
    completados: number;
    pendientes: number;
    satisfaccion: number;
    ingresos: number;
    fechaGeneracion: string;
    states?: number[]; // Agregado para evitar error de propiedad 'states'
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
    tiempoEntrega?: string;
    satisfaccion: number;
    productName?: string;
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
  const [reportesPedidos, setReportesPedidos] = useState<ReportePedido[]>([]);
  const [errorPedidos, setErrorPedidos] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);
  useEffect(() => {
    // Resetear página cuando cambie el filtro
    setCurrentPage(1);
    
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
      import('./backend').then(({ getPedidosReportes }) => {
        getPedidosReportes()
          .then((data: { error: string | null, pedidos: ReportePedido[] }) => {
            if (data.error) {
              setErrorPedidos(data.error);
              setReportesPedidos([]);
            } else {
              setErrorPedidos(null);
              // Mapear para agregar tiempoEntrega si falta
              const pedidosConTiempo = data.pedidos.map((pedido: any) => ({
                ...pedido,
                tiempoEntrega: pedido.tiempoEntrega ?? '', // valor por defecto si no existe
              }));
              setReportesPedidos(pedidosConTiempo);
            }
          })
          .catch((err) => {
            setErrorPedidos('Error inesperado al obtener pedidos.');
            setReportesPedidos([]);
            console.error(err);
          });
      });
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

  // Renderizar métricas clave para el filtro 'mes'
  const renderMetricasMes = () => {
    if (metricasMeses.length === 0) return null;
    const totalPedidos = metricasMeses.reduce((acc, mes) => acc + mes.totalPedidos, 0);
    const completados = metricasMeses.reduce((acc, mes) => acc + mes.completados, 0);
    const ingresos = metricasMeses.reduce((acc, mes) => acc + mes.ingresos, 0);
    const totalSatisfaccion = metricasMeses.reduce((acc, mes) => acc + (mes.satisfaccion * mes.totalPedidos), 0);
    const totalPedidosConReputacion = metricasMeses.reduce((acc, mes) => acc + (mes.satisfaccion > 0 ? mes.totalPedidos : 0), 0);
    const satisfaccionPromedio = totalPedidosConReputacion > 0 ? (totalSatisfaccion / totalPedidosConReputacion).toFixed(2) : '0';
    
    const metricas = [
      { label: 'Pedidos Totales', value: totalPedidos, icon: Package, color: 'text-blue-600' },
      { label: 'Completados', value: completados, icon: CheckCircle, color: 'text-green-600' },
      { label: 'Satisfacción', value: `${satisfaccionPromedio}/5`, icon: Star, color: 'text-yellow-600' },
      { label: 'Ingresos', value: `$${ingresos}`, icon: TrendingUp, color: 'text-purple-600' }
    ];
    return metricas.map(({ label, value, icon: Icon, color }, index) => (
      <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <Icon className={`mx-auto mb-2 ${color}`} size={24} />
        <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
      </div>
    ));
  };

  // Renderizar métricas clave para el filtro 'satisfaccion'
  const renderMetricasSatisfaccion = () => {
    const metricas = [
      { label: 'Promedio General', value: `${metricasSatisfaccion.promedioGeneral}/5`, icon: Star, color: 'text-yellow-600' },
      { label: 'Total Reseñas', value: metricasSatisfaccion.totalResenas, icon: Users, color: 'text-blue-600' },
      { label: '5 Estrellas', value: metricasSatisfaccion.cincoEstrellas, icon: Heart, color: 'text-green-600' },
      { label: 'Satisfacción', value: `${metricasSatisfaccion.satisfechos}%`, icon: CheckCircle, color: 'text-purple-600' }
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
  // Agrupar por mes y estado para el gráfico de estados de pedidos
  // Agrupar por mes y estado usando los valores correctos de state
  // Se requiere acceder a los datos originales de los pedidos por mes
  // Por lo tanto, se debe obtener los datos desde getMetricasPorMes o guardar los states por mes
  // Si metricasMeses no tiene los states, se debe modificar backend para incluirlos
  // Aquí se asume que metricasMeses tiene un campo 'states' con array de states de los pedidos de ese mes
  // Si no existe, se puede obtener desde el backend

  // Si metricasMeses no tiene los states, se omite y se usa la mejor aproximación
  // Si tienes acceso a los pedidos por mes, reemplaza la lógica por la agrupación real
  // Ordenar los meses de menor a mayor (por fechaGeneracion)
  const datosEstadosPorMes = [...metricasMeses]
    .sort((a, b) => new Date(a.fechaGeneracion).getTime() - new Date(b.fechaGeneracion).getTime())
    .map(mes => {
      const pendientes = mes.states ? mes.states.filter((s: number) => [1,2,3,4].includes(s)).length : mes.pendientes;
      const enTransito = mes.states ? mes.states.filter((s: number) => [5,6,7].includes(s)).length : (mes.totalPedidos - mes.pendientes - mes.completados);
      const completados = mes.states ? mes.states.filter((s: number) => s === 8).length : mes.completados;
      return {
        mes: mes.mes.toUpperCase(),
        Pendiente: pendientes,
        "En tránsito": enTransito,
        Completado: completados
      };
    });

  const datosGraficos = {
    mes: [...metricasMeses]
      .sort((a, b) => new Date(a.fechaGeneracion).getTime() - new Date(b.fechaGeneracion).getTime())
      .map(mes => ({ mes: mes.mes.charAt(0).toUpperCase() + mes.mes.slice(1), pedidos: mes.totalPedidos })),
    estadosPorMes: datosEstadosPorMes,
    satisfaccion: reportesSatisfaccion.length > 0
      ? Object.entries(reportesSatisfaccion[0].distribucion).map(([estrella, cantidad]) => ({
          estrella: `${estrella}⭐`,
          cantidad: cantidad as number
        }))
      : []
  };

  // Funciones de paginación
  const getPaginatedPedidos = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return reportesPedidos.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(reportesPedidos.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll suave hacia la sección de lista de reportes
    const listaReportes = document.querySelector('[data-section="lista-reportes"]');
    if (listaReportes) {
      listaReportes.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const obtenerDatosReporte = () => {
    switch (activeFilter) {
      case 'mes':
        return metricasMeses;
      case 'pedido':
        return getPaginatedPedidos(); // Usar datos paginados
      case 'satisfaccion':
        return reportesSatisfaccion;
      default:
        return [];
    }
  };

  const abrirModal = (reporte: Reporte) => {
    setSelectedReport(reporte);
    setModalOpen(true);
  };

  const exportarPDF = (reporte: Reporte) => {
    // PDF profesional con layout corporativo y SSR compatible
    if (activeFilter === 'pedido' && 'id' in reporte) {
      (async () => {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.height;
        const margin = 15;
        const colors = {
          primary: [22, 120, 187],
          secondary: [44, 62, 80],
          light: [245, 248, 255],
          border: [180, 200, 220],
          text: [33, 37, 41]
        };
        // Campos personalizados para pedido
        const tableData = [
          ['Total Pedidos', `${metricasPedido?.totalPedidos ?? ''}`],
          ['Entregados', `${metricasPedido?.entregados ?? ''}`],
          ['En Tránsito', `${metricasPedido?.enTransito ?? ''}`],
          ['Valor Promedio', `$${metricasPedido?.valorPromedio ?? ''}`]
        ];
        // Encabezado
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
        doc.text('RESUMEN DE PEDIDOS', pageWidth / 2, 22, { align: 'center' });
        let currentY = 50;
        autoTable(doc, {
          head: [['Campo', 'Valor']],
          body: tableData,
          startY: currentY,
          margin: { left: margin, right: margin },
          theme: 'grid',
          headStyles: {
            fillColor: [22, 120, 187],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 12,
            halign: 'center',
            cellPadding: 3
          },
          bodyStyles: {
            fontSize: 10,
            cellPadding: 3,
            textColor: [33, 37, 41]
          },
          alternateRowStyles: {
            fillColor: [245, 248, 255]
          },
          columnStyles: {
            0: { cellWidth: 60, fontStyle: 'bold', textColor: [44, 62, 80] },
            1: { cellWidth: pageWidth - (margin * 2) - 60 }
          }
        });
        // Gráfico de estados de pedidos
        const chartElement = document.querySelector('[data-export="estados-pedidos"]');
        if (chartElement) {
          const html2canvas = (await import('html2canvas')).default;
          const canvas = await html2canvas(chartElement as HTMLElement, { backgroundColor: null, scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth * 0.65;
          const imgHeight = imgWidth * 0.5;
          const afterTableY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 40 : currentY + 90;
          doc.setFontSize(14);
          doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
          const tituloY = afterTableY - 20;
          doc.text('Estados de Pedidos', pageWidth / 2, tituloY, { align: 'center' });
          const leftMargin = (pageWidth - imgWidth) / 2;
          doc.addImage(imgData, 'PNG', leftMargin, afterTableY, imgWidth, imgHeight);
        }
        // Footer
        const footerY = pageHeight - 25;
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
        window.open(doc.output('bloburl'), '_blank');
      })();
      return;
    }
    // ...PDF para reportes mensuales y otros tipos...
    (async () => {
      const { jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;
      const doc = new jsPDF();
      // ...existing code para PDF mensual...
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.height;
      const margin = 15;
      const colors = {
        primary: [22, 120, 187],
        secondary: [44, 62, 80],
        light: [245, 248, 255],
        border: [180, 200, 220],
        text: [33, 37, 41]
      };
      let tableData: [string, string][] = [];
      let title = '';
      if (activeFilter === 'mes' && 'mes' in reporte) {
        title = 'RESUMEN MENSUAL';
        tableData = [
          ['Periodo', reporte.mes.toUpperCase()],
          ['Ingresos', `$${reporte.ingresos}`],
          ['Total Pedidos', `${reporte.totalPedidos}`],
          ['Completados', `${reporte.completados}`],
          ['Satisfacción', `${reporte.satisfaccion}/5`]
        ];
      }
      // ...existing code para PDF mensual...
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
      doc.text(title, pageWidth / 2, 22, { align: 'center' });
      let currentY = 50;
      autoTable(doc, {
        head: [['Campo', 'Valor']],
        body: tableData,
        startY: currentY,
        margin: { left: margin, right: margin },
        theme: 'grid',
        headStyles: {
          fillColor: [22, 120, 187],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 12,
          halign: 'center',
          cellPadding: 3
        },
        bodyStyles: {
          fontSize: 10,
          cellPadding: 3,
          textColor: [33, 37, 41]
        },
        alternateRowStyles: {
          fillColor: [245, 248, 255]
        },
        columnStyles: {
          0: { cellWidth: 60, fontStyle: 'bold', textColor: [44, 62, 80] },
          1: { cellWidth: pageWidth - (margin * 2) - 60 }
        }
      });
      const footerY = pageHeight - 25;
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
      window.open(doc.output('bloburl'), '_blank');
    })();
  };

  const exportarGeneral = async () => {
    // PDF profesional con layout corporativo y SSR compatible
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();

    // Layout y colores
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.height;
    const margin = 15;
    const colors = {
      primary: [22, 120, 187],
      secondary: [44, 62, 80],
      light: [245, 248, 255],
      border: [180, 200, 220],
      text: [33, 37, 41]
    };

    // Datos para la tabla PDF: Pedidos Totales, Completados, Satisfacción e Ingresos
    // Usar los datos agregados de los reportes mensuales
    const totalPedidos = metricasMeses.reduce((acc, mes) => acc + mes.totalPedidos, 0);
    const completados = metricasMeses.reduce((acc, mes) => acc + mes.completados, 0);
    const ingresos = metricasMeses.reduce((acc, mes) => acc + mes.ingresos, 0);
    const totalSatisfaccion = metricasMeses.reduce((acc, mes) => acc + (mes.satisfaccion * mes.totalPedidos), 0);
    const totalPedidosConReputacion = metricasMeses.reduce((acc, mes) => acc + (mes.satisfaccion > 0 ? mes.totalPedidos : 0), 0);
    const satisfaccionPromedio = totalPedidosConReputacion > 0 ? (totalSatisfaccion / totalPedidosConReputacion).toFixed(2) : '0';

    const pedidoTable = [
      ['Pedidos Totales', `${totalPedidos}`],
      ['Completados', `${completados}`],
      ['Satisfacción', `${satisfaccionPromedio}/5`],
      ['Ingresos', `$${ingresos}`]
    ];

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

    let currentY = 50;

    // === MANEJO POR TIPO DE PEDIDO ===
    // Solo tabla de métricas agregadas
    autoTable(doc, {
      head: [['Campo', 'Valor']],
      body: pedidoTable,
      startY: currentY,
      margin: { left: margin, right: margin },
      theme: 'grid',
      headStyles: {
        fillColor: [22, 120, 187],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 12,
        halign: 'center',
        cellPadding: 3
      },
      bodyStyles: {
        fontSize: 10,
        cellPadding: 3,
        textColor: [33, 37, 41]
      },
      alternateRowStyles: {
        fillColor: [245, 248, 255]
      },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold', textColor: [44, 62, 80] },
        1: { cellWidth: pageWidth - (margin * 2) - 60 }
      }
    });

    // === AGREGAR GRÁFICO DE TENDENCIA MENSUAL ===
    // Usar html2canvas para capturar el gráfico SVG de Recharts
    const chartElement = document.getElementById('tendencia-mensual-export');
    if (chartElement) {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(chartElement, { backgroundColor: null, scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      // Insertar la imagen debajo de la tabla
  // Reducir el ancho y centrar el gráfico
  const imgWidth = pageWidth * 0.65; // 65% del ancho de la página
  const imgHeight = imgWidth * 0.5; // Relación de aspecto
  const afterTableY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 40 : currentY + 90;
  doc.setFontSize(14);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  // Separar el título del gráfico
  const tituloY = afterTableY - 20;
  doc.text('Tendencia Mensual', pageWidth / 2, tituloY, { align: 'center' });
  // Calcular margen izquierdo para centrar
  const leftMargin = (pageWidth - imgWidth) / 2;
  doc.addImage(imgData, 'PNG', leftMargin, afterTableY, imgWidth, imgHeight);
    }

    // === FOOTER PROFESIONAL ===
    const footerY = pageHeight - 25;
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

    window.open(doc.output('bloburl'), '_blank');
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
          <div className="space-y-4">
            {activeFilter === 'mes' && selectedReport && 'mes' in selectedReport && (
              <div className="p-6 rounded-lg">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4 flex flex-col justify-center items-start">
                    <span className="text-xs font-semibold text-gray-500 mb-1">PERIODO</span>
                    <span className="text-2xl font-bold text-blue-700">{selectedReport.mes.toUpperCase()}</span>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4 flex flex-col justify-center items-start">
                    <span className="text-xs font-semibold text-gray-500 mb-1">INGRESOS</span>
                    <span className="text-2xl font-bold text-green-600">${selectedReport.ingresos}</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                    <Package size={32} className="mb-2 text-gray-400" />
                    <span className="text-2xl font-bold text-[#202841]">{selectedReport.totalPedidos}</span>
                    <span className="text-xs text-gray-500 mt-1">TOTAL PEDIDOS</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                    <CheckCircle size={32} className="mb-2 text-green-500" />
                    <span className="text-2xl font-bold text-[#202841]">{selectedReport.completados}</span>
                    <span className="text-xs text-gray-500 mt-1">COMPLETADOS</span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 flex flex-col items-center">
                    <Star size={32} className="mb-2 text-yellow-500" />
                    <span className="text-2xl font-bold text-[#202841]">{selectedReport.satisfaccion}</span>
                    <span className="text-xs text-gray-500 mt-1">SATISFACCION</span>
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-bold text-base hover:bg-blue-700 transition-colors"
                    onClick={async () => {
                      if ('id' in selectedReport) {
                        // Buscar el PDF en la columna pdfRoutes de la tabla orders
                        const { createClient } = await import('@supabase/supabase-js');
                        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                        if (!supabaseUrl || !supabaseKey) {
                          alert('Supabase URL o Key no están definidos en las variables de entorno.');
                          return;
                        }
                        const supabase = createClient(supabaseUrl as string, supabaseKey as string);
                        const { data, error } = await supabase
                          .from('orders')
                          .select('pdfRoutes')
                          .eq('id', selectedReport.id)
                          .single();
                        if (!error && data && data.pdfRoutes) {
                          window.open(data.pdfRoutes, '_blank');
                        } else {
                          // Si no existe, puedes mostrar un mensaje o fallback
                          alert('No se encontró PDF para este pedido.');
                        }
                      } else {
                        exportarPDF(selectedReport);
                      }
                    }}
                  >
                    <Download size={20} />
                    EXPORTAR COMO PDF
                  </button>
                </div>
              </div>
            )}
            {activeFilter === 'pedido' && selectedReport && 'numeroPedido' in selectedReport && (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-gray-900 dark:text-white">Información del Pedido</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {'numeroPedido' in selectedReport && <div className="text-gray-700 dark:text-gray-300"><strong>Número:</strong> {selectedReport.numeroPedido}</div>}
                  {'cliente' in selectedReport && <div className="text-gray-700 dark:text-gray-300"><strong>Cliente:</strong> {selectedReport.cliente}</div>}
                  {'productName' in selectedReport && <div className="text-gray-700 dark:text-gray-300"><strong>Producto:</strong> {selectedReport.productName}</div>}
                  {'fechaPedido' in selectedReport && <div className="text-gray-700 dark:text-gray-300"><strong>Fecha:</strong> {selectedReport.fechaPedido}</div>}
                  {'estado' in selectedReport && (
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
                  )}
                  {'valor' in selectedReport && <div className="text-gray-700 dark:text-gray-300"><strong>Valor:</strong> ${selectedReport.valor}</div>}
                  {'tiempoEntrega' in selectedReport && <div className="text-gray-700 dark:text-gray-300"><strong>Tiempo Entrega:</strong> {selectedReport.tiempoEntrega}</div>}
                </div>
                <div className="pt-4">
                  <button
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-bold text-base hover:bg-blue-700 transition-colors"
                    onClick={async () => {
                      if (activeFilter === 'pedido' && selectedReport && 'id' in selectedReport) {
                        const { createClient } = await import('@supabase/supabase-js');
                        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
                        if (typeof supabaseUrl !== 'string' || typeof supabaseKey !== 'string') {
                          alert('Supabase URL o Key no están definidos correctamente.');
                          return;
                        }
                        const supabase = createClient(supabaseUrl, supabaseKey);
                        const { data, error } = await supabase
                          .from('orders')
                          .select('pdfRoutes')
                          .eq('id', selectedReport.id)
                          .single();
                        if (!error && data && data.pdfRoutes) {
                          window.open(data.pdfRoutes, '_blank');
                        } else {
                          alert('No se encontró PDF para este pedido.');
                        }
                      } else {
                        exportarPDF(selectedReport);
                      }
                    }}
                  >
                    <Download size={20} />
                    EXPORTAR COMO PDF
                  </button>
                </div>
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
                        {/* Comentarios destacados eliminados */}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
      <Sidebar 
        isExpanded={sidebarExpanded} 
        setIsExpanded={setSidebarExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        userRole="venezuela" 
      />
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'
      } w-full`}>
        <Header 
          notifications={0}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Reportes"
          subtitle="Analiza el rendimiento y métricas de tu operación"
        />


        <div className="p-4 md:p-5 lg:p-6 flex flex-col gap-6 md:gap-8">
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
            <CardContent className="pt-0 pb-4 md:pb-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="flex flex-wrap gap-2 md:gap-3">
                  {([
                    { key: 'mes', label: 'Por Mes', icon: Calendar, color: 'bg-blue-500' },
                    { key: 'pedido', label: 'Por Pedido', icon: ShoppingCart, color: 'bg-green-500' },
                    { key: 'satisfaccion', label: 'Satisfacción Cliente', icon: Heart, color: 'bg-purple-500' }
                  ] as { key: 'mes' | 'pedido' | 'satisfaccion'; label: string; icon: any; color: string }[]).map(({ key, label, icon: Icon, color }) => (
                        <button
                          key={key}
                          onClick={() => setActiveFilter(key)}
                      className={`flex items-center gap-2 px-3 md:px-4 py-2 md:py-3 rounded-lg font-medium transition-all transform hover:scale-105 text-sm md:text-base ${
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
                <button 
                  onClick={() => {
                    if (activeFilter === 'mes') {
                      exportarGeneral();
                    } else if (activeFilter === 'pedido') {
                      exportarPDF({
                        id: 0,
                        numeroPedido: '',
                        cliente: '',
                        fechaPedido: '',
                        estado: '',
                        valor: 0,
                        tiempoEntrega: '',
                        satisfaccion: 0,
                        productName: ''
                      });
                    } else if (activeFilter === 'satisfaccion' && reportesSatisfaccion.length > 0) {
                      const reporte = reportesSatisfaccion[0];
                      (async () => {
                        const { jsPDF } = await import('jspdf');
                        const autoTable = (await import('jspdf-autotable')).default;
                        const doc = new jsPDF();
                        const pageWidth = doc.internal.pageSize.getWidth();
                        const pageHeight = doc.internal.pageSize.height;
                        const margin = 15;
                        const colors = {
                          primary: [22, 120, 187],
                          secondary: [44, 62, 80],
                          light: [245, 248, 255],
                          border: [180, 200, 220],
                          text: [33, 37, 41]
                        };
                        const tableData = [
                          ['Promedio General', `${reporte.promedioGeneral}/5`],
                          ['Total Reseñas', `${reporte.totalReseñas}`],
                          ['5 Estrellas', `${metricasSatisfaccion.cincoEstrellas}`],
                          ['Satisfacción', `${metricasSatisfaccion.satisfechos}%`]
                        ];
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
                        doc.text('SATISFACCIÓN CLIENTE', pageWidth / 2, 22, { align: 'center' });
                        let currentY = 50;
                        autoTable(doc, {
                          head: [['Campo', 'Valor']],
                          body: tableData,
                          startY: currentY,
                          margin: { left: margin, right: margin },
                          theme: 'grid',
                          headStyles: {
                            fillColor: [22, 120, 187],
                            textColor: [255, 255, 255],
                            fontStyle: 'bold',
                            fontSize: 12,
                            halign: 'center',
                            cellPadding: 3
                          },
                          bodyStyles: {
                            fontSize: 10,
                            cellPadding: 3,
                            textColor: [33, 37, 41]
                          },
                          alternateRowStyles: {
                            fillColor: [245, 248, 255]
                          },
                          columnStyles: {
                            0: { cellWidth: 60, fontStyle: 'bold', textColor: [44, 62, 80] },
                            1: { cellWidth: pageWidth - (margin * 2) - 60 }
                          }
                        });
                        const chartElement = document.querySelector('[data-export="satisfaccion"]');
                        if (chartElement) {
                          const html2canvas = (await import('html2canvas')).default;
                          const canvas = await html2canvas(chartElement as HTMLElement, { backgroundColor: null, scale: 2 });
                          const imgData = canvas.toDataURL('image/png');
                          const imgWidth = pageWidth * 0.65;
                          const imgHeight = imgWidth * 0.5;
                          const afterTableY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 40 : currentY + 90;
                          doc.setFontSize(14);
                          doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
                          const tituloY = afterTableY - 20;
                          doc.text('Distribución de Satisfacción', pageWidth / 2, tituloY, { align: 'center' });
                          const leftMargin = (pageWidth - imgWidth) / 2;
                          doc.addImage(imgData, 'PNG', leftMargin, afterTableY, imgWidth, imgHeight);
                        }
                        const footerY = pageHeight - 25;
                        doc.setFontSize(10);
                        doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
                        doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, margin, footerY + 13);
                        doc.text(`Página 1 de 1`, pageWidth - margin, footerY + 13, { align: 'right' });
                        window.open(doc.output('bloburl'), '_blank');
                      })();
                    }
                  }}
                  className="flex items-center gap-2 bg-[#202841] text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  <Download size={20} />
                  Exportar
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Gráficos */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            <Card
              className={
                `rounded-lg shadow-lg border-0 backdrop-blur-sm p-0 transition-colors duration-300 ` +
                (theme === 'dark' ? 'bg-zinc-900/80' : 'bg-white/70')
              }
              id={activeFilter === 'mes' ? 'tendencia-mensual-export' : activeFilter === 'pedido' ? 'estados-pedidos-export' : activeFilter === 'satisfaccion' ? 'satisfaccion-export' : ''}
              data-export={activeFilter === 'mes' ? 'tendencia-mensual' : activeFilter === 'pedido' ? 'estados-pedidos' : activeFilter === 'satisfaccion' ? 'satisfaccion' : ''}
            >
              <CardHeader className="pb-0">
                {/* Eliminar el título negro para el gráfico de estados de pedidos */}
                {/* Título eliminado para evitar duplicado en PDF */}
              </CardHeader>
              <CardContent className="pt-0">
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  {activeFilter === 'pedido' ? (
                    <BarChart data={datosGraficos.estadosPorMes}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="mes" stroke="#222" />
                      <YAxis stroke="#222" />
                      <Tooltip />
                      {/* Pendiente: amarillo, En tránsito: naranja, Completado: verde */}
                      <Bar dataKey="Pendiente" fill="#fde047" name="Pendiente" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="En tránsito" fill="#fb923c" name="En tránsito" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="Completado" fill="#22c55e" name="Completado" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  ) : activeFilter === 'mes' ? (
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

            <Card
              className={
                `rounded-lg shadow-lg border-0 backdrop-blur-sm p-0 transition-colors duration-300 ` +
                (theme === 'dark' ? 'bg-zinc-900/80' : 'bg-white/70')
              }
              data-export={activeFilter === 'mes' ? 'metricas-clave' : undefined}
            >
              <CardHeader className="pb-0">
                <CardTitle className={theme === 'dark' ? 'text-white' : 'text-black'}>Métricas Clave</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3 md:gap-4 h-[250px] md:h-[300px] content-center">
                  {activeFilter === 'mes' && renderMetricasMes()}
                  {activeFilter === 'pedido' && renderMetricasPedido()}
                  {activeFilter === 'satisfaccion' && renderMetricasSatisfaccion()}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Reportes */}
          <Card
            className={
              `rounded-lg shadow-lg border-0 backdrop-blur-sm p-0 transition-colors duration-300 ` +
              (theme === 'dark' ? 'bg-zinc-900/80' : 'bg-white/70')
            }
            data-export={activeFilter === 'mes' ? 'lista-reportes-mes' : undefined}
            data-section="lista-reportes"
          >
            <CardHeader className="pb-0">
              <CardTitle className={theme === 'dark' ? 'text-white' : 'text-black'}>
                Lista de Reportes - {activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 md:space-y-3">
                {activeFilter === 'mes' && obtenerDatosReporte().length > 0 && obtenerDatosReporte().map((reporte: any) => (
                  <div key={reporte.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Calendar className="text-blue-600" size={18} className="md:w-5 md:h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base">{reporte.mes}</h4>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          {`${reporte.totalPedidos} pedidos • ${reporte.satisfaccion}/5 ⭐ • $${reporte.ingresos}`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => abrirModal(reporte)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-2 md:px-3 py-1.5 md:py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm"
                    >
                      <Eye size={14} className="md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Ver Detalles</span>
                      <span className="sm:hidden">Ver</span>
                    </button>
                  </div>
                ))}
                {activeFilter === 'mes' && obtenerDatosReporte().length === 0 && (
                  <div className="text-center text-gray-500 py-6 md:py-8 text-sm md:text-base">No hay reportes mensuales registrados.</div>
                )}

                {activeFilter === 'satisfaccion' && obtenerDatosReporte().length > 0 && obtenerDatosReporte().map((reporte: any) => (
                  <div key={reporte.id} className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Heart className="text-purple-600" size={18} className="md:w-5 md:h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm md:text-base">{reporte.periodo}</h4>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">
                          {`${reporte.promedioGeneral}/5 ⭐ • ${reporte.totalReseñas} reseñas`}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => abrirModal(reporte)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-2 md:px-3 py-1.5 md:py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm"
                    >
                      <Eye size={14} className="md:w-4 md:h-4" />
                      <span className="hidden sm:inline">Ver Detalles</span>
                      <span className="sm:hidden">Ver</span>
                    </button>
                  </div>
                ))}
                {activeFilter === 'satisfaccion' && obtenerDatosReporte().length === 0 && (
                  <div className="text-center text-gray-500 py-6 md:py-8 text-sm md:text-base">No hay reportes de satisfacción registrados.</div>
                )}
                {activeFilter === 'pedido' && errorPedidos && (
                  <div className="text-center text-red-500 py-6 md:py-8 text-sm md:text-base">{errorPedidos}</div>
                )}
                {activeFilter === 'pedido' && !errorPedidos && obtenerDatosReporte().length > 0 && obtenerDatosReporte().map((pedido: ReportePedido) => (
                  <div key={pedido.id} className="flex flex-col md:flex-row items-start md:items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-lg px-4 md:px-6 py-3 md:py-4 shadow-sm gap-3">
                    <div className="flex items-center gap-3 md:gap-4">
                      <ShoppingCart size={24} className="md:w-8 md:h-8 text-blue-400" />
                      <div>
                        <div className="font-bold text-base md:text-lg text-[#202841] dark:text-white">{pedido.numeroPedido}</div>
                        <div className="text-xs md:text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-semibold">{pedido.productName}</span> &bull; {pedido.cliente} &bull; {pedido.estado} &bull; <span className="font-semibold">{pedido.valor}</span>
                          &bull; {pedido.satisfaccion !== null ? `${pedido.satisfaccion}/5` : 'Sin calificar'}
                          {pedido.satisfaccion !== null && <Star size={14} className="md:w-4 md:h-4 inline ml-1 text-yellow-400" />}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => abrirModal(pedido)}
                      className="flex items-center gap-2 bg-blue-600 text-white px-2 md:px-4 py-1.5 md:py-2 rounded-lg hover:bg-blue-700 transition-colors text-xs md:text-sm"
                    >
                      <Eye size={16} className="md:w-5 md:h-5" />
                      <span className="hidden sm:inline">Ver detalles</span>
                      <span className="sm:hidden">Ver</span>
                    </button>
                  </div>
                ))}
                {activeFilter === 'pedido' && !errorPedidos && reportesPedidos.length === 0 && (
                  <div className="text-center text-gray-500 py-6 md:py-8 text-sm md:text-base">No hay pedidos registrados.</div>
                )}

                {/* Paginación para pedidos */}
                {activeFilter === 'pedido' && !errorPedidos && reportesPedidos.length > 0 && totalPages > 1 && (
                  <div className="flex items-center justify-between mt-6 px-4 py-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, reportesPedidos.length)} de {reportesPedidos.length} pedidos
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Anterior
                      </button>
                      
                      {/* Números de página */}
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => handlePageChange(pageNum)}
                              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                      </div>
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        Siguiente
                      </button>
                    </div>
                  </div>
                )}
                {/*
                {activeFilter === 'satisfaccion' && reportesSatisfaccion.map((reporte: any) => (
                  // ...existing code para renderizar reportes de satisfacción...
                ))}
                {activeFilter !== 'pedido' && activeFilter !== 'satisfaccion' && obtenerDatosReporte().map((reporte: any) => (
                  // ...existing code para renderizar otros reportes...
                ))}
                */}
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