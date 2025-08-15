"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { MessageSquare, Phone, Mail, Clock, HelpCircle } from "lucide-react";

// Preguntas frecuentes
const faqData = [
  { id: 1, question: '¿Cómo puedo rastrear mi paquete?', answer: 'Puedes rastrear tu paquete de varias formas:\n\n1. Ingresa el número de seguimiento en nuestra página de rastreo\n2. Haz clic en el enlace que recibiste por email\n3. Usa nuestra app móvil\n4. Pregunta en el chat en vivo\n\nEl número de seguimiento tiene formato TRK123456789 y lo recibes dentro de las 24 horas posteriores al envío. Si no lo encuentras, revisa tu carpeta de spam.' },
  { id: 2, question: '¿Cuánto tiempo tarda la entrega?', answer: 'Los tiempos de entrega varían según el destino y el tipo de envío:\n\nEnvíos Nacionales: 24-48h\nInternacionales: 3-10 días hábiles.' },
  { id: 3, question: '¿Qué métodos de pago aceptan?', answer: 'Tarjetas, PayPal, transferencias y pago contra reembolso.' },
  { id: 4, question: '¿Cómo devuelvo un producto?', answer: 'Ve a "Mis Pedidos", selecciona el producto y sigue los pasos para devolución.' },
];

export default function ClienteSoporte() {
  // Estado para animación de cierre
  const [isClosing, setIsClosing] = useState(false);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  // Estados y lógica centralizados para el chat
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; message: string; time: Date }[]>([]);
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isAgentTyping]);

  // Funciones para el chat
  const openChat = () => {
    setIsChatOpen(true);
    setIsClosing(false);
  };
  const closeChat = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsChatOpen(false);
      setIsClosing(false);
    }, 300); // Duración de la animación
  };
  const sendMessage = (message: string) => {
    if (!message.trim()) return;
    setChatMessages([...chatMessages, { sender: "user", message, time: new Date() }]);
    setIsAgentTyping(true);
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        { sender: "agent", message: "¡Gracias por tu mensaje! Pronto te ayudaremos.", time: new Date() },
      ]);
      setIsAgentTyping(false);
    }, 1500);
  };

  // Solo el renderizado inicial depende de mounted
  const [showFaq, setShowFaq] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<number | undefined>(undefined);
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
          notifications={0}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Soporte"
          subtitle="¿Necesitas ayuda? Estamos aquí para ti"
        />
        
        <div className="p-6 space-y-6">
          {/* Header de la página */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Soporte al Cliente</h1>
                <p className="text-blue-100 mt-1">¿Tienes alguna pregunta? Nuestro equipo está listo para ayudarte</p>
              </div>
              <HelpCircle className="h-12 w-12 text-blue-200" />
            </div>
          </div>

          {/* Canales de Soporte */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-green-100 rounded-full w-fit">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Chat en Línea</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-slate-600 mb-4">Chatea con nuestro equipo de soporte en tiempo real</p>
                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={openChat}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Iniciar Chat
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-blue-100 rounded-full w-fit">
                  <Phone className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle>Teléfono</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-slate-600 mb-4">Llámanos directamente para atención inmediata</p>
                <Button variant="outline" className="w-full">
                  <Phone className="w-4 h-4 mr-2" />
                  +58 412-123-4567
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-purple-100 rounded-full w-fit">
                  <Mail className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle>Email</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-slate-600 mb-4">Envíanos un email y te responderemos en 24 horas</p>
                <Button variant="outline" className="w-full">
                  <Mail className="w-4 h-4 mr-2" />
                  soporte@morna.com
                </Button>
              </CardContent>
            </Card>
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-yellow-100 rounded-full w-fit">
                  <HelpCircle className="h-8 w-8 text-yellow-600" />
                </div>
                <CardTitle>Ayuda Rápida</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-slate-600 mb-4">Consulta las preguntas frecuentes y resuelve tus dudas al instante</p>
                <Button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => setShowFaq(!showFaq)}>Ver Preguntas</Button>
              </CardContent>
            </Card>
          </div>

          {/* Horarios de Atención */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horarios de Atención
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-800">Lunes a Viernes</h4>
                  <p className="text-slate-600">8:00 AM - 6:00 PM (GMT-4)</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800">Sábados</h4>
                  <p className="text-slate-600">9:00 AM - 2:00 PM (GMT-4)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Preguntas frecuentes debajo del horario */}
          {showFaq && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 mt-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-yellow-600" />
                  Preguntas Frecuentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <style jsx>{`
                  .faq-answer {
                    max-height: 0;
                    opacity: 0;
                    transform: translateY(-8px);
                    transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
                    overflow: hidden;
                  }
                  .faq-answer.expanded {
                    max-height: 500px;
                    opacity: 1;
                    transform: translateY(0);
                  }
                `}</style>
                <div className="space-y-3">
                  {faqData.map(faq => (
                    <div
                      key={faq.id}
                      className="border rounded-lg p-3 bg-white shadow-sm cursor-pointer"
                      onClick={() => setOpenFaqId(openFaqId === faq.id ? undefined : faq.id)}
                    >
                      <span className="font-medium text-gray-900">{faq.question}</span>
                      <div className={`faq-answer${openFaqId === faq.id ? ' expanded' : ''} mt-2 text-gray-700 whitespace-pre-line`}>
                        {openFaqId === faq.id && faq.answer}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="mt-4 w-full bg-yellow-500 hover:bg-yellow-600 text-white" onClick={() => setShowFaq(false)}>Cerrar Preguntas</Button>
              </CardContent>
            </Card>
          )}

          {/* Mensaje de Estado */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardContent className="p-12 text-center">
              <HelpCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Soporte en Desarrollo</h3>
              <p className="text-slate-600">Esta sección está siendo desarrollada. Pronto tendrás acceso completo a nuestro sistema de soporte.</p>
            </CardContent>
          </Card>
        </div>
      </main>
      {/* Modal de chat integrado */}
      {(isChatOpen || isClosing) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            className={`bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 flex flex-col ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}
            style={{
              minHeight: '520px',
              transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), opacity 0.3s cubic-bezier(0.4,0,0.2,1)',
              transform: 'scale(1)',
              opacity: 1
            }}
          >
            <style jsx global>{`
              @keyframes fade-in {
                0% {
                  opacity: 0;
                  transform: scale(0.95);
                }
                100% {
                  opacity: 1;
                  transform: scale(1);
                }
              }
              @keyframes fade-out {
                0% {
                  opacity: 1;
                  transform: scale(1);
                }
                100% {
                  opacity: 0;
                  transform: scale(0.95);
                }
              }
              .animate-fade-in {
                animation: fade-in 0.3s ease;
              }
              .animate-fade-out {
                animation: fade-out 0.3s ease;
              }
            `}</style>
            <div className="p-4 border-b flex justify-between items-center bg-green-50 rounded-t-2xl">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-sm">👨‍💼</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Chat con Soporte</h3>
                  <p className="text-xs text-green-600">● Carlos - Agente disponible</p>
                </div>
              </div>
              <button type="button" onClick={closeChat} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4 space-y-3 flex-1 overflow-y-auto" id="chatMessages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-message flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.sender === "user" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-900"}`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className={`text-xs ${msg.sender === "user" ? "text-green-100" : "text-gray-500"} mt-1`}>
                      {msg.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}
              {isAgentTyping && (
                <div className="text-xs text-gray-500 typing-indicator">Carlos está escribiendo...</div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t bg-gray-50">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  const input = e.currentTarget.elements.namedItem('chatInput') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    sendMessage(input.value);
                    input.value = '';
                  }
                }}
                className="flex space-x-2"
                autoComplete="off"
              >
                <input
                  type="text"
                  id="chatInput"
                  name="chatInput"
                  placeholder="Escribe tu mensaje..."
                  className="flex-1 px-3 py-2 border rounded-full focus:ring-2 focus:ring-green-500"
                  autoComplete="off"
                  spellCheck={false}
                />
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">📤</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}