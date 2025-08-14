'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Player } from '@lottiefiles/react-lottie-player';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  Check
} from 'lucide-react';

// Importar animaciones de Lottie
import airPlaneLottie from '/public/animations/FTQoLAnxbj.json';
import cargoShipLottie from '/public/animations/wired-flat-1337-cargo-ship-hover-pinch.json';
import truckLottie from '/public/animations/wired-flat-18-delivery-truck.json';
import cameraLottie from '/public/animations/wired-flat-61-camera-hover-flash.json';
import folderLottie from '/public/animations/wired-flat-120-folder-hover-adding-files.json';
import linkLottie from '/public/animations/wired-flat-11-link-unlink-hover-bounce.json';
import confettiLottie from '/public/animations/wired-flat-1103-confetti-hover-pinch.json';

// Tipos
interface Order {
  id: string;
  product: string;
  description: string;
  amount: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  progress: number;
  tracking: string;
  estimatedDelivery: string;
  createdAt: string;
  category: string;
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
    status: 'pending',
    progress: 10,
    tracking: 'Pendiente',
    estimatedDelivery: '30 días',
    createdAt: '2024-01-25',
    category: 'Wearables'
  }
];

export default function MisPedidosPage() {
  // Estados básicos
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Estados de la página
  const [orders] = useState<Order[]>(MOCK_ORDERS);
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
    estimatedBudget: ''
  });

  // Estados para animaciones de Lottie
  const [hoveredDeliveryOption, setHoveredDeliveryOption] = useState<string | null>(null);
  const [isFolderHovered, setIsFolderHovered] = useState(false);
  const [isCameraHovered, setIsCameraHovered] = useState(false);
  const [isLinkHovered, setIsLinkHovered] = useState(false);

  // Inicialización
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cálculos derivados
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
    totalSpent: orders.reduce((sum, order) => sum + parseFloat(order.amount.replace('$', '').replace(',', '')), 0)
  };

  // Funciones helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
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

  // Handlers
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmitOrder = () => {
    console.log('Nuevo pedido:', newOrderData);
    setShowSuccessAnimation(true);
    
    setTimeout(() => {
      setShowSuccessAnimation(false);
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
        estimatedBudget: ''
      });
    }, 3000);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewOrderData({ ...newOrderData, productImage: e.target.files[0] });
    }
  };

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return newOrderData.productName && newOrderData.description;
      case 2:
        return newOrderData.deliveryType && newOrderData.deliveryVenezuela;
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
      />
      
      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-72 w-[calc(100%-18rem)]' : 'ml-20 w-[calc(100%-5rem)]'}`}>
        <Header 
          notifications={stats.pending} 
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Mis Pedidos"
          subtitle="Gestiona y sigue el estado de tus pedidos"
        />
        
        <div className="p-6 space-y-6">
          {/* Header de la página */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Mis Pedidos</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Gestiona y sigue el estado de tus pedidos</p>
            </div>
            
            {/* Botón Nuevo Pedido */}
            <Dialog open={isNewOrderModalOpen} onOpenChange={setIsNewOrderModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <Plus className="w-4 h-4 mr-2" />
                  Nuevo Pedido
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Crear Nuevo Pedido
                  </DialogTitle>
                  <DialogDescription>
                    Sigue los pasos para crear tu solicitud de importación
                  </DialogDescription>
                </DialogHeader>

                {/* Progress Bar */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Paso {currentStep} de 3</span>
                    <span>{Math.round((currentStep / 3) * 100)}% completado</span>
                  </div>
                  <Progress value={(currentStep / 3) * 100} className="h-2" />
                </div>

                {/* Step Content */}
                <div className="space-y-6">
                  {/* Animación de éxito */}
                  {showSuccessAnimation && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg p-8 text-center space-y-4">
                        <div className="w-24 h-24 mx-auto">
                          <Player
                            src={confettiLottie}
                            className="w-full h-full"
                            loop={true}
                            autoplay={true}
                          />
                        </div>
                        <h3 className="text-2xl font-bold text-green-600">¡Pedido Creado!</h3>
                        <p className="text-slate-600">Tu solicitud ha sido enviada exitosamente</p>
                      </div>
                    </div>
                  )}

                  {/* Step Header */}
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-semibold">{getStepTitle(currentStep)}</h3>
                    <p className="text-sm text-slate-600">{getStepDescription(currentStep)}</p>
                  </div>

                  {/* Step 1: Información del Producto */}
                  {currentStep === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="productName">Nombre del Producto</Label>
                        <Input
                          id="productName"
                          value={newOrderData.productName}
                          onChange={(e) => setNewOrderData({ ...newOrderData, productName: e.target.value })}
                          placeholder="Ej: iPhone 15 Pro Max"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Descripción del Producto</Label>
                        <Textarea
                          id="description"
                          value={newOrderData.description}
                          onChange={(e) => setNewOrderData({ ...newOrderData, description: e.target.value })}
                          placeholder="Describe detalladamente el producto que deseas importar..."
                          rows={4}
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quantity">Cantidad</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={newOrderData.quantity}
                          onChange={(e) => setNewOrderData({ ...newOrderData, quantity: parseInt(e.target.value) || 1 })}
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="specifications">Especificaciones Técnicas</Label>
                        <Textarea
                          id="specifications"
                          value={newOrderData.specifications}
                          onChange={(e) => setNewOrderData({ ...newOrderData, specifications: e.target.value })}
                          placeholder="Color, talla, modelo, características específicas, etc."
                          rows={3}
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Tipo de Solicitud */}
                      <div className="space-y-4">
                        <Label>Tipo de Solicitud</Label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              newOrderData.requestType === 'link'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                            onClick={() => setNewOrderData({ ...newOrderData, requestType: 'link' })}
                            onMouseEnter={() => setIsLinkHovered(true)}
                            onMouseLeave={() => setIsLinkHovered(false)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6">
                                <Player
                                  key={isLinkHovered ? 'link-active' : 'link-inactive'}
                                  src={linkLottie}
                                  className="w-full h-full"
                                  loop={false}
                                  autoplay={isLinkHovered}
                                />
                              </div>
                              <div>
                                <p className="font-medium">Link del Producto</p>
                                <p className="text-sm text-slate-600">Pega el enlace de la tienda</p>
                              </div>
                            </div>
                          </div>
                          <div
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                              newOrderData.requestType === 'photo'
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                            onClick={() => setNewOrderData({ ...newOrderData, requestType: 'photo' })}
                            onMouseEnter={() => setIsCameraHovered(true)}
                            onMouseLeave={() => setIsCameraHovered(false)}
                          >
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6">
                                <Player
                                  key={isCameraHovered ? 'camera-active' : 'camera-inactive'}
                                  src={cameraLottie}
                                  className="w-full h-full"
                                  loop={false}
                                  autoplay={isCameraHovered}
                                />
                              </div>
                              <div>
                                <p className="font-medium">Foto + Descripción</p>
                                <p className="text-sm text-slate-600">Sube una imagen del producto</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {newOrderData.requestType === 'link' && (
                          <div className="space-y-2">
                            <Label htmlFor="productUrl">URL del Producto</Label>
                            <Input
                              id="productUrl"
                              type="url"
                              value={newOrderData.productUrl || ''}
                              onChange={(e) => setNewOrderData({ ...newOrderData, productUrl: e.target.value })}
                              placeholder="https://ejemplo.com/producto"
                              className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        )}

                        {newOrderData.requestType === 'photo' && (
                          <div className="space-y-2">
                            <Label>Imagen del Producto</Label>
                            <div 
                              className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors duration-200"
                              onMouseEnter={() => setIsFolderHovered(true)}
                              onMouseLeave={() => setIsFolderHovered(false)}
                            >
                              <div className="w-8 h-8 mx-auto mb-2">
                                <Player
                                  key={isFolderHovered ? 'folder-active' : 'folder-inactive'}
                                  src={folderLottie}
                                  className="w-full h-full"
                                  loop={false}
                                  autoplay={isFolderHovered}
                                />
                              </div>
                              <p className="text-sm text-slate-600 mb-2">
                                {newOrderData.productImage ? newOrderData.productImage.name : 'Haz clic para subir una imagen'}
                              </p>
                              <Button
                                variant="outline"
                                onClick={() => document.getElementById('imageUpload')?.click()}
                              >
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
                          value={newOrderData.estimatedBudget}
                          onChange={(e) => setNewOrderData({ ...newOrderData, estimatedBudget: e.target.value })}
                          placeholder="Ej: 500"
                          className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        />
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

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePrevStep}
                    disabled={currentStep === 1}
                    className="transition-all duration-200"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Anterior
                  </Button>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsNewOrderModalOpen(false)}
                    >
                      Cancelar
                    </Button>
                    
                    {currentStep < 3 ? (
                      <Button
                        onClick={handleNextStep}
                        disabled={!canProceedToNext()}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                      >
                        Siguiente
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmitOrder}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Pedidos</p>
                    <p className="text-2xl font-bold">{stats.total}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Pendientes</p>
                    <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">En Proceso</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
                  </div>
                  <Truck className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Enviados</p>
                    <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
                  </div>
                  <MapPin className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Total Gastado</p>
                    <p className="text-2xl font-bold text-green-600">${stats.totalSpent.toLocaleString()}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y búsqueda */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
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
                  <SelectTrigger className="w-48">
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
                  <div key={order.id} className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                          <p className="font-medium text-sm">{order.id}</p>
                          <p className="text-xs text-slate-600">{order.product}</p>
                        </div>
                        <Badge className={getStatusColor(order.status)}>
                          {getStatusText(order.status)}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">{order.amount}</p>
                        <p className="text-xs text-slate-600">Tracking: {order.tracking}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progreso</span>
                        <span>{order.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(order.progress)}`} 
                          style={{ width: `${order.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-600">
                        <span>Entrega estimada: {order.estimatedDelivery}</span>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 px-2"
                            onClick={() => handleViewDetails(order)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver detalles
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Soporte
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredOrders.length === 0 && (
                  <div className="text-center py-10">
                    <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-500">No se encontraron pedidos</p>
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
                    <p className="text-sm font-medium text-slate-600">Monto</p>
                    <p className="text-lg font-bold text-green-600">{selectedOrder.amount}</p>
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
      </main>
    </div>
  );
} 