'use client';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
// import { Player } from '@lottiefiles/react-lottie-player';
import { default as dynamicImport } from 'next/dynamic';

// Importar Player dinámicamente sin SSR
const Player = dynamicImport(
  () => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player),
  { ssr: false }
);
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useClientContext } from '@/lib/ClientContext';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  MapPin, 
  MessageSquare, 
  Eye, 
  Search, 
  Plus,
  ArrowLeft,
  ArrowRight,
  Plane,
  Ship,
  Camera,
  Link,
  Upload,
  Check,
  FileText,
  Hash,
  Settings,
  Image,
  Target,
  X
} from 'lucide-react';

// Rutas de animaciones Lottie (desde /public)
const airPlaneLottie = '/animations/FTQoLAnxbj.json';
const cargoShipLottie = '/animations/wired-flat-1337-cargo-ship-hover-pinch.json';
const truckLottie = '/animations/wired-flat-18-delivery-truck.json';
const cameraLottie = '/animations/wired-flat-61-camera-hover-flash.json';
const folderLottie = '/animations/wired-flat-120-folder-hover-adding-files.json';
const linkLottie = '/animations/wired-flat-11-link-unlink-hover-bounce.json';
const confettiLottie = '/animations/wired-flat-1103-confetti-hover-pinch.json';

// Tipos
interface Order {
  id: string;
  product: string;
  description: string;
  amount: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'quoted';
  progress: number;
  tracking: string;
  estimatedDelivery: string;
  createdAt: string;
  category: string;
  estimatedBudget?: number | null;
  totalQuote?: number | null;
  documents?: Array<{
    type: 'image' | 'link';
    url: string;
    label: string;
  }>;
}

interface NewOrderData {
  productName: string;
  description: string;
  quantity: number;
  specifications: string;
  requestType: 'link' | 'photo';
  productUrl?: string;
  productImage?: File;
  deliveryType: 'doorToDoor' | 'air' | 'maritime';
  deliveryVenezuela: string;
  estimatedBudget: string;
  client_id: string;
  client_name?: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  currency: 'USD' | 'BS';
  validation: 'automatic' | 'manual';
  description: string;
  details?: {
    accountNumber?: string;
    bankName?: string;
    reference?: string;
    phoneNumber?: string;
    email?: string;
    qrCode?: string;
  };
}

// Datos mock
const MOCK_ORDERS: Order[] = [
  {
    id: 'ORD-2024-001',
    product: 'Smartphone Samsung Galaxy S24',
    description: 'Teléfono inteligente de última generación con cámara de 200MP',
    amount: '$1,250.00',
    status: 'shipped',
    progress: 75,
    tracking: 'TRK-789456123',
    estimatedDelivery: '15 días',
    createdAt: '2024-01-15',
    category: 'Electrónicos',
    documents: [
      { type: 'image', url: '/images/products/samsung-s24.jpg', label: 'Foto del producto' },
      { type: 'link', url: 'https://tracking.example.com/TRK-789456123', label: 'Seguimiento en línea' }
    ]
  },
  {
    id: 'ORD-2024-002',
    product: 'Laptop Dell Inspiron 15',
    description: 'Computadora portátil para trabajo y gaming',
    amount: '$2,450.00',
    status: 'processing',
    progress: 45,
    tracking: 'TRK-456789321',
    estimatedDelivery: '25 días',
    createdAt: '2024-01-20',
    category: 'Computadoras',
    documents: [
      { type: 'image', url: '/images/products/dell-inspiron.jpg', label: 'Foto del producto' }
    ]
  },
  {
    id: 'ORD-2024-003',
    product: 'Auriculares Sony WH-1000XM5',
    description: 'Auriculares inalámbricos con cancelación de ruido',
    amount: '$350.00',
    status: 'delivered',
    progress: 100,
    tracking: 'TRK-123456789',
    estimatedDelivery: 'Completado',
    createdAt: '2024-01-10',
    category: 'Audio'
  },
  {
    id: 'ORD-2024-004',
    product: 'Smartwatch Apple Watch Series 9',
    description: 'Reloj inteligente con monitor cardíaco',
    amount: '$899.00',
    status: 'quoted',
    progress: 25,
    tracking: 'Cotizado',
    estimatedDelivery: '30 días',
    createdAt: '2024-01-25',
    category: 'Wearables'
  }
];

export default function MisPedidosPage() {
  const { clientId, clientName, clientEmail, clientRole } = useClientContext();

  // Supabase client (navegador)
  const supabase = getSupabaseBrowserClient();
  // Estados básicos
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados de la página
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Estados del modal de nuevo pedido
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [newOrderData, setNewOrderData] = useState<NewOrderData>({
    productName: '',
    description: '',
    quantity: 1,
    specifications: '',
    requestType: 'link',
    deliveryType: 'doorToDoor',
    deliveryVenezuela: '',
    estimatedBudget: '',
    client_id: '',
    client_name: ''
  });

  // Obtener el user_id del usuario autenticado
  useEffect(() => {
    // Usar los datos globales del contexto cliente
    setNewOrderData((prev) => ({
      ...prev,
      client_id: clientId || '',
      client_name: clientName || '',
    }));
  }, [clientId, clientName]);

  // Estados para animaciones de Lottie
  const [hoveredDeliveryOption, setHoveredDeliveryOption] = useState<string | null>(null);
  const [isFolderHovered, setIsFolderHovered] = useState(false);
  const [isCameraHovered, setIsCameraHovered] = useState(false);
  const [isLinkHovered, setIsLinkHovered] = useState(false);
  
  // Estados para drag and drop
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Estados para transiciones suaves
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [stepDirection, setStepDirection] = useState<'next' | 'prev'>('next');
  
  // Referencia al modal para scroll
  const modalRef = useRef<HTMLDivElement>(null);

  // Estados para el modal de pago
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState(1);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);

  // Inicialización
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mapeos de estado numérico de la BD a estados de UI y progreso
  const mapStateToStatus = (state?: number | null): Order['status'] => {
    switch (state) {
      case 3: return 'quoted';
      case 4: return 'processing';
      case 5: return 'shipped';
      case 6: return 'delivered';
      case 2: return 'pending';
      case 1:
      default:
        return 'pending';
    }
  };

  const mapStateToProgress = (state?: number | null): number => {
    switch (state) {
      case 1: return 10; // creado
      case 2: return 20; // recibido
      case 3: return 25; // cotizado
      case 4: return 60; // procesando
      case 5: return 85; // enviado
      case 6: return 100; // entregado
      default: return 0;
    }
  };

  // Cargar pedidos del cliente autenticado
  const fetchOrders = async () => {
    if (!clientId) return;
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, productName, description, estimatedBudget, totalQuote, state, created_at, pdfRoutes, quantity')
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error cargando pedidos:', error);
        return;
      }
      const mapped: Order[] = (data || []).map((row: any) => {
        const amountNumber = (row.totalQuote ?? row.estimatedBudget ?? 0) as number;
        return {
          id: String(row.id),
          product: row.productName || 'Pedido',
          description: row.description || '',
          amount: `$${Number(amountNumber || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`,
          status: mapStateToStatus(row.state as number | null),
          progress: mapStateToProgress(row.state as number | null),
          tracking: '',
          estimatedDelivery: '',
          createdAt: row.created_at || '',
          category: '',
          estimatedBudget: typeof row.estimatedBudget === 'number' ? row.estimatedBudget : (row.estimatedBudget ? Number(row.estimatedBudget) : null),
          totalQuote: typeof row.totalQuote === 'number' ? row.totalQuote : (row.totalQuote ? Number(row.totalQuote) : null),
          documents: row.pdfRoutes ? [{ type: 'link' as const, url: row.pdfRoutes, label: 'Resumen PDF' }] : []
        };
      });
      setOrders(mapped);
    } catch (e) {
      console.error('Excepción cargando pedidos:', e);
    }
  };

  // Disparar carga cuando tengamos clientId
  useEffect(() => {
    if (clientId) fetchOrders();
  }, [clientId]);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.tracking.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    // Total gastado: solo considerar pedidos ya pagados/en proceso en adelante usando totalQuote
    totalSpent: orders
      .filter(o => o.status === 'processing' || o.status === 'shipped' || o.status === 'delivered')
      .reduce((sum, order) => sum + Number(order.totalQuote ?? 0), 0)
  };

  // Funciones helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'quoted': return 'bg-green-100 text-green-800 border-green-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'quoted': return 'Cotizado';
      case 'processing': return 'Procesando';
      case 'shipped': return 'Enviado';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  // Métodos de pago disponibles
  const paymentMethods: PaymentMethod[] = [
    {
      id: 'mobile',
      name: 'Pago Móvil',
      icon: '📱',
      currency: 'BS',
      validation: 'automatic',
      description: 'Pago rápido y seguro',
      details: {
        phoneNumber: '0412-123-4567',
        reference: 'PITA-001-2024'
      }
    },
    {
      id: 'transfer',
      name: 'Transferencia',
      icon: '🏦',
      currency: 'BS',
      validation: 'automatic',
      description: 'Transferencia bancaria',
      details: {
        bankName: 'Banco de Venezuela',
        accountNumber: '0102-1234-5678-9012',
        reference: 'PITA-001-2024'
      }
    },
    {
      id: 'binance',
      name: 'Binance USDT',
      icon: '₿',
      currency: 'USD',
      validation: 'manual',
      description: 'Pago con criptomonedas',
      details: {
        email: 'pita.venezuela@binance.com',
        reference: 'PITA-001-2024'
      }
    },
    {
      id: 'zelle',
      name: 'Zelle',
      icon: '💵',
      currency: 'USD',
      validation: 'manual',
      description: 'Transferencia rápida',
      details: {
        email: 'pita.venezuela@zelle.com',
        reference: 'PITA-001-2024'
      }
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '💳',
      currency: 'USD',
      validation: 'manual',
      description: 'Pago con PayPal',
      details: {
        email: 'pita.venezuela@paypal.com',
        reference: 'PITA-001-2024'
      }
    }
  ];

  // Handlers
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  // Handlers para el modal de pago
  const handlePaymentClick = (order: Order) => {
    setSelectedOrderForPayment(order);
    setPaymentStep(1);
    setSelectedPaymentMethod(null);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    setSelectedPaymentMethod(method);
    setPaymentStep(2);
  };

  const handlePaymentBack = () => {
    if (paymentStep === 2) {
      setPaymentStep(1);
      setSelectedPaymentMethod(null);
    } else {
      setIsPaymentModalOpen(false);
      setSelectedOrderForPayment(null);
    }
  };

  const handlePaymentConfirm = () => {
    // Aquí iría la lógica de confirmación del pago
    console.log('Pago confirmado:', selectedOrderForPayment, selectedPaymentMethod);
    setIsPaymentModalOpen(false);
    setSelectedOrderForPayment(null);
    setSelectedPaymentMethod(null);
    setPaymentStep(1);
  };

  const handleNextStep = () => {
    if (currentStep < 3 && !isTransitioning) {
      setStepDirection('next');
      setIsTransitioning(true);
      
      // Scroll suave hacia arriba del modal con delay para mejor UX
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }, 150);
      
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1 && !isTransitioning) {
      setStepDirection('prev');
      setIsTransitioning(true);
      
      // Scroll suave hacia arriba del modal con delay para mejor UX
      setTimeout(() => {
        if (modalRef.current) {
          modalRef.current.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }
      }, 150);
      
      setTimeout(() => {
        setCurrentStep(currentStep - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const handleSubmitOrder = () => {
  // ...existing code...
  console.log('handleSubmitOrder called', newOrderData);
  // Generar nombre del PDF con fecha legible dd-mm-yyyy
  const fechaObj = new Date();
  const dd = String(fechaObj.getDate()).padStart(2, '0');
  const mm = String(fechaObj.getMonth() + 1).padStart(2, '0');
  const yyyy = fechaObj.getFullYear();
  const fechaPedidoLegible = `${dd}-${mm}-${yyyy}`;
  const numeroPedido = Date.now();
  const nombrePDF = `${newOrderData.productName}_${fechaPedidoLegible}_${numeroPedido}_${newOrderData.client_id}_${newOrderData.deliveryVenezuela}.pdf`;

    // PDF profesional con layout corporativo y SSR compatible
    (async () => {
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
      const pedidoTable = [
        ['ID Pedido', `${numeroPedido}`],
        ['Cliente ID', `${newOrderData.client_id}`],
        ['Nombre de Usuario', `${newOrderData.client_name || '-'}`],
        ['Fecha', `${fechaPedidoLegible}`],
        ['Tipo de Envío', `${newOrderData.deliveryType}`],
        ['Entrega en Venezuela', `${newOrderData.deliveryVenezuela}`],
        ['Producto', `${newOrderData.productName}`],
        ['Cantidad', `${newOrderData.quantity}`],
        ['Presupuesto Estimado', `$${newOrderData.estimatedBudget}`],
        ['Descripción', newOrderData.description || '-'],
        ['Especificaciones', newOrderData.specifications || '-'],
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
        const imgData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(newOrderData.productImage as Blob);
        });
        doc.addImage(imgData, 'JPEG', imgX, currentY, imgWidth, imgHeight);
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
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 12,
            halign: 'center',
            cellPadding: 3
          },
          bodyStyles: {
            fontSize: 10,
            cellPadding: 3,
            textColor: colors.text
          },
          alternateRowStyles: {
            fillColor: colors.light
          },
          columnStyles: {
            0: { cellWidth: 50, fontStyle: 'bold', textColor: colors.secondary },
            1: { cellWidth: tableWidth - 50 }
          }
        });
      } else if (newOrderData.requestType === 'link') {
        // Tabla ocupando todo el ancho
        doc.setFillColor(...colors.light);
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
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 12,
            halign: 'center',
            cellPadding: 4
          },
          bodyStyles: {
            fontSize: 11,
            cellPadding: 4,
            textColor: colors.text
          },
          alternateRowStyles: {
            fillColor: colors.light
          },
          columnStyles: {
            0: { cellWidth: 60, fontStyle: 'bold', textColor: colors.secondary },
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

      // Subir PDF a Supabase Storage
      const pdfBlob = doc.output('blob');
      let folder: string = String(newOrderData.deliveryType);
      if (folder === 'doorToDoor') folder = 'door-to-door';
      // Usar el client_id actual (autenticado) para el PDF y pedido
  const nombrePDFCorr = `${newOrderData.productName}_${fechaPedidoLegible}_${numeroPedido}_${clientId || ''}_${newOrderData.deliveryVenezuela}.pdf`;
      supabase.storage
        .from('orders')
        .upload(`${folder}/${nombrePDFCorr}`, pdfBlob, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'application/pdf',
        })
        .then(async (result: any) => {
          const { error } = result;
          if (error) {
            alert(`Error al subir el PDF al bucket: ${error.message || JSON.stringify(error)}`);
            console.error('Supabase Storage upload error:', error);
          } else {
            // Log del resultado de la subida
            console.log('Resultado de upload:', result);
            // Construir el URL público manualmente
            const pdfUrl = `https://bgzsodcydkjqehjafbkv.supabase.co/storage/v1/object/public/orders/${folder}/${nombrePDFCorr}`;
            console.log('pdfUrl:', pdfUrl);

            // Insertar pedido en la tabla 'orders'
            const pedidoInsert = {
              client_id: clientId || '',
              productName: newOrderData.productName,
              description: newOrderData.description,
              quantity: newOrderData.quantity,
              estimatedBudget: Number(newOrderData.estimatedBudget),
              deliveryType: newOrderData.deliveryVenezuela,
              shippingType: newOrderData.deliveryType,
              imgs: pdfUrl ? [pdfUrl] : [],
              links: newOrderData.productUrl ? [newOrderData.productUrl] : [],
              pdfRoutes: pdfUrl,
              state: 1,
              order_origin: 'vzla',
              elapsed_time: null,
              asignedEVzla: null,
            };
            console.log('Insertando pedido en la tabla orders:', pedidoInsert);
            const { error: dbInsertError } = await supabase
              .from('orders')
              .insert([
                pedidoInsert
              ]);
            if (dbInsertError) {
              alert('Error al guardar el pedido en la base de datos.');
            } else {
              setShowSuccessAnimation(true);
              setTimeout(() => {
                setIsNewOrderModalOpen(false);
                setCurrentStep(1);
                setNewOrderData({
                  productName: '',
                  description: '',
                  quantity: 1,
                  specifications: '',
                  requestType: 'link',
                  deliveryType: 'doorToDoor',
                  deliveryVenezuela: '',
                  estimatedBudget: '',
                  client_id: ''
                });
              }, 1500);
              // Refrescar desde BD para mostrar el pedido real sin duplicados
              fetchOrders();
            }
          }
        });
    })();
  };

  // Validación de imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('Solo se permiten imágenes JPG, JPEG, PNG o WEBP.');
        return;
      }
      setNewOrderData({ ...newOrderData, productImage: file });
    }
  };

  // Funciones para drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      
      if (!validTypes.includes(file.type)) {
        alert('Solo se permiten imágenes JPG, JPEG, PNG o WEBP.');
        return;
      }
      
      setNewOrderData({ ...newOrderData, productImage: file });
    }
  };

  // Validaciones de campos
  const isValidQuantity = (value: any) => {
    return /^[0-9]+$/.test(String(value)) && Number(value) > 0;
  };
  const isValidBudget = (value: any) => {
    return /^[0-9]+(\.[0-9]{1,2})?$/.test(String(value)) && Number(value) > 0;
  };
  const isValidUrl = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };
  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        if (!newOrderData.productName || !newOrderData.description) return false;
        if (!isValidQuantity(newOrderData.quantity)) return false;
        if (newOrderData.requestType === 'link') {
          if (!newOrderData.productUrl || !isValidUrl(newOrderData.productUrl)) return false;
        }
        return true;
      case 2:
        if (!newOrderData.deliveryType || !newOrderData.deliveryVenezuela) return false;
        if (!isValidBudget(newOrderData.estimatedBudget)) return false;
        return true;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Información del Producto';
      case 2: return 'Detalles del Envío';
      case 3: return 'Resumen y Confirmación';
      default: return '';
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return 'Cuéntanos qué producto deseas importar';
      case 2: return 'Configura cómo quieres recibir tu pedido';
      case 3: return 'Revisa y confirma tu solicitud';
      default: return '';
    }
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen flex overflow-x-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      <Sidebar 
        isExpanded={sidebarExpanded} 
        setIsExpanded={setSidebarExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        userRole="client"
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={stats.pending} 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Mis Pedidos"
          subtitle="Gestiona y sigue el estado de tus pedidos"
        />
        
        <div className="p-4 md:p-5 lg:p-6 space-y-6 md:space-y-6 lg:space-y-8">
          {/* Header de la página */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
            <div>
              <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Mis Pedidos</h1>
              <p className={`text-xs md:text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Gestiona y sigue el estado de tus pedidos</p>
            </div>
            
            {/* Botón Nuevo Pedido */}
            <Dialog open={isNewOrderModalOpen} onOpenChange={setIsNewOrderModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Pedido
                </Button>
              </DialogTrigger>
              <DialogContent ref={modalRef} className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
                <DialogHeader className="text-center pb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                    <DialogTitle className="relative text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in-up">
                      ✨ Crear Nuevo Pedido
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-lg text-slate-600 mt-2">
                    Sigue los pasos para crear tu solicitud de importación
                  </DialogDescription>
                </DialogHeader>

                {/* Enhanced Progress Bar */}
                <div className={`space-y-4 mb-8 transition-all duration-300 ${
                  isTransitioning ? 'opacity-75' : 'opacity-100'
                }`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">Paso {currentStep} de 3</span>
                    <span className="font-bold text-blue-600">{Math.round((currentStep / 3) * 100)}% completado</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500 ease-out relative"
                        style={{ width: `${(currentStep / 3) * 100}%` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                      </div>
                    </div>
                    {/* Step Indicators */}
                    <div className="flex justify-between mt-2">
                      {[1, 2, 3].map((step) => (
                        <div key={step} className="flex flex-col items-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                            step <= currentStep 
                              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-110' 
                              : 'bg-slate-300 text-slate-600'
                          }`}>
                            {step < currentStep ? '✓' : step}
                          </div>
                          <span className={`text-xs mt-1 transition-colors duration-300 ${
                            step <= currentStep ? 'text-blue-600 font-medium' : 'text-slate-500'
                          }`}>
                            {step === 1 ? 'Producto' : step === 2 ? 'Envío' : 'Resumen'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                                  {/* Step Content with Smooth Transitions */}
                  <div className={`space-y-6 transition-all duration-300 ${
                    isTransitioning 
                      ? stepDirection === 'next' 
                        ? 'opacity-0 transform translate-x-4' 
                        : 'opacity-0 transform -translate-x-4'
                      : 'opacity-100 transform translate-x-0'
                  }`}>
                  {/* Enhanced Success Animation */}
                  {showSuccessAnimation && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up">
                      <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-12 text-center space-y-6 shadow-2xl border border-slate-200/50 max-w-md mx-4 transform animate-fade-in-up">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="bg-green-500 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                            <Check className="w-12 h-12 text-white" />
                          </div>
                          <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            ¡Pedido Creado!
                          </h3>
                          <p className="text-slate-600 text-lg">Tu solicitud ha sido enviada exitosamente</p>
                          <Button
                            onClick={() => setShowSuccessAnimation(false)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg mt-4"
                          >
                            ¡Perfecto!
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Step Header */}
                  <div className={`text-center space-y-4 mb-8 transition-all duration-300 ${
                    isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'
                  }`}>
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur-lg opacity-10 animate-pulse"></div>
                      <div className="relative bg-white/80 backdrop-blur-sm rounded-lg p-6 border border-slate-200/50">
                        <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                          {getStepTitle(currentStep)}
                        </h3>
                        <p className="text-slate-600">{getStepDescription(currentStep)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Step 1: Información del Producto */}
                  {currentStep === 1 && (
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <Label htmlFor="productName" className="text-sm font-semibold text-slate-700 flex items-center">
                          <Package className="w-4 h-4 mr-2 text-blue-600" />
                          Nombre del Producto
                        </Label>
                        <div className="relative group">
                          <Input
                            id="productName"
                            value={newOrderData.productName}
                            onChange={(e) => setNewOrderData({ ...newOrderData, productName: e.target.value })}
                            placeholder="Ej: iPhone 15 Pro Max"
                            className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm border-slate-200 group-hover:border-blue-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-blue-600" />
                          Descripción del Producto
                        </Label>
                        <div className="relative group">
                          <Textarea
                            id="description"
                            value={newOrderData.description}
                            onChange={(e) => setNewOrderData({ ...newOrderData, description: e.target.value })}
                            placeholder="Describe detalladamente el producto que deseas importar..."
                            rows={4}
                            className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm border-slate-200 group-hover:border-blue-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="quantity" className="text-sm font-semibold text-slate-700 flex items-center">
                          <Hash className="w-4 h-4 mr-2 text-blue-600" />
                          Cantidad
                        </Label>
                        <div className="relative group">
                          <Input
                            id="quantity"
                            type="number"
                            min="1"
                            value={newOrderData.quantity === 0 ? '' : newOrderData.quantity}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === '') {
                                setNewOrderData({ ...newOrderData, quantity: 0 });
                              } else if (/^[0-9]+$/.test(val)) {
                                setNewOrderData({ ...newOrderData, quantity: parseInt(val) });
                              }
                            }}
                            className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm border-slate-200 group-hover:border-blue-300"
                          />
                          {newOrderData.quantity <= 0 && (
                            <p className="text-xs text-red-500 mt-1">La cantidad debe ser un número mayor que cero.</p>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="specifications" className="text-sm font-semibold text-slate-700 flex items-center">
                          <Settings className="w-4 h-4 mr-2 text-blue-600" />
                          Especificaciones Técnicas
                        </Label>
                        <div className="relative group">
                          <Textarea
                            id="specifications"
                            value={newOrderData.specifications}
                            onChange={(e) => setNewOrderData({ ...newOrderData, specifications: e.target.value })}
                            placeholder="Color, talla, modelo, características específicas, etc."
                            rows={3}
                            className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm border-slate-200 group-hover:border-blue-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>

                      {/* Tipo de Solicitud */}
                      <div className="space-y-4">
                        <Label className="text-sm font-semibold text-slate-700 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-blue-600" />
                          Tipo de Solicitud
                        </Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div
                            className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                              newOrderData.requestType === 'link'
                                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg'
                                : 'border-slate-200 hover:border-blue-300 bg-white/80 backdrop-blur-sm hover:shadow-md'
                            }`}
                            onClick={() => setNewOrderData({ ...newOrderData, requestType: 'link' })}
                            onMouseEnter={() => setIsLinkHovered(true)}
                            onMouseLeave={() => setIsLinkHovered(false)}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Player
                                  key={isLinkHovered ? 'link-active' : 'link-inactive'}
                                  src={linkLottie}
                                  className="w-5 h-5"
                                  loop={false}
                                  autoplay={isLinkHovered}
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">Link del Producto</p>
                                <p className="text-sm text-slate-600">Pega el enlace de la tienda</p>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`p-6 border-2 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                              newOrderData.requestType === 'photo'
                                ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-lg'
                                : 'border-slate-200 hover:border-blue-300 bg-white/80 backdrop-blur-sm hover:shadow-md'
                            }`}
                            onClick={() => setNewOrderData({ ...newOrderData, requestType: 'photo' })}
                            onMouseEnter={() => setIsCameraHovered(true)}
                            onMouseLeave={() => setIsCameraHovered(false)}
                          >
                            <div className="flex items-center space-x-4">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Player
                                  key={isCameraHovered ? 'camera-active' : 'camera-inactive'}
                                  src={cameraLottie}
                                  className="w-5 h-5"
                                  loop={false}
                                  autoplay={isCameraHovered}
                                />
                              </div>
                              <div>
                                <p className="font-semibold text-slate-800">Foto + Descripción</p>
                                <p className="text-sm text-slate-600">Sube una imagen del producto</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {newOrderData.requestType === 'link' && (
                          <div className="space-y-2">
                            <Label htmlFor="productUrl">URL del Producto *</Label>
                            <Input
                              id="productUrl"
                              type="url"
                              value={newOrderData.productUrl || ''}
                              onChange={(e) => setNewOrderData({ ...newOrderData, productUrl: e.target.value })}
                              placeholder="https://ejemplo.com/producto"
                              className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                                newOrderData.requestType === 'link' && !newOrderData.productUrl ? 'border-red-300 focus:ring-red-500' : ''
                              }`}
                            />

                            {newOrderData.productUrl && !isValidUrl(newOrderData.productUrl) && (
                              <p className="text-xs text-red-500 mt-1">La URL no es válida.</p>
                            )}
                          </div>
                        )}

                        {newOrderData.requestType === 'photo' && (
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-slate-700 flex items-center">
                              <Image className="w-4 h-4 mr-2 text-blue-600" />
                              Imagen del Producto
                            </Label>
                            <div 
                              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 bg-white/80 backdrop-blur-sm group cursor-pointer ${
                                isDragOver 
                                  ? 'border-blue-500 bg-blue-50 shadow-lg' 
                                  : 'border-slate-300 hover:border-blue-400 hover:shadow-lg'
                              }`}
                              onMouseEnter={() => setIsFolderHovered(true)}
                              onMouseLeave={() => setIsFolderHovered(false)}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={handleDrop}
                            >
                              <div className="w-12 h-12 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                <Player
                                  key={isFolderHovered ? 'folder-active' : 'folder-inactive'}
                                  src={folderLottie}
                                  className="w-6 h-6"
                                  loop={false}
                                  autoplay={isFolderHovered}
                                />
                              </div>
                              <p className="text-sm text-slate-600 mb-4 font-medium">
                                {newOrderData.productImage 
                                  ? newOrderData.productImage.name 
                                  : 'Arrastra una imagen aquí o haz clic para seleccionar'
                                }
                              </p>
                              <Button
                                variant="outline"
                                onClick={() => document.getElementById('imageUpload')?.click()}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Seleccionar Imagen
                              </Button>
                              <input
                                id="imageUpload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Detalles del Envío */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label>Tipo de Envío</Label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              newOrderData.deliveryType === 'doorToDoor'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                            onClick={() => setNewOrderData({ ...newOrderData, deliveryType: 'doorToDoor' })}
                            onMouseEnter={() => setHoveredDeliveryOption('doorToDoor')}
                            onMouseLeave={() => setHoveredDeliveryOption(null)}
                          >
                            <div className="text-center space-y-2">
                              <div className="w-8 h-8 mx-auto">
                                <Player
                                  key={hoveredDeliveryOption === 'doorToDoor' ? 'truck-active' : 'truck-inactive'}
                                  src={truckLottie}
                                  className="w-full h-full"
                                  loop={false}
                                  autoplay={hoveredDeliveryOption === 'doorToDoor'}
                                />
                              </div>
                              <p className="font-medium">Puerta a Puerta</p>
                              <p className="text-sm text-slate-600">Recogemos en tu dirección</p>
                            </div>
                          </div>
                          <div
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              newOrderData.deliveryType === 'air'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                            onClick={() => setNewOrderData({ ...newOrderData, deliveryType: 'air' })}
                            onMouseEnter={() => setHoveredDeliveryOption('air')}
                            onMouseLeave={() => setHoveredDeliveryOption(null)}
                          >
                            <div className="text-center space-y-2">
                              <div className="w-8 h-8 mx-auto">
                                <Player
                                  key={hoveredDeliveryOption === 'air' ? 'airplane-active' : 'airplane-inactive'}
                                  src={airPlaneLottie}
                                  className="w-full h-full"
                                  loop={false}
                                  autoplay={hoveredDeliveryOption === 'air'}
                                />
                              </div>
                              <p className="font-medium">Envío Aéreo</p>
                              <p className="text-sm text-slate-600">Envío rápido por avión</p>
                            </div>
                          </div>
                          <div
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              newOrderData.deliveryType === 'maritime'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                            onClick={() => setNewOrderData({ ...newOrderData, deliveryType: 'maritime' })}
                            onMouseEnter={() => setHoveredDeliveryOption('maritime')}
                            onMouseLeave={() => setHoveredDeliveryOption(null)}
                          >
                            <div className="text-center space-y-2">
                              <div className="w-8 h-8 mx-auto">
                                <Player
                                  key={hoveredDeliveryOption === 'maritime' ? 'ship-active' : 'ship-inactive'}
                                  src={cargoShipLottie}
                                  className="w-full h-full"
                                  loop={false}
                                  autoplay={hoveredDeliveryOption === 'maritime'}
                                />
                              </div>
                              <p className="font-medium">Envío Marítimo</p>
                              <p className="text-sm text-slate-600">Envío económico por barco</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryVenezuela">Opción de Entrega en Venezuela</Label>
                        <Select value={newOrderData.deliveryVenezuela} onValueChange={(value) => setNewOrderData({ ...newOrderData, deliveryVenezuela: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona cómo quieres recibir tu pedido" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pickup">Recoger en oficina</SelectItem>
                            <SelectItem value="delivery">Entrega a domicilio</SelectItem>
                            <SelectItem value="express">Entrega express</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estimatedBudget">Presupuesto Estimado (USD)</Label>
                        <Input
                          id="estimatedBudget"
                          type="number"
                          min="0"
                          value={newOrderData.estimatedBudget}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (/^[0-9]*\.?[0-9]{0,2}$/.test(val)) {
                              setNewOrderData({ ...newOrderData, estimatedBudget: val });
                            }
                          }}
                          placeholder="Ej: 500"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                        {newOrderData.estimatedBudget && !isValidBudget(newOrderData.estimatedBudget) && (
                          <p className="text-xs text-red-500 mt-1">El presupuesto estimado debe ser un monto válido.</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Resumen y Confirmación */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                        <h4 className="font-semibold text-lg">Resumen de tu Solicitud</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-600">Producto</p>
                            <p className="font-medium">{newOrderData.productName}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-600">Cantidad</p>
                            <p className="font-medium">{newOrderData.quantity}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-600">Tipo de Envío</p>
                            <p className="font-medium">
                              {newOrderData.deliveryType === 'doorToDoor' && 'Puerta a Puerta'}
                              {newOrderData.deliveryType === 'air' && 'Envío Aéreo'}
                              {newOrderData.deliveryType === 'maritime' && 'Envío Marítimo'}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-600">Presupuesto Estimado</p>
                            <p className="font-medium">${newOrderData.estimatedBudget}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-600">Descripción</p>
                          <p className="text-sm">{newOrderData.description}</p>
                        </div>

                        {newOrderData.specifications && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-600">Especificaciones</p>
                            <p className="text-sm">{newOrderData.specifications}</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-900">¡Casi listo!</p>
                            <p className="text-sm text-blue-700">
                              Tu solicitud será revisada por nuestro equipo y recibirás una cotización en las próximas 24 horas.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Enhanced Navigation Buttons */}
                <div className="flex justify-between pt-8 border-t border-slate-200/50">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={currentStep === 1 || isTransitioning}
                    className="transition-all duration-300 hover:bg-slate-50 hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isTransitioning ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-slate-600 border-t-transparent rounded-full animate-spin mr-2"></div>
                        Transicionando...
                      </div>
                    ) : (
                      <>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Anterior
                      </>
                    )}
                  </Button>
                  
                  <div className="flex justify-center">
                    {currentStep < 3 ? (
                      <Button
                        onClick={handleNextStep}
                        disabled={!canProceedToNext() || isTransitioning}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isTransitioning ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Transicionando...
                          </div>
                        ) : (
                          <>
                            Siguiente
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmitOrder}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Crear Pedido
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-slate-600">Total Pedidos</p>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Package className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-slate-600">Pendientes</p>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-6 w-6 md:h-8 md:w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-slate-600">En Proceso</p>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-blue-600">{stats.processing}</p>
                  </div>
                  <Truck className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-slate-600">Enviados</p>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-purple-600">{stats.shipped}</p>
                  </div>
                  <MapPin className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-slate-600">Total Gastado</p>
                    <p className="text-lg md:text-xl lg:text-2xl font-bold text-green-600">${stats.totalSpent.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-6 w-6 md:h-8 md:w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y búsqueda */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por producto, ID o tracking..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                    <SelectItem value="processing">En proceso</SelectItem>
                    <SelectItem value="shipped">Enviados</SelectItem>
                    <SelectItem value="delivered">Entregados</SelectItem>
                    <SelectItem value="cancelled">Cancelados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Lista de pedidos */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle>Mis Pedidos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-3 md:p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-4">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="flex flex-col">
                          <p className="font-medium text-xs md:text-sm">{order.id}</p>
                          <p className="text-xs text-slate-600">{order.product}</p>
                        </div>
                        <Badge className={`${getStatusColor(order.status)} text-xs md:text-sm`}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] md:text-[11px] uppercase tracking-wide text-slate-500">
                          {order.status === 'pending' && 'Presupuesto'}
                          {order.status === 'quoted' && 'Cotización a pagar'}
                          {order.status !== 'pending' && order.status !== 'quoted' && 'Monto'}
                        </p>
                        <p className="font-medium text-base md:text-lg">
                          {order.status === 'pending' && typeof order.estimatedBudget !== 'undefined' && order.estimatedBudget !== null
                            ? `$${Number(order.estimatedBudget).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                            : order.status === 'quoted' && typeof order.totalQuote !== 'undefined' && order.totalQuote !== null
                              ? `$${Number(order.totalQuote).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                              : order.amount}
                        </p>
                        <p className="text-xs text-slate-600">Tracking: {order.tracking || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs md:text-sm">
                        <span>Progreso</span>
                        <span>{order.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 md:h-2">
                        <div 
                          className={`h-1.5 md:h-2 rounded-full ${getProgressColor(order.progress)}`} 
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between gap-2 md:gap-0 text-xs text-slate-600">
                        <span>Entrega estimada: {order.estimatedDelivery}</span>
                        <div className="flex gap-1 md:gap-2">
                          {order.status === 'quoted' && (
                            <Button 
                              size="sm" 
                              className="h-5 md:h-6 px-2 md:px-3 bg-green-600 hover:bg-green-700 text-white text-xs"
                              onClick={() => handlePaymentClick(order)}
                            >
                              <DollarSign className="h-3 w-3 mr-1" />
                              Pagar
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 md:h-6 px-1 md:px-2 text-xs"
                            onClick={() => handleViewDetails(order)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver detalles
                          </Button>
                          <Button variant="ghost" size="sm" className="h-5 md:h-6 px-1 md:px-2 text-xs">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Soporte
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredOrders.length === 0 && (
                  <div className="text-center py-8 md:py-10">
                    <Package className="h-10 w-10 md:h-12 md:w-12 text-slate-400 mx-auto mb-3 md:mb-4" />
                    <p className="text-slate-500 text-sm md:text-base">No se encontraron pedidos</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Modal de detalles del pedido */}
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
          {selectedOrder && (
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalles del Pedido: {selectedOrder.id}</DialogTitle>
                <DialogDescription>
                  Información completa y documentos del pedido
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Producto</p>
                    <p className="text-lg">{selectedOrder.product}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {selectedOrder.status === 'pending' && 'Presupuesto'}
                      {selectedOrder.status === 'quoted' && 'Cotización a pagar'}
                      {selectedOrder.status !== 'pending' && selectedOrder.status !== 'quoted' && 'Monto'}
                    </p>
                    <p className="text-lg font-bold text-green-600">
                      {selectedOrder.status === 'pending' && typeof selectedOrder.estimatedBudget !== 'undefined' && selectedOrder.estimatedBudget !== null
                        ? `$${Number(selectedOrder.estimatedBudget).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                        : selectedOrder.status === 'quoted' && typeof selectedOrder.totalQuote !== 'undefined' && selectedOrder.totalQuote !== null
                          ? `$${Number(selectedOrder.totalQuote).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                          : selectedOrder.amount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Estado</p>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {getStatusText(selectedOrder.status)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">Tracking</p>
                    <p className="text-sm font-mono">{selectedOrder.tracking}</p>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Descripción</p>
                  <p className="text-sm text-slate-700">{selectedOrder.description}</p>
                </div>

                {/* Progreso */}
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">Progreso del pedido</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progreso actual</span>
                      <span>{selectedOrder.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${getProgressColor(selectedOrder.progress)}`} 
                        style={{ width: `${selectedOrder.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-600">
                      Entrega estimada: {selectedOrder.estimatedDelivery}
                    </p>
                  </div>
                </div>

                {/* Documentos */}
                {selectedOrder.documents && selectedOrder.documents.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">Documentos</p>
                    <div className="space-y-2">
                      {selectedOrder.documents.map((doc, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                          <div className="w-4 h-4 text-blue-600">
                            {doc.type === 'image' ? '📷' : '🔗'}
                          </div>
                          <span className="text-sm">{doc.label}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 ml-auto">
                            Ver
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Contactar Soporte
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Descargar Factura
                  </Button>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* Modal de Pago */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                💳 Realizar Pago
              </DialogTitle>
              <DialogDescription className="text-center">
                {paymentStep === 1 ? 'Selecciona tu método de pago preferido' : 'Confirma los detalles de tu pago'}
              </DialogDescription>
            </DialogHeader>

            {selectedOrderForPayment && (
              <div className="space-y-6">
                {/* Información del pedido */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{selectedOrderForPayment.product}</h3>
                      <p className="text-sm text-slate-600">{selectedOrderForPayment.id}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">{selectedOrderForPayment.amount}</p>
                      <p className="text-xs text-slate-500 mt-1">Cotización válida hasta: 25/01/2024</p>
                    </div>
                  </div>
                </div>

                {/* Paso 1: Selección de método de pago */}
                {paymentStep === 1 && (
                  <div className="space-y-4 payment-step-transition">
                    <div className="grid grid-cols-1 gap-3">
                      {paymentMethods.map((method) => (
                        <div
                          key={method.id}
                          className="p-4 border-2 border-slate-200 rounded-xl cursor-pointer hover:border-blue-300 hover:shadow-md payment-method-card group"
                          onClick={() => handlePaymentMethodSelect(method)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-2xl">{method.icon}</div>
                              <div>
                                <h4 className="font-semibold">{method.name}</h4>
                                <p className="text-sm text-slate-600">{method.description}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge className={`${
                                method.validation === 'automatic' 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                              }`}>
                                {method.validation === 'automatic' ? '⚡ Automático' : ' Manual'}
                              </Badge>
                              <p className="text-xs text-slate-500 mt-1">{method.currency}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Paso 2: Detalles del método seleccionado */}
                {paymentStep === 2 && selectedPaymentMethod && (
                  <div className="space-y-6 payment-step-transition">
                    {/* Método seleccionado */}
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{selectedPaymentMethod.icon}</div>
                        <div>
                          <h4 className="font-semibold">{selectedPaymentMethod.name}</h4>
                          <p className="text-sm text-slate-600">{selectedPaymentMethod.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Información de pago */}
                    <div className="space-y-4 payment-info-card">
                      <h4 className="font-semibold text-lg">📋 Información de Pago</h4>
                      
                      {selectedPaymentMethod.id === 'mobile' && (
                        <div className="space-y-3">
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700">Número de Teléfono:</p>
                            <p className="text-lg font-mono font-bold text-blue-600">{selectedPaymentMethod.details?.phoneNumber}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700">Referencia:</p>
                            <p className="text-lg font-mono font-bold text-green-600">{selectedPaymentMethod.details?.reference}</p>
                          </div>
                        </div>
                      )}

                      {selectedPaymentMethod.id === 'transfer' && (
                        <div className="space-y-3">
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700">Banco:</p>
                            <p className="text-lg font-bold text-blue-600">{selectedPaymentMethod.details?.bankName}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700">Número de Cuenta:</p>
                            <p className="text-lg font-mono font-bold text-green-600">{selectedPaymentMethod.details?.accountNumber}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700">Referencia:</p>
                            <p className="text-lg font-mono font-bold text-purple-600">{selectedPaymentMethod.details?.reference}</p>
                          </div>
                        </div>
                      )}

                      {(selectedPaymentMethod.id === 'binance' || selectedPaymentMethod.id === 'zelle' || selectedPaymentMethod.id === 'paypal') && (
                        <div className="space-y-3">
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700">Email:</p>
                            <p className="text-lg font-mono font-bold text-blue-600">{selectedPaymentMethod.details?.email}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700">Referencia:</p>
                            <p className="text-lg font-mono font-bold text-green-600">{selectedPaymentMethod.details?.reference}</p>
                          </div>
                        </div>
                      )}

                      {/* Instrucciones */}
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <div className="text-yellow-600 mt-0.5">⚠️</div>
                          <div>
                            <p className="font-medium text-yellow-800">Instrucciones importantes:</p>
                            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                              <li>• Realiza el pago con la referencia exacta</li>
                              <li>• Guarda el comprobante de pago</li>
                              <li>• El proceso puede tomar hasta 24 horas</li>
                              {selectedPaymentMethod.validation === 'manual' && (
                                <li>• Nuestro equipo validará tu pago manualmente</li>
                              )}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Botones de navegación */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={handlePaymentBack}
                    className="flex-1"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    {paymentStep === 1 ? 'Cancelar' : 'Volver'}
                  </Button>
                  
                  {paymentStep === 2 && (
                    <Button 
                      onClick={handlePaymentConfirm}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Confirmar Pago
                    </Button>
                  )}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      
      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .step-transition-enter {
          animation: slideInFromRight 0.3s ease-out;
        }
        
        .step-transition-enter-prev {
          animation: slideInFromLeft 0.3s ease-out;
        }
        
        .step-transition-exit {
          animation: fadeInUp 0.3s ease-out reverse;
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.4s ease-out;
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideInFromBottom {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .payment-method-card {
          transition: all 0.2s ease-in-out;
        }
        
        .payment-method-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }
        
        .payment-step-transition {
          animation: scaleIn 0.3s ease-out;
        }
        
        .payment-info-card {
          animation: slideInFromBottom 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}
