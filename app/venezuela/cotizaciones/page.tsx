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
  Calculator, 
  DollarSign,
  Search,
  Filter,
  RefreshCw,
  Eye,
  Send,
  Clock,
  AlertTriangle,
  Package,
  CheckCircle,
  FileText
} from 'lucide-react';

// Tipos
interface Quotation {
  id: string;
  orderId: string;
  clientName: string;
  clientId: string;
  product: string;
  description: string;
  quantity: number;
  originalPrice: number;
  finalPrice: number;
  currency: 'USD' | 'BS';
  status: 'pending' | 'sent' | 'accepted' | 'rejected' | 'expired';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  expiresAt: string;
  notes?: string;
  shippingCost: number;
  deliveryTime: string;
  paymentTerms: string;
}

// Datos mock
const QUOTATIONS: Quotation[] = [
  {
    id: 'COT-001',
    orderId: 'ORD-2024-001',
    clientName: 'María González',
    clientId: 'CL-001',
    product: 'iPhone 15 Pro Max',
    description: 'iPhone 15 Pro Max 256GB Titanio Natural',
    quantity: 1,
    originalPrice: 1200,
    finalPrice: 1350,
    currency: 'USD',
    status: 'sent',
    priority: 'high',
    createdAt: '2024-01-15 10:30',
    expiresAt: '2024-01-22 10:30',
    notes: 'Precio incluye envío aéreo y seguro',
    shippingCost: 150,
    deliveryTime: '15-20 días',
    paymentTerms: '50% anticipo, 50% antes del envío'
  },
  {
    id: 'COT-002',
    orderId: 'ORD-2024-002',
    clientName: 'Carlos Pérez',
    clientId: 'CL-002',
    product: 'MacBook Air M2',
    description: 'MacBook Air M2 13" 8GB RAM 256GB SSD',
    quantity: 1,
    originalPrice: 1100,
    finalPrice: 1250,
    currency: 'USD',
    status: 'pending',
    priority: 'medium',
    createdAt: '2024-01-16 14:20',
    expiresAt: '2024-01-23 14:20',
    notes: 'Incluye adaptador de corriente',
    shippingCost: 150,
    deliveryTime: '20-25 días',
    paymentTerms: '100% anticipo'
  },
  {
    id: 'COT-003',
    orderId: 'ORD-2024-003',
    clientName: 'Ana Rodríguez',
    clientId: 'CL-003',
    product: 'AirPods Pro',
    description: 'AirPods Pro 2da Generación',
    quantity: 2,
    originalPrice: 400,
    finalPrice: 450,
    currency: 'USD',
    status: 'accepted',
    priority: 'low',
    createdAt: '2024-01-14 16:45',
    expiresAt: '2024-01-21 16:45',
    notes: 'Precio por unidad',
    shippingCost: 50,
    deliveryTime: '10-15 días',
    paymentTerms: 'Pago completo'
  },
  {
    id: 'COT-004',
    orderId: 'ORD-2024-004',
    clientName: 'Luis Martínez',
    clientId: 'CL-004',
    product: 'iPad Pro 12.9"',
    description: 'iPad Pro 12.9" 128GB WiFi + Cellular',
    quantity: 1,
    originalPrice: 900,
    finalPrice: 1050,
    currency: 'USD',
    status: 'rejected',
    priority: 'medium',
    createdAt: '2024-01-13 09:15',
    expiresAt: '2024-01-20 09:15',
    notes: 'Cliente solicitó descuento adicional',
    shippingCost: 150,
    deliveryTime: '18-22 días',
    paymentTerms: '30% anticipo, 70% antes del envío'
  }
];

export default function VenezuelaCotizacionesPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sent': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'sent': return 'Enviada';
      case 'accepted': return 'Aceptada';
      case 'rejected': return 'Rechazada';
      case 'expired': return 'Expirada';
      default: return 'Desconocido';
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${currency === 'USD' ? '$' : 'Bs.'}${amount.toLocaleString()}`;
  };

  const filteredQuotations = QUOTATIONS.filter(quotation => {
    const matchesSearch = 
      quotation.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quotation.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quotation.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || quotation.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: QUOTATIONS.length,
    pending: QUOTATIONS.filter(q => q.status === 'pending').length,
    sent: QUOTATIONS.filter(q => q.status === 'sent').length,
    accepted: QUOTATIONS.filter(q => q.status === 'accepted').length,
    rejected: QUOTATIONS.filter(q => q.status === 'rejected').length,
    totalValue: QUOTATIONS.reduce((sum, q) => sum + q.finalPrice, 0)
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
        userRole="venezuela"
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-24 w-[calc(100%-6rem)]'
      }`}>
        <Header 
          notifications={stats.pending + stats.sent}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Cotizaciones"
          subtitle="Gestiona cotizaciones y precios para clientes"
        />
        
        <div className="p-6 space-y-6">
          {/* Header de la página */}
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Cotizaciones</h1>
                <p className="text-yellow-100 mt-1">Gestiona cotizaciones y precios para clientes</p>
              </div>
              <div className="hidden md:flex items-center space-x-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-yellow-100">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-yellow-100">Pendientes</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{stats.accepted}</p>
                  <p className="text-sm text-yellow-100">Aceptadas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalValue, 'USD')}</p>
                  <p className="text-sm text-yellow-100">Valor Total</p>
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
                      placeholder="Buscar por producto, cliente o ID..."
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
                      <SelectItem value="sent">Enviada</SelectItem>
                      <SelectItem value="accepted">Aceptada</SelectItem>
                      <SelectItem value="rejected">Rechazada</SelectItem>
                      <SelectItem value="expired">Expirada</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="w-40">
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las prioridades</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
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

          {/* Lista de Cotizaciones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredQuotations.map((quotation) => (
              <Card key={quotation.id} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{quotation.product}</CardTitle>
                      <p className="text-sm text-slate-600">{quotation.id} - {quotation.clientName}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(quotation.priority)}>
                        {quotation.priority === 'high' ? 'Alta' : quotation.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                      <Badge className={getStatusColor(quotation.status)}>
                        {getStatusText(quotation.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">{quotation.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>Cantidad:</span>
                      <span className="font-medium">{quotation.quantity}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Precio Original:</span>
                      <span className="font-medium">{formatCurrency(quotation.originalPrice, quotation.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Precio Final:</span>
                      <span className="font-bold text-lg">{formatCurrency(quotation.finalPrice, quotation.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Envío:</span>
                      <span className="font-medium">{formatCurrency(quotation.shippingCost, quotation.currency)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Tiempo de Entrega:</span>
                      <span className="font-medium">{quotation.deliveryTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Condiciones de Pago:</span>
                      <span className="font-medium text-xs">{quotation.paymentTerms}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Expira:</span>
                      <span className="font-medium">{quotation.expiresAt}</span>
                    </div>
                  </div>

                  {quotation.notes && (
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm text-slate-600">{quotation.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalles
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Send className="w-4 h-4 mr-2" />
                      Enviar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Estado vacío */}
          {filteredQuotations.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-12 text-center">
                <Calculator className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No hay cotizaciones</h3>
                <p className="text-slate-600">No hay cotizaciones disponibles o no hay coincidencias con los filtros.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
} 