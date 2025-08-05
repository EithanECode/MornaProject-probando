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
  ChevronLeft,  ChevronRight,
  LogOut,
  User,
  Globe
} from 'lucide-react';
import VenezuelaFlag from './VenezuelaFlag';
import PitaLogo from './PitaLogo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export default function Sidebar({ isExpanded, setIsExpanded }: SidebarProps) {
  const [activeItem, setActiveItem] = useState('dashboard');

  // Detectar la página actual
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/') {
      setActiveItem('dashboard');
    } else if (path === '/pedidos') {
      setActiveItem('pedidos');
    }
  }, []);

  const handleNavigation = (itemId: string) => {
    setActiveItem(itemId);
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
    <div className={`
      fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
      border-r border-slate-700/50 shadow-2xl backdrop-blur-sm z-50
      transition-all duration-500 ease-in-out flex flex-col
      ${isExpanded ? 'w-72' : 'w-20'}
    `}>
      {/* Header */}
      <div className={`${isExpanded ? 'p-6' : 'p-4'} border-b border-slate-700/50 flex-shrink-0 transition-all duration-500 ease-in-out`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center transition-all duration-500 ease-in-out ${isExpanded ? 'space-x-3' : 'justify-center w-full'}`}>
            <div className={`transition-all duration-500 ease-in-out ${isExpanded ? 'w-auto' : 'w-full flex justify-center'}`}>
              <PitaLogo size={isExpanded ? "md" : "lg"} animated={true} />
            </div>
            <div className={`
              transition-all duration-500 ease-in-out overflow-hidden
              ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
            `}>
              <div className="whitespace-nowrap">
                <h1 className="text-xl font-bold text-white">Pita Express</h1>
                <p className="text-xs text-slate-400">Admin Panel</p>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
          >
            {isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${isExpanded ? 'p-4' : 'p-2'} space-y-2 overflow-y-auto transition-all duration-500 ease-in-out`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`
                w-full flex items-center ${isExpanded ? 'space-x-3 px-4 py-3' : 'justify-center p-3'} rounded-xl
                transition-all duration-500 ease-in-out group relative overflow-hidden
                ${isActive 
                  ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white shadow-lg border border-blue-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                }
              `}
            >
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full animate-pulse" />
              )}
              
              <div className={`
                transition-all duration-500 ease-in-out
                ${isExpanded ? 'w-8 h-8' : 'w-full h-full'} flex items-center justify-center rounded-lg
                ${isActive ? 'bg-blue-500/20' : 'group-hover:bg-slate-600/50'}
              `}>
                <Icon className={`${isExpanded ? 'w-5 h-5' : 'w-6 h-6'} ${item.color} ${isActive ? 'animate-bounce' : ''} transition-all duration-300`} />
              </div>
              
              <div className={`
                transition-all duration-500 ease-in-out overflow-hidden
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
                <div className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-pulse transition-all duration-500 ease-in-out">
                  <span className="text-xs text-white font-bold">{item.badge}</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={`${isExpanded ? 'p-4' : 'p-2'} border-t border-slate-700/50 space-y-4 flex-shrink-0`}>
        {/* User Profile */}
        <div className={`
          flex items-center ${isExpanded ? 'space-x-3 p-3' : 'justify-center p-2'} rounded-xl bg-slate-800/50 border border-slate-700/50
          transition-all duration-500 ease-in-out hover:bg-slate-700/50
        `}>
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
            <VenezuelaFlag size="sm" animated={true} />
          </div>
          <div className={`
            transition-all duration-500 ease-in-out overflow-hidden
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
              className={`
                w-full flex items-center ${isExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-xl
                text-slate-400 hover:text-white hover:bg-slate-700/50
                transition-all duration-500 ease-in-out group
              `}
            >
              <div className={`
                transition-all duration-500 ease-in-out
                ${isExpanded ? 'w-8 h-8' : 'w-full h-full'} flex items-center justify-center rounded-lg
                group-hover:bg-slate-600/50
              `}>
                <Icon className={`${isExpanded ? 'w-5 h-5' : 'w-6 h-6'} ${item.color} transition-all duration-300`} />
              </div>
              <div className={`
                transition-all duration-500 ease-in-out overflow-hidden
                ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
              `}>
                <span className="font-medium whitespace-nowrap">{item.label}</span>
              </div>
            </button>
          );
        })}

        {/* Logout */}
        <button className={`
          w-full flex items-center ${isExpanded ? 'space-x-3 px-4' : 'justify-center px-2'} py-3 rounded-xl
          text-red-400 hover:text-red-300 hover:bg-red-500/10
          transition-all duration-500 ease-in-out group border border-red-500/20
        `}>
          <div className={`
            transition-all duration-500 ease-in-out
            ${isExpanded ? 'w-8 h-8' : 'w-full h-full'} flex items-center justify-center rounded-lg
            group-hover:bg-red-500/20
          `}>
            <LogOut className={`${isExpanded ? 'w-5 h-5' : 'w-6 h-6'} transition-all duration-300`} />
          </div>
          <div className={`
            transition-all duration-500 ease-in-out overflow-hidden
            ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
          `}>
            <span className="font-medium whitespace-nowrap">Cerrar Sesión</span>
          </div>
        </button>
      </div>
    </div>
  );
}
