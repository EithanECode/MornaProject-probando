"use client";

import { Bell, MessageCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  notifications: number;
  onMenuToggle?: () => void;
}

export default function Header({ notifications, onMenuToggle }: HeaderProps) {
  const handleMenuToggle = () => {
    onMenuToggle?.();
  };

  return (
    <header className="dashboard-header bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Botón de menú hamburguesa - solo visible en móviles y tablets */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMenuToggle}
              className="lg:hidden p-2 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Dashboard</h1>
              <p className="text-xs sm:text-sm text-slate-600">Resumen de la operación</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button variant="outline" size="sm" className="relative hidden sm:flex">
              <Bell className="w-4 h-4 mr-2" />
              <span className="hidden md:inline">Notificaciones</span>
              {notifications > 0 && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {notifications}
                </Badge>
              )}
            </Button>
            
            {/* Botón de notificaciones compacto para móviles */}
            <Button variant="outline" size="sm" className="relative sm:hidden">
              <Bell className="w-4 h-4" />
              {notifications > 0 && (
                <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {notifications}
                </Badge>
              )}
            </Button>
            
            {/* Botón de chat de soporte para desktop */}
            <Button variant="outline" size="sm" className="hidden md:flex">
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat Soporte
            </Button>
            
            {/* Botón de chat de soporte compacto para móviles */}
            <Button variant="outline" size="sm" className="md:hidden">
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
} 