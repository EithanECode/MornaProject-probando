import { 
  LayoutDashboard, 
  Package, 
  MessageCircle, 
  BarChart3, 
  Settings, 
  Users,
  Truck,
  FileText
} from 'lucide-react';
import { MenuItem } from '@/lib/types/navigation';

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    badge: null,
    color: 'text-blue-500',
    href: '/dashboard'
  },
  {
    id: 'pedidos',
    label: 'Pedidos',
    icon: Package,
    badge: 23,
    color: 'text-orange-500',
    href: '/pedidos'
  },
  {
    id: 'tracking',
    label: 'Tracking',
    icon: Truck,
    badge: 5,
    color: 'text-green-500',
    href: '/tracking'
  },
  {
    id: 'chat',
    label: 'Chat Soporte',
    icon: MessageCircle,
    badge: 3,
    color: 'text-purple-500',
    href: '/chat'
  },
  {
    id: 'reportes',
    label: 'Reportes',
    icon: BarChart3,
    badge: null,
    color: 'text-indigo-500',
    href: '/reportes'
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: Users,
    badge: null,
    color: 'text-teal-500',
    href: '/clientes'
  },
  {
    id: 'documentos',
    label: 'Documentos',
    icon: FileText,
    badge: null,
    color: 'text-slate-500',
    href: '/documentos'
  }
];

export const BOTTOM_ITEMS: MenuItem[] = [
  {
    id: 'settings',
    label: 'Configuración',
    icon: Settings,
    color: 'text-gray-500',
    href: '/configuracion'
  }
]; 