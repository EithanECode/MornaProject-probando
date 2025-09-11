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
import { useToast } from '@/hooks/use-toast';
import { useClientContext } from '@/lib/ClientContext';
import { useTranslation } from '@/hooks/useTranslation';
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
  X,
  Filter
  ,Download
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
  stateNum?: number; // estado numérico 1..13 desde BD para badges detallados
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

// Tipos para modal de tracking (copiados del tracking)
interface TrackingOrder {
  id: string;
  product: string;
  trackingNumber: string;
  status: 'pending' | 'processing' | 'shipped' | 'in-transit' | 'delivered' | 'cancelled';
  progress: number;
  estimatedDelivery: string;
  currentLocation: string;
  lastUpdate: string;
  carrier: string;
  timeline: Array<{
    id: string;
    status: string;
    description: string;
    location: string;
    timestamp: string;
    completed: boolean;
  }>;
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
  const { t } = useTranslation();
  const { clientId, clientName, clientEmail, clientRole } = useClientContext();

  // Supabase client (navegador)
  const supabase = getSupabaseBrowserClient();
  const { toast } = useToast();
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
  // Estado del modal de seguimiento
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [selectedTrackingOrder, setSelectedTrackingOrder] = useState<TrackingOrder | null>(null);

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
  const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

  // Inicialización
  useEffect(() => {
    setMounted(true);
  }, []);

  // Mapeos de estado numérico de la BD a estados de UI y progreso
  const mapStateToStatus = (state?: number | null): Order['status'] => {
    if (!state) return 'pending';
    // Coarse mapping para UI del cliente
    if (state === 3) return 'quoted';
    if (state >= 4 && state <= 7) return 'processing';
    if (state === 8 || state === 9) return 'shipped';
    if (state === 10 || state === 11 || state === 12) return 'processing';
    if (state >= 13) return 'delivered';
    if (state === 2) return 'pending';
    return 'pending';
  };

  const mapStateToProgress = (state?: number | null): number => {
    switch (state) {
      case 1: return 10; // creado
      case 2: return 20; // recibido
      case 3: return 30; // cotizado
      case 4: return 60; // procesando
      case 5: return 70; // en proceso
      case 6: return 75; // en proceso
      case 7: return 80; // en proceso
  case 8: return 85; // enviado a vzla
  case 9: return 90; // llegando a Vzla
      case 10: return 92; // en aduana
      case 11: return 95; // recibido
      case 12: return 98; // listo para entrega
      case 13: return 100; // entregado
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
          stateNum: typeof row.state === 'number' ? row.state : (row.state ? Number(row.state) : undefined),
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

  // Agregar realtime para pedidos del cliente
  useEffect(() => {
    if (!clientId) return;

    const ordersChannel = supabase
      .channel(`client-orders-mis-pedidos-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          console.log('Realtime: Mis pedidos changed', payload);
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [clientId, supabase]);

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

  // Helpers específicos para el modal de tracking (colores simples)
  const getTrackingStatusColor = (status: string) => {
    switch (status) {
  case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200 transition-colors hover:bg-yellow-50 hover:ring-1 hover:ring-yellow-200';
  case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200 transition-colors hover:bg-blue-50 hover:ring-1 hover:ring-blue-200';
  case 'shipped': return 'bg-purple-100 text-purple-800 border-purple-200 transition-colors hover:bg-purple-50 hover:ring-1 hover:ring-purple-200';
  case 'in-transit': return 'bg-orange-100 text-orange-800 border-orange-200 transition-colors hover:bg-orange-50 hover:ring-1 hover:ring-orange-200';
  case 'delivered': return 'bg-green-100 text-green-800 border-green-200 transition-colors hover:bg-green-50 hover:ring-1 hover:ring-green-200';
  case 'cancelled': return 'bg-red-100 text-red-800 border-red-200 transition-colors hover:bg-red-50 hover:ring-1 hover:ring-red-200';
  default: return 'bg-gray-100 text-gray-800 border-gray-200 transition-colors hover:bg-gray-50 hover:ring-1 hover:ring-gray-200';
    }
  };

  const getTrackingStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'processing': return 'Procesando';
      case 'shipped': return 'Enviado';
      case 'in-transit': return 'En Tránsito';
      case 'delivered': return 'Entregado';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  // Construir objeto de tracking a partir de un pedido
  const buildTrackingFromOrder = (order: Order): TrackingOrder => {
    const mapStatus = (s: Order['status']): TrackingOrder['status'] => {
      if (s === 'shipped') return 'in-transit';
      if (s === 'delivered') return 'delivered';
      if (s === 'processing') return 'processing';
      if (s === 'cancelled') return 'cancelled';
      return 'pending';
    };

    const status = mapStatus(order.status);
    const steps = [
      { id: '1', key: 'created' },
      { id: '2', key: 'processing' },
      { id: '3', key: 'shipped' },
  { id: '4', key: 'in_transit' },
      { id: '5', key: 'customs' },
      { id: '6', key: 'delivered' },
    ];
    const statusIndexMap: Record<TrackingOrder['status'], number> = {
      pending: 0,
      processing: 1,
      shipped: 2,
      'in-transit': 3,
      delivered: 5,
      cancelled: 0,
    };
    const idx = statusIndexMap[status] ?? 0;

    const timeline: TrackingOrder['timeline'] = steps.map((s, i) => ({
      id: s.id,
      status: s.key,
      description: s.key,
      location: i <= idx ? (i === 3 ? 'En ruta' : '—') : '—',
      timestamp: '—',
      completed: i <= idx && status !== 'cancelled',
    }));

    return {
      id: order.id,
      product: order.product,
      trackingNumber: order.tracking || 'N/A',
      status,
      progress: order.progress ?? 0,
      estimatedDelivery: order.estimatedDelivery || '—',
      currentLocation: status === 'in-transit' || status === 'delivered' ? 'En tránsito' : '—',
      lastUpdate: '—',
      carrier: '—',
      timeline,
    };
  };

  const openTrackingModal = (order: Order) => {
    const t = buildTrackingFromOrder(order);
    setSelectedTrackingOrder(t);
    setTimeout(() => setIsTrackingModalOpen(true), 10);
  };

  const closeTrackingModal = () => {
    setIsTrackingModalOpen(false);
    setTimeout(() => setSelectedTrackingOrder(null), 300);
  };

  // Funciones helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300 shadow-sm transition-colors hover:from-yellow-50 hover:to-yellow-100 hover:ring-1 hover:ring-yellow-200 dark:hover:ring-yellow-500/20 hover:brightness-110 dark:hover:brightness-110';
      case 'quoted': return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 shadow-sm transition-colors hover:from-green-50 hover:to-green-100 hover:ring-1 hover:ring-green-200 dark:hover:ring-green-500/20 hover:brightness-110 dark:hover:brightness-110';
      case 'processing': return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 shadow-sm transition-colors hover:from-blue-50 hover:to-blue-100 hover:ring-1 hover:ring-blue-200 dark:hover:ring-blue-500/20 hover:brightness-110 dark:hover:brightness-110';
      case 'shipped': return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 shadow-sm transition-colors hover:from-purple-50 hover:to-purple-100 hover:ring-1 hover:ring-purple-200 dark:hover:ring-purple-500/20 hover:brightness-110 dark:hover:brightness-110';
      case 'delivered': return 'bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800 border-emerald-300 shadow-sm transition-colors hover:from-emerald-50 hover:to-emerald-100 hover:ring-1 hover:ring-emerald-200 dark:hover:ring-emerald-500/20 hover:brightness-110 dark:hover:brightness-110';
      case 'cancelled': return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300 shadow-sm transition-colors hover:from-red-50 hover:to-red-100 hover:ring-1 hover:ring-red-200 dark:hover:ring-red-500/20 hover:brightness-110 dark:hover:brightness-110';
      default: return 'bg-gradient-to-r from-slate-100 to-slate-200 text-slate-800 border-slate-300 shadow-sm transition-colors hover:from-slate-50 hover:to-slate-100 hover:ring-1 hover:ring-slate-200 dark:hover:ring-slate-500/20 hover:brightness-110 dark:hover:brightness-110';
    }
  };

  const getStatusText = (status: string) => {
    return t(`client.recentOrders.statuses.${status}`) || status;
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (progress >= 50) return 'bg-gradient-to-r from-blue-500 to-indigo-500';
    if (progress >= 25) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-slate-400 to-slate-500';
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

  const handlePaymentConfirm = async () => {
    if (!selectedOrderForPayment) return;
    if (!clientId) {
      toast({ title: 'No autenticado', description: 'Debes iniciar sesión para confirmar el pago.', variant: 'destructive', duration: 4000 });
      return;
    }
    setIsConfirmingPayment(true);
    try {
      const rawId = selectedOrderForPayment.id;
      const orderId = isNaN(Number(rawId)) ? rawId : Number(rawId);
      const { error } = await supabase
        .from('orders')
        .update({ state: 4 })
        .eq('id', orderId as any)
        .eq('client_id', clientId);
      if (error) {
        console.error('Error actualizando estado del pedido:', error);
        toast({ title: 'Error al confirmar pago', description: error.message || 'Intenta nuevamente.', variant: 'destructive', duration: 5000 });
        return;
      }
      // Refrescar pedidos y cerrar modal
      await fetchOrders();
  toast({ title: 'Pago confirmado', description: 'Tu pedido ha sido marcado como pagado. Estado actualizado a 4.', duration: 4000 });
      setIsPaymentModalOpen(false);
      setSelectedOrderForPayment(null);
      setSelectedPaymentMethod(null);
      setPaymentStep(1);
    } catch (e: any) {
      console.error('Excepción confirmando pago:', e);
      toast({ title: 'Error inesperado', description: e?.message || 'Ocurrió un problema al confirmar el pago.', variant: 'destructive', duration: 5000 });
    } finally {
      setIsConfirmingPayment(false);
    }
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

            // Preparar payload para creación vía API (service role) evitando problemas RLS / constraints
            const payload = {
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
              order_origin: 'vzla'
            };
            console.log('Creando pedido vía API /api/admin/orders:', payload);
            const apiRes = await fetch('/api/admin/orders', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload)
            });
            if (!apiRes.ok) {
              let errMsg = `Status ${apiRes.status}`;
              try {
                const j = await apiRes.json();
                if (j?.error) errMsg += ` - ${j.error}`;
                if (j?.details) errMsg += ` | ${Array.isArray(j.details) ? j.details.join(', ') : j.details}`;
              } catch { /* ignore */ }
              console.error('Error creando pedido (cliente) vía API:', errMsg, payload);
              alert('Error al guardar el pedido en la base de datos.\n' + errMsg);
              return;
            }
            const json = await apiRes.json().catch(() => null);
            if (json?.warning === 'links_removed_due_to_constraint') {
              console.warn('El link fue removido por constraint en la BD.');
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
                client_id: ''
              });
            }, 1500);
            // Refrescar desde BD para mostrar el pedido real
            fetchOrders();
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
      case 1: return t('client.recentOrders.newOrder.stepTitles.productInfo');
      case 2: return t('client.recentOrders.newOrder.stepTitles.shippingDetails');
      case 3: return t('client.recentOrders.newOrder.stepTitles.summaryConfirmation');
      default: return '';
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return t('client.recentOrders.newOrder.stepDescriptions.productInfo');
      case 2: return t('client.recentOrders.newOrder.stepDescriptions.shippingDetails');
      case 3: return t('client.recentOrders.newOrder.stepDescriptions.summaryConfirmation');
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
          title={t('client.recentOrders.title')}
          subtitle={t('client.recentOrders.subtitle')}
        />
        
        <div className="p-4 md:p-5 lg:p-6 space-y-6 md:space-y-6 lg:space-y-8">
          {/* Header de la página */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl p-4 md:p-6 lg:p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                <div>
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">{t('client.recentOrders.title')}</h1>
                  <p className="text-green-100 text-sm md:text-base lg:text-lg">{t('client.dashboard.panel')}</p>
                  <p className="text-green-200 mt-2 text-xs md:text-sm">{t('client.recentOrders.subtitle')}</p>
                </div>
                
                <div className="grid grid-cols-2 md:flex md:items-center md:space-x-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold">{stats.total}</div>
                    <p className="text-green-100 text-xs md:text-sm">{t('client.dashboard.totalOrders')}</p>
                  </div>
                  <div className="hidden md:block w-px h-12 md:h-16 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold">${stats.totalSpent.toLocaleString()}</div>
                    <p className="text-green-100 text-xs md:text-sm">{t('client.dashboard.totalSpent')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botón Nuevo Pedido */}
          <div className="flex justify-end">
            <Dialog open={isNewOrderModalOpen} onOpenChange={setIsNewOrderModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('client.quickActions.newOrder')}
                </Button>
              </DialogTrigger>
              <DialogContent ref={modalRef} className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
                <DialogHeader className="text-center pb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 animate-pulse"></div>
                    <DialogTitle className="relative text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent animate-fade-in-up">
                      ✨ {t('client.quickActions.newOrder')}
                    </DialogTitle>
                  </div>
                  <DialogDescription className="text-lg text-slate-600 mt-2">
                    {t('client.recentOrders.newOrder.dialogDescription')}
                  </DialogDescription>
                </DialogHeader>

                {/* Enhanced Progress Bar */}
                <div className={`space-y-4 mb-8 transition-all duration-300 ${
                  isTransitioning ? 'opacity-75' : 'opacity-100'
                }`}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{t('client.recentOrders.newOrder.step', { current: currentStep, total: 3 })}</span>
                    <span className="font-bold text-blue-600">{t('client.recentOrders.newOrder.percentComplete', { percent: Math.round((currentStep / 3) * 100) })}</span>
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
                            {step === 1 ? t('client.recentOrders.newOrder.productTab') : step === 2 ? t('client.recentOrders.newOrder.shippingTab') : t('client.recentOrders.newOrder.summaryTab')}
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
                            {t('client.recentOrders.newOrder.success.title')}
                          </h3>
                          <p className="text-slate-600 text-lg">{t('client.recentOrders.newOrder.success.message')}</p>
                          <Button
                            onClick={() => setShowSuccessAnimation(false)}
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white transition-all duration-300 transform hover:scale-105 shadow-lg mt-4"
                          >
                            {t('client.recentOrders.newOrder.success.button')}
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
                          {t('client.recentOrders.newOrder.productName')}
                        </Label>
                        <div className="relative group">
                          <Input
                            id="productName"
                            value={newOrderData.productName}
                            onChange={(e) => setNewOrderData({ ...newOrderData, productName: e.target.value })}
                            placeholder={t('client.recentOrders.newOrder.productNamePlaceholder')}
                            className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm border-slate-200 group-hover:border-blue-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="description" className="text-sm font-semibold text-slate-700 flex items-center">
                          <FileText className="w-4 h-4 mr-2 text-blue-600" />
                          {t('client.recentOrders.newOrder.productDescription')}
                        </Label>
                        <div className="relative group">
                          <Textarea
                            id="description"
                            value={newOrderData.description}
                            onChange={(e) => setNewOrderData({ ...newOrderData, description: e.target.value })}
                            placeholder={t('client.recentOrders.newOrder.productDescriptionPlaceholder')}
                            rows={4}
                            className="transition-all duration-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm border-slate-200 group-hover:border-blue-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="quantity" className="text-sm font-semibold text-slate-700 flex items-center">
                          <Hash className="w-4 h-4 mr-2 text-blue-600" />
                          {t('client.recentOrders.newOrder.quantity')}
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
                            <p className="text-xs text-red-500 mt-1">{t('client.recentOrders.newOrder.invalidQuantity')}</p>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="specifications" className="text-sm font-semibold text-slate-700 flex items-center">
                          <Settings className="w-4 h-4 mr-2 text-blue-600" />
                          {t('client.recentOrders.newOrder.specifications')}
                        </Label>
                        <div className="relative group">
                          <Textarea
                            id="specifications"
                            value={newOrderData.specifications}
                            onChange={(e) => setNewOrderData({ ...newOrderData, specifications: e.target.value })}
                            placeholder={t('client.recentOrders.newOrder.specificationsPlaceholder')}
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
                          {t('client.recentOrders.newOrder.requestType')}
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
                                <p className="font-semibold text-slate-800">{t('client.recentOrders.newOrder.linkTitle')}</p>
                                <p className="text-sm text-slate-600">{t('client.recentOrders.newOrder.linkSubtitle')}</p>
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
                                <p className="font-semibold text-slate-800">{t('client.recentOrders.newOrder.photoTitle')}</p>
                                <p className="text-sm text-slate-600">{t('client.recentOrders.newOrder.photoSubtitle')}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {newOrderData.requestType === 'link' && (
                          <div className="space-y-2">
                            <Label htmlFor="productUrl">{t('client.recentOrders.newOrder.productUrl')}</Label>
                            <Input
                              id="productUrl"
                              type="url"
                              value={newOrderData.productUrl || ''}
                              onChange={(e) => setNewOrderData({ ...newOrderData, productUrl: e.target.value })}
                              placeholder={t('client.recentOrders.newOrder.productUrlPlaceholder')}
                              className={`transition-all duration-200 focus:ring-2 focus:ring-blue-500 ${
                                newOrderData.requestType === 'link' && !newOrderData.productUrl ? 'border-red-300 focus:ring-red-500' : ''
                              }`}
                            />

                            {newOrderData.productUrl && !isValidUrl(newOrderData.productUrl) && (
                              <p className="text-xs text-red-500 mt-1">{t('client.recentOrders.newOrder.invalidUrl')}</p>
                            )}
                          </div>
                        )}

                        {newOrderData.requestType === 'photo' && (
                          <div className="space-y-3">
                            <Label className="text-sm font-semibold text-slate-700 flex items-center">
                              <Image className="w-4 h-4 mr-2 text-blue-600" />
                              {t('client.recentOrders.newOrder.productImage')}
                            </Label>
                            
                            {newOrderData.productImage ? (
                              // Vista de imagen subida
                              <div className="relative group">
                                <div className="border-2 border-slate-200 rounded-xl overflow-hidden bg-white/80 backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
                                  <div className="relative">
                                    <img
                                      src={URL.createObjectURL(newOrderData.productImage)}
                                      alt="Producto"
                                      className="w-full h-48 object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                                      <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => document.getElementById('imageUpload')?.click()}
                                          className="bg-white/90 hover:bg-white text-slate-700 border-0 shadow-lg"
                                        >
                                          <Upload className="w-4 h-4 mr-1" />
                                          {t('client.recentOrders.newOrder.change')}
                                        </Button>
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => setNewOrderData({ ...newOrderData, productImage: undefined })}
                                          className="bg-white/90 hover:bg-white text-red-600 border-0 shadow-lg hover:text-red-700"
                                        >
                                          <X className="w-4 h-4 mr-1" />
                                          {t('client.recentOrders.newOrder.delete')}
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="p-4">
                                    <p className="text-sm font-medium text-slate-800 truncate">
                                      {newOrderData.productImage.name}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {(newOrderData.productImage.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <input
                                  id="imageUpload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                              </div>
                            ) : (
                              // Vista de drag & drop
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
                                  {t('client.recentOrders.newOrder.dragDrop')}
                                </p>
                                <Button
                                  variant="outline"
                                  onClick={() => document.getElementById('imageUpload')?.click()}
                                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105"
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  {t('client.recentOrders.newOrder.selectImage')}
                                </Button>
                                <input
                                  id="imageUpload"
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageUpload}
                                  className="hidden"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 2: Detalles del Envío */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label>{t('client.recentOrders.newOrder.deliveryType')}</Label>
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
                              <p className="font-medium">{t('client.recentOrders.newOrder.doorToDoor')}</p>
                              <p className="text-sm text-slate-600">{t('client.recentOrders.newOrder.doorToDoorDesc')}</p>
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
                              <p className="font-medium">{t('client.recentOrders.newOrder.air')}</p>
                              <p className="text-sm text-slate-600">{t('client.recentOrders.newOrder.airDesc')}</p>
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
                              <p className="font-medium">{t('client.recentOrders.newOrder.maritime')}</p>
                              <p className="text-sm text-slate-600">{t('client.recentOrders.newOrder.maritimeDesc')}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="deliveryVenezuela">{t('client.recentOrders.newOrder.deliveryVenezuela')}</Label>
                        <Select value={newOrderData.deliveryVenezuela} onValueChange={(value) => setNewOrderData({ ...newOrderData, deliveryVenezuela: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder={t('client.recentOrders.newOrder.deliveryVenezuelaPlaceholder')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pickup">{t('client.recentOrders.newOrder.pickup')}</SelectItem>
                            <SelectItem value="delivery">{t('client.recentOrders.newOrder.delivery')}</SelectItem>
                            <SelectItem value="express">{t('client.recentOrders.newOrder.express')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="estimatedBudget">{t('client.recentOrders.newOrder.estimatedBudget')}</Label>
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
                          placeholder={t('client.recentOrders.newOrder.estimatedBudgetPlaceholder')}
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                        {newOrderData.estimatedBudget && !isValidBudget(newOrderData.estimatedBudget) && (
                          <p className="text-xs text-red-500 mt-1">{t('client.recentOrders.newOrder.invalidBudget')}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Step 3: Resumen y Confirmación */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="bg-slate-50 rounded-lg p-6 space-y-4">
                        <h4 className="font-semibold text-lg">{t('client.recentOrders.newOrder.summaryTitle')}</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-600">{t('client.recentOrders.newOrder.productName')}</p>
                            <p className="font-medium">{newOrderData.productName}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-600">{t('client.recentOrders.newOrder.quantity')}</p>
                            <p className="font-medium">{newOrderData.quantity}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-600">{t('client.recentOrders.newOrder.deliveryType')}</p>
                            <p className="font-medium">
                              {newOrderData.deliveryType === 'doorToDoor' && t('client.recentOrders.newOrder.doorToDoor')}
                              {newOrderData.deliveryType === 'air' && t('client.recentOrders.newOrder.air')}
                              {newOrderData.deliveryType === 'maritime' && t('client.recentOrders.newOrder.maritime')}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-600">{t('client.recentOrders.newOrder.estimatedBudget')}</p>
                            <p className="font-medium">${newOrderData.estimatedBudget}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-600">{t('client.recentOrders.newOrder.productDescription')}</p>
                          <p className="text-sm">{newOrderData.description}</p>
                        </div>

                        {newOrderData.specifications && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-600">{t('client.recentOrders.newOrder.specifications')}</p>
                            <p className="text-sm">{newOrderData.specifications}</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-blue-900">{t('client.recentOrders.newOrder.almostReady')}</p>
                            <p className="text-sm text-blue-700">
                              {t('client.recentOrders.newOrder.reviewMessage')}
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
                        {t('client.recentOrders.newOrder.transitioning')}
                      </div>
                    ) : (
                      <>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {t('client.recentOrders.newOrder.previous')}
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
                            {t('client.recentOrders.newOrder.transitioning')}
                          </div>
                        ) : (
                          <>
                            {t('client.recentOrders.newOrder.next')}
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
                        {t('client.recentOrders.newOrder.createOrder')}
                      </Button>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">{t('client.dashboard.totalOrders')}</CardTitle>
                <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                  <Package className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-900">{stats.total}</div>
                <p className="text-xs text-blue-700">{t('client.recentOrders.table.id')}</p>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-800">{t('client.recentOrders.statuses.pending')}</CardTitle>
                <div className="p-2 bg-yellow-500 rounded-lg group-hover:scale-110 transition-transform">
                  <Clock className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-900">{stats.pending}</div>
                <p className="text-xs text-yellow-700">{t('client.recentOrders.statuses.pending')}</p>
                <div className="mt-2 w-full bg-yellow-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${(stats.pending / stats.total) * 100}%`}}></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-800">{t('client.recentOrders.statuses.processing')}</CardTitle>
                <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                  <Truck className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-900">{stats.processing}</div>
                <p className="text-xs text-blue-700">{t('client.recentOrders.statuses.processing')}</p>
                <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(stats.processing / stats.total) * 100}%`}}></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-800">{t('client.recentOrders.statuses.shipped')}</CardTitle>
                <div className="p-2 bg-purple-500 rounded-lg group-hover:scale-110 transition-transform">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-purple-900">{stats.shipped}</div>
                <p className="text-xs text-purple-700">{t('client.recentOrders.statuses.shipped')}</p>
                <div className="mt-2 w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(stats.shipped / stats.total) * 100}%`}}></div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-800">{t('client.dashboard.totalSpent')}</CardTitle>
                <div className="p-2 bg-emerald-500 rounded-lg group-hover:scale-110 transition-transform">
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl lg:text-3xl font-bold text-emerald-900">${stats.totalSpent.toLocaleString()}</div>
                <p className="text-xs text-emerald-700">{t('client.dashboard.totalInvestment')}</p>
                <div className="mt-2 w-full bg-emerald-200 rounded-full h-2">
                  <div className="bg-emerald-500 h-2 rounded-full" style={{width: '100%'}}></div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y búsqueda - barra compacta y alineada a la derecha */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base md:text-lg font-semibold">{t('client.recentOrders.filter')}</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder={t('client.recentOrders.search')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 pl-8 w-56 md:w-64 transition-colors"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10 w-40 md:w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder={t('client.recentOrders.filter')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('client.recentOrders.filter')}</SelectItem>
                      <SelectItem value="pending">{t('client.recentOrders.statuses.pending')}</SelectItem>
                      <SelectItem value="quoted">{t('client.recentOrders.statuses.quoted')}</SelectItem>
                      <SelectItem value="processing">{t('client.recentOrders.statuses.processing')}</SelectItem>
                      <SelectItem value="shipped">{t('client.recentOrders.statuses.shipped')}</SelectItem>
                      <SelectItem value="delivered">{t('client.recentOrders.statuses.delivered')}</SelectItem>
                      <SelectItem value="cancelled">{t('client.recentOrders.statuses.cancelled')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Lista de pedidos */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">{t('client.recentOrders.title')}</CardTitle>
              <p className="text-sm text-slate-600">{t('client.recentOrders.subtitle')}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-4 md:p-6 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md transition-all duration-300 group">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6 mb-4">
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="flex flex-col">
                          <p className="font-bold text-sm md:text-base text-slate-800">{order.id}</p>
                          <p className="text-sm text-slate-600 font-medium">{order.product}</p>
                        </div>
                        {/* Un solo badge basado en stateNum; fallback al badge de status si no hay stateNum */}
                        {typeof order.stateNum === 'number' ? (
                          <Badge className={`text-xs md:text-sm font-semibold px-3 py-1 transition-colors hover:brightness-110 hover:ring-1 ${
                            order.stateNum === 13 ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:ring-emerald-200 dark:hover:ring-emerald-500/20' :
                            order.stateNum === 12 ? 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-50 hover:ring-gray-200 dark:hover:ring-gray-500/20' :
                            order.stateNum === 11 ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-50 hover:ring-green-200 dark:hover:ring-green-500/20' :
                            order.stateNum === 10 ? 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-50 hover:ring-orange-200 dark:hover:ring-orange-500/20' :
                            order.stateNum === 9 ? 'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-50 hover:ring-cyan-200 dark:hover:ring-cyan-500/20' :
                            order.stateNum === 8 ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:ring-emerald-200 dark:hover:ring-emerald-500/20' :
                            order.stateNum === 7 ? 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-50 hover:ring-indigo-200 dark:hover:ring-indigo-500/20' :
                            order.stateNum === 6 ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-50 hover:ring-blue-200 dark:hover:ring-blue-500/20' :
                            order.stateNum === 5 ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:ring-yellow-200 dark:hover:ring-yellow-500/20' :
                            order.stateNum === 4 ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-50 hover:ring-blue-200 dark:hover:ring-blue-500/20' :
                            order.stateNum === 3 ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-50 hover:ring-green-200 dark:hover:ring-green-500/20' :
                            order.stateNum === 2 ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:ring-yellow-200 dark:hover:ring-yellow-500/20' :
                            'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:ring-yellow-200 dark:hover:ring-yellow-500/20'
                          }`}>
                            {order.stateNum === 5 ? t('client.recentOrders.statuses.paymentValidated') :
                             order.stateNum === 6 ? t('client.recentOrders.statuses.packagingBox') :
                             order.stateNum === 7 ? t('client.recentOrders.statuses.packagingContainer') :
                             order.stateNum === 9 ? t('client.recentOrders.statuses.sentFromChina') :
                             order.stateNum === 10 ? t('client.recentOrders.statuses.inCustoms') :
                             order.stateNum === 11 ? t('client.recentOrders.statuses.arriving') :
                             order.stateNum === 12 ? t('client.recentOrders.statuses.inStore') :
                             order.stateNum === 13 ? t('client.recentOrders.statuses.delivered') :
                             order.stateNum === 8 ? t('client.recentOrders.statuses.shipped') :
                             order.stateNum === 4 ? t('client.recentOrders.statuses.processing') :
                             order.stateNum === 3 ? t('client.recentOrders.statuses.quoted') :
                             order.stateNum === 2 ? t('client.recentOrders.statuses.pending') :
                             t('client.recentOrders.statuses.pending')}
                          </Badge>
                        ) : (
                          <Badge className={`${getStatusColor(order.status)} text-xs md:text-sm font-semibold px-3 py-1`}>
                            {getStatusText(order.status)}
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] md:text-[11px] uppercase tracking-wide text-slate-500 font-medium">
                          {order.status === 'pending' && t('client.recentOrders.budget')}
                          {order.status === 'quoted' && t('client.recentOrders.statuses.quoted')}
                          {order.status !== 'pending' && order.status !== 'quoted' && t('client.recentOrders.table.amount')}
                        </p>
                        <p className="font-bold text-lg md:text-xl text-slate-800">
                          {order.status === 'pending' && typeof order.estimatedBudget !== 'undefined' && order.estimatedBudget !== null
                            ? `$${Number(order.estimatedBudget).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                            : order.status === 'quoted' && typeof order.totalQuote !== 'undefined' && order.totalQuote !== null
                              ? `$${Number(order.totalQuote).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
                              : order.amount}
                        </p>
                        <p className="text-xs text-slate-600 font-medium">Tracking: {order.tracking || '-'}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-slate-700">{t('client.recentOrders.progress')}</span>
                        <span className="text-slate-800">{order.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2 md:h-3 overflow-hidden">
                        <div 
                          className={`h-2 md:h-3 rounded-full transition-all duration-500 ${getProgressColor(order.progress)}`} 
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex flex-col md:flex-row md:justify-between gap-3 md:gap-0 text-sm">
                        <span className="text-slate-600 font-medium">{t('client.recentOrders.estimatedDelivery')}: {order.estimatedDelivery}</span>
                        <div className="flex gap-2 md:gap-3">
                          {order.status === 'quoted' && (
                            <Button 
                              size="sm" 
                              className="h-7 md:h-8 px-3 md:px-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                              onClick={() => handlePaymentClick(order)}
                            >
                              <DollarSign className="h-3 w-3 mr-1" />
                              {t('client.recentOrders.actions.pay')}
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 md:h-8 px-3 md:px-4 text-xs font-semibold border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300"
                            onClick={() => handleViewDetails(order)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            {t('client.recentOrders.actions.view')}
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="h-7 md:h-8 px-3 md:px-4 text-xs font-semibold border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300 transition-all duration-300"
                            onClick={() => openTrackingModal(order)}
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            {t('client.recentOrders.actions.track')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredOrders.length === 0 && (
                  <div className="text-center py-12 md:py-16">
                    <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center">
                      <Package className="h-8 w-8 md:h-10 md:w-10 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-base md:text-lg font-medium">{t('client.recentOrders.noOrders')}</p>
                    <p className="text-slate-400 text-sm mt-2">Intenta ajustar los filtros de búsqueda</p>
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
                <DialogTitle>{t('client.recentOrders.modal.detailsTitle')}: {selectedOrder.id}</DialogTitle>
                <DialogDescription>
                  {t('client.recentOrders.modal.detailsSubtitle')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{t('client.recentOrders.modal.product')}</p>
                    <p className="text-lg">{selectedOrder.product}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">
                      {selectedOrder.status === 'pending' && t('client.recentOrders.budget')}
                      {selectedOrder.status === 'quoted' && t('client.recentOrders.statuses.quoted')}
                      {selectedOrder.status !== 'pending' && selectedOrder.status !== 'quoted' && t('client.recentOrders.modal.amount')}
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
                    <p className="text-sm font-medium text-slate-600">{t('client.recentOrders.modal.status')}</p>
                    {typeof selectedOrder.stateNum === 'number' ? (
                      <Badge className={`text-xs font-semibold px-3 py-1 transition-colors hover:brightness-110 hover:ring-1 ${
                        selectedOrder.stateNum === 13 ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:ring-emerald-200 dark:hover:ring-emerald-500/20' :
                        selectedOrder.stateNum === 12 ? 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-50 hover:ring-gray-200 dark:hover:ring-gray-500/20' :
                        selectedOrder.stateNum === 11 ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-50 hover:ring-green-200 dark:hover:ring-green-500/20' :
                        selectedOrder.stateNum === 10 ? 'bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-50 hover:ring-orange-200 dark:hover:ring-orange-500/20' :
                        selectedOrder.stateNum === 9 ? 'bg-cyan-100 text-cyan-800 border-cyan-200 hover:bg-cyan-50 hover:ring-cyan-200 dark:hover:ring-cyan-500/20' :
                        selectedOrder.stateNum === 8 ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-50 hover:ring-emerald-200 dark:hover:ring-emerald-500/20' :
                        selectedOrder.stateNum === 7 ? 'bg-indigo-100 text-indigo-800 border-indigo-200 hover:bg-indigo-50 hover:ring-indigo-200 dark:hover:ring-indigo-500/20' :
                        selectedOrder.stateNum === 6 ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-50 hover:ring-blue-200 dark:hover:ring-blue-500/20' :
                        selectedOrder.stateNum === 5 ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:ring-yellow-200 dark:hover:ring-yellow-500/20' :
                        selectedOrder.stateNum === 4 ? 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-50 hover:ring-blue-200 dark:hover:ring-blue-500/20' :
                        selectedOrder.stateNum === 3 ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-50 hover:ring-green-200 dark:hover:ring-green-500/20' :
                        selectedOrder.stateNum === 2 ? 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:ring-yellow-200 dark:hover:ring-yellow-500/20' :
                        'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:ring-yellow-200 dark:hover:ring-yellow-500/20'
                      }`}>
                        {selectedOrder.stateNum === 13 ? t('client.recentOrders.statuses.delivered') :
                         selectedOrder.stateNum === 5 ? t('client.recentOrders.statuses.paymentValidated') :
                         selectedOrder.stateNum === 6 ? t('client.recentOrders.statuses.packagingBox') :
                         selectedOrder.stateNum === 7 ? t('client.recentOrders.statuses.packagingContainer') :
                         selectedOrder.stateNum === 9 ? t('client.recentOrders.statuses.sentFromChina') :
                         selectedOrder.stateNum === 10 ? t('client.recentOrders.statuses.inCustoms') :
                         selectedOrder.stateNum === 11 ? t('client.recentOrders.statuses.arriving') :
                         selectedOrder.stateNum === 12 ? t('client.recentOrders.statuses.inStore') :
                         selectedOrder.stateNum === 13 ? t('client.recentOrders.statuses.delivered') :
                         selectedOrder.stateNum === 8 ? t('client.recentOrders.statuses.shipped') :
                         selectedOrder.stateNum === 4 ? t('client.recentOrders.statuses.processing') :
                         selectedOrder.stateNum === 3 ? t('client.recentOrders.statuses.quoted') :
                         selectedOrder.stateNum === 2 ? t('client.recentOrders.statuses.pending') :
                         t('client.recentOrders.statuses.pending')}
                      </Badge>
                    ) : (
                      <Badge className={getStatusColor(selectedOrder.status)}>
                        {getStatusText(selectedOrder.status)}
                      </Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-600">{t('client.recentOrders.modal.tracking')}</p>
                    <p className="text-sm font-mono">{selectedOrder.tracking}</p>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">{t('client.recentOrders.modal.description')}</p>
                  <p className="text-sm text-slate-700">{selectedOrder.description}</p>
                </div>

                {/* Progreso */}
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">{t('client.recentOrders.progress')}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('client.recentOrders.modal.currentProgress')}</span>
                      <span>{selectedOrder.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full ${getProgressColor(selectedOrder.progress)}`} 
                        style={{ width: `${selectedOrder.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-600">
                      {t('client.recentOrders.estimatedDelivery')}: {selectedOrder.estimatedDelivery}
                    </p>
                  </div>
                </div>

                {/* Documentos */}
                {selectedOrder.documents && selectedOrder.documents.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">{t('client.recentOrders.modal.detailsSubtitle')}</p>
                    <div className="space-y-2">
                      {selectedOrder.documents.map((doc, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-slate-50 rounded">
                          <div className="w-4 h-4 text-blue-600">
                            {doc.type === 'image' ? '📷' : '🔗'}
                          </div>
                          <span className="text-sm">{doc.label}</span>
                          <Button variant="ghost" size="sm" className="h-6 px-2 ml-auto">
                            {t('client.recentOrders.actions.view')}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Acciones */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    {t('client.recentOrders.modal.downloadInvoice')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          )}
        </Dialog>

        {/* Modal de Seguimiento (copiado del tracking) */}
        {selectedTrackingOrder && (
          <div 
            className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ease-out ${
              isTrackingModalOpen 
                ? 'bg-black/50 backdrop-blur-sm opacity-100' 
                : 'bg-black/0 backdrop-blur-none opacity-0'
            }`}
            onClick={closeTrackingModal}
          >
            <div 
              className={`bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-all duration-300 ease-out transform ${
                isTrackingModalOpen 
                  ? 'scale-100 opacity-100 translate-y-0' 
                  : 'scale-95 opacity-0 translate-y-8'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedTrackingOrder.product}</h2>
                    <p className="text-slate-600">{selectedTrackingOrder.id}</p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={closeTrackingModal}
                  >
                    ✕
                  </Button>
                </div>

                {/* Información del tracking */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">{t('client.recentOrders.trackingModal.trackingNumber')}</p>
                    <p className="font-mono font-medium">{selectedTrackingOrder.trackingNumber}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">{t('client.recentOrders.trackingModal.carrier')}</p>
                    <p className="font-medium">{selectedTrackingOrder.carrier}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">{t('client.recentOrders.trackingModal.estimatedDelivery')}</p>
                    <p className="font-medium">{selectedTrackingOrder.estimatedDelivery}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">{t('client.recentOrders.trackingModal.currentStatus')}</p>
                    <Badge className={getTrackingStatusColor(selectedTrackingOrder.status)}>
                      {t(`client.recentOrders.trackingModal.states.${selectedTrackingOrder.status}`)}
                    </Badge>
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">{t('client.recentOrders.trackingModal.historyTitle')}</h3>
                  <div className="space-y-4">
                    {selectedTrackingOrder.timeline.map((step, index) => (
                      <div key={step.id} className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          step.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {step.completed ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <span className="text-xs font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{t(`client.recentOrders.trackingModal.states.${step.status}`)}</p>
                          <p className="text-sm text-slate-600">{t(`client.recentOrders.trackingModal.states.${step.status}`)}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span className="text-xs text-slate-500">{step.location}</span>
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">{step.timestamp}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Pago */}
        <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                💳 {t('client.recentOrders.paymentModal.title')}
              </DialogTitle>
              <DialogDescription className="text-center">
                {paymentStep === 1 
                  ? t('client.recentOrders.paymentModal.selectMethod') 
                  : t('client.recentOrders.paymentModal.confirmDetails')}
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
                      <p className="text-xs text-slate-500 mt-1">{t('client.recentOrders.paymentModal.quoteValidUntil', { date: '25/01/2024' })}</p>
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
                                  ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-50 hover:ring-1 hover:ring-green-200 transition-colors' 
                                  : 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-50 hover:ring-1 hover:ring-yellow-200 transition-colors'
                              }`}>
                                {method.validation === 'automatic' ? `⚡ ${t('client.recentOrders.paymentModal.automatic')}` : t('client.recentOrders.paymentModal.manual')}
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
                      <h4 className="font-semibold text-lg">📋 {t('client.recentOrders.paymentModal.paymentInfo')}</h4>
                      
                      {selectedPaymentMethod.id === 'mobile' && (
                        <div className="space-y-3">
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700">{t('client.recentOrders.paymentModal.phoneNumber')}</p>
                            <p className="text-lg font-mono font-bold text-blue-600">{selectedPaymentMethod.details?.phoneNumber}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700">{t('client.recentOrders.paymentModal.reference')}</p>
                            <p className="text-lg font-mono font-bold text-green-600">{selectedPaymentMethod.details?.reference}</p>
                          </div>
                        </div>
                      )}

                      {selectedPaymentMethod.id === 'transfer' && (
                        <div className="space-y-3">
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700">{t('client.recentOrders.paymentModal.bank')}</p>
                            <p className="text-lg font-bold text-blue-600">{selectedPaymentMethod.details?.bankName}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700">{t('client.recentOrders.paymentModal.accountNumber')}</p>
                            <p className="text-lg font-mono font-bold text-green-600">{selectedPaymentMethod.details?.accountNumber}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700">{t('client.recentOrders.paymentModal.reference')}</p>
                            <p className="text-lg font-mono font-bold text-purple-600">{selectedPaymentMethod.details?.reference}</p>
                          </div>
                        </div>
                      )}

                      {(selectedPaymentMethod.id === 'binance' || selectedPaymentMethod.id === 'zelle' || selectedPaymentMethod.id === 'paypal') && (
                        <div className="space-y-3">
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700">{t('client.recentOrders.paymentModal.email')}</p>
                            <p className="text-lg font-mono font-bold text-blue-600">{selectedPaymentMethod.details?.email}</p>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <p className="text-sm font-medium text-slate-700">{t('client.recentOrders.paymentModal.reference')}</p>
                            <p className="text-lg font-mono font-bold text-green-600">{selectedPaymentMethod.details?.reference}</p>
                          </div>
                        </div>
                      )}

                      {/* Instrucciones */}
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-start gap-2">
                          <div className="text-yellow-600 mt-0.5">⚠️</div>
                          <div>
                            <p className="font-medium text-yellow-800">{t('client.recentOrders.paymentModal.importantInstructions')}</p>
                            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
                              <li>• {t('client.recentOrders.paymentModal.instructions.exactReference')}</li>
                              <li>• {t('client.recentOrders.paymentModal.instructions.saveReceipt')}</li>
                              <li>• {t('client.recentOrders.paymentModal.instructions.processTime')}</li>
                              {selectedPaymentMethod.validation === 'manual' && (
                                <li>• {t('client.recentOrders.paymentModal.instructions.manualValidation')}</li>
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
                    {paymentStep === 1 ? t('client.recentOrders.paymentModal.cancel') : t('client.recentOrders.paymentModal.back')}
                  </Button>
                  
                  {paymentStep === 2 && (
                    <Button 
                      onClick={handlePaymentConfirm}
                      disabled={isConfirmingPayment}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isConfirmingPayment ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          {t('client.recentOrders.paymentModal.processing')}
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          {t('client.recentOrders.paymentModal.confirmPayment')}
                        </>
                      )}
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
