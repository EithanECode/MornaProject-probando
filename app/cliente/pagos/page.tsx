'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  CreditCard, 
  DollarSign,
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
  Zap
} from 'lucide-react';

// Tipos
interface Payment {
  id: string;
  orderId: string;
  product: string;
  amount: number;
  currency: 'USD' | 'BS';
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod: 'transfer' | 'card' | 'cash' | 'crypto';
  dueDate: string;
  createdAt: string;
  description: string;
  paymentDetails?: {
    accountNumber?: string;
    bankName?: string;
    reference?: string;
  };
}

// Datos mock
const PAYMENTS: Payment[] = [
  {
    id: 'PAY-001',
    orderId: 'ORD-2024-001',
    product: 'iPhone 15 Pro Max',
    amount: 1350,
    currency: 'USD',
    status: 'pending',
    paymentMethod: 'transfer',
    dueDate: '2024-01-25',
    createdAt: '2024-01-15 10:30',
    description: 'Pago inicial - 50% del total',
    paymentDetails: {
      accountNumber: '0102-1234-5678-9012',
      bankName: 'Banco de Venezuela',
      reference: 'PITA-001-2024'
    }
  },
  {
    id: 'PAY-002',
    orderId: 'ORD-2024-002',
    product: 'MacBook Air M2',
    amount: 1250,
    currency: 'USD',
    status: 'paid',
    paymentMethod: 'transfer',
    dueDate: '2024-01-20',
    createdAt: '2024-01-16 14:20',
    description: 'Pago completo',
    paymentDetails: {
      accountNumber: '0102-1234-5678-9012',
      bankName: 'Banco de Venezuela',
      reference: 'PITA-002-2024'
    }
  },
  {
    id: 'PAY-003',
    orderId: 'ORD-2024-003',
    product: 'AirPods Pro',
    amount: 450,
    currency: 'USD',
    status: 'paid',
    paymentMethod: 'card',
    dueDate: '2024-01-18',
    createdAt: '2024-01-14 16:45',
    description: 'Pago con tarjeta de crédito'
  },
  {
    id: 'PAY-004',
    orderId: 'ORD-2024-004',
    product: 'iPad Pro 12.9"',
    amount: 1050,
    currency: 'USD',
    status: 'failed',
    paymentMethod: 'transfer',
    dueDate: '2024-01-22',
    createdAt: '2024-01-17 09:15',
    description: 'Pago inicial - 30% del total',
    paymentDetails: {
      accountNumber: '0102-1234-5678-9012',
      bankName: 'Banco de Venezuela',
      reference: 'PITA-004-2024'
    }
  }
];

export default function PagosPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      case 'refunded': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'paid': return 'Pagado';
      case 'failed': return 'Fallido';
      case 'refunded': return 'Reembolsado';
      default: return 'Desconocido';
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'transfer': return 'Transferencia';
      case 'card': return 'Tarjeta';
      case 'cash': return 'Efectivo';
      case 'crypto': return 'Criptomonedas';
      default: return 'Desconocido';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'transfer': return <Banknote className="h-4 w-4" />;
      case 'card': return <CreditCard className="h-4 w-4" />;
      case 'cash': return <Wallet className="h-4 w-4" />;
      case 'crypto': return <Zap className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency === 'USD' ? '$' : 'Bs.'}${amount.toLocaleString()}`;
  };

  const filteredPayments = PAYMENTS.filter(payment => {
    const matchesSearch = 
      payment.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payment.paymentMethod === methodFilter;
    return matchesSearch && matchesStatus && matchesMethod;
  });

  const stats = {
    total: PAYMENTS.length,
    pending: PAYMENTS.filter(p => p.status === 'pending').length,
    paid: PAYMENTS.filter(p => p.status === 'paid').length,
    failed: PAYMENTS.filter(p => p.status === 'failed').length,
    totalAmount: PAYMENTS.reduce((sum, p) => sum + p.amount, 0),
    pendingAmount: PAYMENTS.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0)
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
        sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-24 w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={stats.pending}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Pagos"
          subtitle="Gestiona y realiza pagos de tus pedidos"
        />
        
        <div className="p-6 space-y-6">
          {/* Header de la página */}
          <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Pagos</h1>
                <p className="text-red-100 mt-1">Gestiona y realiza pagos de tus pedidos</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-red-100">Total Pagos</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-red-100">Pendientes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{formatCurrency(stats.pendingAmount, 'USD')}</p>
                  <p className="text-sm text-red-100">Por Pagar</p>
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
                      placeholder="Buscar por producto, orden o ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendiente</SelectItem>
                      <SelectItem value="paid">Pagado</SelectItem>
                      <SelectItem value="failed">Fallido</SelectItem>
                      <SelectItem value="refunded">Reembolsado</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={methodFilter} onValueChange={setMethodFilter}>
                    <SelectTrigger className="w-40">
                      <CreditCard className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los métodos</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="crypto">Criptomonedas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Actualizar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Pagos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredPayments.map((payment) => (
              <Card key={payment.id} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{payment.product}</CardTitle>
                      <p className="text-sm text-slate-600">{payment.id} - {payment.orderId}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getStatusColor(payment.status)}>
                        {getStatusText(payment.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">{payment.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>Monto:</span>
                      <span className="font-bold text-lg">{formatCurrency(payment.amount, payment.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Método de Pago:</span>
                      <div className="flex items-center gap-2">
                        {getMethodIcon(payment.paymentMethod)}
                        <span className="font-medium">{getMethodText(payment.paymentMethod)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Fecha de Vencimiento:</span>
                      <span className="font-medium">{payment.dueDate}</span>
                    </div>
                  </div>

                  {payment.paymentDetails && (
                    <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                      <p className="text-sm font-medium text-slate-700">Detalles de Pago:</p>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>Banco:</span>
                          <span className="font-medium">{payment.paymentDetails.bankName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Cuenta:</span>
                          <span className="font-mono font-medium">{payment.paymentDetails.accountNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Referencia:</span>
                          <span className="font-mono font-medium">{payment.paymentDetails.reference}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Button>
                    {payment.status === 'pending' && (
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Realizar Pago
                      </Button>
                    )}
                    {payment.status === 'paid' && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Estado vacío */}
          {filteredPayments.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-12 text-center">
                <CreditCard className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay pagos</h3>
                <p className="text-slate-600">No hay pagos disponibles o no hay coincidencias con los filtros.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
} 