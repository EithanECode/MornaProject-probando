"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Package, 
  MessageCircle, 
  Settings, 
  LogOut,
  User,
  MapPin,
  Users,
  AlertTriangle,
  BarChart3,
  FileText,
  Calculator,
  Truck,
  Flag,
  CreditCard,
  Shield,
  BadgeDollarSign
} from 'lucide-react';
import VenezuelaFlag from '@/components/ui/common/VenezuelaFlag';
import PitaLogo from '@/components/ui/common/PitaLogo';
import { Badge } from '@/components/ui/badge';

interface SidebarProps {
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  isMobileMenuOpen?: boolean;
  onMobileMenuClose?: () => void;
  userRole?: 'client' | 'venezuela' | 'china' | 'pagos' | 'admin';
}

// Menús específicos para cada rol
const CLIENT_MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
    color: 'text-blue-500',
    path: '/dashboard'
  },
  {
    id: 'mis-pedidos',
    label: 'Mis Pedidos',
    icon: Package,
    badge: 3,
    color: 'text-orange-500',
    path: '/mis-pedidos'
  },
  {
    id: 'pagos',
    label: 'Pagos',
    icon: CreditCard,
    badge: 2,
    color: 'text-red-500',
    path: '/pagos'
  },
  {
    id: 'tracking',
    label: 'Tracking',
    icon: MapPin,
    badge: null,
    color: 'text-purple-500',
    path: '/tracking'
  },
  {
    id: 'soporte',
    label: 'Soporte',
    icon: MessageCircle,
    badge: null,
    color: 'text-green-500',
    path: '/soporte'
  }
];

const VENEZUELA_MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
    color: 'text-blue-500',
    path: '/venezuela'
  },
  {
    id: 'pedidos',
    label: 'Revisar Pedidos',
    icon: Package,
    badge: 5,
    color: 'text-orange-500',
    path: '/venezuela/pedidos'
  },
  {
    id: 'soporte',
    label: 'Soporte',
    icon: MessageCircle,
    badge: 3,
    color: 'text-green-500',
    path: '/venezuela/soporte'
  },
  {
    id: 'tracking',
    label: 'Tracking',
    icon: MapPin,
    badge: 2,
    color: 'text-purple-500',
    path: '/venezuela/tracking'
  },
  {
    id: 'validacion-pagos',
    label: 'Validación de Pagos',
    icon: BadgeDollarSign,
    badge: null,
    color: 'text-emerald-500',
    path: '/venezuela/validacion-pagos'
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: BarChart3,
    badge: null,
    color: 'text-indigo-500',
    path: '/venezuela/reportes'
  }
];

const CHINA_MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
    color: 'text-blue-500',
    path: '/china'
  },
  {
    id: 'pedidos',
    label: 'Pedidos',
    icon: Package,
    badge: 12,
    color: 'text-orange-500',
    path: '/china/pedidos'
  },
  {
    id: 'cotizaciones',
    label: 'Cotizaciones',
    icon: Calculator,
    badge: 15,
    color: 'text-yellow-500',
    path: '/china/cotizaciones'
  },
  {
    id: 'logistica',
    label: 'Logística',
    icon: Truck,
    badge: 7,
    color: 'text-purple-500',
    path: '/china/logistica'
  },
  {
    id: 'proveedores',
    label: 'Proveedores',
    icon: Users,
    badge: null,
    color: 'text-green-500',
    path: '/china/proveedores'
  },
  {
    id: 'pagos',
    label: 'Pagos',
    icon: CreditCard,
    badge: 4,
    color: 'text-red-500',
    path: '/china/pagos'
  }
];

const PAGOS_MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
    color: 'text-blue-500',
    path: '/pagos'
  },
  {
    id: 'validacion',
    label: 'Validación',
    icon: Shield,
    badge: 15,
    color: 'text-green-500',
    path: '/validacion-pagos'
  },
  {
    id: 'transacciones',
    label: 'Transacciones',
    icon: CreditCard,
    badge: null,
    color: 'text-purple-500',
    path: '/pagos/transacciones'
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: BarChart3,
    badge: null,
    color: 'text-orange-500',
    path: '/pagos/reportes'
  }
];

const ADMIN_MENU_ITEMS = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
    color: 'text-blue-500',
    path: '/admin'
  },
  {
    id: 'usuarios',
    label: 'Usuarios',
    icon: Users,
    badge: null,
    color: 'text-green-500',
    path: '/usuarios'
  },
  {
    id: 'pedidos',
    label: 'Pedidos',
    icon: Package,
    badge: null,
    color: 'text-orange-500',
    path: '/pedidos'
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: BarChart3,
    badge: null,
    color: 'text-purple-500',
    path: '/reportes'
  },
  {
    id: 'alertas',
    label: 'Alertas',
    icon: AlertTriangle,
    badge: 5,
    color: 'text-red-500',
    path: '/alertas'
  },
  {
    id: 'gestion',
    label: 'Gestión',
    icon: Settings,
    badge: null,
    color: 'text-gray-500',
    path: '/gestion'
  }
];

const BOTTOM_ITEMS = [
  {
    id: 'settings',
    label: 'Configuración',
    icon: Settings,
    color: 'text-gray-500',
    path: '/configuracion'
  }
];

// Función para obtener el menú según el rol
const getMenuItemsByRole = (role?: string) => {
  switch (role) {
    case 'venezuela':
      return VENEZUELA_MENU_ITEMS;
    case 'china':
      return CHINA_MENU_ITEMS;
    case 'pagos':
      return PAGOS_MENU_ITEMS;
    case 'admin':
      return ADMIN_MENU_ITEMS;
    default:
      return CLIENT_MENU_ITEMS;
  }
};

// Función para obtener información del usuario según el rol
const getUserInfoByRole = (role?: string) => {
  switch (role) {
    case 'venezuela':
      return {
        name: 'Empleado Venezuela',
        email: 'venezuela@morna.com',
        flag: '🇻🇪'
      };
    case 'china':
      return {
        name: 'Empleado China',
        email: 'china@morna.com',
        flag: '🇨🇳'
      };
    case 'pagos':
      return {
        name: 'Validador Pagos',
        email: 'pagos@morna.com',
        flag: '💳'
      };
    case 'admin':
      return {
        name: 'Administrador',
        email: 'admin@morna.com',
        flag: '👑'
      };
    default:
      return {
        name: 'Cliente',
        email: 'cliente@morna.com',
        flag: '🇻🇪'
      };
  }
};

// Hook personalizado para detectar el tamaño de pantalla
const useScreenSize = () => {
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };

    updateScreenWidth();
    window.addEventListener('resize', updateScreenWidth);
    return () => window.removeEventListener('resize', updateScreenWidth);
  }, []);

  return screenWidth;
};

// Hook personalizado para detectar la página activa
const useActivePage = (menuItems: any[]) => {
  const pathname = usePathname();
  
  return useMemo(() => {
    const currentItem = menuItems.find(item => item.path === pathname);
    const currentBottomItem = BOTTOM_ITEMS.find(item => item.path === pathname);
    return currentItem?.id || currentBottomItem?.id || 'dashboard';
  }, [pathname, menuItems]);
};

export default function Sidebar({ isExpanded, setIsExpanded, isMobileMenuOpen = false, onMobileMenuClose, userRole = 'client' }: SidebarProps) {
  const router = useRouter();
  const screenWidth = useScreenSize();
  
  const menuItems = getMenuItemsByRole(userRole);
  const userInfo = getUserInfoByRole(userRole);
  
  const activeItem = useActivePage(menuItems);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // Memoizar los cálculos responsivos
  const responsiveConfig = useMemo(() => {
    const isSmallScreen = screenWidth < 1366;
    const isMediumScreen = screenWidth < 1600;
    const isLargeScreen = screenWidth >= 1600;
    const isMobile = screenWidth < 1024; // lg breakpoint

    return {
      sidebarWidth: isMobile 
        ? (isExpanded ? 'w-80' : 'w-16') // Mobile: respeta el estado isExpanded
        : isExpanded 
          ? (screenWidth < 1440 ? 'w-64' : 'w-72')
          : (isSmallScreen ? 'w-16' : isMediumScreen ? 'w-18' : 'w-20'),
      
      iconSize: isExpanded
        ? (isSmallScreen ? 'w-4 h-4' : isMediumScreen ? 'w-4.5 h-4.5' : 'w-5 h-5')
        : (isSmallScreen ? 'w-4 h-4' : isMediumScreen ? 'w-4.5 h-4.5' : 'w-5 h-5'),
      
      logoSize: ((): 'sm' | 'md' | 'lg' | 'xl' => {
        if (isExpanded) {
          return screenWidth < 1440 ? 'sm' : 'md';
        } else {
          if (isSmallScreen) return 'sm';
          if (isMediumScreen) return 'md';
          return 'lg';
        }
      })(),
      
      padding: isExpanded 
        ? 'p-4' 
        : (isSmallScreen ? 'p-2' : isMediumScreen ? 'p-3' : 'p-4'),
      
      buttonPadding: isExpanded
        ? (isSmallScreen ? 'px-3 py-2.5' : isMediumScreen ? 'px-3.5 py-2.5' : 'px-4 py-3')
        : (isSmallScreen ? 'p-2' : isMediumScreen ? 'p-2.5' : 'p-3'),
      
      textSize: isSmallScreen ? 'text-sm' : 'text-base',
      titleSize: isSmallScreen ? 'text-lg' : 'text-xl',
      subtitleSize: isSmallScreen ? 'text-[10px]' : 'text-xs',
      badgeSize: isSmallScreen ? 'text-[10px]' : 'text-xs',
      iconContainerSize: isExpanded 
        ? (isSmallScreen ? 'w-6 h-6' : isMediumScreen ? 'w-7 h-7' : 'w-8 h-8')
        : 'w-full h-full',
      userContainerSize: isSmallScreen ? 'w-8 h-8' : 'w-10 h-10',
      userTextSize: isSmallScreen ? 'text-xs' : 'text-sm',
      userSubtextSize: isSmallScreen ? 'text-[10px]' : 'text-xs',
      userPadding: isSmallScreen ? 'p-2' : 'p-3',
      isMobile
    };
  }, [isExpanded, screenWidth, isMobileMenuOpen]);

  // Optimizar el manejo del hover (solo en desktop)
  const handleMouseEnter = useCallback(() => {
    if (responsiveConfig.isMobile) return;
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsExpanded(true);
  }, [hoverTimeout, setIsExpanded, responsiveConfig.isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (responsiveConfig.isMobile) return;
    const timeout = setTimeout(() => {
      setIsExpanded(false);
    }, 300);
    setHoverTimeout(timeout);
  }, [setIsExpanded, responsiveConfig.isMobile]);

  // Optimizar la navegación
  const handleNavigation = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  // Memoizar el renderizado de los elementos del menú
  const renderMenuItem = useCallback((item: typeof menuItems[0]) => {
    const Icon = item.icon;
    const isActive = activeItem === item.id;
    
    return (
      <button
        key={item.id}
        onClick={() => handleNavigation(item.path)}
        className={`
          w-full flex items-center ${isExpanded ? 'space-x-3 px-4 py-3' : `justify-center ${responsiveConfig.buttonPadding}`} rounded-xl
          transition-all duration-150 ease-out group relative
          active:scale-95
          ${isActive 
            ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white shadow-lg border border-blue-500/30' 
            : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
          }
        `}
      >
        {/* Active indicator */}
        <div className={`
          absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 rounded-r-full
          transition-all duration-150 ease-out
          ${isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'}
        `} />
        
        <div className={`${responsiveConfig.iconContainerSize} flex items-center justify-center rounded-lg`}>
          <Icon 
            className={`${responsiveConfig.iconSize} ${item.color} transition-all duration-150 ease-out ${isActive ? 'scale-105' : 'scale-100'}`}
          />
        </div>
        
        <div className={`
          transition-all duration-150 ease-out overflow-hidden
          ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
        `}>
          <div className="flex items-center justify-between whitespace-nowrap">
            <span className={`font-medium ${responsiveConfig.textSize}`}>{item.label}</span>
            {item.badge && (
              <Badge className={`bg-red-500 text-white ${responsiveConfig.badgeSize} animate-pulse`}>
                {item.badge}
              </Badge>
            )}
          </div>
        </div>
        
        {!isExpanded && item.badge && (
          <div className={`absolute top-1 right-1 ${screenWidth < 1366 ? 'w-4 h-4' : 'w-5 h-5'} bg-red-500 rounded-full flex items-center justify-center animate-pulse`}>
            <span className={`${responsiveConfig.badgeSize} text-white font-bold`}>{item.badge}</span>
          </div>
        )}
      </button>
    );
  }, [isExpanded, activeItem, responsiveConfig, handleNavigation, screenWidth]);

  return (
    <>
      {/* Overlay para móviles */}
      {responsiveConfig.isMobile && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onMobileMenuClose}
        />
      )}
      
      <div 
        className={`
          fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
          border-r border-slate-700/50 shadow-2xl backdrop-blur-sm z-50
          transition-all duration-300 ease-out flex flex-col
          ${responsiveConfig.isMobile 
            ? 'w-80' 
            : responsiveConfig.sidebarWidth
          }
        `}
        style={{
          transform: responsiveConfig.isMobile && !isMobileMenuOpen ? 'translateX(-100%)' : 'translateX(0)',
          visibility: responsiveConfig.isMobile && !isMobileMenuOpen ? 'hidden' : 'visible'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
        <div className={`${responsiveConfig.padding} border-b border-slate-700/50 flex-shrink-0`}>
          <div className={`flex items-center ${isExpanded ? 'space-x-3' : 'justify-center'}`}>
            <PitaLogo size={responsiveConfig.logoSize} animated={true} />
            <div className={`
              transition-all duration-150 ease-out overflow-hidden
              ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
            `}>
              <div className="whitespace-nowrap">
                <h1 className={`font-bold text-white ${responsiveConfig.titleSize}`}>Pita Express</h1>
                <p className={`text-slate-400 ${responsiveConfig.subtitleSize}`}>{userInfo.name}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${responsiveConfig.padding} space-y-2 overflow-y-auto sidebar-scrollbar`}>
          {menuItems.map(renderMenuItem)}
        </nav>

        {/* Bottom Section */}
        <div className={`${responsiveConfig.padding} border-t border-slate-700/50 space-y-4 flex-shrink-0`}>
          {/* User Profile */}
          <div className={`flex items-center space-x-3 ${responsiveConfig.userPadding} rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-150 ease-out`}>
            <div className={`${responsiveConfig.userContainerSize} bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center`}>
              {userRole === 'client' ? (
                <VenezuelaFlag size="sm" animated={true} />
              ) : (
                <span className="text-lg">{userInfo.flag}</span>
              )}
            </div>
            <div className={`
              transition-all duration-150 ease-out overflow-hidden
              ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
            `}>
              <div className="whitespace-nowrap">
                <p className={`font-medium text-white ${responsiveConfig.userTextSize}`}>
                  {userInfo.name}
                </p>
                <p className={`text-slate-400 ${responsiveConfig.userSubtextSize}`}>
                  {userInfo.email}
                </p>
              </div>
            </div>
          </div>

          {/* Settings */}
          {BOTTOM_ITEMS.map((item) => {
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-150 ease-out group"
              >
                <div className={`${screenWidth < 1366 ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-lg group-hover:bg-slate-600/50`}>
                  <Icon className={`${responsiveConfig.iconSize} ${item.color}`} />
                </div>
                <div className={`
                  transition-all duration-150 ease-out overflow-hidden
                  ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
                `}>
                  <span className="font-medium whitespace-nowrap">{item.label}</span>
                </div>
              </button>
            );
          })}

          {/* Logout */}
          <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150 ease-out group border border-red-500/20">
            <div className={`${screenWidth < 1366 ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-lg group-hover:bg-red-500/20`}>
              <LogOut className={responsiveConfig.iconSize} />
            </div>
            <div className={`
              transition-all duration-150 ease-out overflow-hidden
              ${isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0'}
            `}>
              <span className="font-medium whitespace-nowrap">Cerrar Sesión</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
