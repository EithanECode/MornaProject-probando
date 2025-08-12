"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  Globe,
  BadgeDollarSign
} from 'lucide-react';
import VenezuelaFlag from '@/components/ui/common/VenezuelaFlag';
import PitaLogo from '@/components/ui/common/PitaLogo';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
}

export default function Sidebar({ isExpanded, setIsExpanded }: SidebarProps) {
  const router = useRouter();
  const [activeItem, setActiveItem] = useState('dashboard');
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);
  const [screenWidth, setScreenWidth] = useState(0);

  // Detectar el ancho de pantalla para ajustar el sidebar
  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };

    updateScreenWidth();
    window.addEventListener('resize', updateScreenWidth);
    return () => window.removeEventListener('resize', updateScreenWidth);
  }, []);

  // Detectar la página actual
  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/') {
      setActiveItem('dashboard');
    } else if (path === '/pedidos') {
      setActiveItem('pedidos');
    } else if (path === '/tracking') {
      setActiveItem('tracking');
    } else if (path === '/alertas') {
      setActiveItem('alertas');
    } else if (path === '/validacion-pagos' || path === '/pagos') {
      setActiveItem('validacion-pagos');
    } else if (path === '/reportes') {
      setActiveItem('reportes');
    } else if (path === '/usuarios') {
      setActiveItem('usuarios');
    } else if (path === '/configuracion') {
      setActiveItem('settings');
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
      router.push('/');
    } else if (itemId === 'pedidos') {
      router.push('/pedidos');
    } else if (itemId === 'tracking') {
      router.push('/tracking');
    } else if (itemId === 'alertas') {
      router.push('/alertas');
    } else if (itemId === 'validacion-pagos') {
      router.push('/validacion-pagos');
    } else if (itemId === 'reportes') {
      router.push('/reportes');
    } else if (itemId === 'usuarios') {
      router.push('/usuarios');
    } else if (itemId === 'settings') {
      router.push('/configuracion');
    }
  };

  // Determinar tamaños responsivos
  const getSidebarWidth = () => {
    if (isExpanded) {
      return screenWidth < 1440 ? 'w-64' : 'w-72'; // Más pequeño en pantallas menores
    } else {
      if (screenWidth < 1366) return 'w-16'; // 64px para pantallas pequeñas
      if (screenWidth < 1600) return 'w-18'; // 72px para pantallas medianas
      return 'w-20'; // 80px para pantallas grandes
    }
  };

  const getIconSize = () => {
    if (isExpanded) {
      if (screenWidth < 1366) return 'w-4 h-4'; // Iconos más pequeños cuando está expandido en pantallas pequeñas
      if (screenWidth < 1600) return 'w-4.5 h-4.5'; // Tamaño intermedio
      return 'w-5 h-5'; // Tamaño normal
    } else {
      if (screenWidth < 1366) return 'w-4 h-4'; // Iconos más pequeños en pantallas pequeñas
      if (screenWidth < 1600) return 'w-4.5 h-4.5'; // Tamaño intermedio
      return 'w-5 h-5'; // Tamaño normal
    }
  };

  const getLogoSize = () => {
    if (isExpanded) return screenWidth < 1440 ? "sm" : "md";
    if (screenWidth < 1366) return "sm";
    if (screenWidth < 1600) return "md";
    return "lg";
  };

  const getPadding = () => {
    if (isExpanded) return 'p-4';
    if (screenWidth < 1366) return 'p-2'; // Menos padding en pantallas pequeñas
    if (screenWidth < 1600) return 'p-3';
    return 'p-4';
  };

  const getButtonPadding = () => {
    if (isExpanded) {
      if (screenWidth < 1366) return 'px-3 py-2.5'; // Padding más compacto cuando está expandido en pantallas pequeñas
      if (screenWidth < 1600) return 'px-3.5 py-2.5'; // Padding intermedio
      return 'px-4 py-3'; // Padding normal
    } else {
      if (screenWidth < 1366) return 'p-2'; // Botones más compactos
      if (screenWidth < 1600) return 'p-2.5';
      return 'p-3';
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
    {
      id: 'tracking',
      label: 'Tracking',
      icon: Truck,
      badge: 5,
      color: 'text-green-500'
    },
    {
      id: 'alertas',
      label: 'Alertas',
      icon: Bell,
      badge: 3,
      color: 'text-red-500'
    },
    {
      id: 'validacion-pagos',
      label: 'Validación de Pagos',
      icon: BadgeDollarSign,
      badge: null,
      color: 'text-emerald-500'
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: BarChart3,
      badge: null,
      color: 'text-indigo-500'
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: Users,
      badge: null,
      color: 'text-teal-500'
    },
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
        ${getSidebarWidth()}
      `}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Header */}
      <div className={`${getPadding()} border-b border-slate-700/50 flex-shrink-0`}>
        <div className={`flex items-center ${isExpanded ? 'space-x-3' : 'justify-center'}`}>
          <PitaLogo size={getLogoSize()} animated={true} />
          <div className={`
            transition-all duration-200 ease-out overflow-hidden
            ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
          `}>
            <div className="whitespace-nowrap">
              <h1 className={`font-bold text-white ${screenWidth < 1366 ? 'text-lg' : 'text-xl'}`}>Pita Express</h1>
              <p className={`text-slate-400 ${screenWidth < 1366 ? 'text-[10px]' : 'text-xs'}`}>Admin Panel</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={`flex-1 ${getPadding()} space-y-2 overflow-y-auto`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeItem === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className={`
                w-full flex items-center ${isExpanded ? 'space-x-3 px-4 py-3' : `justify-center ${getButtonPadding()}`} rounded-xl
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
              
              <div className={`${isExpanded ? (screenWidth < 1366 ? 'w-6 h-6' : screenWidth < 1600 ? 'w-7 h-7' : 'w-8 h-8') : 'w-full h-full'} flex items-center justify-center rounded-lg`}>
                <Icon 
                  className={`${getIconSize()} ${item.color} transition-all duration-200 ease-out ${isActive ? 'scale-110 animate-bounce' : 'scale-100'}`}
                  style={isActive ? { animationDuration: '1.5s' } : undefined}
                />
              </div>
              
              <div className={`
                transition-all duration-200 ease-out overflow-hidden
                ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
              `}>
                <div className="flex items-center justify-between whitespace-nowrap">
                  <span className={`font-medium ${screenWidth < 1366 ? 'text-sm' : 'text-base'}`}>{item.label}</span>
                  {item.badge && (
                    <Badge className={`bg-red-500 text-white ${screenWidth < 1366 ? 'text-[10px]' : 'text-xs'} animate-pulse`}>
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </div>
              
              {!isExpanded && item.badge && (
                <div className={`absolute top-1 right-1 ${screenWidth < 1366 ? 'w-4 h-4' : 'w-5 h-5'} bg-red-500 rounded-full flex items-center justify-center animate-pulse`}>
                  <span className={`${screenWidth < 1366 ? 'text-[10px]' : 'text-xs'} text-white font-bold`}>{item.badge}</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className={`${getPadding()} border-t border-slate-700/50 space-y-4 flex-shrink-0`}>
        {/* User Profile */}
        <div className={`flex items-center space-x-3 ${screenWidth < 1366 ? 'p-2' : 'p-3'} rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-200 ease-out`}>
          <div className={`${screenWidth < 1366 ? 'w-8 h-8' : 'w-10 h-10'} bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center`}>
            <VenezuelaFlag size="sm" animated={true} />
          </div>
          <div className={`
            transition-all duration-200 ease-out overflow-hidden
            ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
          `}>
            <div className="whitespace-nowrap">
              <p className={`font-medium text-white ${screenWidth < 1366 ? 'text-xs' : 'text-sm'}`}>Empleado Vzla</p>
              <p className={`text-slate-400 ${screenWidth < 1366 ? 'text-[10px]' : 'text-xs'}`}>vzla@logidash.com</p>
            </div>
          </div>
        </div>

        {/* Settings */}
        {bottomItems.map((item) => {
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200 ease-out group"
            >
              <div className={`${screenWidth < 1366 ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-lg group-hover:bg-slate-600/50`}>
                <Icon className={`${getIconSize()} ${item.color}`} />
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
          <div className={`${screenWidth < 1366 ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-lg group-hover:bg-red-500/20`}>
            <LogOut className={getIconSize()} />
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
