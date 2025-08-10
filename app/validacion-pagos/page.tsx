"use client";
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
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
  TrendingUp
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
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      {cardsData.map((card, index) => (
        <div 
          key={index}
          className={`${card.bgColor} text-white p-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`${card.textColor} text-sm font-medium mb-1`}>
                {card.title}
              </p>
              <p className="text-3xl font-bold">
                {card.value}
              </p>
            </div>
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
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
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border gap-1 transition-all duration-300 hover:scale-105 ${config.className}`}>
      <AnimatedIcon animation="pulse">
        {config.icon}
      </AnimatedIcon>
      {config.text}
    </span>
  );
};

// ================================
// COMPONENTE: ACCIONES DE PAGO PENDIENTE
// ================================
const PaymentActions: React.FC<{ payment: Payment; onApprove: (id: string) => void; onReject: (id: string) => void }> = ({ 
  payment, 
  onApprove, 
  onReject 
}) => {
  if (payment.estado !== 'pendiente') {
    return (
      <button className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors duration-200">
        <AnimatedIcon animation="float">
          <Eye size={14} />
        </AnimatedIcon>
        Ver
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={() => onApprove(payment.id)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-all duration-200 transform hover:scale-105"
      >
        <AnimatedIcon animation="bounce">
          <Check size={14} />
        </AnimatedIcon>
        Aprobar
      </button>
      <button 
        onClick={() => onReject(payment.id)}
        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-all duration-200 transform hover:scale-105"
      >
        <AnimatedIcon animation="shake">
          <X size={14} />
        </AnimatedIcon>
        Rechazar
      </button>
    </div>
  );
};

// ================================
// COMPONENTE: AVATAR DE USUARIO
// ================================
const UserAvatar: React.FC<{ name: string; id: string }> = ({ name, id }) => {
  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map(name => name[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="flex items-center group">
      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mr-3 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
        <AnimatedIcon animation="pulse">
          <span className="text-white font-bold text-sm">
            {getInitials(name)}
          </span>
        </AnimatedIcon>
      </div>
      <div>
        <div className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
          {name}
        </div>
        <div className="text-xs text-gray-500 font-mono">
          {id}
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
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [selectedTab, setSelectedTab] = useState<'todos' | 'pendientes' | 'auditoria'>('todos');

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
    } else if (selectedTab === 'auditoria') {
      filtered = filtered.filter(p => p.destino === 'China');
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

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} />
      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-72' : 'ml-20'}`}>
        <div className="p-6">
          {/* ================================ */}
          {/* HEADER */}
          {/* ================================ */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <AnimatedIcon animation="bounce">
                  <DollarSign className="text-blue-600" size={32} />
                </AnimatedIcon>
                Validación de Pagos
              </h1>
              <p className="text-gray-600 mt-1">Administra y da seguimiento a todos los pedidos</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105">
                <AnimatedIcon animation="float">
                  <Download size={16} />
                </AnimatedIcon>
                Exportar
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 transform hover:scale-105 shadow-lg">
                <AnimatedIcon animation="bounce">
                  <Plus size={16} />
                </AnimatedIcon>
                Nuevo Pedido
              </button>
            </div>
          </div>

          {/* ================================ */}
          {/* TARJETAS DE ESTADÍSTICAS */}
          {/* ================================ */}
          <StatsCards stats={stats} />

          {/* ================================ */}
          {/* PESTAÑAS */}
          {/* ================================ */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { id: 'todos', label: 'Lista de Pedidos', count: payments.length },
                  { id: 'pendientes', label: 'Pagos Pendientes', count: stats.pendientes },
                  { id: 'auditoria', label: 'Auditoría China', count: payments.filter(p => p.destino === 'China').length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSelectedTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                      selectedTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      selectedTab === tab.id 
                        ? 'bg-blue-100 text-blue-600' 
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
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 md:w-80 group">
                <div className="absolute left-3 top-3 z-10">
                  <AnimatedIcon animation="pulse">
                    <Search size={20} className="text-gray-400 group-focus-within:text-blue-500 transition-colors duration-200" />
                  </AnimatedIcon>
                </div>
                <input
                  type="text"
                  placeholder="Buscar pedidos..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <AnimatedIcon animation="shake">
                  <Filter size={20} className="text-gray-500" />
                </AnimatedIcon>
                <select
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[180px]"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="todos">Todos los estados</option>
                  <option value="completado">Completados</option>
                  <option value="pendiente">Pendientes</option>
                  <option value="rechazado">Rechazados</option>
                </select>
              </div>
            </div>
          </div>

          {/* ================================ */}
          {/* TABLA DE PAGOS */}
          {/* ================================ */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <AnimatedIcon animation="float">
                  <Package size={24} className="text-blue-500" />
                </AnimatedIcon>
                {selectedTab === 'pendientes' ? 'Pagos Pendientes de Aprobación' :
                 selectedTab === 'auditoria' ? 'Pagos hacia China - Vista de Auditoría' :
                 'Lista de Pedidos'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {filteredPayments.length} pedidos encontrados
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    {[
                      { label: 'ID Pedido', icon: <AnimatedIcon animation={["pulse","bounce"]}><Hash size={14} /></AnimatedIcon> },
                      { label: 'Cliente', icon: <AnimatedIcon animation={["pulse","bounce"]}><User size={14} /></AnimatedIcon> },
                      { label: 'Estado', icon: <AnimatedIcon animation={["pulse","bounce"]}><CheckCircle size={14} /></AnimatedIcon> },
                      { label: 'Fecha', icon: <AnimatedIcon animation={["pulse","bounce"]}><Calendar size={14} /></AnimatedIcon> },
                      { label: 'Monto', icon: <AnimatedIcon animation={["pulse","bounce"]}><DollarSign size={14} /></AnimatedIcon> },
                      { label: 'Referencia', icon: <AnimatedIcon animation={["pulse","bounce"]}><Hash size={14} /></AnimatedIcon> },
                      { label: 'Destino', icon: <AnimatedIcon animation={["pulse","bounce"]}><MapPin size={14} /></AnimatedIcon> },
                      { label: 'Acciones', icon: <AnimatedIcon animation={["pulse","shake"]}><MoreHorizontal size={14} /></AnimatedIcon> }
                    ].map((header, index) => (
                      <th key={index} className="px-6 py-4 text-left">
                        <div className="flex items-center gap-2 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          <AnimatedIcon animation="pulse">
                            {header.icon}
                          </AnimatedIcon>
                          {header.label}
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
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center text-sm font-semibold">
                            {payment.id.split('-')[1]}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{payment.id}</div>
                            <div className="text-xs text-gray-500">{payment.descripcion}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <UserAvatar name={payment.usuario} id={payment.id} />
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={payment.estado} />
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(payment.fecha)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-200">
                          {formatCurrency(payment.monto)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded">
                          {payment.referencia}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {payment.destino === 'China' && (
                            <AnimatedIcon animation="pulse">
                              <AlertTriangle size={14} className="text-orange-500" />
                            </AnimatedIcon>
                          )}
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            payment.destino === 'China' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {payment.destino}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <PaymentActions 
                          payment={payment} 
                          onApprove={handleApprove}
                          onReject={handleReject}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPayments.length === 0 && (
              <div className="text-center py-16">
                <AnimatedIcon animation="bounce">
                  <Package size={48} className="mx-auto text-gray-400 mb-4" />
                </AnimatedIcon>
                <p className="text-gray-500 text-lg font-medium">No se encontraron pagos</p>
                <p className="text-gray-400 text-sm mt-2">Intenta ajustar los filtros o términos de búsqueda</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-gray-500">
            Mostrando {filteredPayments.length} de {payments.length} transacciones
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaymentValidationDashboard;