"use client";

// Force dynamic rendering to avoid SSR issues with XLSX
export const dynamic = 'force-dynamic';

import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useToast } from '@/hooks/use-toast';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Toaster } from '@/components/ui/toaster';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// XLSX se importará dinámicamente para evitar errores de SSR
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Eye, 
  MoreHorizontal, 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  Clock, 
  Package,
  User,
  Calendar,
  Hash,
  Check,
  X,
  AlertTriangle,
  MapPin,
  TrendingUp,
  Bell,
  Menu,
  RotateCcw
} from 'lucide-react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useVzlaContext } from '@/lib/VzlaContext';
import { useRealtimeVzlaPayments } from '@/hooks/use-realtime-vzla-payments';
import { useTranslation } from '@/hooks/useTranslation';

// ================================
// TIPOS DE DATOS TYPESCRIPT
// ================================
interface Payment {
  id: string;
  usuario: string;
  fecha: string;
  idProducto: string;
  monto: number;
  referencia: string;
  estado: 'completado' | 'pendiente' | 'rechazado';
  metodo: string;
  destino?: string;
  descripcion?: string;
}

interface PaymentStats {
  totalGastado: number;
  pagosTotales: number;
  completados: number;
  pendientes: number;
}

// Tipo parcial de la tabla orders necesario para mapear a Payment
interface DbOrder {
  id: string | number;
  client_id: string;
  productName: string | null;
  description: string | null;
  totalQuote: number | null;
  estimatedBudget: number | null;
  created_at: string | null;
  state: number;
}

// ================================
// DATOS MOCK
// ================================
const mockPayments: Payment[] = [
  {
    id: 'PED-001',
    usuario: 'Ana Pérez',
    fecha: '2025-08-09',
    idProducto: '#ORD-001',
    monto: 2450.00,
    referencia: 'REF-78945612',
    estado: 'pendiente',
    metodo: 'Transferencia Bancaria',
    destino: 'China',
    descripcion: 'Electrónicos varios'
  },
  {
    id: 'PED-002',
    usuario: 'Carlos Ruiz',
    fecha: '2025-08-08',
    idProducto: '#ORD-002',
    monto: 1890.50,
    referencia: 'REF-78945613',
    estado: 'completado',
    metodo: 'Tarjeta de Crédito',
    destino: 'Venezuela',
    descripcion: 'Herramientas industriales'
  },
  {
    id: 'PED-003',
    usuario: 'Lucía Méndez',
    fecha: '2025-08-08',
    idProducto: '#ORD-003',
    monto: 3200.75,
    referencia: 'REF-78945614',
    estado: 'pendiente',
    metodo: 'PayPal',
    destino: 'China',
    descripcion: 'Ropa deportiva'
  },
  {
    id: 'PED-004',
    usuario: 'Empresa XYZ',
    fecha: '2025-08-07',
    idProducto: '#ORD-004',
    monto: 5450.25,
    referencia: 'REF-78945615',
    estado: 'completado',
    metodo: 'Transferencia',
    destino: 'Venezuela',
    descripcion: 'Maquinaria pesada'
  },
  {
    id: 'PED-005',
    usuario: 'Tiendas ABC',
    fecha: '2025-08-07',
    idProducto: '#ORD-005',
    monto: 720.00,
    referencia: 'REF-78945616',
    estado: 'completado',
    metodo: 'Tarjeta de Débito',
    destino: 'Venezuela',
    descripcion: 'Productos de belleza'
  },
  {
    id: 'PED-006',
    usuario: 'Juan Rodríguez',
    fecha: '2025-08-06',
    idProducto: '#ORD-006',
    monto: 1675.30,
    referencia: 'REF-78945617',
    estado: 'pendiente',
    metodo: 'Transferencia',
    destino: 'China',
    descripcion: 'Equipos médicos'
  },
  {
    id: 'PED-007',
    usuario: 'María González',
    fecha: '2025-08-06',
    idProducto: '#ORD-007',
    monto: 980.00,
    referencia: 'REF-78945618',
    estado: 'pendiente',
    metodo: 'PayPal',
    destino: 'Venezuela',
    descripcion: 'Materiales de construcción'
  },
  {
    id: 'PED-008',
    usuario: 'Roberto Silva',
    fecha: '2025-08-05',
    idProducto: '#ORD-008',
    monto: 4200.80,
    referencia: 'REF-78945619',
    estado: 'completado',
    metodo: 'Transferencia',
    destino: 'China',
    descripcion: 'Tecnología avanzada'
  }
];

// ================================
// COMPONENTE: ICONO ANIMADO
// ================================
const AnimatedIcon: React.FC<{
  children: React.ReactNode;
  animation?: 'bounce' | 'pulse' | 'float' | 'spin' | 'shake' | Array<'bounce' | 'pulse' | 'float' | 'spin' | 'shake'>;
  className?: string;
}> = ({ children, animation = 'pulse', className = '' }) => {
  const animations = {
    bounce: 'animate-bounce',
    pulse: 'animate-pulse',
    float: 'hover:animate-pulse transition-all duration-300 hover:-translate-y-1',
    spin: 'animate-spin',
    shake: 'hover:animate-bounce transition-all duration-300'
  };
  let animClass = '';
  if (Array.isArray(animation)) {
    animClass = animation.map(a => animations[a]).join(' ');
  } else {
    animClass = animations[animation];
  }
  return (
    <div className={`${animClass} ${className}`}>
      {children}
    </div>
  );
};

// ================================
// COMPONENTE: TARJETAS DE ESTADÍSTICAS
// ================================
const StatsCards: React.FC<{ stats: PaymentStats }> = ({ stats }) => {
  const { t } = useTranslation();
  const cardsData = [
    {
      title: t('venezuela.pagos.stats.totalSpent'),
      value: `$${stats.totalGastado.toLocaleString()}`,
      icon: <TrendingUp size={24} />,
      bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
      textColor: 'text-blue-100'
    },
    {
      title: t('venezuela.pagos.stats.totalPayments'),
      value: stats.pagosTotales,
      icon: <CreditCard size={24} />,
      bgColor: 'bg-gradient-to-r from-orange-500 to-orange-600',
      textColor: 'text-orange-100'
    },
    {
      title: t('venezuela.pagos.stats.completed'),
      value: stats.completados,
  icon: <AnimatedIcon animation={["pulse","bounce"]}><CheckCircle size={24} /></AnimatedIcon>,
      bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
      textColor: 'text-green-100'
    },
    {
      title: t('venezuela.pagos.stats.pending'),
      value: stats.pendientes,
  icon: <AnimatedIcon animation={["pulse","spin"]}><Clock size={24} /></AnimatedIcon>,
      bgColor: 'bg-gradient-to-r from-purple-500 to-purple-600',
      textColor: 'text-purple-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
      {cardsData.map((card, index) => (
        <div 
          key={index}
          className={`${card.bgColor} text-white p-4 md:p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`${card.textColor} text-xs md:text-sm font-medium mb-1`}>
                {card.title}
              </p>
              <p className="text-xl md:text-2xl lg:text-3xl font-bold">
                {card.value}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-2 md:p-3 rounded-lg">
              <AnimatedIcon animation="float">
                {card.icon}
              </AnimatedIcon>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ================================
// COMPONENTE: STATUS BADGE
// ================================
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const { t } = useTranslation();
  const getStatusConfig = (estado: string) => {
    const configs = {
      completado: {
        className: 'bg-green-100 text-green-800 border-green-200',
        text: t('venezuela.pagos.status.completado'),
        icon: <AnimatedIcon animation={["pulse","bounce"]}><CheckCircle size={12} /></AnimatedIcon>
      },
      pendiente: {
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        text: t('venezuela.pagos.status.pendiente'),
        icon: <AnimatedIcon animation={["pulse","spin"]}><Clock size={12} /></AnimatedIcon>
      },
      rechazado: {
        className: 'bg-red-100 text-red-800 border-red-200',
        text: t('venezuela.pagos.status.rechazado'),
        icon: <AnimatedIcon animation={["pulse","shake"]}><X size={12} /></AnimatedIcon>
      }
    };
    return configs[estado as keyof typeof configs] || configs.pendiente;
  };

  const config = getStatusConfig(status);

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border gap-1 transition-all duration-300 hover:scale-105 ${config.className}`}>
      <AnimatedIcon animation="pulse">
        {config.icon}
      </AnimatedIcon>
      <span className="truncate">{config.text}</span>
    </span>
  );
};

// ================================
// COMPONENTE: MODAL DE DETALLES DE PAGO
// ================================
const PaymentDetailsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}> = ({ isOpen, onClose, payment }) => {
  const { t } = useTranslation();
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      // Pequeño delay para que la animación de entrada sea visible
      setTimeout(() => setIsVisible(true), 10);
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen || !payment) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-300 ${
        isClosing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleBackdropClick}
    >
      <div className={`bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl transition-all duration-300 transform ${
        isClosing ? 'scale-95 opacity-0' : (isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0')
      }`}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{t('venezuela.pagos.modal.details.title')}</h3>
            <p className="text-sm text-gray-500">{payment.id}</p>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">{t('venezuela.pagos.modal.details.clientInfo')}</h4>
            <p><span className="font-medium">{t('venezuela.pagos.modal.details.fields.user')}</span> {payment.usuario}</p>
            <p><span className="font-medium">{t('venezuela.pagos.modal.details.fields.productId')}</span> {payment.idProducto}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">{t('venezuela.pagos.modal.details.paymentInfo')}</h4>
            <p><span className="font-medium">{t('venezuela.pagos.modal.details.fields.amount')}</span> ${payment.monto.toLocaleString()}</p>
            <p><span className="font-medium">{t('venezuela.pagos.modal.details.fields.date')}</span> {new Date(payment.fecha).toLocaleDateString('es-ES')}</p>
            <p><span className="font-medium">{t('venezuela.pagos.modal.details.fields.reference')}</span> {payment.referencia}</p>
            <p><span className="font-medium">{t('venezuela.pagos.modal.details.fields.method')}</span> {payment.metodo}</p>
          </div>
          <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">{t('venezuela.pagos.modal.details.additionalDetails')}</h4>
            <p><span className="font-medium">{t('venezuela.pagos.modal.details.fields.destination')}</span> {payment.destino}</p>
            <p><span className="font-medium">{t('venezuela.pagos.modal.details.fields.description')}</span> {payment.descripcion}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================================
// COMPONENTE: CARD DE PAGO PARA MOBILE
// ================================
const PaymentCard: React.FC<{ payment: Payment; onApprove: (id: string) => void; onReject: (id: string) => void; onViewDetails: (payment: Payment) => void }> = ({ 
  payment, 
  onApprove, 
  onReject, 
  onViewDetails 
}) => {
  const { t } = useTranslation();
  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('es-ES', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs font-semibold">
            {payment.id.split('-')[1]}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{payment.usuario}</h3>
            <p className="text-xs text-gray-500">{payment.idProducto}</p>
          </div>
        </div>
        <StatusBadge status={payment.estado} />
      </div>

      {/* Detalles */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">{t('venezuela.pagos.mobile.date')}</span>
          <span className="font-medium">{formatDate(payment.fecha)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t('venezuela.pagos.mobile.amount')}</span>
          <span className="font-semibold text-green-600">{formatCurrency(payment.monto)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">{t('venezuela.pagos.mobile.method')}</span>
          <span className="font-medium">{payment.metodo}</span>
        </div>
        {payment.destino && (
          <div className="flex justify-between">
            <span className="text-gray-600">{t('venezuela.pagos.mobile.destination')}</span>
            <span className="font-medium">{payment.destino}</span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => onViewDetails(payment)}
          className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4 inline mr-1" />
      {t('venezuela.pagos.actions.view')}
        </button>
        {payment.estado === 'pendiente' && (
          <>
            <button
              onClick={() => onApprove(payment.id)}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4 inline mr-1" />
        {t('venezuela.pagos.actions.approve')}
            </button>
            <button
              onClick={() => onReject(payment.id)}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4 inline mr-1" />
        {t('venezuela.pagos.actions.reject')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ================================
// COMPONENTE: DIÁLOGO DE CONFIRMACIÓN
// ================================
const ConfirmationDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
        <div className="flex items-center">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 ml-4">{title}</h3>
        </div>
        <p className="mt-4 text-sm text-gray-600">{message}</p>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            {t('venezuela.pagos.modal.reject.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            {t('venezuela.pagos.modal.reject.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
};

// ================================
// COMPONENTE PRINCIPAL
// ================================
const PaymentValidationDashboard: React.FC = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [selectedTab, setSelectedTab] = useState<'todos' | 'pendientes'>('todos');
  const [rejectionConfirmation, setRejectionConfirmation] = useState<{ isOpen: boolean; paymentId: string | null }>({ isOpen: false, paymentId: null });
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; payment: Payment | null }>({ isOpen: false, payment: null });
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [lastAction, setLastAction] = useState<{
    type: 'approve' | 'reject';
    paymentId: string;
    previousStatus: string;
  } | null>(null);
  const [mounted, setMounted] = useState(false);
  const [lastRealtimeUpdate, setLastRealtimeUpdate] = useState<number | null>(null);
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const { vzlaId } = useVzlaContext();
  useEffect(() => { setMounted(true); }, []);

  // Realtime: recargar cuando cambian pedidos pendientes relacionados
  useRealtimeVzlaPayments(() => {
    setRefreshIndex(i => i + 1);
    setLastRealtimeUpdate(Date.now());
  }, vzlaId);

  // Realtime for clients: refresh when client names or data change
  useEffect(() => {
    const channel = supabase
      .channel(`vzla-payments-clients-${vzlaId || 'all'}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => {
        setRefreshIndex(i => i + 1);
        setLastRealtimeUpdate(Date.now());
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase, vzlaId]);

  // Polling fallback: refetch periodically in case a realtime event is missed
  useEffect(() => {
    if (!vzlaId) return;
    const intervalMs = 10000; // 10s
    const id = setInterval(() => {
      setRefreshIndex(i => i + 1);
      setLastRealtimeUpdate(Date.now());
    }, intervalMs);
    return () => clearInterval(id);
  }, [vzlaId]);

  useEffect(() => {
    const load = async () => {
      if (!vzlaId) return;
      setLoading(true);
      setError(null);
      // Guard de timeout para evitar 'Cargando...' infinito
      const timeoutMs = 15000; // 15s
      let timeoutHandle: any;
      const startTimeout = () => {
        timeoutHandle = setTimeout(() => {
          setError('La consulta está tardando demasiado (timeout). Verifica conexión y políticas RLS.');
          setLoading(false);
        }, timeoutMs);
      };
      const clearTimeoutSafe = () => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
      };
      startTimeout();
      try {
        const selectCols = 'id, client_id, productName, description, totalQuote, estimatedBudget, created_at, state';
        // Filtro principal: columna "asigned" (id de usuario de Supabase)
        let { data, error } = await supabase
          .from('orders')
          .select(selectCols)
          .eq('asigned', vzlaId)
          .gte('state', 4)
          .order('created_at', { ascending: false });

  // Fallback 1: "asignnedEVzla" (solo si el error es de columna)
  const isColumnError1 = error && /column|does not exist|42703/i.test(error.message || '');
  if (isColumnError1) {
          const fb1 = await supabase
            .from('orders')
            .select(selectCols)
            .eq('asignnedEVzla', vzlaId)
            .gte('state', 4)
            .order('created_at', { ascending: false });
          data = fb1.data as any[] | null;
          error = fb1.error as any;
        }

  // Fallback 2: "asignedEVzla" (solo si persiste error de columna)
  const isColumnError2 = error && /column|does not exist|42703/i.test(error.message || '');
  if (isColumnError2) {
          const fb2 = await supabase
            .from('orders')
            .select(selectCols)
            .eq('asignedEVzla', vzlaId)
            .gte('state', 4)
            .order('created_at', { ascending: false });
          data = fb2.data as any[] | null;
          error = fb2.error as any;
        }

        if (error) throw error;

        const clientIds = (data || []).map((o: any) => o.client_id);
        let clientMap = new Map<string, string>();
        if (clientIds.length) {
          const { data: clients, error: cErr } = await supabase
            .from('clients')
            .select('user_id, name')
            .in('user_id', clientIds);
          if (cErr) throw cErr;
          clientMap = new Map((clients || []).map((c: any) => [c.user_id, c.name || 'Cliente']));
        }

  const mapped: Payment[] = (data as DbOrder[] | null)?.map((o) => {
          const estado: Payment['estado'] = o.state === 4 ? 'pendiente' : 'completado';
          return {
            id: String(o.id),
            usuario: clientMap.get(o.client_id) || 'Cliente',
            fecha: o.created_at || new Date().toISOString(),
            idProducto: o.productName ? `#${o.productName}` : `#ORD-${o.id}`,
            monto: Number(o.totalQuote ?? o.estimatedBudget ?? 0),
            referencia: `ORD-${o.id}`,
            estado,
            metodo: 'Transferencia',
            destino: 'Venezuela',
            descripcion: o.description || 'Pedido en proceso de pago'
          };
        }) || [];

  setPayments(mapped);
      } catch (e: any) {
  setError(e?.message || t('venezuela.pagos.error.loadErrorTitle'));
      } finally {
  clearTimeoutSafe();
        setLoading(false);
      }
    };
    load();
  }, [vzlaId, refreshIndex, supabase]);

  // Calcular estadísticas
  const stats = useMemo((): PaymentStats => {
    const completados = payments.filter(p => p.estado === 'completado');
    const pendientes = payments.filter(p => p.estado === 'pendiente');
    
    return {
      totalGastado: completados.reduce((sum, p) => sum + p.monto, 0),
      pagosTotales: payments.length,
      completados: completados.length,
      pendientes: pendientes.length
    };
  }, [payments]);

  // Filtrar pagos
  const filteredPayments = useMemo(() => {
    let filtered = payments;

    // Filtro por pestaña
    if (selectedTab === 'pendientes') {
      filtered = filtered.filter(p => p.estado === 'pendiente');
    }

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(payment => 
        payment.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.referencia.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.idProducto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por estado
    if (filterStatus !== 'todos') {
      filtered = filtered.filter(p => p.estado === filterStatus);
    }

    return filtered;
  }, [payments, searchTerm, filterStatus, selectedTab]);

  // Deshacer con parámetros explícitos (recomendado para toasts)
  const handleUndoFor = async (
    paymentId: string,
    previousStatus: 'completado' | 'pendiente' | 'rechazado',
    type: 'approve' | 'reject'
  ) => {
    // UI optimista: revertir estado visual al previo
    setPayments(prev => prev.map(p =>
      p.id === paymentId ? { ...p, estado: previousStatus } : p
    ));

    try {
      if (type === 'approve') {
        const idFilter: any = isNaN(Number(paymentId)) ? paymentId : Number(paymentId);
        const { error } = await supabase
          .from('orders')
          .update({ state: 4 })
          .eq('id', idFilter);
        if (error) throw error;
      }
      toast({
  title: t('venezuela.pagos.toasts.undoTitle'),
  description: t('venezuela.pagos.toasts.undoDesc'),
        variant: 'default',
        duration: 3000,
      });
    } catch (e: any) {
      // Si falla la reversión en BD, informamos y reintentamos devolver UI al estado post-aprobación
      toast({
  title: t('venezuela.pagos.toasts.undoErrorTitle'),
  description: e?.message || t('venezuela.pagos.toasts.undoErrorDesc'),
        variant: 'destructive',
        duration: 4000,
      });
      if (type === 'approve') {
        setPayments(prev => prev.map(p =>
          p.id === paymentId ? { ...p, estado: 'completado' } : p
        ));
      }
    }
  };

  // Función para deshacer la última acción (fallback legado)
  const handleUndo = async () => {
    if (!lastAction) return;

    const { paymentId, previousStatus, type } = lastAction;

    // UI optimista: revertir estado visual
    setPayments(prev => prev.map(p =>
      p.id === paymentId ? { ...p, estado: previousStatus as 'completado' | 'pendiente' | 'rechazado' } : p
    ));

    // Persistencia: si el último fue aprobar, regresamos a state=4
    try {
      if (type === 'approve') {
        const idFilter: any = isNaN(Number(paymentId)) ? paymentId : Number(paymentId);
        const { error } = await supabase
          .from('orders')
          .update({ state: 4 })
          .eq('id', idFilter);
        if (error) throw error;
      }
      // Si en el futuro agregamos persistencia para reject, manejar aquí
      toast({
  title: t('venezuela.pagos.toasts.undoTitle'),
  description: t('venezuela.pagos.toasts.undoDesc'),
        variant: 'default',
        duration: 3000,
      });
      setLastAction(null);
    } catch (e: any) {
      // Si falla la reversión en BD, informamos y reintentamos devolver UI al estado post-aprobación
      toast({
  title: t('venezuela.pagos.toasts.undoErrorTitle'),
  description: e?.message || t('venezuela.pagos.toasts.undoErrorDesc'),
        variant: 'destructive',
        duration: 4000,
      });
      // Recolocar UI al estado que tenía tras la acción previa (approve => completado)
      if (type === 'approve') {
        setPayments(prev => prev.map(p =>
          p.id === paymentId ? { ...p, estado: 'completado' } : p
        ));
      }
    }
  };

  // Manejar aprobación
  const handleApprove = async (id: string) => {
    const payment = payments.find(p => p.id === id);
    if (!payment) return;

    // Guardamos acción previa para permitir deshacer
    setLastAction({
      type: 'approve',
      paymentId: id,
      previousStatus: payment.estado,
    });

    // UI optimista
    setPayments(prev => prev.map(p =>
      p.id === id ? { ...p, estado: 'completado' as const } : p
    ));

    // Persistir: state = 5 (verificado)
    try {
      const idFilter: any = isNaN(Number(id)) ? id : Number(id);
      const { error } = await supabase
        .from('orders')
        .update({ state: 5 })
        .eq('id', idFilter);
      if (error) throw error;
    } catch (e: any) {
      // Revertir UI si falla
      setPayments(prev => prev.map(p =>
        p.id === id ? { ...p, estado: payment.estado } : p
      ));
      setLastAction(null);
      toast({
        title: t('venezuela.pagos.toasts.approveErrorTitle'),
        description: e?.message || t('venezuela.pagos.toasts.approveErrorDesc'),
        variant: 'destructive',
        duration: 4000,
      });
      return;
    }

    toast({
      title: t('venezuela.pagos.toasts.approvedTitle'),
      description: t('venezuela.pagos.toasts.approvedDesc', { id }),
      variant: 'default',
      duration: 3000,
      action: (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleUndoFor(id, payment.estado as any, 'approve');
          }}
          className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
        >
          <RotateCcw size={14} />
          {t('venezuela.pagos.actions.undo')}
        </button>
      ),
    });
  };

  // Manejar rechazo
  const handleReject = (id: string) => {
    const payment = payments.find(p => p.id === id);
    if (payment) {
      setLastAction({
        type: 'reject',
        paymentId: id,
        previousStatus: payment.estado
      });
      
      setPayments(prev => prev.map(p => 
        p.id === id ? { ...p, estado: 'rechazado' as const } : p
      ));
      setRejectionConfirmation({ isOpen: false, paymentId: null });

      toast({
    title: t('venezuela.pagos.toasts.rejectedTitle'),
    description: t('venezuela.pagos.toasts.rejectedDesc', { id }),
        variant: "default",
        duration: 3000,
        action: (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleUndo();
            }}
            className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
          >
            <RotateCcw size={14} />
      {t('venezuela.pagos.actions.undo')}
          </button>
        ),
      });
    }
  };

  const openRejectionConfirmation = (id: string) => {
    setRejectionConfirmation({ isOpen: true, paymentId: id });
  };

  const closeRejectionConfirmation = () => {
    setRejectionConfirmation({ isOpen: false, paymentId: null });
  };

  const openDetailsModal = (payment: Payment) => {
    setDetailsModal({ isOpen: true, payment });
  };

  const closeDetailsModal = () => {
    setDetailsModal({ isOpen: false, payment: null });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('es-ES', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const exportarGeneral = async () => {
    const data = filteredPayments.map(payment => ({
      [t('venezuela.pagos.export.columns.orderId')]: payment.id,
      [t('venezuela.pagos.export.columns.client')]: payment.usuario,
      [t('venezuela.pagos.export.columns.status')]: payment.estado,
      [t('venezuela.pagos.export.columns.date')]: payment.fecha,
      [t('venezuela.pagos.export.columns.amount')]: payment.monto,
      [t('venezuela.pagos.export.columns.reference')]: payment.referencia,
      [t('venezuela.pagos.export.columns.destination')]: payment.destino,
      [t('venezuela.pagos.export.columns.description')]: payment.descripcion
    }));

            const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, t('venezuela.pagos.export.sheetName'));
  XLSX.writeFile(workbook, t('venezuela.pagos.export.fileName'));
  };

  return (
    <>
      <PaymentDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={closeDetailsModal}
        payment={detailsModal.payment}
      />
          <ConfirmationDialog
        isOpen={rejectionConfirmation.isOpen}
        onClose={closeRejectionConfirmation}
        onConfirm={() => {
          if (rejectionConfirmation.paymentId) {
            handleReject(rejectionConfirmation.paymentId);
          }
        }}
        title={t('venezuela.pagos.modal.reject.title')}
        message={t('venezuela.pagos.modal.reject.message')}
      />
      <div
        className={
          `min-h-screen flex overflow-x-hidden ` +
          (mounted && theme === 'dark'
            ? 'bg-slate-900'
            : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50')
        }
      >
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
          notifications={3}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title={t('venezuela.pagos.title')}
          subtitle={t('venezuela.pagos.subtitle')}
        />
        <div className="p-4 md:p-5 lg:p-6">
          {/* Error visible */}
          {error && (
            <div className="mb-4 md:mb-6 flex items-start justify-between gap-3 rounded-lg border border-red-300 bg-red-50 p-3 text-red-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5" size={18} />
                <div>
                  <p className="font-semibold">{t('venezuela.pagos.error.loadErrorTitle')}</p>
                  <p className="text-sm break-all">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* ================================ */}
          {/* TARJETAS DE ESTADÍSTICAS */}
          {/* ================================ */}
          <StatsCards stats={stats} />
          {lastRealtimeUpdate && (
            <div className="mb-4 text-xs text-gray-500 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {t('venezuela.pagos.realtime.lastUpdate', { time: new Date(lastRealtimeUpdate).toLocaleTimeString('es-ES') })}
              </span>
              <button
                onClick={() => setRefreshIndex(i => i + 1)}
                className="px-2 py-1 border rounded-md text-[10px] hover:bg-gray-100 transition-colors"
              >{t('venezuela.pagos.realtime.refresh')}</button>
            </div>
          )}

          {/* ================================ */}
          {/* PESTAÑAS */}
          {/* ================================ */}
          <div className="mb-4 md:mb-6">
            <div className={mounted && theme === 'dark' ? 'border-b border-slate-700' : 'border-b border-gray-200'}>
              <nav className="-mb-px flex space-x-4 md:space-x-8">
                {[
                  { id: 'todos', label: t('venezuela.pagos.tabs.ordersList'), count: loading ? 0 : payments.length },
                  { id: 'pendientes', label: t('venezuela.pagos.tabs.pendingPayments'), count: loading ? 0 : stats.pendientes },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`py-3 md:py-4 px-1 border-b-2 font-medium text-xs md:text-sm transition-all duration-200 flex items-center gap-1 md:gap-2 ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : mounted && theme === 'dark'
                          ? 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                    <span className={`px-1.5 md:px-2 py-0.5 md:py-1 rounded-full text-xs ${
                      selectedTab === tab.id 
                        ? 'bg-blue-100 text-blue-600' 
                        : mounted && theme === 'dark'
                          ? 'bg-slate-700 text-slate-200'
                          : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* ================================ */}
          {/* BARRA COMPACTA DERECHA */}
          {/* ================================ */}
          <Card className={mounted && theme === 'dark' ? 'bg-slate-800 border-slate-700 mb-4 md:mb-6' : 'bg-white border-gray-200 mb-4 md:mb-6'}>
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{t('venezuela.pagos.listCardTitle')}</CardTitle>
                {/* i18n: list title */}
                
                <div className="w-full sm:w-auto flex items-center justify-end gap-2 md:gap-3 flex-wrap">
                  <Input
                    placeholder={t('venezuela.pagos.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="h-10 w-56 md:w-64 px-3"
                  />
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="h-10 w-40 md:w-48 px-3 whitespace-nowrap truncate">
                      <SelectValue placeholder={t('venezuela.pagos.filters.allStatuses')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">{t('venezuela.pagos.filters.allStatuses')}</SelectItem>
                      <SelectItem value="completado">{t('venezuela.pagos.filters.completed')}</SelectItem>
                      <SelectItem value="pendiente">{t('venezuela.pagos.filters.pending')}</SelectItem>
                      <SelectItem value="rechazado">{t('venezuela.pagos.filters.rejected')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    className="h-10 bg-[#202841] text-white hover:bg-opacity-90"
                    onClick={exportarGeneral}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">{t('venezuela.pagos.actions.export')}</span>
                    <span className="sm:hidden">{t('venezuela.pagos.actions.exportShort')}</span>
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* ================================ */}
          {/* TABLA DE PAGOS */}
          {/* ================================ */}
          
          {/* Header de la tabla */}
          <div className={mounted && theme === 'dark' ? 'bg-slate-800 rounded-xl shadow-sm overflow-hidden' : 'bg-white rounded-xl shadow-sm overflow-hidden'}>
            <div className={mounted && theme === 'dark' ? 'px-4 md:px-6 py-3 md:py-4 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800' : 'px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white'}>
              <h2 className={`text-lg md:text-xl font-semibold flex items-center gap-2 ${mounted && theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <AnimatedIcon animation="float">
                                      <Package className="md:w-6 md:h-6 text-blue-500" />
                </AnimatedIcon>
                {selectedTab === 'pendientes' ? t('venezuela.pagos.table.pendingApprovalTitle') :
                 t('venezuela.pagos.table.ordersListTitle')}
              </h2>
              <p className={mounted && theme === 'dark' ? 'text-slate-300 text-xs md:text-sm mt-1' : 'text-gray-600 text-xs md:text-sm mt-1'}>
                {loading ? t('venezuela.pagos.table.loading') : t('venezuela.pagos.table.resultsFound', { count: filteredPayments.length })}
              </p>
            </div>

            {/* Vista Mobile - Cards */}
            <div className="block lg:hidden p-4 space-y-4">
              {!loading && filteredPayments.map((payment) => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onApprove={handleApprove}
                  onReject={openRejectionConfirmation}
                  onViewDetails={openDetailsModal}
                />
              ))}
            </div>

            {/* Vista Desktop - Tabla */}
            <div className="hidden lg:block overflow-x-auto">
              <table className={`w-full table-fixed ${mounted && theme === 'dark' ? 'bg-slate-800' : ''}`}> 
                <thead className={mounted && theme === 'dark' ? 'bg-slate-900' : 'bg-gray-50'}>
                  <tr>
                    {[
                      { label: t('venezuela.pagos.table.headers.id'), icon: <AnimatedIcon animation={["pulse","bounce"]}><Hash size={14} /></AnimatedIcon>, width: 'w-44' },
                      { label: t('venezuela.pagos.table.headers.client'), icon: <AnimatedIcon animation={["pulse","bounce"]}><User size={14} /></AnimatedIcon>, width: 'w-36' },
                      { label: t('venezuela.pagos.table.headers.status'), icon: <AnimatedIcon animation={["pulse","bounce"]}><CheckCircle size={14} /></AnimatedIcon>, width: 'w-32' },
                      { label: t('venezuela.pagos.table.headers.date'), icon: <AnimatedIcon animation={["pulse","bounce"]}><Calendar size={14} /></AnimatedIcon>, width: 'w-24' },
                      { label: t('venezuela.pagos.table.headers.amount'), icon: <AnimatedIcon animation={["pulse","bounce"]}><DollarSign size={14} /></AnimatedIcon>, width: 'w-28' },
                      { label: t('venezuela.pagos.table.headers.reference'), icon: <AnimatedIcon animation={["pulse","bounce"]}><Hash size={14} /></AnimatedIcon>, width: 'w-36' },
                      { label: t('venezuela.pagos.table.headers.destination'), icon: <AnimatedIcon animation={["pulse","bounce"]}><MapPin size={14} /></AnimatedIcon>, width: 'w-28' },
                      { label: t('venezuela.pagos.table.headers.actions'), icon: <AnimatedIcon animation={["pulse","shake"]}><MoreHorizontal size={14} /></AnimatedIcon>, width: 'w-28' }
                    ].map((header, index) => (
                      <th key={index} className={`px-2 py-3 text-left ${header.width}`}>
                        <div className={`flex items-center gap-1 text-xs font-semibold uppercase tracking-wider ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-gray-600'}`}>
                          <AnimatedIcon animation="pulse">
                            {header.icon}
                          </AnimatedIcon>
                          <span className="truncate">{header.label}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr 
                      key={payment.id} 
                      className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all duration-200 group"
                    >
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-500 text-white rounded-lg flex items-center justify-center text-xs font-semibold flex-shrink-0">
                            {payment.id.split('-')[1]}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-medium truncate ${mounted && theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{payment.id}</div>
                            <div className={`text-xs truncate ${mounted && theme === 'dark' ? 'text-slate-400' : 'text-gray-500'}`}>{payment.descripcion}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-2">
                          <div className={mounted && theme === 'dark' ? 'w-7 h-7 bg-slate-700 text-blue-200 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0' : 'w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0'}>
                            {payment.usuario.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className={`text-sm font-medium truncate ${mounted && theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{payment.usuario}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <StatusBadge status={payment.estado} />
                      </td>
                      <td className={`px-2 py-3 text-sm ${mounted && theme === 'dark' ? 'text-slate-200' : 'text-gray-900'}`}>
                        <span className="truncate block">{formatDate(payment.fecha)}</span>
                      </td>
                      <td className="px-2 py-3">
                        <span className={`text-sm font-bold truncate block transition-colors duration-200 ${mounted && theme === 'dark' ? 'text-green-300 group-hover:text-green-400' : 'text-gray-900 group-hover:text-green-600'}`}>
                          {formatCurrency(payment.monto)}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <span className={`text-xs font-mono px-2 py-1 rounded truncate block ${mounted && theme === 'dark' ? 'text-slate-300 bg-slate-900' : 'text-gray-600 bg-gray-50'}`}> 
                          {payment.referencia}
                        </span>
                      </td>
                      <td className="px-2 py-3">
                        <div className="flex items-center gap-1">
                          {payment.destino === 'China' && (
                            <AnimatedIcon animation="pulse">
                              <AlertTriangle size={10} className="text-orange-500 flex-shrink-0" />
                            </AnimatedIcon>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full truncate ${
                            payment.destino === 'China'
                              ? mounted && theme === 'dark' ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'
                              : mounted && theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {payment.destino}
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3">
                        <PaymentActions 
                          payment={payment} 
                          onApprove={handleApprove}
                          onReject={openRejectionConfirmation}
                          onViewDetails={openDetailsModal}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

      {filteredPayments.length === 0 && (
              <div className="text-center py-8 md:py-16">
                <AnimatedIcon animation="bounce">
                  <Package className="md:w-12 md:h-12 mx-auto text-gray-400 mb-4" />
                </AnimatedIcon>
        <p className="text-gray-500 text-base md:text-lg font-medium">{t('venezuela.pagos.empty.title')}</p>
        <p className="text-gray-400 text-sm mt-2">{t('venezuela.pagos.empty.subtitle')}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`mt-4 md:mt-6 text-center text-xs md:text-sm text-gray-500`}>
            {t('venezuela.pagos.footer.showing', { shown: filteredPayments.length, total: payments.length })}
          </div>
        </div>
      </main>
    </div>
    <Toaster />
    </>
  );
};

// ================================
// COMPONENTE: ACCIONES DE PAGO PENDIENTE
// ================================
const PaymentActions: React.FC<{ 
  payment: Payment; 
  onApprove: (id: string) => void; 
  onReject: (id: string) => void;
  onViewDetails: (payment: Payment) => void;
}> = ({ 
  payment, 
  onApprove, 
  onReject,
  onViewDetails
}) => {
  const { t } = useTranslation();
  if (payment.estado !== 'pendiente') {
    return (
      <button 
        onClick={() => onViewDetails(payment)}
        className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
      >
        <AnimatedIcon animation="float">
          <Eye size={10} />
        </AnimatedIcon>
        <span className="truncate">{t('venezuela.pagos.actions.view')}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => onApprove(payment.id)}
        className="flex items-center p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
      >
        <Check size={14} />
      </button>
      <button 
        onClick={() => onReject(payment.id)}
        className="flex items-center p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
      >
        <X size={14} />
      </button>
      <button 
        onClick={() => onViewDetails(payment)}
        className="flex items-center p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-200 transform hover:scale-110 shadow-sm hover:shadow-md"
      >
        <Eye size={14} />
      </button>
    </div>
  );
};

// ================================
// COMPONENTE: AVATAR DE USUARIO
// ================================
const UserAvatar: React.FC<{ name: string; id: string }> = ({ name, id }) => {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase();
  return (
    <div className="w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
      {initials}
    </div>
  );
};

export default PaymentValidationDashboard;