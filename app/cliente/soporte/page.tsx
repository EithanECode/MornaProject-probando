'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Phone, Mail, Clock, HelpCircle } from 'lucide-react';

export default function ClienteSoporte() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="mx-auto p-3 bg-green-100 rounded-full w-fit">
                  <MessageSquare className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle>Chat en Línea</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-slate-600 mb-4">Chatea con nuestro equipo de soporte en tiempo real</p>
                <Button className="w-full bg-green-600 hover:bg-green-700">
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
    </div>
  );
} 