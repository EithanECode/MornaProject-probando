"use client";

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  MessageCircle, 
  BarChart3, 
  Settings, 
  Bell,
  Users,
  Truck,
  FileText,
  LogOut,
  User,
  Globe
} from 'lucide-react';
import VenezuelaFlag from '@/components/ui/common/VenezuelaFlag';
import PitaLogo from '@/components/ui/common/PitaLogo';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export default function Sidebar({ isExpanded, setIsExpanded }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('dashboard');
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Detectar la página actual
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/') {
      setActiveItem('dashboard');
    } else if (path === '/pedidos') {
      setActiveItem('pedidos');
    }
  }, []);

  const handleMouseEnter = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsExpanded(true);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsExpanded(false);
    }, 300); // 300ms delay antes de cerrar
    setHoverTimeout(timeout);
  };

  const handleNavigation = (itemId: string) => {
    setActiveItem(itemId);
    // Navegación inmediata sin delays artificiales
    if (itemId === 'dashboard') {
      window.location.href = '/';
    } else if (itemId === 'pedidos') {
      window.location.href = '/pedidos';
    }
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
      color: 'text-blue-500'
    },
    {
      id: 'pedidos',
      label: 'Pedidos',
      icon: Package,
      badge: 23,
      color: 'text-orange-500'
    },
    // {
    //   id: 'tracking',
    //   label: 'Tracking',
    //   icon: Truck,
    //   badge: 5,
    //   color: 'text-green-500'
    // },
    // {
    //   id: 'chat',
    //   label: 'Chat Soporte',
    //   icon: MessageCircle,
    //   badge: 3,
    //   color: 'text-purple-500'
    // },
    // {
    //   id: 'reportes',
    //   label: 'Reportes',
    //   icon: BarChart3,
    //   badge: null,
    //   color: 'text-indigo-500'
    // },
    // {
    //   id: 'clientes',
    //   label: 'Clientes',
    //   icon: Users,
    //   badge: null,
    //   color: 'text-teal-500'
    // },
    // {
    //   id: 'documentos',
    //   label: 'Documentos',
    //   icon: FileText,
    //   badge: null,
    //   color: 'text-slate-500'
    // },
  ];

  const bottomItems = [
    {
      id: 'settings',
      label: 'Configuración',
      icon: Settings,
      color: 'text-gray-500'
    }
  ];

  return (
    <div 
      className={`
        fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
        border-r border-slate-700/50 shadow-2xl backdrop-blur-sm z-50
        transition-all duration-200 ease-out flex flex-col
        ${isExpanded ? 'w-72' : 'w-20'}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-700/50 flex-shrink-0">
        <div className={`flex items-center ${isExpanded ? 'space-x-3' : 'justify-center'}`}>
          <PitaLogo size={isExpanded ? "md" : "lg"} animated={true} />
          <div className={`
            transition-all duration-200 ease-out overflow-hidden
            ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
          `}>
            <div className="whitespace-nowrap">
              <h1 className="text-xl font-bold text-white">Pita Express</h1>
              <p className="text-xs text-slate-400">Admin Panel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`
                w-full flex items-center ${isExpanded ? 'space-x-3 px-4 py-3' : 'justify-center p-3'} rounded-xl
                transition-all duration-200 ease-out group relative
                active:scale-95 active:shadow-inner
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white shadow-lg border border-blue-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }
              `}
            >
              {/* Active indicator */}
              <div className={`
                absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full
                transition-all duration-200 ease-out
                ${isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}
              `} />
              
              <div className={`${isExpanded ? 'w-8 h-8' : 'w-full h-full'} flex items-center justify-center rounded-lg`}>
                <Icon className={`w-5 h-5 ${item.color} transition-all duration-200 ease-out ${isActive ? 'scale-110 animate-pulse' : 'scale-100'}`} />
              </div>
              
              <div className={`
                transition-all duration-200 ease-out overflow-hidden
                ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
              `}>
                <div className="flex items-center justify-between whitespace-nowrap">
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge className="bg-red-500 text-white text-xs animate-pulse">
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </div>
              
              {!isExpanded && item.badge && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                  <span className="text-xs text-white font-bold">{item.badge}</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-slate-700/50 space-y-4 flex-shrink-0">
        {/* User Profile */}
        <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-200 ease-out">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <VenezuelaFlag size="sm" animated={true} />
          </div>
          <div className={`
            transition-all duration-200 ease-out overflow-hidden
            ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
          `}>
            <div className="whitespace-nowrap">
              <p className="text-sm font-medium text-white">Empleado Vzla</p>
              <p className="text-xs text-slate-400">vzla@logidash.com</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        {bottomItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 ease-out group"
            >
              <div className="w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-slate-600/50">
                <Icon className={`w-5 h-5 ${item.color}`} />
              </div>
              <div className={`
                transition-all duration-200 ease-out overflow-hidden
                ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
              `}>
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              </div>
            </button>
          );
        })}

        {/* Logout */}
        <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 ease-out group border border-red-500/20">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg group-hover:bg-red-500/20">
            <LogOut className="w-5 h-5" />
          </div>
          <div className={`
            transition-all duration-200 ease-out overflow-hidden
            ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
          `}>
            <span className="font-medium whitespace-nowrap">Cerrar Sesión</span>
          </div>
        </button>
      </div>
    </div>
  );
}
