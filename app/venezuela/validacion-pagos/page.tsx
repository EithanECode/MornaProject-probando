"use client";

// Force dynamic rendering to avoid SSR issues with XLSX
export const dynamic = 'force-dynamic';

import React, { useState, useMemo, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
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
  Menu
} from 'lucide-react';

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
  const cardsData = [
    {
      title: 'Total Gastado',
      value: `$${stats.totalGastado.toLocaleString()}`,
      icon: <TrendingUp size={24} />,
      bgColor: 'bg-gradient-to-r from-blue-500 to-blue-600',
      textColor: 'text-blue-100'
    },
    {
      title: 'Pagos Totales',
      value: stats.pagosTotales,
      icon: <CreditCard size={24} />,
      bgColor: 'bg-gradient-to-r from-orange-500 to-orange-600',
      textColor: 'text-orange-100'
    },
    {
      title: 'Completados',
      value: stats.completados,
  icon: <AnimatedIcon animation={["pulse","bounce"]}><CheckCircle size={24} /></AnimatedIcon>,
      bgColor: 'bg-gradient-to-r from-green-500 to-green-600',
      textColor: 'text-green-100'
    },
    {
      title: 'Pendientes',
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
  const getStatusConfig = (estado: string) => {
    const configs = {
      completado: {
        className: 'bg-green-100 text-green-800 border-green-200',
        text: 'Completado',
        icon: <AnimatedIcon animation={["pulse","bounce"]}><CheckCircle size={12} /></AnimatedIcon>
      },
      pendiente: {
        className: 'bg-orange-100 text-orange-800 border-orange-200',
        text: 'Pendiente',
        icon: <AnimatedIcon animation={["pulse","spin"]}><Clock size={12} /></AnimatedIcon>
      },
      rechazado: {
        className: 'bg-red-100 text-red-800 border-red-200',
        text: 'Rechazado',
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
  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Detalles del Pago</h3>
            <p className="text-sm text-gray-500">{payment.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Información del Cliente</h4>
            <p><span className="font-medium">Usuario:</span> {payment.usuario}</p>
            <p><span className="font-medium">ID Producto:</span> {payment.idProducto}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Información del Pago</h4>
            <p><span className="font-medium">Monto:</span> ${payment.monto.toLocaleString()}</p>
            <p><span className="font-medium">Fecha:</span> {new Date(payment.fecha).toLocaleDateString('es-ES')}</p>
            <p><span className="font-medium">Referencia:</span> {payment.referencia}</p>
            <p><span className="font-medium">Método:</span> {payment.metodo}</p>
          </div>
          <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Detalles Adicionales</h4>
            <p><span className="font-medium">Destino:</span> {payment.destino}</p>
            <p><span className="font-medium">Descripción:</span> {payment.descripcion}</p>
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
          <span className="text-gray-600">Fecha:</span>
          <span className="font-medium">{formatDate(payment.fecha)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Monto:</span>
          <span className="font-semibold text-green-600">{formatCurrency(payment.monto)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Método:</span>
          <span className="font-medium">{payment.metodo}</span>
        </div>
        {payment.destino && (
          <div className="flex justify-between">
            <span className="text-gray-600">Destino:</span>
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
          Ver
        </button>
        {payment.estado === 'pendiente' && (
          <>
            <button
              onClick={() => onApprove(payment.id)}
              className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4 inline mr-1" />
              Aprobar
            </button>
            <button
              onClick={() => onReject(payment.id)}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4 inline mr-1" />
              Rechazar
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
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Confirmar Rechazo
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
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [selectedTab, setSelectedTab] = useState<'todos' | 'pendientes'>('todos');
  const [rejectionConfirmation, setRejectionConfirmation] = useState<{ isOpen: boolean; paymentId: string | null }>({ isOpen: false, paymentId: null });
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; payment: Payment | null }>({ isOpen: false, payment: null });
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

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

  // Manejar aprobación
  const handleApprove = (id: string) => {
    setPayments(prev => prev.map(p => 
      p.id === id ? { ...p, estado: 'completado' as const } : p
    ));
  };

  // Manejar rechazo
  const handleReject = (id: string) => {
    setPayments(prev => prev.map(p => 
      p.id === id ? { ...p, estado: 'rechazado' as const } : p
    ));
    setRejectionConfirmation({ isOpen: false, paymentId: null });
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
      'ID Pedido': payment.id,
      'Cliente': payment.usuario,
      'Estado': payment.estado,
      'Fecha': payment.fecha,
      'Monto': payment.monto,
      'Referencia': payment.referencia,
      'Destino': payment.destino,
      'Descripción': payment.descripcion
    }));

            const XLSX = await import('xlsx');
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Pagos");
        XLSX.writeFile(workbook, "pagos_validacion.xlsx");
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
        title="Confirmar Rechazo"
        message="¿Estás seguro de que quieres rechazar este pago? Esta acción no se puede deshacer."
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
          title="Validación de Pagos"
          subtitle="Administra y da seguimiento a todos los pedidos"
        />
        <div className="p-4 md:p-5 lg:p-6">
          

          {/* ================================ */}
          {/* TARJETAS DE ESTADÍSTICAS */}
          {/* ================================ */}
          <StatsCards stats={stats} />

          {/* ================================ */}
          {/* PESTAÑAS */}
          {/* ================================ */}
          <div className="mb-4 md:mb-6">
            <div className={mounted && theme === 'dark' ? 'border-b border-slate-700' : 'border-b border-gray-200'}>
              <nav className="-mb-px flex space-x-4 md:space-x-8">
                {[
                  { id: 'todos', label: 'Lista de Pedidos', count: payments.length },
                  { id: 'pendientes', label: 'Pagos Pendientes', count: stats.pendientes },
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
          {/* FILTROS Y BÚSQUEDA */}
          {/* ================================ */}
          <div className={mounted && theme === 'dark' ? 'bg-slate-800 rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6' : 'bg-white rounded-xl shadow-sm p-4 md:p-6 mb-4 md:mb-6'}>
            <div className="flex flex-col gap-4">
              <div className="relative group">
                <div className="absolute left-3 top-3 z-10">
                  <AnimatedIcon animation="pulse">
                    <Search size={20} className="text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                  </AnimatedIcon>
                </div>
                <input
                  type="text"
                  placeholder="Buscar pedidos..."
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${mounted && theme === 'dark' ? 'border-slate-700 bg-slate-900 text-slate-100 placeholder:text-slate-400' : 'border-gray-300'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                <AnimatedIcon animation="shake">
                  <Filter size={20} className="text-gray-500" />
                </AnimatedIcon>
                <Select onValueChange={(value) => setFilterStatus(value)} defaultValue="todos">
                  <SelectTrigger className="flex-1 md:w-[180px]">
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los estados</SelectItem>
                    <SelectItem value="completado">Completados</SelectItem>
                    <SelectItem value="pendiente">Pendientes</SelectItem>
                    <SelectItem value="rechazado">Rechazados</SelectItem>
                  </SelectContent>
                </Select>
                <button
                  onClick={exportarGeneral}
                  className="flex items-center gap-2 bg-[#202841] text-white px-3 md:px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  <Download size={18} className="md:w-5 md:h-5" />
                  <span className="hidden sm:inline">Exportar</span>
                  <span className="sm:hidden">Export</span>
                </button>
              </div>
            </div>
          </div>

          {/* ================================ */}
          {/* TABLA DE PAGOS */}
          {/* ================================ */}
          
          {/* Header de la tabla */}
          <div className={mounted && theme === 'dark' ? 'bg-slate-800 rounded-xl shadow-sm overflow-hidden' : 'bg-white rounded-xl shadow-sm overflow-hidden'}>
            <div className={mounted && theme === 'dark' ? 'px-4 md:px-6 py-3 md:py-4 border-b border-slate-700 bg-gradient-to-r from-slate-900 to-slate-800' : 'px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white'}>
              <h2 className={`text-lg md:text-xl font-semibold flex items-center gap-2 ${mounted && theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                <AnimatedIcon animation="float">
                  <Package size={20} className="md:w-6 md:h-6 text-blue-500" />
                </AnimatedIcon>
                {selectedTab === 'pendientes' ? 'Pagos Pendientes de Aprobación' :
                 'Lista de Pedidos'}
              </h2>
              <p className={mounted && theme === 'dark' ? 'text-slate-300 text-xs md:text-sm mt-1' : 'text-gray-600 text-xs md:text-sm mt-1'}>
                {filteredPayments.length} pedidos encontrados
              </p>
            </div>

            {/* Vista Mobile - Cards */}
            <div className="block lg:hidden p-4 space-y-4">
              {filteredPayments.map((payment) => (
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
                      { label: 'ID Pedido', icon: <AnimatedIcon animation={["pulse","bounce"]}><Hash size={14} /></AnimatedIcon>, width: 'w-44' },
                      { label: 'Cliente', icon: <AnimatedIcon animation={["pulse","bounce"]}><User size={14} /></AnimatedIcon>, width: 'w-36' },
                      { label: 'Estado', icon: <AnimatedIcon animation={["pulse","bounce"]}><CheckCircle size={14} /></AnimatedIcon>, width: 'w-32' },
                      { label: 'Fecha', icon: <AnimatedIcon animation={["pulse","bounce"]}><Calendar size={14} /></AnimatedIcon>, width: 'w-24' },
                      { label: 'Monto', icon: <AnimatedIcon animation={["pulse","bounce"]}><DollarSign size={14} /></AnimatedIcon>, width: 'w-28' },
                      { label: 'Referencia', icon: <AnimatedIcon animation={["pulse","bounce"]}><Hash size={14} /></AnimatedIcon>, width: 'w-36' },
                      { label: 'Destino', icon: <AnimatedIcon animation={["pulse","bounce"]}><MapPin size={14} /></AnimatedIcon>, width: 'w-28' },
                      { label: 'Acciones', icon: <AnimatedIcon animation={["pulse","shake"]}><MoreHorizontal size={14} /></AnimatedIcon>, width: 'w-28' }
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
                  <Package size={32} className="md:w-12 md:h-12 mx-auto text-gray-400 mb-4" />
                </AnimatedIcon>
                <p className="text-gray-500 text-base md:text-lg font-medium">No se encontraron pagos</p>
                <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros o términos de búsqueda</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className={`mt-4 md:mt-6 text-center text-xs md:text-sm text-gray-500`}>
            Mostrando {filteredPayments.length} de {payments.length} transacciones
          </div>
        </div>
      </main>
    </div>
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
  if (payment.estado !== 'pendiente') {
    return (
      <button 
        onClick={() => onViewDetails(payment)}
        className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
      >
        <AnimatedIcon animation="float">
          <Eye size={10} />
        </AnimatedIcon>
        <span className="truncate">Ver</span>
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