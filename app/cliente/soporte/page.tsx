"use client";

import { useState, useEffect, useRef } from "react";
import { useTranslation } from '@/hooks/useTranslation';
import { useTheme } from "next-themes";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Phone, 
  Mail, 
  Clock, 
  HelpCircle, 
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  X,
  Bot,
  User,
  Sparkles,
  Zap,
  Shield,
  Headphones
} from "lucide-react";

// Preguntas frecuentes expandidas
const faqData = [
  {
    id: 1,
    category: "Tracking",
    question: '¿Cómo puedo rastrear mi paquete?',
    answer: 'Puedes rastrear tu paquete de varias formas:\n\n1. Ingresa el número de seguimiento en nuestra página de rastreo\n2. Haz clic en el enlace que recibiste por email\n3. Usa nuestra app móvil\n4. Pregunta en el chat en vivo\n\nEl número de seguimiento tiene formato TRK123456789 y lo recibes dentro de las 24 horas posteriores al envío. Si no lo encuentras, revisa tu carpeta de spam.',
    tags: ['tracking', 'envío', 'seguimiento']
  },
  {
    id: 2,
    category: "Envíos",
    question: '¿Cuánto tiempo tarda la entrega?',
    answer: 'Los tiempos de entrega varían según el destino y el tipo de envío:\n\n• Envíos Nacionales: 24-48h\n• Internacionales: 3-10 días hábiles\n• Express: 1-3 días hábiles\n• Económico: 5-15 días hábiles\n\nLos tiempos pueden variar por factores como aduanas, clima o eventos especiales.',
    tags: ['entrega', 'tiempo', 'envío']
  },
  {
    id: 3,
    category: "Pagos",
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos múltiples métodos de pago para tu comodidad:\n\n• Tarjetas de crédito/débito (Visa, MasterCard, American Express)\n• PayPal\n• Transferencias bancarias\n• Pago Móvil\n• Criptomonedas (Bitcoin, Ethereum)\n• Pago contra reembolso (solo envíos nacionales)\n\nTodos los pagos son procesados de forma segura con encriptación SSL.',
    tags: ['pago', 'tarjeta', 'paypal', 'transferencia']
  },
  {
    id: 4,
    category: "Devoluciones",
    question: '¿Cómo devuelvo un producto?',
    answer: 'Para devolver un producto sigue estos pasos:\n\n1. Ve a "Mis Pedidos" en tu cuenta\n2. Selecciona el producto que deseas devolver\n3. Haz clic en "Solicitar Devolución"\n4. Completa el formulario con el motivo\n5. Imprime la etiqueta de devolución\n6. Envía el producto en 7 días\n\nLas devoluciones son gratuitas si el producto llegó dañado o es diferente al solicitado.',
    tags: ['devolución', 'reembolso', 'producto']
  },
  {
    id: 5,
    category: "Cuenta",
    question: '¿Cómo cambio mi contraseña?',
    answer: 'Para cambiar tu contraseña:\n\n1. Inicia sesión en tu cuenta\n2. Ve a "Configuración" → "Seguridad"\n3. Haz clic en "Cambiar Contraseña"\n4. Ingresa tu contraseña actual\n5. Escribe la nueva contraseña\n6. Confirma la nueva contraseña\n7. Haz clic en "Guardar Cambios"\n\nRecibirás un email de confirmación cuando el cambio sea exitoso.',
    tags: ['contraseña', 'cuenta', 'seguridad']
  },
  {
    id: 6,
    category: "Facturación",
    question: '¿Cómo obtengo mi factura?',
    answer: 'Para obtener tu factura:\n\n1. Ve a "Mis Pedidos"\n2. Selecciona el pedido específico\n3. Haz clic en "Descargar Factura"\n4. La factura se descargará en formato PDF\n\nTambién puedes solicitar facturas por email enviando tu número de pedido a facturacion@morna.com\n\nLas facturas están disponibles 24 horas después de la confirmación del pago.',
    tags: ['factura', 'facturación', 'pdf']
  }
];

// Respuestas automáticas del chat
const autoResponses = [
  "¡Hola! Soy Carlos, tu agente de soporte. ¿En qué puedo ayudarte hoy?",
  "Entiendo tu consulta. Déjame revisar esa información para ti...",
  "Perfecto, puedo ayudarte con eso. Te explico paso a paso:",
  "Excelente pregunta. Según nuestros registros:",
  "Gracias por contactarnos. Te ayudo a resolver esto:",
  "¡Por supuesto! Aquí tienes la información que necesitas:",
  "Me alegra poder ayudarte. La respuesta es:",
  "Entiendo perfectamente tu situación. Te recomiendo:"
];

export default function ClienteSoporte() {
  const { t } = useTranslation();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Estados del chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isChatClosing, setIsChatClosing] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ 
    id: string; 
    sender: 'user' | 'agent'; 
    message: string; 
    time: Date;
    isTyping?: boolean;
  }[]>([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Estados del FAQ
  const [openFaqId, setOpenFaqId] = useState<number | undefined>(undefined);
  const [faqSearch, setFaqSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFiltering, setIsFiltering] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAgentTyping]);

  // Funciones del chat
  const openChat = () => {
    setIsChatClosing(false);
    setIsChatOpen(true);
    // Pequeño delay para que se vea la animación de entrada
    setTimeout(() => {
      // Mensaje de bienvenida automático
      if (chatMessages.length === 0) {
        setChatMessages([{
          id: '1',
          sender: 'agent',
          message: '¡Hola! Soy Carlos, tu agente de soporte. ¿En qué puedo ayudarte hoy? 😊',
          time: new Date()
        }]);
      }
    }, 300);
  };

  const closeChat = () => {
    setIsChatClosing(true);
    setTimeout(() => {
      setIsChatOpen(false);
      setIsChatClosing(false);
    }, 300);
  };

  const sendMessage = (message: string) => {
    if (!message.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user' as const,
      message: message.trim(),
      time: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsAgentTyping(true);

    // Simular respuesta del agente
    setTimeout(() => {
      const randomResponse = autoResponses[Math.floor(Math.random() * autoResponses.length)];
      const agentMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent' as const,
        message: `${randomResponse}\n\n${getResponseForMessage(message)}`,
        time: new Date()
      };
      setChatMessages(prev => [...prev, agentMessage]);
      setIsAgentTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const getResponseForMessage = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('tracking') || lowerMessage.includes('rastreo') || lowerMessage.includes('seguimiento')) {
      return 'Para rastrear tu pedido, ve a la sección "Tracking" en el menú lateral. Ingresa tu número de seguimiento (formato TRK123456789) y podrás ver el estado en tiempo real.';
    }
    
    if (lowerMessage.includes('tiempo') || lowerMessage.includes('entrega') || lowerMessage.includes('días')) {
      return 'Los tiempos de entrega varían: Nacional 24-48h, Internacional 3-10 días, Express 1-3 días. Puedes ver el tiempo estimado en tu pedido específico.';
    }
    
    if (lowerMessage.includes('pago') || lowerMessage.includes('tarjeta') || lowerMessage.includes('paypal')) {
      return 'Aceptamos tarjetas, PayPal, transferencias, Pago Móvil y criptomonedas. Todos los pagos son seguros con encriptación SSL.';
    }
    
    if (lowerMessage.includes('devolución') || lowerMessage.includes('reembolso')) {
      return 'Para devoluciones, ve a "Mis Pedidos", selecciona el producto y solicita la devolución. Es gratis si llegó dañado o es diferente al solicitado.';
    }
    
    return 'Si necesitas ayuda más específica, puedes contactarnos por teléfono al +58 412-123-4567 o por email a soporte@morna.com.';
  };

  // Filtrar FAQ
  const filteredFaq = faqData.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
                         faq.tags.some(tag => tag.toLowerCase().includes(faqSearch.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Función para manejar cambios de filtro con animación
  const handleCategoryChange = (category: string) => {
    setIsFiltering(true);
    setSelectedCategory(category);
    setTimeout(() => setIsFiltering(false), 100);
  };

  const handleSearchChange = (search: string) => {
    setIsFiltering(true);
    setFaqSearch(search);
    setTimeout(() => setIsFiltering(false), 100);
  };

  const categories = ['all', ...Array.from(new Set(faqData.map(faq => faq.category)))];

  if (!mounted) return null;

  return (
    <>
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
            notifications={0}
            onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            title={t('client.support.title')}
            subtitle={t('client.support.subtitle')}
          />
          
          <div className="p-4 md:p-5 lg:p-6 space-y-6 md:space-y-6 lg:space-y-8">
            {/* Header de la página con animación */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-xl p-4 md:p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-pulse"></div>
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
                <div className="space-y-2">
                  <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">{t('client.support.headerTitle')}</h1>
                  <p className="text-blue-100 text-sm md:text-base lg:text-lg">{t('client.support.headerSubtitle')}</p>
                  <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4 text-xs md:text-sm">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span>{t('client.support.onlineNow')}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 md:w-4 md:h-4" />
                      <span>{t('client.support.responseTime')}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:flex md:items-center md:space-x-4 gap-4">
                  <div className="text-center">
                    <div className="text-lg md:text-xl lg:text-2xl font-bold">24/7</div>
                    <div className="text-xs md:text-sm text-blue-100">{t('client.support.support')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-xl lg:text-2xl font-bold">98%</div>
                    <div className="text-xs md:text-sm text-blue-100">{t('client.support.satisfaction')}</div>
                  </div>
                </div>
              </div>
            </div>

                        {/* Canales de Soporte con animaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <Card className="group bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer" onClick={openChat}>
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 md:p-4 bg-gradient-to-br from-green-400 to-green-600 rounded-full w-fit group-hover:scale-110 transition-transform duration-300">
                    <MessageSquare className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-green-600 transition-colors">{t('support.channels.chatTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-xs md:text-sm text-slate-600 mb-4">{t('support.channels.chatDesc')}</p>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-200 transition-colors">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    {t('support.channels.available')}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="group bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 md:p-4 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full w-fit group-hover:scale-110 transition-transform duration-300">
                    <Phone className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-blue-600 transition-colors">{t('support.channels.phoneTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-xs md:text-sm text-slate-600 mb-4">{t('support.channels.phoneDesc')}</p>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:border-blue-300 group-hover:text-blue-600 transition-colors"
                    onClick={() => window.open('https://wa.me/584121234567', '_blank')}
                  >
                    <Phone className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="text-xs md:text-sm">+58 412-123-4567</span>
                  </Button>
                </CardContent>
              </Card>

              <Card className="group bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-xl transition-all duration-300 hover:scale-105">
                <CardHeader className="text-center">
                  <div className="mx-auto p-3 md:p-4 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full w-fit group-hover:scale-110 transition-transform duration-300">
                    <Mail className="h-6 w-6 md:h-8 md:w-8 text-white" />
                  </div>
                  <CardTitle className="group-hover:text-purple-600 transition-colors">{t('support.channels.emailTitle')}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-xs md:text-sm text-slate-600 mb-4">{t('support.channels.emailDesc')}</p>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:border-purple-300 group-hover:text-purple-600 transition-colors"
                    onClick={() => window.open('mailto:soporte@morna.com?subject=Soporte Morna&body=Hola, necesito ayuda con...', '_blank')}
                  >
                    <Mail className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    <span className="text-xs md:text-sm">soporte@morna.com</span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Horarios de Atención */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  {t('client.support.schedule.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-blue-50 rounded-lg gap-2 md:gap-0">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm md:text-base">{t('client.support.schedule.weekdays')}</h4>
                        <p className="text-slate-600 text-xs md:text-sm">8:00 AM - 6:00 PM (GMT-4)</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800 text-xs md:text-sm w-fit">{t('client.support.schedule.open')}</Badge>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-orange-50 rounded-lg gap-2 md:gap-0">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm md:text-base">{t('client.support.schedule.saturday')}</h4>
                        <p className="text-slate-600 text-xs md:text-sm">9:00 AM - 2:00 PM (GMT-4)</p>
                      </div>
                      <Badge className="bg-orange-100 text-orange-800 text-xs md:text-sm w-fit">{t('client.support.schedule.limited')}</Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-red-50 rounded-lg gap-2 md:gap-0">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm md:text-base">{t('client.support.schedule.sunday')}</h4>
                        <p className="text-slate-600 text-xs md:text-sm">{t('client.support.schedule.closed')}</p>
                      </div>
                      <Badge className="bg-red-100 text-red-800 text-xs md:text-sm w-fit">{t('client.support.schedule.closed')}</Badge>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between p-3 bg-purple-50 rounded-lg gap-2 md:gap-0">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm md:text-base">{t('client.support.schedule.chat247')}</h4>
                        <p className="text-slate-600 text-xs md:text-sm">{t('client.support.schedule.automatic')}</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800 text-xs md:text-sm w-fit">{t('client.support.channels.available')}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Interactivo - Siempre visible */}
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-orange-600" />
                  Preguntas Frecuentes
                </CardTitle>
                <p className="text-xs md:text-sm text-slate-600">Encuentra respuestas rápidas a las preguntas más comunes</p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Búsqueda y filtros */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar en preguntas frecuentes..."
                      value={faqSearch}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {/* Filtros por categoría */}
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {categories.map(category => (
                      <Badge
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        className="cursor-pointer hover:bg-slate-100 transition-colors text-xs md:text-sm"
                        onClick={() => handleCategoryChange(category)}
                      >
                        {category === 'all' ? 'Todas' : category}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Lista de FAQ */}
                <div className="space-y-3">
                  {filteredFaq.length > 0 ? (
                    filteredFaq.map((faq, index) => (
                      <div
                        key={faq.id}
                        className={`border rounded-lg p-4 bg-white shadow-sm cursor-pointer hover:shadow-md transition-all duration-500 ease-out ${
                          isFiltering ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                        }`}
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: isFiltering ? 'none' : 'fadeInUp 0.6s ease-out forwards'
                        }}
                        onClick={() => setOpenFaqId(openFaqId === faq.id ? undefined : faq.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="secondary" className="text-xs">
                                {faq.category}
                              </Badge>
                            </div>
                            <h4 className="font-medium text-gray-900 text-sm md:text-base">{faq.question}</h4>
                          </div>
                          <div className="ml-2 md:ml-4 transition-transform duration-200">
                            {openFaqId === faq.id ? (
                              <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                            )}
                          </div>
                        </div>
                        
                        <div 
                          className={`overflow-hidden transition-all duration-300 ease-in-out ${
                            openFaqId === faq.id 
                              ? 'max-h-96 opacity-100 mt-4' 
                              : 'max-h-0 opacity-0'
                          }`}
                        >
                          <div className="text-gray-700 whitespace-pre-line border-t pt-4 text-xs md:text-sm">
                            {faq.answer}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-3">
                            {faq.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 md:py-8">
                      <HelpCircle className="w-8 h-8 md:w-12 md:h-12 text-slate-400 mx-auto mb-3 md:mb-4" />
                      <p className="text-slate-600 text-sm md:text-base">No se encontraron preguntas que coincidan con tu búsqueda.</p>
                      <Button 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => {
                          handleSearchChange('');
                          handleCategoryChange('all');
                        }}
                      >
                        Limpiar filtros
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Chat Modal Moderno */}
      {isChatOpen && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-end p-2 md:p-4">
          <div className={`bg-white rounded-2xl shadow-2xl max-w-md w-full flex flex-col h-[500px] md:h-[600px] transition-all duration-300 ease-out ${
            isChatClosing 
              ? 'translate-y-full scale-95 opacity-0' 
              : 'animate-in slide-in-from-bottom-4 duration-500 ease-out scale-in-95'
          }`}>
            {/* Header del chat */}
            <div className="p-3 md:p-4 border-b bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 md:w-5 md:h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base">Chat con Soporte</h3>
                    <p className="text-xs md:text-sm text-green-100 flex items-center">
                      <div className="w-2 h-2 bg-green-300 rounded-full mr-2 animate-pulse"></div>
                      Carlos - En línea
                    </p>
                  </div>
                </div>
                <button 
                  onClick={closeChat}
                  className="text-white/80 hover:text-white transition-colors p-1 md:p-2"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>

            {/* Mensajes */}
            <div className="flex-1 p-3 md:p-4 space-y-3 md:space-y-4 overflow-y-auto bg-gray-50">
              {chatMessages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-xs px-3 md:px-4 py-2 md:py-3 rounded-2xl ${
                    msg.sender === "user" 
                      ? "bg-green-600 text-white rounded-br-md" 
                      : "bg-white text-gray-900 rounded-bl-md shadow-sm"
                  }`}>
                    <p className="text-xs md:text-sm">{msg.message}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === "user" ? "text-green-100" : "text-gray-500"
                    }`}>
                      {msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              
              {isAgentTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-900 rounded-2xl rounded-bl-md shadow-sm px-3 md:px-4 py-2 md:py-3">
                    <div className="flex items-center space-x-1">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">Carlos está escribiendo...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input del chat */}
            <div className="p-3 md:p-4 border-t bg-white rounded-b-2xl">
                              <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (chatInput.trim()) {
                      sendMessage(chatInput);
                    }
                  }}
                  className="flex space-x-1 md:space-x-2"
                >
                <Input
                  type="text"
                  placeholder="Escribe tu mensaje..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1"
                  disabled={isAgentTyping}
                />
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!chatInput.trim() || isAgentTyping}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Send className="w-3 h-3 md:w-4 md:h-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Estilos CSS para animaciones */}
      <style jsx>{`
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          50% {
            opacity: 0.5;
            transform: translateY(15px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </>
  );
}