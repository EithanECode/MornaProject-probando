"use client";

// Force dynamic rendering to avoid SSR issues with html2canvas
export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useTheme } from 'next-themes';
import { default as dynamicImport } from 'next/dynamic';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useAdminOrders } from '@/hooks/use-admin-orders';
import { useAdminOrdersList, type AdminOrderListItem } from '@/hooks/use-admin-orders-list';
import { useClientsInfo } from '@/hooks/use-clients-info';
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
  MapPin,
  Truck,
  Camera,
  Upload,
  FileText,
  Hash,
  Settings,
  Image,
  Target,
  DollarSign,
  MessageSquare,
  ArrowLeft,
  ArrowRight,
  Check
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import VenezuelaOrdersTabContent from '@/components/venezuela/VenezuelaOrdersTabContent';
import ChinaOrdersTabContent from '@/components/china/ChinaOrdersTabContent';

// jsPDF se importará dinámicamente para evitar errores de SSR
// html2canvas se importará dinámicamente para evitar errores de SSR

// Lazy load components pesados
const LazyExportButton = dynamicImport(() => Promise.resolve(({ onClick, label }: { onClick: () => void; label: string }) => (
  <Button variant="outline" size="sm" onClick={onClick}>
    <Download className="w-4 h-4 mr-2" />
    {label}
  </Button>
)), { ssr: false });

// Importar Player de Lottie dinámicamente sin SSR
const Player = dynamicImport(
  () => import('@lottiefiles/react-lottie-player').then((mod) => mod.Player),
  { ssr: false }
);

// Local UI shape derived from DB
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

// ================== MAPEOS DE ESTADOS (1..13) ==================
// Referencia cruzada con `app/cliente/mis-pedidos/page.tsx` donde:
// 1 creado, 2 recibido, 3 cotizado, 4-7 procesando, 8-9 enviado, 10-12 pasos finales, 13 entregado.
// En la vista admin usamos un subconjunto de estados UI:
//   'esperando-pago' | 'pendiente-china' | 'pendiente-vzla' | 'en-transito' | 'entregado' | 'cancelado'
// Objetivo: cubrir todos los estados 1..13 y evitar que caigan en default 'pendiente-china'.
// Si en el futuro se requiere granularidad (aduana, listo-entrega, etc.) se pueden añadir claves nuevas.

const NUMERIC_STATE_TO_UI: Record<number, Order['status']> = {
  1: 'esperando-pago',      // Creado / esperando confirmación de pago
  2: 'pendiente-china',     // Recibido, pendiente gestión China
  3: 'pendiente-china',     // Cotizado (seguimos tratándolo como pendiente-china hasta asignación Vzla)
  4: 'pendiente-vzla',      // Asignado / pendiente Venezuela
  5: 'en-transito',         // Procesando / logística
  6: 'en-transito',
  7: 'en-transito',
  8: 'en-transito',         // Enviado a Vzla
  9: 'en-transito',         // Llegando a Vzla
  10: 'en-transito',        // Aduana
  11: 'en-transito',        // Recibido en almacén
  12: 'en-transito',        // Listo para entrega
  13: 'entregado',          // Entregado final
};

// Estado cancelado no está definido en la serie 1..13; mantenemos 9 (provisional) para compat si existía antes.
// Si se define un número oficial para cancelado, actualizar aquí.
const CANCELLED_NUMERIC_FALLBACK = 9; // TODO: reemplazar si existe estado numérico real de cancelación

// Para operaciones de escritura (UI -> numérico) elegimos un número representativo.
const UI_STATE_TO_NUMERIC: Record<Order['status'], number> = {
  'esperando-pago': 1,
  'pendiente-china': 2, // Usamos 2 (recibido) como punto representativo inicial
  'pendiente-vzla': 4,
  'en-transito': 5,     // Primer estado de tránsito
  'entregado': 13,
  'cancelado': CANCELLED_NUMERIC_FALLBACK,
};

// Memoizar las configuraciones para evitar recreaciones
const STATUS_CONFIG = {
  // Dark theme – hover sólo al pasar por el badge (sin depender del hover de la fila)
  'pendiente-china': {
    color: [
      'bg-yellow-700 border-yellow-800 text-yellow-100',
      'hover:brightness-110',
      'hover:ring-1 hover:ring-yellow-700/50',
      'transition-colors duration-200'
    ].join(' '),
    icon: AlertCircle
  },
  'pendiente-vzla': {
    color: [
      'bg-yellow-700 border-yellow-800 text-yellow-100',
      'hover:brightness-110',
      'hover:ring-1 hover:ring-yellow-700/50',
      'transition-colors duration-200'
    ].join(' '),
    icon: AlertCircle
  },
  'esperando-pago': {
    color: [
      'bg-orange-700 border-orange-800 text-orange-100',
      'hover:brightness-110',
      'hover:ring-1 hover:ring-orange-700/50',
      'transition-colors duration-200'
    ].join(' '),
    icon: Clock
  },
  'en-transito': {
    color: [
      'bg-blue-800 border-blue-900 text-blue-100',
      'hover:brightness-110',
      'hover:ring-1 hover:ring-blue-800/50',
      'transition-colors duration-200'
    ].join(' '),
    icon: Plane
  },
  'entregado': {
    color: [
      'bg-green-800 border-green-900 text-green-100',
      'hover:brightness-110',
      'hover:ring-1 hover:ring-green-800/50',
      'transition-colors duration-200'
    ].join(' '),
    icon: CheckCircle
  },
  'cancelado': {
    color: [
      'bg-red-800 border-red-900 text-red-100',
      'hover:brightness-110',
      'hover:ring-1 hover:ring-red-800/50',
      'transition-colors duration-200'
    ].join(' '),
    icon: AlertCircle
  }
} as const;

const ASSIGNED_CONFIG = {
  'china': {
    color: [
      'bg-red-800 border-red-900 text-red-100',
      'hover:brightness-110',
      'hover:ring-1 hover:ring-red-800/50',
      'transition-colors duration-200'
    ].join(' ')
  },
  'vzla': {
    color: [
      'bg-blue-800 border-blue-900 text-blue-100',
      'hover:brightness-110',
      'hover:ring-1 hover:ring-blue-800/50',
      'transition-colors duration-200'
    ].join(' ')
  }
} as const;

// Light theme colors
const STATUS_CONFIG_LIGHT = {
  // Light theme – hover sólo al pasar por el badge (sin group-hover)
  'pendiente-china': {
    color: [
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'hover:bg-yellow-50',
      'hover:border-yellow-300',
      'hover:ring-1 hover:ring-yellow-200',
      'transition-colors duration-200'
    ].join(' '),
    icon: AlertCircle
  },
  'pendiente-vzla': {
    color: [
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'hover:bg-yellow-50',
      'hover:border-yellow-300',
      'hover:ring-1 hover:ring-yellow-200',
      'transition-colors duration-200'
    ].join(' '),
    icon: AlertCircle
  },
  'esperando-pago': {
    color: [
      'bg-orange-100 text-orange-800 border-orange-200',
      'hover:bg-orange-50',
      'hover:border-orange-300',
      'hover:ring-1 hover:ring-orange-200',
      'transition-colors duration-200'
    ].join(' '),
    icon: Clock
  },
  'en-transito': {
    color: [
      'bg-blue-100 text-blue-800 border-blue-200',
      'hover:bg-blue-50',
      'hover:border-blue-300',
      'hover:ring-1 hover:ring-blue-200',
      'transition-colors duration-200'
    ].join(' '),
    icon: Plane
  },
  'entregado': {
    color: [
      'bg-green-100 text-green-800 border-green-200',
      'hover:bg-green-50',
      'hover:border-green-300',
      'hover:ring-1 hover:ring-green-200',
      'transition-colors duration-200'
    ].join(' '),
    icon: CheckCircle
  },
  'cancelado': {
    color: [
      'bg-red-100 text-red-800 border-red-200',
      'hover:bg-red-50',
      'hover:border-red-300',
      'hover:ring-1 hover:ring-red-200',
      'transition-colors duration-200'
    ].join(' '),
    icon: AlertCircle
  }
} as const;

const ASSIGNED_CONFIG_LIGHT = {
  'china': {
    color: [
      'bg-red-100 text-red-800 border-red-200',
      'hover:bg-red-50',
      'hover:border-red-300',
      'hover:ring-1 hover:ring-red-200',
      'transition-colors duration-200'
    ].join(' ')
  },
  'vzla': {
    color: [
      'bg-blue-100 text-blue-800 border-blue-200',
      'hover:bg-blue-50',
      'hover:border-blue-300',
      'hover:ring-1 hover:ring-blue-200',
      'transition-colors duration-200'
    ].join(' ')
  }
} as const;

// Hook personalizado para manejar el filtrado y paginación
const useOrdersFilter = (orders: Order[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const filteredOrders = useMemo(() => {
    return orders.filter(order => {
  const idStr = String(order.id || '');
  const clientStr = String(order.client || '');
  const descStr = String(order.description || '');
  const matchesSearch = idStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            clientStr.toLowerCase().includes(searchTerm.toLowerCase()) ||
            descStr.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const visiblePages = useMemo<(number | 'ellipsis-left' | 'ellipsis-right')[]>(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | 'ellipsis-left' | 'ellipsis-right')[] = [1];
    // Left ellipsis
    if (currentPage > 3) pages.push('ellipsis-left');
    // Middle window around current
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let p = start; p <= end; p++) pages.push(p);
    // Right ellipsis
    if (currentPage < totalPages - 2) pages.push('ellipsis-right');
    pages.push(totalPages);
    return pages;
  }, [currentPage, totalPages]);
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
  visiblePages,
    stats
  };
};

export default function PedidosPage() {
  const { t } = useTranslation();

  // Todas las traducciones de status se hacen directamente en el renderizado con t(`admin.orders.status.${status}`)
  // Datos desde Supabase (stats/admin)
  const { data: adminStats, loading: adminLoading, error: adminError, refetch: refetchStats } = useAdminOrders();
  // Lista de pedidos reales
  const { data: adminOrders, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useAdminOrdersList();
  // Lista de clientes para asignar pedido
  const { data: clients } = useClientsInfo();
  // Variables solicitadas
  const totalPedidos = adminStats?.totalPedidos ?? 0;
  const pedidosPendientes = adminStats?.pedidosPendientes ?? 0;
  const pedidosTransito = adminStats?.pedidosTransito ?? 0;
  const pedidosEntregados = adminStats?.pedidosEntregados ?? 0;

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Order | null>(null);
  const [animateStats, setAnimateStats] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const supabase = getSupabaseBrowserClient();

  // Local state rendered in UI (mapped from adminOrders)
  const [orders, setOrders] = useState<Order[]>([]);

  // Estados del modal de nuevo pedido (reutilizado de cliente)
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
  const [hoveredDeliveryOption, setHoveredDeliveryOption] = useState<string | null>(null);
  const [isFolderHovered, setIsFolderHovered] = useState(false);
  const [isCameraHovered, setIsCameraHovered] = useState(false);
  const [isLinkHovered, setIsLinkHovered] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [stepDirection, setStepDirection] = useState<'next' | 'prev'>('next');
  const modalRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>('admin');

  useEffect(() => { setMounted(true); }, []);

  // Map DB orders to UI shape whenever adminOrders changes
  useEffect(() => {
    if (!adminOrders) return;
    // Mapear estado numérico (1..13) a estado UI consolidado
    const now = new Date();
    const mapped: Order[] = adminOrders.map((o: AdminOrderListItem) => {
      const created = o.created_at ? new Date(o.created_at) : now;
      const daysElapsed = Math.max(0, Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)));
      const assignedTo: Order['assignedTo'] = o.asignedEChina ? 'china' : 'vzla';
      const status = NUMERIC_STATE_TO_UI[o.state as number] ?? 'pendiente-china';
      return {
        id: String(o.id),
        client: o.clientName ?? 'Desconocido',
        status,
        assignedTo,
        daysElapsed,
        description: o.description || o.productName || '',
        priority: 'media',
      };
    });
    setOrders(mapped);
  }, [adminOrders]);

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
  visiblePages,
    stats
  } = useOrdersFilter(orders);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateStats(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert(t('admin.orders.alerts.onlyImages'));
        return;
      }
      setNewOrderData((prev) => ({ ...prev, productImage: file }));
    }
  };

  // Image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert(t('admin.orders.alerts.onlyImages'));
        return;
      }
      setNewOrderData((prev) => ({ ...prev, productImage: file }));
    }
  };

  // Validaciones
  const isValidQuantity = (value: any) => /^[0-9]+$/.test(String(value)) && Number(value) > 0;
  const isValidBudget = (value: any) => /^[0-9]+(\.[0-9]{1,2})?$/.test(String(value)) && Number(value) > 0;
  const isValidUrl = (value: string) => { try { new URL(value); return true; } catch { return false; } };

  // Sanitizar segmentos de ruta/nombre para Storage (evita espacios, tildes, barras y caracteres no seguros)
  const sanitizePathSegment = (input: string) => {
    return (input || '')
      // eliminar tildes/acentos
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      // reemplazar barras por guion para evitar subcarpetas accidentales
      .replace(/[\/\\]/g, '-')
      // reemplazar espacios por guion bajo
      .replace(/\s+/g, '_')
      // permitir solo ASCII seguro
      .replace(/[^a-zA-Z0-9._-]/g, '')
      // colapsar repeticiones
      .replace(/_+/g, '_')
      .replace(/-+/g, '-')
      // recortar extremos
      .replace(/^[_-]+|[_-]+$/g, '')
      // limitar longitud
      .slice(0, 120);
  };
  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        if (!newOrderData.client_id) return false;
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

  const handleNextStep = () => {
    if (currentStep < 3 && !isTransitioning) {
      setStepDirection('next');
      setIsTransitioning(true);
      setTimeout(() => { if (modalRef.current) { modalRef.current.scrollTo({ top: 0, behavior: 'smooth' }); } }, 150);
      setTimeout(() => { setCurrentStep((s) => s + 1); setIsTransitioning(false); }, 300);
    }
  };
  const handlePrevStep = () => {
    if (currentStep > 1 && !isTransitioning) {
      setStepDirection('prev');
      setIsTransitioning(true);
      setTimeout(() => { if (modalRef.current) { modalRef.current.scrollTo({ top: 0, behavior: 'smooth' }); } }, 150);
      setTimeout(() => { setCurrentStep((s) => s - 1); setIsTransitioning(false); }, 300);
    }
  };

  const handleSubmitOrder = () => {
    // Generar nombre del PDF con fecha legible dd-mm-yyyy
    const fechaObj = new Date();
    const dd = String(fechaObj.getDate()).padStart(2, '0');
    const mm = String(fechaObj.getMonth() + 1).padStart(2, '0');
    const yyyy = fechaObj.getFullYear();
    const fechaPedidoLegible = `${dd}-${mm}-${yyyy}`;
    const numeroPedido = Date.now();
  // Construir nombre de archivo seguro para Storage
  const safeProduct = sanitizePathSegment(newOrderData.productName);
  const safeClient = sanitizePathSegment(newOrderData.client_id);
  const safeDeliveryVzla = sanitizePathSegment(newOrderData.deliveryVenezuela);
  const safeBase = sanitizePathSegment(`${safeProduct}_${fechaPedidoLegible}_${numeroPedido}_${safeClient}_${safeDeliveryVzla}`);
  const nombrePDF = `${safeBase}.pdf`;

  // Opcional: si luego se usa una carpeta (p. ej. deliveryType), sanitizarla también
  // const safeFolder = sanitizePathSegment(newOrderData.deliveryType || 'misc');
  // const storagePath = `${safeFolder}/${nombrePDF}`; // usar storagePath en el upload

    (async () => {
      try {
        const { jsPDF } = await import('jspdf');
        const autoTable = (await import('jspdf-autotable')).default;
        const doc = new jsPDF();

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = (doc.internal as any).pageSize.height;
        const margin = 15;
        const colors = {
          primary: [22, 120, 187] as [number, number, number],
          secondary: [44, 62, 80] as [number, number, number],
          light: [245, 248, 255] as [number, number, number],
          border: [180, 200, 220] as [number, number, number],
          text: [33, 37, 41] as [number, number, number]
        };

        const pedidoTable: [string, string][] = [
          [t('admin.orders.pdf.fields.orderId'), `${numeroPedido}`],
          [t('admin.orders.pdf.fields.clientId'), `${newOrderData.client_id}`],
          [t('admin.orders.pdf.fields.userName'), `${newOrderData.client_name || t('admin.orders.common.unknown')}`],
          [t('admin.orders.pdf.fields.date'), `${fechaPedidoLegible}`],
          [t('admin.orders.pdf.fields.shippingType'), `${newOrderData.deliveryType}`],
          [t('admin.orders.pdf.fields.deliveryVzla'), `${newOrderData.deliveryVenezuela}`],
          [t('admin.orders.pdf.fields.product'), `${newOrderData.productName}`],
          [t('admin.orders.pdf.fields.quantity'), `${newOrderData.quantity}`],
          [t('admin.orders.pdf.fields.estimatedBudget'), `$${newOrderData.estimatedBudget}`],
          [t('admin.orders.pdf.fields.description'), newOrderData.description || t('admin.orders.common.unknown')],
          [t('admin.orders.pdf.fields.specifications'), newOrderData.specifications || t('admin.orders.common.unknown')],
        ];
        if (newOrderData.requestType === 'link') {
          pedidoTable.push([t('admin.orders.pdf.fields.url'), newOrderData.productUrl || t('admin.orders.common.unknown')]);
        }

        // Header
        doc.setFillColor(...colors.primary);
        doc.rect(0, 0, pageWidth, 35, 'F');
        doc.setFontSize(24);
        doc.setTextColor(255, 255, 255);
  doc.text(t('admin.orders.pdf.summaryTitle'), pageWidth / 2, 22, { align: 'center' });
        doc.setFontSize(10);
  doc.text(`${t('admin.orders.pdf.order')}: #${numeroPedido}`, pageWidth - margin, 15, { align: 'right' });
  doc.text(`${t('admin.orders.pdf.date')}: ${fechaPedidoLegible}`, pageWidth - margin, 21, { align: 'right' });

        let currentY = 50;

        if (newOrderData.requestType === 'photo' && newOrderData.productImage) {
          const imgWidth = 80;
          const imgHeight = 80;
          const imgX = margin;
          doc.setFillColor(240, 240, 240);
          doc.roundedRect(imgX - 2, currentY - 2, imgWidth + 4, imgHeight + 4, 3, 3, 'F');
          const imgData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(newOrderData.productImage as Blob);
          });
          doc.addImage(imgData, 'JPEG', imgX, currentY, imgWidth, imgHeight);
          const tableStartX = imgX + imgWidth + 15;
          const tableWidth = pageWidth - tableStartX - margin;
          autoTable(doc, {
            head: [[t('admin.orders.pdf.field'), t('admin.orders.pdf.value')]],
            body: pedidoTable,
            startY: currentY,
            margin: { left: tableStartX, right: margin },
            tableWidth: tableWidth,
            theme: 'grid',
          });
        } else {
          // Tabla completa
          autoTable(doc, {
            head: [[t('admin.orders.pdf.field'), t('admin.orders.pdf.information')]],
            body: pedidoTable,
            startY: currentY,
            margin: { left: margin, right: margin },
            theme: 'striped',
          });
          // URL destacada
          if (newOrderData.productUrl) {
            const finalY = (doc as any).lastAutoTable?.finalY + 12;
            doc.setFontSize(10);
            doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
            doc.text(`${t('admin.orders.pdf.productUrl')}:`, margin, finalY + 6);
            doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
            const urlText = (doc as any).splitTextToSize(newOrderData.productUrl, pageWidth - (margin * 2));
            doc.text(urlText, margin, finalY + 14);
          }
        }

        // Footer
        const footerY = (doc.internal as any).pageSize.height - 25;
        doc.setDrawColor(180, 200, 220);
        doc.setLineWidth(0.5);
        doc.line(15, footerY - 5, doc.internal.pageSize.getWidth() - 15, footerY - 5);
        doc.setFontSize(8);
        doc.setTextColor(44, 62, 80);
        doc.text(`${t('admin.orders.pdf.generatedAt')}: ${new Date().toLocaleString()}`, 15, footerY + 13);

        // Subir PDF a Supabase Storage
        const pdfBlob = doc.output('blob');
        let folder: string = String(newOrderData.deliveryType);
        if (folder === 'doorToDoor') folder = 'door-to-door';
        const safeFolder = sanitizePathSegment(folder || 'misc');
        const nombrePDFCorr = nombrePDF;
        const uploadRes = await supabase.storage
          .from('orders')
          .upload(`${safeFolder}/${nombrePDFCorr}`, pdfBlob, {
            cacheControl: '3600',
            upsert: true,
            contentType: 'application/pdf',
          });
        if (uploadRes.error) {
          console.error('Supabase Storage upload error:', uploadRes.error);
          alert(`Error al subir el PDF: ${uploadRes.error.message}`);
          return;
        }
        const { data: publicUrlData } = supabase.storage
          .from('orders')
          .getPublicUrl(`${safeFolder}/${nombrePDFCorr}`);
        const pdfUrl = publicUrlData?.publicUrl || '';

        // Ahora crear el pedido vía API (service role) para evitar problemas RLS
        const payload = {
          client_id: newOrderData.client_id || '',
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
          order_origin: 'vzla'
        };

        const apiRes = await fetch('/api/admin/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!apiRes.ok) {
          let errMsg = `${apiRes.status}`;
          try {
            const j = await apiRes.json();
            if (j?.error) errMsg += ` - ${j.error}`;
            if (j?.details) errMsg += ` | ${Array.isArray(j.details) ? j.details.join(', ') : j.details}`;
          } catch {}
          console.error('Error creando pedido vía API:', errMsg, payload);
          alert(t('admin.orders.messages.createError') + `\n${errMsg}`);
          return;
        }

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
            client_id: '',
            client_name: ''
          });
          setShowSuccessAnimation(false);
        }, 1200);
        refetchOrders();
        refetchStats();
      } catch (e:any) {
        console.error('Excepción creando pedido:', e);
        alert(t('admin.orders.messages.createError'));
      }
    })();
  };

  // Memoizar la función de exportación
  const handleExport = useCallback(async () => {
    const pdfContent = document.createElement('div');
    pdfContent.style.width = '210mm';
    pdfContent.style.padding = '10mm';

  const title = document.createElement('h1');
  title.innerText = t('admin.orders.export.reportTitle');
    title.style.fontSize = '24px';
    title.style.marginBottom = '20px';
    pdfContent.appendChild(title);

    const table = document.createElement('table');
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    const headers = [
      t('admin.orders.table.id'),
      t('admin.orders.table.client'),
      t('admin.orders.table.description'),
      t('admin.orders.table.status'),
      t('admin.orders.table.assigned'),
      t('admin.orders.table.time', { unit: t('admin.orders.table.days') })
    ];
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
  t(`admin.orders.status.${order.status}`),
  t(`admin.orders.assigned.${order.assignedTo}`),
  t('admin.orders.table.daysElapsed', { count: order.daysElapsed })
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
    
  pdf.save(t('admin.orders.export.fileName'));
  }, [filteredOrders]);

  // Funciones para manejo de modales y datos
  const handleOpenEditModal = (order: Order) => {
    setEditFormData(order);
    setIsEditModalOpen(true);
    setSelectedOrder(null);
  };

  const handleUpdateOrder = async () => {
    if (!editFormData) return;
    try {
  // Mapear estado UI -> state numérico usando mapping central
  const mappedState = UI_STATE_TO_NUMERIC[editFormData.status];
      const body: any = {
        description: editFormData.description,
      };
  // Solo enviar state si está en el rango 1..13 (incluyendo fallback cancelado si aplica)
  if (typeof mappedState === 'number' && mappedState >= 1 && mappedState <= 13) {
        body.state = mappedState;
      }

      const res = await fetch(`/api/admin/orders/${encodeURIComponent(editFormData.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        let message = `${res.status}`;
        try {
          const json = await res.json();
          if (json?.error) message += ` - ${json.error}`;
        } catch {}
        throw new Error(`${t('admin.orders.messages.updateError')}: ${message}`);
      }

      // Optimistic update local
      setOrders(prev => prev.map(o => (o.id === editFormData.id ? editFormData : o)));
      setIsEditModalOpen(false);
      setEditFormData(null);
      // Refrescar server data
      refetchOrders();
      refetchStats();
    } catch (e) {
      console.error(e);
      alert(t('admin.orders.messages.updateError'));
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrder) return;
  const confirm = window.confirm(t('admin.orders.messages.deleteConfirm', { id: selectedOrder.id }));
    if (!confirm) return;

    try {
      const res = await fetch(`/api/admin/orders/${encodeURIComponent(selectedOrder.id)}`, { method: 'DELETE', cache: 'no-store' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${t('admin.orders.messages.deleteError')}: ${res.status} ${text}`);
      }
      // Optimistic UI: eliminar del estado local
      setOrders(prev => prev.filter(o => o.id !== selectedOrder.id));
      setSelectedOrder(null);
      // Refrescar server data para persistencia
      refetchOrders();
      refetchStats();
    } catch (e) {
      console.error(e);
      alert(t('admin.orders.messages.deleteError'));
    }
  };

  // Determinar qué configuración de colores usar
  const statusConfig = mounted && theme === 'dark' ? STATUS_CONFIG : STATUS_CONFIG_LIGHT;
  const assignedConfig = mounted && theme === 'dark' ? ASSIGNED_CONFIG : ASSIGNED_CONFIG_LIGHT;

  // Memoizar las tarjetas de estadísticas
  const statsCards = useMemo(() => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-700 dark:text-blue-300 text-sm md:text-base font-medium">{t('admin.orders.stats.totalOrders')}</p>
              <p className="text-2xl md:text-3xl font-bold text-blue-800 dark:text-blue-200">
                {totalPedidos}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 dark:bg-blue-800/30 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 md:w-6 md:h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 dark:from-yellow-900/20 dark:to-orange-900/20 dark:border-yellow-700 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-700 dark:text-yellow-300 text-sm md:text-base font-medium">{t('admin.orders.stats.pending')}</p>
              <p className="text-2xl md:text-3xl font-bold text-yellow-800 dark:text-yellow-200">
                {pedidosPendientes}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-yellow-100 dark:bg-yellow-800/30 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 md:w-6 md:h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200 dark:from-purple-900/20 dark:to-violet-900/20 dark:border-purple-700 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-700 dark:text-purple-300 text-sm md:text-base font-medium">{t('admin.orders.stats.inTransit')}</p>
              <p className="text-2xl md:text-3xl font-bold text-purple-800 dark:text-purple-200">
                {pedidosTransito}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 dark:bg-purple-800/30 rounded-lg flex items-center justify-center">
              <Plane className="w-5 h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-700 dark:text-green-300 text-sm md:text-base font-medium">{t('admin.orders.stats.delivered')}</p>
              <p className="text-2xl md:text-3xl font-bold text-green-800 dark:text-green-200">
                {pedidosEntregados}
              </p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 dark:bg-green-800/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ), [animateStats, totalPedidos, pedidosPendientes, pedidosTransito, pedidosEntregados]);

  // Memoizar el renderizado de las filas de la tabla
  const tableRows = useMemo(() => (
    paginatedOrders.map((order) => {
      const status = statusConfig[order.status];
      const assigned = assignedConfig[order.assignedTo];
      const StatusIcon = status.icon;
      return (
        <tr 
          key={order.id}
          className={`border-b border-slate-100 hover:bg-blue-100 dark:hover:bg-blue-800/40 transition-all duration-200 cursor-pointer group text-slate-900 dark:text-white`}
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
              {t(`admin.orders.status.${order.status}`)}
            </Badge>
          </td>
          <td className="py-4 px-6">
            <Badge className={`${assigned.color} border text-slate-900 dark:text-white`}>
              {t(`admin.orders.assigned.${order.assignedTo}`)}
            </Badge>
          </td>
          <td className="py-4 px-6">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{t('admin.orders.time.days', { count: order.daysElapsed })}</span>
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
                {t('admin.orders.actions.view')}
              </Button>
            </div>
          </td>
        </tr>
      );
    })
  ), [paginatedOrders, statusConfig, assignedConfig, t]);

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
      <Sidebar 
        isExpanded={sidebarExpanded} 
        setIsExpanded={setSidebarExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        userRole="admin" 
      />

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 min-w-0 ${sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-20 lg:w-[calc(100%-5rem)]'}`}>
        <Header 
          notifications={3}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title={t('admin.orders.title')}
          subtitle={t('admin.orders.subtitle')}
          showTitleOnMobile
        />

        <div className={mounted && theme === 'dark' ? 'p-4 md:p-5 lg:p-6 space-y-4 md:space-y-5 lg:space-y-6 bg-slate-900' : 'p-4 md:p-5 lg:p-6 space-y-4 md:space-y-5 lg:space-y-6'}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-8 flex w-full gap-1 rounded-2xl p-2 bg-gradient-to-r from-slate-100/70 via-white/60 to-slate-100/70 dark:from-slate-800/60 dark:via-slate-800/40 dark:to-slate-800/60 backdrop-blur border border-slate-200/60 dark:border-slate-700/60 shadow-sm">
              <TabsTrigger value="admin" className="flex-1 min-w-0 justify-center whitespace-nowrap truncate data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-sm md:text-base px-4 py-2 rounded-xl font-medium flex items-center gap-2 border border-transparent data-[state=inactive]:bg-white/60 dark:data-[state=inactive]:bg-slate-900/40 data-[state=inactive]:hover:bg-white data-[state=inactive]:dark:hover:bg-slate-700/60">
                <Settings className="w-4 h-4" /> {t('sidebar.management')}
              </TabsTrigger>
              <TabsTrigger value="venezuela" className="flex-1 min-w-0 justify-center whitespace-nowrap truncate data-[state=active]:bg-gradient-to-r data-[state=active]:from-amber-500 data-[state=active]:to-orange-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-sm md:text-base px-4 py-2 rounded-xl font-medium flex items-center gap-2 border border-transparent data-[state=inactive]:bg-white/60 dark:data-[state=inactive]:bg-slate-900/40 data-[state=inactive]:hover:bg-white data-[state=inactive]:dark:hover:bg-slate-700/60">
                <MapPin className="w-4 h-4" /> {t('admin.orders.vzlaTabLabel')}
              </TabsTrigger>
              <TabsTrigger value="china" className="flex-1 min-w-0 justify-center whitespace-nowrap truncate data-[state=active]:bg-gradient-to-r data-[state=active]:from-red-600 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all text-sm md:text-base px-4 py-2 rounded-xl font-medium flex items-center gap-2 border border-transparent data-[state=inactive]:bg-white/60 dark:data-[state=inactive]:bg-slate-900/40 data-[state=inactive]:hover:bg-white data-[state=inactive]:dark:hover:bg-slate-700/60">
                <Plane className="w-4 h-4" /> {t('admin.orders.chinaTabLabel')}
              </TabsTrigger>
              {/* Pestaña Cliente eliminada */}
            </TabsList>

            <TabsContent value="admin" className="space-y-6">
              {/* Stats Cards */}
              {statsCards}
              {/* Table Card existente */}
              <Card className={mounted && theme === 'dark' ? 'shadow-lg border-0 bg-slate-800/80 backdrop-blur-sm' : 'shadow-lg border-0 bg-white/70 backdrop-blur-sm'}>
            <CardHeader>
                                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <CardTitle className={`text-lg md:text-xl font-bold ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('admin.orders.listTitle')}</CardTitle>
                      <CardDescription className={`text-sm md:text-base ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
{t('admin.orders.listDescription', { count: totalPedidos })}
                      </CardDescription>
                    </div>
            <div className="w-full lg:w-auto flex items-center justify-end gap-2 md:gap-3 flex-wrap">
                        <Input
                          placeholder={t('admin.orders.search')}
                          value={searchTerm}
                          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className={`${mounted && theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-400' : 'bg-white/50 border-slate-200'} h-10 w-full sm:w-64 px-3`}
                        />
                        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className={`h-10 w-full sm:w-56 px-3 whitespace-nowrap truncate ${mounted && theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100' : 'bg-white/50 border-slate-200'}`}>
                            <SelectValue placeholder={t('admin.orders.filters.status')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">{t('admin.orders.filters.allStates')}</SelectItem>
                            <SelectItem value="pendiente-china">{t('admin.orders.status.pendiente-china')}</SelectItem>
                            <SelectItem value="pendiente-vzla">{t('admin.orders.status.pendiente-vzla')}</SelectItem>
                            <SelectItem value="esperando-pago">{t('admin.orders.status.esperando-pago')}</SelectItem>
                            <SelectItem value="en-transito">{t('admin.orders.status.en-transito')}</SelectItem>
                            <SelectItem value="entregado">{t('admin.orders.status.entregado')}</SelectItem>
                            <SelectItem value="cancelado">{t('admin.orders.status.cancelado')}</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          size="sm"
                          className={`h-10 bg-blue-600 text-white hover:bg-blue-700 ${mounted && theme === 'dark' ? '' : ''}`}
                          onClick={() => setIsNewOrderModalOpen(true)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {t('admin.orders.actions.newOrder')}
                        </Button>
                      </div>
                    </div>
                  
            </CardHeader>
            <CardContent>
              {/* Vista Desktop - Tabla */}
              <div className="hidden lg:block overflow-x-auto">
                <table className={mounted && theme === 'dark' ? 'w-full bg-slate-800' : 'w-full'}>
                  <thead>
                    <tr className={mounted && theme === 'dark' ? 'border-b border-slate-700' : 'border-b border-slate-200'}>
                      <th className={mounted && theme === 'dark' ? 'text-left py-4 px-6 font-semibold text-white' : 'text-left py-4 px-6 font-semibold text-slate-900'}>{t('admin.orders.table.id')}</th>
                      <th className={mounted && theme === 'dark' ? 'text-left py-4 px-6 font-semibold text-white' : 'text-left py-4 px-6 font-semibold text-slate-900'}>{t('admin.orders.table.client')}</th>
                      <th className={mounted && theme === 'dark' ? 'text-left py-4 px-6 font-semibold text-white' : 'text-left py-4 px-6 font-semibold text-slate-900'}>{t('admin.orders.table.status')}</th>
                      <th className={mounted && theme === 'dark' ? 'text-left py-4 px-6 font-semibold text-white' : 'text-left py-4 px-6 font-semibold text-slate-900'}>{t('admin.orders.table.assignedTo')}</th>
                      <th className={mounted && theme === 'dark' ? 'text-left py-4 px-6 font-semibold text-white' : 'text-left py-4 px-6 font-semibold text-slate-900'}>{t('admin.orders.table.time')}</th>
                      <th className={mounted && theme === 'dark' ? 'text-left py-4 px-6 font-semibold text-white' : 'text-left py-4 px-6 font-semibold text-slate-900'}>{t('admin.orders.table.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows}
                  </tbody>
                </table>
              </div>

              {/* Vista Mobile/Tablet - Cards */}
              <div className="lg:hidden space-y-3 md:space-y-4">
                {paginatedOrders.map((order) => {
                  const status = statusConfig[order.status];
                  const assigned = assignedConfig[order.assignedTo];
                  const StatusIcon = status.icon;
                  
                  return (
                                         <div
                       key={order.id}
                       className={`bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-4 md:p-5 hover:shadow-lg transition-all duration-300 group cursor-pointer ${mounted && theme === 'dark' ? 'bg-slate-800/80 border-slate-700' : ''}`}
                       onClick={() => setSelectedOrder(order)}
                     >
                       <div className="flex flex-col gap-3 md:gap-4">
                         <div className="flex items-center gap-3 md:gap-4">
                           <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center flex-shrink-0">
                             <Package className="w-5 h-5 md:w-6 md:h-6 text-white" />
                           </div>
                           <div className="min-w-0 flex-1">
                             <div className="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors text-sm md:text-base dark:text-white">{order.id}</div>
                             <div className="text-xs md:text-sm text-slate-600 dark:text-slate-300 mt-1">{order.client}</div>
                             <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{order.description}</div>
                           </div>
                           <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 flex-shrink-0">
                             <Clock className="w-3 h-3" />
                             <span>{t('admin.orders.time.days', { count: order.daysElapsed })}</span>
                           </div>
                         </div>
                         <div className="flex items-center gap-2 flex-wrap">
                           <Badge className={`${status.color} border text-xs`}>
                             <StatusIcon className="w-3 h-3 mr-1" />
                             {t(`admin.orders.status.${order.status}`)}
                           </Badge>
                           <Badge className={`${assigned.color} border text-xs`}>
                            {t(`admin.orders.assigned.${order.assignedTo}`)}
                           </Badge>
                         </div>
                       </div>
                     </div>
                  );
                })}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t ${mounted && theme === 'dark' ? 'border-slate-700' : 'border-slate-200'}`}>
                  <div className={`text-xs md:text-sm ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    {t('admin.orders.pagination.results', {
                      from: filteredOrders.length === 0 ? 0 : startIndex + 1,
                      to: startIndex + paginatedOrders.length,
                      total: filteredOrders.length
                    })}
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className={mounted && theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 hover:border-blue-800' : 'bg-white/50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'}
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      {t('admin.orders.pagination.previous')}
                    </Button>
                    {/* Compact indicator on mobile */}
                    <div className={`flex items-center gap-2 sm:hidden ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                      <span className="text-xs">{currentPage} / {totalPages}</span>
                    </div>
                    {/* Full pagination with ellipses on sm+ */}
                    <div className="hidden sm:flex items-center space-x-1">
                      {visiblePages.map((p, idx) => {
                        if (p === 'ellipsis-left' || p === 'ellipsis-right') {
                          return (
                            <span key={`${p}-${idx}`} className={`${mounted && theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} px-2`}>…</span>
                          );
                        }
                        const page = p as number;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={currentPage === page
                              ? 'bg-blue-600 text-white'
                              : mounted && theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 hover:border-blue-800' : 'bg-white/50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className={mounted && theme === 'dark' ? 'bg-slate-900 border-slate-700 text-slate-100 hover:bg-slate-800 hover:border-blue-800' : 'bg-white/50 border-slate-200 hover:bg-blue-50 hover:border-blue-300'}
                    >
                      {t('admin.orders.pagination.next')}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
            </TabsContent>

            <TabsContent value="venezuela" className="space-y-6">
              <VenezuelaOrdersTabContent />
            </TabsContent>
            <TabsContent value="china" className="space-y-6">
              <ChinaOrdersTabContent />
            </TabsContent>
            {/* TabsContent cliente eliminado */}
          </Tabs>
        </div>
      </main>

      {/* Modal Crear Nuevo Pedido (reutilizado de cliente) */}
      <Dialog open={isNewOrderModalOpen} onOpenChange={setIsNewOrderModalOpen}>
        <DialogContent ref={modalRef} className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
          <DialogHeader className="text-center pb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20"></div>
              <DialogTitle className="relative text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
{t('admin.orders.actions.create')}
              </DialogTitle>
            </div>
            <DialogDescription className="text-lg text-slate-600 mt-2">
{t('admin.orders.form.description')}
            </DialogDescription>
          </DialogHeader>

          {/* Progreso */}
          <div className={`space-y-4 mb-8 ${isTransitioning ? 'opacity-75' : 'opacity-100'}`}>
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{t('admin.orders.steps.step')} {currentStep} {t('admin.orders.steps.of')} 3</span>
              <span className="font-bold text-blue-600">{Math.round((currentStep / 3) * 100)}{t('admin.orders.steps.completed')}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${(currentStep / 3) * 100}%` }} />
            </div>
          </div>

          {/* Contenido por pasos */}
          <div className={`space-y-6 ${isTransitioning ? (stepDirection === 'next' ? 'opacity-0 translate-x-1' : 'opacity-0 -translate-x-1') : 'opacity-100 translate-x-0'} transition-all`}>
            {showSuccessAnimation && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in-up">
                <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl p-12 text-center space-y-6 shadow-2xl border border-slate-200/50 max-w-md mx-4 transform animate-fade-in-up">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="bg-green-500 rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
                      <Check className="w-12 h-12 text-white" />
                    </div>
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                      {t('client.recentOrders.newOrder.success.title')}
                    </h3>
                    <p className="text-slate-600 text-lg">{t('client.recentOrders.newOrder.success.message')}</p>
                  </div>
                </div>
              </div>
            )}
            {/* {t('admin.orders.steps.step1')} */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>{t('admin.orders.form.client')}</Label>
                  <Select value={newOrderData.client_id} onValueChange={(v) => {
                    const cli = (clients || []).find(c => c.user_id === v);
                    setNewOrderData((prev) => ({ ...prev, client_id: v, client_name: cli?.name || '' }));
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin.orders.form.selectClient')} />
                    </SelectTrigger>
                    <SelectContent>
                      {(clients || []).map((c) => (
                        <SelectItem key={c.user_id} value={c.user_id}>{c.name} ({c.user_id.slice(0, 6)}…)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center">
                    <Package className="w-4 h-4 mr-2 text-blue-600" />
{t('admin.orders.form.productNameLabel')}
                  </Label>
                  <Input value={newOrderData.productName} onChange={(e) => setNewOrderData({ ...newOrderData, productName: e.target.value })} placeholder={t('admin.orders.form.productNamePlaceholder')} />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-blue-600" />
{t('admin.orders.form.productDescription')}
                  </Label>
                  <Textarea value={newOrderData.description} onChange={(e) => setNewOrderData({ ...newOrderData, description: e.target.value })} rows={4} placeholder={t('admin.orders.form.productDescriptionPlaceholder')} />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center">
                    <Hash className="w-4 h-4 mr-2 text-blue-600" />
{t('admin.orders.form.quantity')}
                  </Label>
                  <Input type="number" min="1" value={newOrderData.quantity === 0 ? '' : newOrderData.quantity} onChange={(e) => {
                    const val = e.target.value; if (val === '') setNewOrderData({ ...newOrderData, quantity: 0 }); else if (/^[0-9]+$/.test(val)) setNewOrderData({ ...newOrderData, quantity: parseInt(val) });
                  }} />
                  {newOrderData.quantity <= 0 && (<p className="text-xs text-red-500">La cantidad debe ser mayor que cero.</p>)}
                </div>

                {/* Tipo de Solicitud */}
                <div className="space-y-4">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center"><Target className="w-4 h-4 mr-2 text-blue-600" />{t('admin.orders.form.requestType')}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-4 border-2 rounded-xl cursor-pointer ${newOrderData.requestType === 'link' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`} onClick={() => setNewOrderData({ ...newOrderData, requestType: 'link' })} onMouseEnter={() => setIsLinkHovered(true)} onMouseLeave={() => setIsLinkHovered(false)}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Player key={isLinkHovered ? 'link-active' : 'link-inactive'} src={'/animations/wired-flat-11-link-unlink-hover-bounce.json'} className="w-5 h-5" loop={false} autoplay={isLinkHovered} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{t('admin.orders.form.productLink')}</p>
                          <p className="text-sm text-slate-600">{t('admin.orders.form.productLinkDescription')}</p>
                        </div>
                      </div>
                    </div>
                    <div className={`p-4 border-2 rounded-xl cursor-pointer ${newOrderData.requestType === 'photo' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`} onClick={() => setNewOrderData({ ...newOrderData, requestType: 'photo' })} onMouseEnter={() => setIsCameraHovered(true)} onMouseLeave={() => setIsCameraHovered(false)}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Player key={isCameraHovered ? 'camera-active' : 'camera-inactive'} src={'/animations/wired-flat-61-camera-hover-flash.json'} className="w-5 h-5" loop={false} autoplay={isCameraHovered} />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{t('admin.orders.form.photoDescription')}</p>
                          <p className="text-sm text-slate-600">{t('admin.orders.form.photoDescriptionDetail')}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {newOrderData.requestType === 'link' && (
                    <div className="space-y-2">
                      <Label htmlFor="productUrl">{t('admin.orders.form.productUrl')} *</Label>
                      <Input id="productUrl" type="url" value={newOrderData.productUrl || ''} onChange={(e) => setNewOrderData({ ...newOrderData, productUrl: e.target.value })} placeholder={t('admin.orders.form.productUrlPlaceholder')} />
                      {newOrderData.productUrl && !isValidUrl(newOrderData.productUrl) && (<p className="text-xs text-red-500">{t('admin.orders.form.invalidUrl')}</p>)}
                    </div>
                  )}

                  {newOrderData.requestType === 'photo' && (
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-slate-700 flex items-center"><Image className="w-4 h-4 mr-2 text-blue-600" />{t('admin.orders.form.productImage')}</Label>
                      {newOrderData.productImage ? (
                        <div className="relative">
                          <div className="border-2 border-slate-200 rounded-xl overflow-hidden bg-white">
                            <img src={URL.createObjectURL(newOrderData.productImage)} alt={t('admin.orders.form.productImageAlt')} className="w-full h-48 object-cover" />
                            <div className="p-3 flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => document.getElementById('imageUpload')?.click()}><Upload className="w-4 h-4 mr-1" />{t('admin.orders.form.change')}</Button>
                              <Button variant="outline" size="sm" onClick={() => setNewOrderData({ ...newOrderData, productImage: undefined })} className="text-red-600"><X className="w-4 h-4 mr-1" />{t('admin.orders.form.remove')}</Button>
                            </div>
                          </div>
                          <input id="imageUpload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </div>
                      ) : (
                        <div className={`border-2 border-dashed rounded-xl p-8 text-center bg-white ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-slate-300'}`} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}>
                          <p className="text-sm text-slate-600 mb-4">{t('admin.orders.form.dragImageHere')}</p>
                          <Button variant="outline" onClick={() => document.getElementById('imageUpload')?.click()}><Upload className="w-4 h-4 mr-2" />{t('admin.orders.form.selectImage')}</Button>
                          <input id="imageUpload" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Paso 2: Envío y presupuesto */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>{t('admin.orders.form.deliveryType')}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className={`p-4 border-2 rounded-lg cursor-pointer ${newOrderData.deliveryType === 'doorToDoor' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`} onClick={() => setNewOrderData({ ...newOrderData, deliveryType: 'doorToDoor' })} onMouseEnter={() => setHoveredDeliveryOption('doorToDoor')} onMouseLeave={() => setHoveredDeliveryOption(null)}>
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto">
                          <Player key={hoveredDeliveryOption === 'doorToDoor' ? 'truck-active' : 'truck-inactive'} src={'/animations/wired-flat-18-delivery-truck.json'} className="w-full h-full" loop={false} autoplay={hoveredDeliveryOption === 'doorToDoor'} />
                        </div>
                        <p className="font-medium mt-2">{t('admin.orders.deliveryTypes.doorToDoor')}</p>
                      </div>
                    </div>
                    <div className={`p-4 border-2 rounded-lg cursor-pointer ${newOrderData.deliveryType === 'air' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`} onClick={() => setNewOrderData({ ...newOrderData, deliveryType: 'air' })} onMouseEnter={() => setHoveredDeliveryOption('air')} onMouseLeave={() => setHoveredDeliveryOption(null)}>
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto">
                          <Player key={hoveredDeliveryOption === 'air' ? 'airplane-active' : 'airplane-inactive'} src={'/animations/FTQoLAnxbj.json'} className="w-full h-full" loop={false} autoplay={hoveredDeliveryOption === 'air'} />
                        </div>
                        <p className="font-medium mt-2">{t('admin.orders.deliveryTypes.air')}</p>
                      </div>
                    </div>
                    <div className={`p-4 border-2 rounded-lg cursor-pointer ${newOrderData.deliveryType === 'maritime' ? 'border-blue-500 bg-blue-50' : 'border-slate-200'}`} onClick={() => setNewOrderData({ ...newOrderData, deliveryType: 'maritime' })} onMouseEnter={() => setHoveredDeliveryOption('maritime')} onMouseLeave={() => setHoveredDeliveryOption(null)}>
                      <div className="text-center">
                        <div className="w-8 h-8 mx-auto">
                          <Player key={hoveredDeliveryOption === 'maritime' ? 'ship-active' : 'ship-inactive'} src={'/animations/wired-flat-1337-cargo-ship-hover-pinch.json'} className="w-full h-full" loop={false} autoplay={hoveredDeliveryOption === 'maritime'} />
                        </div>
                        <p className="font-medium mt-2">{t('admin.orders.deliveryTypes.maritime')}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryVenezuela">{t('admin.orders.form.deliveryVenezuela')}</Label>
                  <Select value={newOrderData.deliveryVenezuela} onValueChange={(value) => setNewOrderData({ ...newOrderData, deliveryVenezuela: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t('admin.orders.form.selectDelivery')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pickup">{t('admin.orders.form.pickupOffice')}</SelectItem>
                      <SelectItem value="delivery">{t('admin.orders.form.homeDelivery')}</SelectItem>
                      <SelectItem value="express">{t('admin.orders.form.expressDelivery')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estimatedBudget">{t('admin.orders.form.estimatedBudgetUsd')}</Label>
                  <Input id="estimatedBudget" type="number" min="0" value={newOrderData.estimatedBudget} onChange={(e) => {
                    const val = e.target.value; if (/^[0-9]*\.?[0-9]{0,2}$/.test(val)) { setNewOrderData({ ...newOrderData, estimatedBudget: val }); }
                  }} placeholder={t('admin.orders.form.estimatedBudgetPlaceholder')} />
                  {newOrderData.estimatedBudget && !isValidBudget(newOrderData.estimatedBudget) && (<p className="text-xs text-red-500">{t('admin.orders.form.invalidBudget')}</p>)}
                </div>
              </div>
            )}

            {/* Paso 3: Resumen */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                  <h4 className="font-semibold text-lg">{t('admin.orders.summary.title')}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">{t('admin.orders.summary.client')}</p>
                      <p className="font-medium">{newOrderData.client_name} ({newOrderData.client_id})</p>
                    </div>
                    <div>
                                           <p className="text-sm text-slate-600">{t('admin.orders.summary.product')}</p>
                      <p className="font-medium">{newOrderData.productName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">{t('admin.orders.summary.quantity')}</p>
                      <p className="font-medium">{newOrderData.quantity}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">{t('admin.orders.summary.shippingType')}</p>
                      <p className="font-medium">
                        {newOrderData.deliveryType === 'doorToDoor' && t('admin.orders.deliveryTypes.doorToDoor')}
                        {newOrderData.deliveryType === 'air' && t('admin.orders.deliveryTypes.air')}
                        {newOrderData.deliveryType === 'maritime' && t('admin.orders.deliveryTypes.maritime')}
                      </p>
                                       </div>
                    <div>
                      <p className="text-sm text-slate-600">{t('admin.orders.summary.estimatedBudget')}</p>
                      <p className="font-medium">${newOrderData.estimatedBudget}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">{t('admin.orders.summary.description')}</p>
                    <p className="text-sm">{newOrderData.description}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botones navegación */}
          <div className="flex justify-between pt-8 border-t border-slate-200/50">
            <Button variant="outline" onClick={handlePrevStep} disabled={currentStep === 1 || isTransitioning}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('admin.orders.steps.previous')}
            </Button>
            {currentStep < 3 ? (
              <Button onClick={handleNextStep} disabled={!canProceedToNext() || isTransitioning} className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                {t('admin.orders.steps.next')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmitOrder} className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                <Check className="w-4 h-4 mr-2" />
                {t('admin.orders.summary.createOrder')}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalles del Pedido */}
      <Dialog open={!!selectedOrder && !isEditModalOpen && !isDocumentsModalOpen} onOpenChange={() => setSelectedOrder(null)}>
        {selectedOrder && (
          <DialogContent
            className={mounted && theme === 'dark' ? 'sm:max-w-[700px] bg-slate-900 p-0 rounded-lg shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95' : 'sm:max-w-[700px] bg-white p-0 rounded-lg shadow-2xl animate-in fade-in-0 slide-in-from-bottom-2 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95'}
          >
            <div className="flex flex-col md:flex-row">
              {/* Sección izquierda - Detalles del pedido */}
              <div className={mounted && theme === 'dark' ? 'md:w-2/3 p-4 md:p-6 lg:p-8 border-b md:border-b-0 md:border-r border-slate-700' : 'md:w-2/3 p-4 md:p-6 lg:p-8 border-b md:border-b-0 md:border-r border-gray-200'}>
                <DialogHeader>
                  <DialogTitle className={`text-lg md:text-xl lg:text-2xl font-bold ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                    Detalles del Pedido: {selectedOrder.id}
                  </DialogTitle>
                  <DialogDescription className={`text-sm md:text-base ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-500'}`}>
                    Información detallada sobre el pedido y su estado actual.
                  </DialogDescription>
                </DialogHeader>

                <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
                  {/* Detalles de la tarjeta */}
                  <div className="flex items-center space-x-3">
                    <div className={mounted && theme === 'dark' ? 'w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-900 flex items-center justify-center' : 'w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-100 flex items-center justify-center'}>
                      <Package className={mounted && theme === 'dark' ? 'w-4 h-4 md:w-5 md:h-5 text-blue-300' : 'w-4 h-4 md:w-5 md:h-5 text-blue-600'} />
                    </div>
                    <div>
                      <p className={`font-semibold text-base md:text-lg ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Cliente</p>
                      <p className={`text-sm md:text-base ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>{selectedOrder.client}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={mounted && theme === 'dark' ? 'w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-900 flex items-center justify-center' : 'w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-100 flex items-center justify-center'}>
                      <MapPin className={mounted && theme === 'dark' ? 'w-4 h-4 md:w-5 md:h-5 text-purple-300' : 'w-4 h-4 md:w-5 md:h-5 text-purple-600'} />
                    </div>
                    <div>
                      <p className={`font-semibold text-base md:text-lg ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Asignado a</p>
                      <Badge className={`${assignedConfig[selectedOrder.assignedTo].color} border text-xs md:text-sm`}>
                        {t(`admin.orders.assigned.${selectedOrder.assignedTo}`)}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={mounted && theme === 'dark' ? 'w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-900 flex items-center justify-center' : 'w-8 h-8 md:w-10 md:h-10 rounded-full bg-green-100 flex items-center justify-center'}>
                      <Clock className={mounted && theme === 'dark' ? 'w-4 h-4 md:w-5 md:h-5 text-green-300' : 'w-4 h-4 md:w-5 md:h-5 text-green-600'} />
                    </div>
                    <div>
                      <p className={`font-semibold text-base md:text-lg ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Tiempo Transcurrido</p>
                      <p className={`text-sm md:text-base ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>{t('admin.orders.table.daysElapsed', { count: selectedOrder.daysElapsed })}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className={mounted && theme === 'dark' ? 'w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-900 flex items-center justify-center' : 'w-8 h-8 md:w-10 md:h-10 rounded-full bg-orange-100 flex items-center justify-center'}>
                      <Calendar className={mounted && theme === 'dark' ? 'w-4 h-4 md:w-5 md:h-5 text-orange-300' : 'w-4 h-4 md:w-5 md:h-5 text-orange-600'} />
                    </div>
                    <div>
                      <p className={`font-semibold text-base md:text-lg ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Estado Actual</p>
                      <Badge className={`${statusConfig[selectedOrder.status].color} border text-xs md:text-sm`}>
                        {
                          (() => {
                            const StatusIcon = statusConfig[selectedOrder.status].icon;
                            return <StatusIcon className="w-3 h-3 mr-1" />;
                          })()
                        }
                        {t(`admin.orders.status.${selectedOrder.status}`)}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-8">
                  <p className={`font-semibold text-lg md:text-xl ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Descripción del Pedido</p>
                  <p className={`mt-2 text-sm md:text-base ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>{selectedOrder.description}</p>
                </div>
              </div>

              {/* Sección derecha - Historial y Acciones */}
              <div className={mounted && theme === 'dark' ? 'md:w-1/3 p-4 md:p-6 lg:p-8 bg-slate-800 flex flex-col justify-between' : 'md:w-1/3 p-4 md:p-6 lg:p-8 bg-gray-50 flex flex-col justify-between'}>
                <div>
                  <h3 className={`font-bold text-base md:text-lg ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Historial del Pedido</h3>
                  <div className="mt-3 md:mt-4 space-y-3 md:space-y-4">
                    {/* Placeholder para el historial */}
                    <div className={mounted && theme === 'dark' ? 'flex items-center' : 'flex items-center'}>
                      <div className={mounted && theme === 'dark' ? 'w-2 h-2 rounded-full bg-blue-400 mr-4' : 'w-2 h-2 rounded-full bg-blue-500 mr-4'}></div>
                      <span className={mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>{t('admin.orders.history.createdBy', { client: selectedOrder.client, days: selectedOrder.daysElapsed })}</span>
                    </div>
                    <div className={mounted && theme === 'dark' ? 'flex items-center' : 'flex items-center'}>
                      <div className={mounted && theme === 'dark' ? 'w-2 h-2 rounded-full bg-yellow-400 mr-4' : 'w-2 h-2 rounded-full bg-yellow-500 mr-4'}></div>
                      <span className={mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}>En espera de cotización</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 md:mt-8 flex flex-col space-y-2">
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
                      <SelectItem key={statusKey} value={statusKey}>{t(`admin.orders.status.${statusKey}`)}</SelectItem>
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
                      <SelectItem key={assignedKey} value={assignedKey}>{t(`admin.orders.assigned.${assignedKey}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="daysElapsed" className={mounted && theme === 'dark' ? 'text-right text-slate-200' : 'text-right'}>{t('admin.orders.form.daysElapsed')}</Label>
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