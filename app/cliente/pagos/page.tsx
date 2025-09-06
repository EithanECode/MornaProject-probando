'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useClientContext } from '@/lib/ClientContext';
import { 
  CreditCard, 
  Search,
  Filter,
  RefreshCw,
  Eye,
  Download,
  Clock,
  AlertTriangle,
  Package,
  CheckCircle,
  FileText,
  Banknote,
  Wallet,
  Zap,
  Calendar,
  TrendingUp,
  TrendingDown,
  Receipt,
  ArrowRight,
  CalendarDays,
  Smartphone,
  Globe
} from 'lucide-react';

// Tipos
interface Payment {
  id: string;
  orderId: string;
  product: string;  
  amount: number;
  currency: 'USD' | 'BS';
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'processing';
  paymentMethod: 'pago_movil' | 'transfer' | 'binance' | 'zelle' | 'paypal' | 'card';
  dueDate: string;
  createdAt: string;
  paidAt?: string;
  description: string;
  paymentDetails?: {
    accountNumber?: string;
    bankName?: string;
    reference?: string;
    phoneNumber?: string;
    walletAddress?: string;
    email?: string;
  };
  receiptUrl?: string;
}

// Tipo parcial para la tabla orders (ajustado a lo que usamos aquí)
interface DbOrder {
  id: string;
  productName: string | null;
  description: string | null;
  estimatedBudget: number | null;
  totalQuote: number | null;
  state: number | null;
  created_at: string | null;
}

// Datos mock mejorados
const PAYMENTS: Payment[] = [
  {
    id: 'PAY-2024-001',
    orderId: 'ORD-2024-001',
    product: 'iPhone 15 Pro Max',
    amount: 1350,
    currency: 'USD',
    status: 'paid',
    paymentMethod: 'pago_movil',
    dueDate: '2024-01-25',
    createdAt: '2024-01-15 10:30',
    paidAt: '2024-01-15 14:45',
    description: 'Pago inicial - 50% del total',
    paymentDetails: {
      phoneNumber: '0412-123-4567',
      reference: 'PITA-001-2024'
    },
    receiptUrl: '/receipts/pay-001.pdf'
  },
  {
    id: 'PAY-2024-002',
    orderId: 'ORD-2024-002',
    product: 'MacBook Air M2',
    amount: 1250,
    currency: 'USD',
    status: 'paid',
    paymentMethod: 'transfer',
    dueDate: '2024-01-20',
    createdAt: '2024-01-16 14:20',
    paidAt: '2024-01-16 16:30',
    description: 'Pago completo',
    paymentDetails: {
      accountNumber: '0102-1234-5678-9012',
      bankName: 'Banco de Venezuela',
      reference: 'PITA-002-2024'
    },
    receiptUrl: '/receipts/pay-002.pdf'
  },
  {
    id: 'PAY-2024-003',
    orderId: 'ORD-2024-003',
    product: 'AirPods Pro',
    amount: 450,
    currency: 'USD',
    status: 'paid',
    paymentMethod: 'binance',
    dueDate: '2024-01-18',
    createdAt: '2024-01-14 16:45',
    paidAt: '2024-01-14 17:20',
    description: 'Pago con USDT',
    paymentDetails: {
      walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
      reference: 'PITA-003-2024'
    },
    receiptUrl: '/receipts/pay-003.pdf'
  },
  {
    id: 'PAY-2024-004',
    orderId: 'ORD-2024-004',
    product: 'iPad Pro 12.9"',
    amount: 1050,
    currency: 'USD',
    status: 'pending',
    paymentMethod: 'zelle',
    dueDate: '2024-01-22',
    createdAt: '2024-01-17 09:15',
    description: 'Pago inicial - 30% del total',
    paymentDetails: {
      email: 'pagos@pitaexpress.com',
      reference: 'PITA-004-2024'
    }
  },
  {
    id: 'PAY-2024-005',
    orderId: 'ORD-2024-005',
    product: 'Apple Watch Series 9',
    amount: 750,
    currency: 'USD',
    status: 'processing',
    paymentMethod: 'paypal',
    dueDate: '2024-01-24',
    createdAt: '2024-01-18 11:30',
    description: 'Pago con PayPal',
    paymentDetails: {
      email: 'pagos@pitaexpress.com',
      reference: 'PITA-005-2024'
    }
  },
  {
    id: 'PAY-2024-006',
    orderId: 'ORD-2024-006',
    product: 'Samsung Galaxy S24',
    amount: 1200,
    currency: 'USD',
    status: 'failed',
    paymentMethod: 'transfer',
    dueDate: '2024-01-26',
    createdAt: '2024-01-19 15:45',
    description: 'Pago completo - Transferencia fallida',
    paymentDetails: {
      accountNumber: '0102-1234-5678-9012',
      bankName: 'Banco de Venezuela',
      reference: 'PITA-006-2024'
    }
  },
  {
    id: 'PAY-2024-007',
    orderId: 'ORD-2024-007',
    product: 'MacBook Pro M3',
    amount: 2200,
    currency: 'USD',
    status: 'paid',
    paymentMethod: 'card',
    dueDate: '2024-01-28',
    createdAt: '2024-01-20 10:15',
    paidAt: '2024-01-20 10:45',
    description: 'Pago con tarjeta de crédito',
    paymentDetails: {
      reference: 'PITA-007-2024'
    },
    receiptUrl: '/receipts/pay-007.pdf'
  },
  {
    id: 'PAY-2024-008',
    orderId: 'ORD-2024-008',
    product: 'Sony WH-1000XM5',
    amount: 380,
    currency: 'USD',
    status: 'refunded',
    paymentMethod: 'pago_movil',
    dueDate: '2024-01-30',
    createdAt: '2024-01-21 13:20',
    paidAt: '2024-01-21 14:00',
    description: 'Pago reembolsado - Producto no disponible',
    paymentDetails: {
      phoneNumber: '0412-123-4567',
      reference: 'PITA-008-2024'
    }
  }
];

export default function PagosPage() {
  const { t } = useTranslation();
  const { clientId } = useClientContext();
  const supabase = getSupabaseBrowserClient();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cargar órdenes del cliente con state === 5 y mapear a pagos
  useEffect(() => {
    const load = async () => {
      if (!clientId) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('id, productName, description, estimatedBudget, totalQuote, state, created_at')
          .eq('client_id', clientId)
          .eq('state', 4)
          .order('created_at', { ascending: false });
        if (error) throw error;

        const mapped: Payment[] = (data as DbOrder[] | null)?.map((row) => {
          const amountNum = (row.totalQuote ?? row.estimatedBudget ?? 0) as number;
          return {
            id: `PAY-${row.id}`,
            orderId: String(row.id),
            product: row.productName || 'Pedido',
            amount: Number(amountNum || 0),
            currency: 'USD',
            // En state 5, lo tratamos como pendiente hasta tener confirmación
            status: 'pending',
            // Método desconocido al no tener campo específico; default transferencia
            paymentMethod: 'transfer',
            dueDate: row.created_at || new Date().toISOString(),
            createdAt: row.created_at || new Date().toISOString(),
            description: row.description || `Orden ${row.id}`,
          };
        }) || [];

        setPayments(mapped);
      } catch (e: any) {
        setError(e?.message || 'Error cargando pagos');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clientId, supabase]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return t('client.recentOrders.payments.pendingStatus');
      case 'paid': return t('client.recentOrders.payments.paidStatus');
      case 'failed': return t('client.recentOrders.payments.failedStatus');
      case 'refunded': return t('client.recentOrders.payments.refundedStatus');
      case 'processing': return t('client.recentOrders.payments.processingStatus');
      default: return t('client.recentOrders.payments.status');
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'pago_movil': return t('client.recentOrders.payments.pago_movil');
      case 'transfer': return t('client.recentOrders.payments.transfer');
      case 'binance': return t('client.recentOrders.payments.binance');
      case 'zelle': return t('client.recentOrders.payments.zelle');
      case 'paypal': return t('client.recentOrders.payments.paypal');
      case 'card': return t('client.recentOrders.payments.card');
      default: return t('client.recentOrders.payments.method');
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'pago_movil': return <Smartphone className="h-4 w-4" />;
      case 'transfer': return <Banknote className="h-4 w-4" />;
      case 'binance': return <Globe className="h-4 w-4" />;
      case 'zelle': return <CreditCard className="h-4 w-4" />;
      case 'paypal': return <CreditCard className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency === 'USD' ? '$' : 'Bs.'}${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    
    // Filtro por fecha
    let matchesDate = true;
    if (dateFilter !== 'all') {
      const paymentDate = new Date(payment.createdAt);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - paymentDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      switch (dateFilter) {
        case 'today':
          matchesDate = diffDays === 0;
          break;
        case 'week':
          matchesDate = diffDays <= 7;
          break;
        case 'month':
          matchesDate = diffDays <= 30;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesMethod && matchesDate;
  });

  const stats = {
    total: payments.length,
    pending: payments.filter(p => p.status === 'pending').length,
    paid: payments.filter(p => p.status === 'paid').length,
    failed: payments.filter(p => p.status === 'failed').length,
    processing: payments.filter(p => p.status === 'processing').length,
    refunded: payments.filter(p => p.status === 'refunded').length,
    totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
    paidAmount: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
  };

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
        userRole="client"
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={stats.pending}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title={t('client.recentOrders.payments.title')}
          subtitle={t('client.recentOrders.payments.subtitle')}
        />
        
        <div className="p-4 md:p-5 lg:p-6 space-y-6 md:space-y-6 lg:space-y-8">
          {/* Header del Dashboard con Bienvenida */}
          <div className="bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-xl p-4 md:p-6 lg:p-8 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                <div>
                  <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-2">{t('client.recentOrders.payments.title')}</h2>
                  <p className="text-green-100 text-sm md:text-base lg:text-lg">{t('client.recentOrders.payments.dashboard')}</p>
                  <p className="text-green-200 mt-2 text-xs md:text-sm">{t('client.recentOrders.payments.subtitle')}</p>
                </div>
                <div className="grid grid-cols-2 md:flex md:items-center md:space-x-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold">{stats.total}</div>
                    <p className="text-green-100 text-xs md:text-sm">{t('client.recentOrders.payments.totalPayments')}</p>
                  </div>
                  <div className="hidden md:block w-px h-12 md:h-16 bg-white/20"></div>
                  <div className="text-center">
                    <div className="text-2xl md:text-3xl lg:text-4xl font-bold">{formatCurrency(stats.paidAmount, 'USD')}</div>
                    <p className="text-green-100 text-xs md:text-sm">{t('client.recentOrders.payments.totalPaid')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dashboard Principal */}
          <div className="space-y-6 md:space-y-6 lg:space-y-8">
            {/* Estadísticas Principales */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-green-800">{t('client.recentOrders.payments.paid')}</CardTitle>
                  <div className="p-2 bg-green-500 rounded-lg group-hover:scale-110 transition-transform">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-green-900">{stats.paid}</div>
                  <p className="text-xs text-green-700">{t('client.recentOrders.payments.paidDesc')}</p>
                  <div className="mt-2 w-full bg-green-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: `${(stats.paid / stats.total) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-yellow-800">{t('client.recentOrders.payments.pending')}</CardTitle>
                  <div className="p-2 bg-yellow-500 rounded-lg group-hover:scale-110 transition-transform">
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-yellow-900">{stats.pending}</div>
                  <p className="text-xs text-yellow-700">{t('client.recentOrders.payments.pendingDesc')}</p>
                  <div className="mt-2 w-full bg-yellow-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${(stats.pending / stats.total) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-blue-800">{t('client.recentOrders.payments.processing')}</CardTitle>
                  <div className="p-2 bg-blue-500 rounded-lg group-hover:scale-110 transition-transform">
                    <RefreshCw className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-blue-900">{stats.processing}</div>
                  <p className="text-xs text-blue-700">{t('client.recentOrders.payments.processingDesc')}</p>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(stats.processing / stats.total) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-red-800">{t('client.recentOrders.payments.failed')}</CardTitle>
                  <div className="p-2 bg-red-500 rounded-lg group-hover:scale-110 transition-transform">
                    <AlertTriangle className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xl md:text-2xl lg:text-3xl font-bold text-red-900">{stats.failed}</div>
                  <p className="text-xs text-red-700">{t('client.recentOrders.payments.failedDesc')}</p>
                  <div className="mt-2 w-full bg-red-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{width: `${(stats.failed / stats.total) * 100}%`}}></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros y búsqueda */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">{t('client.recentOrders.payments.filtersTitle')}</CardTitle>
                <p className="text-sm text-slate-600">{t('client.recentOrders.payments.filtersSubtitle')}</p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3 md:gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder={t('client.recentOrders.payments.searchPlaceholder')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                                    <div className="grid grid-cols-1 md:flex md:gap-2 gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-full md:w-40">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue placeholder={t('client.recentOrders.payments.status')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('client.recentOrders.payments.allStatuses')}</SelectItem>
                        <SelectItem value="pending">{t('client.recentOrders.payments.pendingStatus')}</SelectItem>
                        <SelectItem value="paid">{t('client.recentOrders.payments.paidStatus')}</SelectItem>
                        <SelectItem value="processing">{t('client.recentOrders.payments.processingStatus')}</SelectItem>
                        <SelectItem value="failed">{t('client.recentOrders.payments.failedStatus')}</SelectItem>
                        <SelectItem value="refunded">{t('client.recentOrders.payments.refundedStatus')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={methodFilter} onValueChange={setMethodFilter}>
                      <SelectTrigger className="w-full md:w-40">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <SelectValue placeholder={t('client.recentOrders.payments.method')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('client.recentOrders.payments.allMethods')}</SelectItem>
                        <SelectItem value="pago_movil">{t('client.recentOrders.payments.pago_movil')}</SelectItem>
                        <SelectItem value="transfer">{t('client.recentOrders.payments.transfer')}</SelectItem>
                        <SelectItem value="binance">{t('client.recentOrders.payments.binance')}</SelectItem>
                        <SelectItem value="zelle">{t('client.recentOrders.payments.zelle')}</SelectItem>
                        <SelectItem value="paypal">{t('client.recentOrders.payments.paypal')}</SelectItem>
                        <SelectItem value="card">{t('client.recentOrders.payments.card')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={dateFilter} onValueChange={setDateFilter}>
                      <SelectTrigger className="w-full md:w-40">
                        <CalendarDays className="w-4 h-4 mr-2" />
                        <SelectValue placeholder={t('client.recentOrders.payments.date')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('client.recentOrders.payments.allDates')}</SelectItem>
                        <SelectItem value="today">{t('client.recentOrders.payments.today')}</SelectItem>
                        <SelectItem value="week">{t('client.recentOrders.payments.week')}</SelectItem>
                        <SelectItem value="month">{t('client.recentOrders.payments.month')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Pagos */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                <h3 className="text-lg md:text-xl font-semibold">Transacciones ({filteredPayments.length})</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {filteredPayments.map((payment) => (
                  <Card key={payment.id} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-all duration-300 group">
                    <CardHeader>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                            {getMethodIcon(payment.paymentMethod)}
                          </div>
                          <div>
                            <CardTitle className="text-base md:text-lg">{payment.product}</CardTitle>
                            <p className="text-xs md:text-sm text-slate-600">{payment.id} - {payment.orderId}</p>
                          </div>
                        </div>
                        <Badge className={`${getStatusColor(payment.status)} text-xs md:text-sm`}>
                          {getStatusText(payment.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <p className="text-xs md:text-sm text-slate-600">{payment.description}</p>
                        <div className="flex items-center justify-between text-xs md:text-sm">
                          <span className="text-slate-600">{t('client.recentOrders.payments.amount')}</span>
                          <span className="font-bold text-lg md:text-xl text-slate-800">{formatCurrency(payment.amount, payment.currency)}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs md:text-sm">
                          <span className="text-slate-600">{t('client.recentOrders.payments.methodLabel')}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{getMethodText(payment.paymentMethod)}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs md:text-sm">
                          <span className="text-slate-600">{t('client.recentOrders.payments.paymentDate')}</span>
                          <span className="font-medium">{formatDate(payment.createdAt)}</span>
                        </div>
                        {payment.paidAt && (
                          <div className="flex items-center justify-between text-xs md:text-sm">
                            <span className="text-slate-600">{t('client.recentOrders.payments.confirmed')}</span>
                            <span className="font-medium text-green-600">{formatDate(payment.paidAt)}</span>
                          </div>
                        )}
                      </div>

                      {payment.paymentDetails && (
                        <div className="p-3 md:p-4 bg-slate-50 rounded-xl space-y-3">
                          <p className="text-xs md:text-sm font-medium text-slate-700">{t('client.recentOrders.payments.paymentDetails')}</p>
                          <div className="space-y-2 text-xs">
                            {payment.paymentDetails.bankName && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">{t('client.recentOrders.payments.bank')}</span>
                                <span className="font-medium">{payment.paymentDetails.bankName}</span>
                              </div>
                            )}
                            {payment.paymentDetails.accountNumber && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">{t('client.recentOrders.payments.account')}</span>
                                <span className="font-mono font-medium">{payment.paymentDetails.accountNumber}</span>
                              </div>
                            )}
                            {payment.paymentDetails.phoneNumber && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">{t('client.recentOrders.payments.phone')}</span>
                                <span className="font-mono font-medium">{payment.paymentDetails.phoneNumber}</span>
                              </div>
                            )}
                            {payment.paymentDetails.walletAddress && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">{t('client.recentOrders.payments.wallet')}</span>
                                <span className="font-mono font-medium text-xs">{payment.paymentDetails.walletAddress.slice(0, 10)}...</span>
                              </div>
                            )}
                            {payment.paymentDetails.email && (
                              <div className="flex justify-between">
                                <span className="text-slate-600">{t('client.recentOrders.payments.email')}</span>
                                <span className="font-medium">{payment.paymentDetails.email}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-slate-600">{t('client.recentOrders.payments.reference')}</span>
                              <span className="font-mono font-medium">{payment.paymentDetails.reference}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="flex-1 group-hover:bg-slate-50 transition-colors text-xs">
                          <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          {t('client.recentOrders.payments.viewDetails')}
                        </Button>
                        {payment.status === 'paid' && payment.receiptUrl && (
                          <Button variant="outline" size="sm" className="hover:bg-green-50 hover:border-green-300 transition-colors text-xs">
                            <Download className="w-3 h-3 md:w-4 md:h-4" />
                          </Button>
                        )}
                        {payment.status === 'failed' && (
                          <Button variant="outline" size="sm" className="flex-1 hover:bg-red-50 hover:border-red-300 transition-colors text-xs">
                            <RefreshCw className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                            {t('client.recentOrders.payments.retry')}
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Estado vacío */}
            {filteredPayments.length === 0 && (
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
                <CardContent className="p-8 md:p-12 text-center">
                  <Receipt className="w-12 h-12 md:w-16 md:h-16 text-slate-400 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2">{t('client.recentOrders.payments.noTransactions')}</h3>
                  <p className="text-slate-600 text-sm md:text-base">{t('client.recentOrders.payments.noPayments')}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 