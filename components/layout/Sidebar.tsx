"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
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
import { useClientContext } from '@/lib/ClientContext';
import { useVzlaContext } from '@/lib/VzlaContext';
import { useChinaContext } from '@/lib/ChinaContext';
import { useAdminContext } from '@/lib/AdminContext';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

// Safe context hooks that don't throw errors
const useSafeClientContext = () => {
  try {
    return useClientContext();
  } catch {
    return null;
  }
};

const useSafeVzlaContext = () => {
  try {
    return useVzlaContext();
  } catch {
    return null;
  }
};

const useSafeChinaContext = () => {
  try {
    return useChinaContext();
  } catch {
    return null;
  }
};

const useSafeAdminContext = () => {
  try {
    return useAdminContext();
  } catch {
    return null;
  }
};

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
    icon: LayoutDashboard,
    badge: null,
    color: 'text-blue-500',
    path: '/cliente'
  },
  {
    id: 'orders',
    icon: Package,
  badge: null,
    color: 'text-orange-500',
    path: '/cliente/mis-pedidos'
  },
  {
    id: 'payments',
    icon: CreditCard,
  badge: null,
    color: 'text-red-500',
    path: '/cliente/pagos'
  },
  {
    id: 'support',
    icon: MessageCircle,
    badge: null,
    color: 'text-green-500',
    path: '/cliente/soporte'
  }
];

const VENEZUELA_MENU_ITEMS = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    badge: null,
    color: 'text-blue-500',
    path: '/venezuela'
  },
  {
    id: 'orders',
    icon: Package,
  badge: null,
    color: 'text-orange-500',
    path: '/venezuela/pedidos'
  },
  {
    id: 'support',
    icon: MessageCircle,
  badge: null,
    color: 'text-green-500',
    path: '/venezuela/soporte'
  },
  {
    id: 'payments-validation',
    icon: BadgeDollarSign,
    badge: null,
    color: 'text-emerald-500',
    path: '/venezuela/validacion-pagos'
  },
  {
    id: 'reports',
    icon: BarChart3,
    badge: null,
    color: 'text-indigo-500',
    path: '/venezuela/reportes'
  }
];

const CHINA_MENU_ITEMS = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    badge: null,
    color: 'text-blue-500',
    path: '/china'
  },
  {
    id: 'orders',
    icon: Package,
  badge: null,
    color: 'text-orange-500',
    path: '/china/pedidos'
  }
];

const PAGOS_MENU_ITEMS = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    badge: null,
    color: 'text-blue-500',
    path: '/pagos'
  },
  {
    id: 'payments-validation',
    icon: Shield,
    badge: 15,
    color: 'text-green-500',
    path: '/validacion-pagos'
  },
  {
    id: 'transactions',
    icon: CreditCard,
    badge: null,
    color: 'text-purple-500',
    path: '/pagos/transacciones'
  },
  {
    id: 'reports',
    icon: BarChart3,
    badge: null,
    color: 'text-orange-500',
    path: '/pagos/reportes'
  }
];

const getAdminMenuItems = (t: (key: string) => string) => [
  {
    id: 'dashboard',
    label: t && typeof t === 'function' ? t('sidebar.dashboard') : 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
    color: 'text-blue-500',
    path: '/admin'
  },
  {
    id: 'usuarios',
    label: t && typeof t === 'function' ? t('sidebar.users') : 'Usuarios',
    icon: Users,
    badge: null,
    color: 'text-green-500',
    path: '/admin/usuarios'
  },
  {
    id: 'pedidos',
    label: t && typeof t === 'function' ? t('sidebar.orders') : 'Pedidos',
    icon: Package,
    badge: null,
    color: 'text-orange-500',
    path: '/admin/pedidos'
  },
  {
    id: 'gestion',
    label: t && typeof t === 'function' ? t('sidebar.management') : 'Gestión',
    icon: Settings,
    badge: null,
    color: 'text-gray-500',
    path: '/admin/gestion'
  }
];

// Función para obtener los items del bottom según el rol
const getBottomItemsByRole = (role?: string) => {
  const basePath = role === 'admin' ? '/admin' : 
                   role === 'venezuela' ? '/venezuela' : 
                   role === 'china' ? '/china' : 
                   role === 'pagos' ? '/pagos' : 
                   '/cliente';
  
  return [
    {
      id: 'settings',
      icon: Settings,
      color: 'text-gray-500',
      path: `${basePath}/configuracion`
    }
  ];
};

// Función para obtener el menú según el rol
const getMenuItemsByRole = (role?: string, t?: (key: string) => string) => {
  switch (role) {
    case 'venezuela':
      return VENEZUELA_MENU_ITEMS;
    case 'china':
      return CHINA_MENU_ITEMS;
    case 'pagos':
      return PAGOS_MENU_ITEMS;
    case 'admin':
      return getAdminMenuItems(t!);
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
const useActivePage = (menuItems: any[], userRole?: string, pathname?: string) => {
  return useMemo(() => {
    if (!pathname) return 'dashboard';
    const currentItem = menuItems.find(item => item.path === pathname);
    const bottomItems = getBottomItemsByRole(userRole);
    const currentBottomItem = bottomItems.find(item => item.path === pathname);
    return currentItem?.id || currentBottomItem?.id || 'dashboard';
  }, [pathname, menuItems, userRole]);
};

export default function Sidebar({ isExpanded, setIsExpanded, isMobileMenuOpen = false, onMobileMenuClose, userRole = 'client' }: SidebarProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const screenWidth = useScreenSize();
  
  const menuItems = getMenuItemsByRole(userRole, t);

  // Call all hooks unconditionally at the top level
  const clientCtx = useSafeClientContext();
  const vzlaCtx = useSafeVzlaContext();
  const chinaCtx = useSafeChinaContext();
  const adminCtx = useSafeAdminContext();

  // Get dynamic user info from context if available
  let userInfo: { name: string; email: string; flag?: string } = getUserInfoByRole(userRole);
  
  if (userRole === 'client' && clientCtx) {
    if (clientCtx.clientName || clientCtx.clientEmail) {
      userInfo = {
        name: clientCtx.clientName || userInfo.name,
        email: clientCtx.clientEmail || userInfo.email,
        flag: userInfo.flag
      };
    }
  } else if (userRole === 'venezuela' && vzlaCtx) {
    if (vzlaCtx.vzlaName || vzlaCtx.vzlaEmail) {
      userInfo = {
        name: vzlaCtx.vzlaName || userInfo.name,
        email: vzlaCtx.vzlaEmail || userInfo.email,
        flag: userInfo.flag
      };
    }
  } else if (userRole === 'china' && chinaCtx) {
    if (chinaCtx.chinaName || chinaCtx.chinaEmail) {
      userInfo = {
        name: chinaCtx.chinaName || userInfo.name,
        email: chinaCtx.chinaEmail || userInfo.email,
        flag: userInfo.flag
      };
    }
  } else if (userRole === 'admin' && adminCtx) {
    if (adminCtx.adminName || adminCtx.adminEmail) {
      userInfo = {
        name: adminCtx.adminName || userInfo.name,
        email: adminCtx.adminEmail || userInfo.email,
        flag: userInfo.flag
      };
    }
  }
  
  const pathname = usePathname();
  const activeItem = useActivePage(menuItems, userRole, pathname);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  // === Client active orders badge (dynamic) ===
  const [clientActiveOrders, setClientActiveOrders] = useState<number | null>(null);
  useEffect(() => {
    // Only fetch for client role with available context
    if (userRole !== 'client' || !clientCtx?.clientId) {
      setClientActiveOrders(null);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    let isCancelled = false;
    (async () => {
      try {
        // Count orders with state < 13 (considered activos/no entregados)
        const { count, error } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', clientCtx.clientId)
          .lt('state', 13);
        if (error) {
          console.error('Sidebar orders count error:', error);
          if (!isCancelled) setClientActiveOrders(null);
          return;
        }
        if (!isCancelled) setClientActiveOrders(typeof count === 'number' ? count : 0);
      } catch (e) {
        console.error('Sidebar orders count exception:', e);
        if (!isCancelled) setClientActiveOrders(null);
      }
    })();
    return () => { isCancelled = true; };
  }, [userRole, clientCtx?.clientId]);

  // === Venezuela active orders badge (dynamic) ===
  const [vzlaActiveOrders, setVzlaActiveOrders] = useState<number | null>(null);
  useEffect(() => {
    if (userRole !== 'venezuela' || !vzlaCtx?.vzlaId) {
      setVzlaActiveOrders(null);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    let isCancelled = false;
    (async () => {
      try {
        const { count, error } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('asignedEVzla', vzlaCtx.vzlaId)
          .lt('state', 13);
        if (error) {
          console.error('Sidebar Vzla orders count error:', error);
          if (!isCancelled) setVzlaActiveOrders(null);
          return;
        }
        if (!isCancelled) setVzlaActiveOrders(typeof count === 'number' ? count : 0);
      } catch (e) {
        console.error('Sidebar Vzla orders count exception:', e);
        if (!isCancelled) setVzlaActiveOrders(null);
      }
    })();
    return () => { isCancelled = true; };
  }, [userRole, vzlaCtx?.vzlaId]);

  // === Client pending payments badge (dynamic) ===
  const [clientPendingPayments, setClientPendingPayments] = useState<number | null>(null);
  useEffect(() => {
    if (userRole !== 'client' || !clientCtx?.clientId) {
      setClientPendingPayments(null);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    let isCancelled = false;
    (async () => {
      try {
        // Pending payments are represented by orders with state === 4 (as used in pagos page)
        const { count, error } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('client_id', clientCtx.clientId)
          .eq('state', 4);
        if (error) {
          console.error('Sidebar pending payments count error:', error);
          if (!isCancelled) setClientPendingPayments(null);
          return;
        }
        if (!isCancelled) setClientPendingPayments(typeof count === 'number' ? count : 0);
      } catch (e) {
        console.error('Sidebar pending payments count exception:', e);
        if (!isCancelled) setClientPendingPayments(null);
      }
    })();
    return () => { isCancelled = true; };
  }, [userRole, clientCtx?.clientId]);

  // === Venezuela active supports badge (dynamic) ===
  const [vzlaActiveSupports, setVzlaActiveSupports] = useState<number | null>(null);
  useEffect(() => {
    if (userRole !== 'venezuela' || !vzlaCtx?.vzlaId) {
      setVzlaActiveSupports(null);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    let isCancelled = false;
    (async () => {
      try {
        // Assumption: support tickets table and fields
        // Table: 'support_tickets', assigned column: 'asignedEVzla', status: 'active' | 'waiting' | 'resolved'
        const { count, error } = await supabase
          .from('support_tickets')
          .select('id', { count: 'exact', head: true })
          .eq('asignedEVzla', vzlaCtx.vzlaId)
          .eq('status', 'active');
        if (error) {
          console.error('Sidebar Vzla supports count error:', error);
          if (!isCancelled) setVzlaActiveSupports(null);
          return;
        }
        if (!isCancelled) setVzlaActiveSupports(typeof count === 'number' ? count : 0);
      } catch (e) {
        console.error('Sidebar Vzla supports count exception:', e);
        if (!isCancelled) setVzlaActiveSupports(null);
      }
    })();
    return () => { isCancelled = true; };
  }, [userRole, vzlaCtx?.vzlaId]);

  // === Venezuela pending payments (validaciones) badge (dynamic) ===
  const [vzlaPendingPayments, setVzlaPendingPayments] = useState<number | null>(null);
  useEffect(() => {
    if (userRole !== 'venezuela' || !vzlaCtx?.vzlaId) {
      setVzlaPendingPayments(null);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    let isCancelled = false;
    (async () => {
      try {
        // Pending payment validations are orders assigned to this Vzla employee with state === 4
        const { count, error } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('asignedEVzla', vzlaCtx.vzlaId)
          .eq('state', 4);
        if (error) {
          console.error('Sidebar Vzla pending payments count error:', error);
          if (!isCancelled) setVzlaPendingPayments(null);
          return;
        }
        if (!isCancelled) setVzlaPendingPayments(typeof count === 'number' ? count : 0);
      } catch (e) {
        console.error('Sidebar Vzla pending payments count exception:', e);
        if (!isCancelled) setVzlaPendingPayments(null);
      }
    })();
    return () => { isCancelled = true; };
  }, [userRole, vzlaCtx?.vzlaId]);

  // === China active orders badge (dynamic) ===
  const [chinaActiveOrders, setChinaActiveOrders] = useState<number | null>(null);
  useEffect(() => {
    if (userRole !== 'china' || !chinaCtx?.chinaId) {
      setChinaActiveOrders(null);
      return;
    }
    const supabase = getSupabaseBrowserClient();
    let isCancelled = false;
    (async () => {
      try {
        const { count, error } = await supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('asignedEChina', chinaCtx.chinaId)
          .lt('state', 13);
        if (error) {
          console.error('Sidebar China orders count error:', error);
          if (!isCancelled) setChinaActiveOrders(null);
          return;
        }
        if (!isCancelled) setChinaActiveOrders(typeof count === 'number' ? count : 0);
      } catch (e) {
        console.error('Sidebar China orders count exception:', e);
        if (!isCancelled) setChinaActiveOrders(null);
      }
    })();
    return () => { isCancelled = true; };
  }, [userRole, chinaCtx?.chinaId]);

  // Merge dynamic badges into client menu
  const menuItemsWithCounts = useMemo(() => {
    if (userRole === 'client') {
      return menuItems.map((item) => {
        if (item.id === 'orders') {
          const badgeVal = typeof clientActiveOrders === 'number' && clientActiveOrders > 0 ? clientActiveOrders : null;
          return { ...item, badge: badgeVal };
        }
        if (item.id === 'payments') {
          const badgeVal = typeof clientPendingPayments === 'number' && clientPendingPayments > 0 ? clientPendingPayments : null;
          return { ...item, badge: badgeVal };
        }
        return item;
      });
    }
    if (userRole === 'venezuela') {
      return menuItems.map((item) => {
        if (item.id === 'orders') {
          const badgeVal = typeof vzlaActiveOrders === 'number' && vzlaActiveOrders > 0 ? vzlaActiveOrders : null;
          return { ...item, badge: badgeVal };
        }
        if (item.id === 'support') {
          const badgeVal = typeof vzlaActiveSupports === 'number' && vzlaActiveSupports > 0 ? vzlaActiveSupports : null;
          return { ...item, badge: badgeVal };
        }
        if (item.id === 'payments-validation') {
          const badgeVal = typeof vzlaPendingPayments === 'number' && vzlaPendingPayments > 0 ? vzlaPendingPayments : null;
          return { ...item, badge: badgeVal };
        }
        return item;
      });
    }
    if (userRole === 'china') {
      return menuItems.map((item) => {
        if (item.id === 'orders') {
          const badgeVal = typeof chinaActiveOrders === 'number' && chinaActiveOrders > 0 ? chinaActiveOrders : null;
          return { ...item, badge: badgeVal };
        }
        return item;
      });
    }
    return menuItems;
  }, [menuItems, userRole, clientActiveOrders, clientPendingPayments, vzlaActiveOrders, vzlaActiveSupports, vzlaPendingPayments, chinaActiveOrders]);

  // Memoizar los cálculos responsivos con optimización
  const responsiveConfig = useMemo(() => {
    // Breakpoints específicos para evitar gaps
    const isMobile = screenWidth < 768;           // Mobile: < 768px
    const isTablet = screenWidth >= 768 && screenWidth < 1024;  // Tablet: 768px - 1023px
    const isDesktop = screenWidth >= 1024;        // Desktop: ≥ 1024px
    const isSmallScreen = screenWidth < 1366;
    const isMediumScreen = screenWidth < 1600;

    // Cálculos específicos por breakpoint
    const sidebarWidth = isMobile 
      ? (isMobileMenuOpen ? 'w-80' : 'w-16')
      : isTablet
        ? (isExpanded ? 'w-64' : 'w-20')
        : isExpanded 
          ? (screenWidth < 1440 ? 'w-64' : 'w-72')
          : 'w-20';
    
    const iconSize = 'w-4 h-4';
  const logoSize: 'sm' | 'md' | 'lg' | 'xl' = isExpanded ? (screenWidth < 1440 ? 'sm' : 'md') : 'md';
    const padding = isExpanded ? 'p-4' : 'p-2';
    const buttonPadding = isExpanded ? 'px-4 py-3' : 'p-2';
    
    return {
      sidebarWidth,
      iconSize,
      logoSize,
      padding,
      buttonPadding,
      textSize: isSmallScreen ? 'text-sm' : 'text-base',
      titleSize: isSmallScreen ? 'text-lg' : 'text-xl',
      subtitleSize: 'text-xs',
      badgeSize: 'text-xs',
      iconContainerSize: isExpanded ? 'w-8 h-8' : 'w-full h-full',
      userContainerSize: isSmallScreen ? 'w-8 h-8' : 'w-10 h-10',
      userTextSize: isSmallScreen ? 'text-xs' : 'text-sm',
      userSubtextSize: 'text-xs',
      userPadding: isSmallScreen ? 'p-2' : 'p-3',
      isMobile,
      isTablet,
      isDesktop
    };
  }, [screenWidth, isExpanded, isMobileMenuOpen]);

  // Actualizar isExpanded automáticamente cuando cambie la resolución
  useEffect(() => {
    const isMobile = screenWidth < 768;
    const isTablet = screenWidth >= 768 && screenWidth < 1024;
    
    if (isMobile) {
      // En mobile, isExpanded debe seguir a isMobileMenuOpen
      setIsExpanded(isMobileMenuOpen || false);
    } else if (isTablet) {
      // En tablet, mantener expandido por defecto para mejor usabilidad
      setIsExpanded(true);
    }
    // En desktop, mantener el comportamiento actual (controlado por hover)
  }, [screenWidth, isMobileMenuOpen, setIsExpanded]);

  // Optimizar el manejo del hover (solo en desktop)
  const handleMouseEnter = useCallback(() => {
    if (responsiveConfig.isMobile || responsiveConfig.isTablet) return;
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setIsExpanded(true);
  }, [hoverTimeout, setIsExpanded, responsiveConfig.isMobile, responsiveConfig.isTablet]);

  const handleMouseLeave = useCallback(() => {
    if (responsiveConfig.isMobile || responsiveConfig.isTablet) return;
    const timeout = setTimeout(() => {
      setIsExpanded(false);
    }, 300);
    setHoverTimeout(timeout);
  }, [setIsExpanded, responsiveConfig.isMobile, responsiveConfig.isTablet]);



  // Memoizar el renderizado de los elementos del menú
  const renderMenuItem = useCallback((item: typeof menuItems[0]) => {
    const Icon = item.icon;
    const isActive = activeItem === item.id;
    return (
      <div key={item.id}>
        <Link
          href={item.path}
          prefetch={true}
          className={`
            w-full flex items-center ${(responsiveConfig.isMobile || responsiveConfig.isTablet) ? (isMobileMenuOpen ? 'space-x-3 px-4 py-3' : `justify-center ${responsiveConfig.buttonPadding}`) : (isExpanded ? 'space-x-3 px-4 py-3' : `justify-center ${responsiveConfig.buttonPadding}`)} rounded-xl
            transition-all duration-100 ease-out group relative
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
          ${responsiveConfig.isMobile ? (isMobileMenuOpen ? 'w-auto opacity-100' : 'w-0 opacity-0') : (isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0')}
        `}>
          <div className="flex items-center justify-between whitespace-nowrap">
            <span className={`font-medium ${responsiveConfig.textSize}`}>{t('sidebar.' + item.id) ?? item.id}</span>
            {typeof item.badge === 'number' && item.badge > 0 ? (
              <Badge className={`bg-red-500 text-white ${responsiveConfig.badgeSize} animate-pulse`}>
                {item.badge}
              </Badge>
            ) : null}
          </div>
        </div>
        
                    {!responsiveConfig.isMobile && !responsiveConfig.isTablet && !isExpanded && typeof item.badge === 'number' && item.badge > 0 ? (
          <div className={`absolute top-1 right-1 ${screenWidth < 1366 ? 'w-4 h-4' : 'w-5 h-5'} bg-red-500 rounded-full flex items-center justify-center animate-pulse`}>
            <span className={`${responsiveConfig.badgeSize} text-white font-bold`}>{item.badge}</span>
          </div>
        ) : null}
      </Link>
    </div>
  );
}, [isExpanded, activeItem, responsiveConfig, screenWidth, t]);

  return (
    <>
      
      {/* Overlay para móviles */}
              {(responsiveConfig.isMobile || responsiveConfig.isTablet) && isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onMobileMenuClose}
        />
      )}
      
      <div 
        className={`
          fixed left-0 top-0 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
          border-r border-slate-700/50 shadow-2xl backdrop-blur-sm z-50
          transition-all duration-200 ease-out flex flex-col
          ${(responsiveConfig.isMobile || responsiveConfig.isTablet)
            ? 'w-80' 
            : responsiveConfig.sidebarWidth
          }
        `}
        style={{
          transform: (responsiveConfig.isMobile || responsiveConfig.isTablet) && !isMobileMenuOpen ? 'translateX(-100%)' : 'translateX(0)',
          visibility: (responsiveConfig.isMobile || responsiveConfig.isTablet) && !isMobileMenuOpen ? 'hidden' : 'visible'
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Header */}
                  <div className={`${responsiveConfig.padding} border-b border-slate-700/50 flex-shrink-0`}>
            <div className={`flex items-center ${(responsiveConfig.isMobile || responsiveConfig.isTablet) ? (isMobileMenuOpen ? 'space-x-3' : 'justify-center') : (isExpanded ? 'space-x-3' : 'justify-center')}`}>
              <PitaLogo size={responsiveConfig.logoSize} animated={true} />
              <div className={`
                transition-all duration-150 ease-out overflow-hidden
                ${responsiveConfig.isMobile ? (isMobileMenuOpen ? 'w-auto opacity-100' : 'w-0 opacity-0') : (isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0')}
              `}>
              <div className="whitespace-nowrap">
                <h1 className={`font-bold text-white ${responsiveConfig.titleSize}`}>Pita Express</h1>
                <p className={`text-slate-400 ${responsiveConfig.subtitleSize}`}>{userInfo.name}</p>
                <p className={`text-slate-400 ${responsiveConfig.subtitleSize}`}>{userInfo.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className={`flex-1 ${responsiveConfig.padding} space-y-2 overflow-y-auto sidebar-scrollbar`}>
          {menuItemsWithCounts.map(renderMenuItem)}
        </nav>

        {/* Bottom Section */}
        <div className={`${responsiveConfig.padding} border-t border-slate-700/50 space-y-4 flex-shrink-0`}>
          {/* User Profile */}
          <div className={`flex items-center ${(responsiveConfig.isMobile || responsiveConfig.isTablet) ? (isMobileMenuOpen ? 'space-x-3' : 'justify-center') : 'space-x-3'} ${responsiveConfig.userPadding} rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50 transition-all duration-150 ease-out`}>
            <div className={`${responsiveConfig.userContainerSize} bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center`}>
              {userRole === 'client' ? (
                <VenezuelaFlag size={"sm"} animated={true} />
              ) : (
                <span className="text-lg">{userInfo.flag}</span>
              )}
            </div>
            <div className={`
              transition-all duration-150 ease-out overflow-hidden
              ${responsiveConfig.isMobile ? (isMobileMenuOpen ? 'w-auto opacity-100' : 'w-0 opacity-0') : (isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0')}
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
          {(() => {
            const bottomItems = getBottomItemsByRole(userRole);
            
            return bottomItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === pathname;
              
              return (
                <Link
                  key={item.id}
                  href={item.path}
                  prefetch={true}
                  className={`
                    w-full flex items-center ${(responsiveConfig.isMobile || responsiveConfig.isTablet) ? (isMobileMenuOpen ? 'space-x-3 px-4 py-3' : 'justify-center p-2') : 'space-x-3 px-4 py-3'} rounded-xl transition-all duration-150 ease-out group
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white shadow-lg border border-blue-500/30' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                    }
                  `}
                >
                  <div className={`${screenWidth < 1366 ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-lg group-hover:bg-slate-600/50`}>
                    <Icon className={`${responsiveConfig.iconSize} ${item.color} transition-all duration-150 ease-out ${isActive ? 'scale-105' : 'scale-100'}`} />
                  </div>
                  <div className={`
                    transition-all duration-150 ease-out overflow-hidden
                    ${responsiveConfig.isMobile ? (isMobileMenuOpen ? 'w-auto opacity-100' : 'w-0 opacity-0') : (isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0')}
                  `}>
                    <span className="font-medium whitespace-nowrap">{t('sidebar.' + item.id) ?? item.id}</span>
                  </div>
                </Link>
              );
            });
          })()}

          {/* Logout */}
          <button
            className={`w-full flex items-center ${(responsiveConfig.isMobile || responsiveConfig.isTablet) ? (isMobileMenuOpen ? 'space-x-3 px-4 py-3' : 'justify-center p-2') : 'space-x-3 px-4 py-3'} rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-150 ease-out group border border-red-500/20`}
            onClick={() => {
              // Elimina el token del almacenamiento local
              localStorage.removeItem('token');
              sessionStorage.removeItem('token');
              // Redirige al login-register
              window.location.href = '/login-register';
            }}
          >
            <div className={`${screenWidth < 1366 ? 'w-6 h-6' : 'w-8 h-8'} flex items-center justify-center rounded-lg group-hover:bg-red-500/20`}>
              <LogOut className={responsiveConfig.iconSize} />
            </div>
            <div className={`
              transition-all duration-150 ease-out overflow-hidden
              ${responsiveConfig.isMobile ? (isMobileMenuOpen ? 'w-auto opacity-100' : 'w-0 opacity-0') : (isExpanded ? 'w-auto opacity-100' : 'w-0 opacity-0')}
            `}>
              <span className="font-medium whitespace-nowrap">{t('sidebar.logout')}</span>
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
