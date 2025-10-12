"use client";

import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  notifications: number;
  onMenuToggle?: () => void;
  title?: string;
  subtitle?: string;
  hideTitle?: boolean;
  showTitleOnMobile?: boolean;
  // Opcionales para el dropdown de notificaciones
  notificationsItems?: Array<{
    id: string;
    title: string;
    description?: string;
    href?: string;
    unread?: boolean;
  }>;
  onMarkAllAsRead?: () => void;
  onOpenNotifications?: () => void;
  onItemClick?: (id: string) => void;
}

export default function Header({ 
  notifications, 
  onMenuToggle, 
  title = "Dashboard", 
  subtitle = "Resumen de la operación",
  hideTitle = false,
  showTitleOnMobile = false,
  notificationsItems = [],
  onMarkAllAsRead,
  onOpenNotifications,
  onItemClick,
}: HeaderProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const handleMenuToggle = () => {
    onMenuToggle?.();
  };

  return (
  <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40 shadow-sm">
      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMenuToggle}
              className="lg:hidden p-2 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            {/* Title Section */}
            {!hideTitle && (
              <div className={showTitleOnMobile ? "block" : "hidden sm:block"}>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{title}</h1>
                <p className="text-xs sm:text-sm text-slate-600">{subtitle}</p>
              </div>
            )}
          </div>
          
          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Desktop Notifications (Dropdown) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="relative hidden sm:flex hover:bg-slate-50 transition-colors"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  <span className="hidden md:inline">{t('header.notifications')}</span>
                  {notifications > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-[#202841] text-white text-xs">
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="p-2">
                  <DropdownMenuLabel className="px-2 py-1.5">{t('header.notifications')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notificationsItems && notificationsItems.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      {notificationsItems.map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          className={`flex flex-col items-start gap-0.5 ${n.unread ? 'bg-slate-50' : ''} ${n.href ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                          onSelect={(e) => {
                            if (n.href) {
                              e.preventDefault();
                              onItemClick?.(n.id);
                              router.push(n.href);
                            }
                          }}
                        >
                          <span className={`text-sm ${n.unread ? 'font-semibold' : 'font-medium'}`}>{n.title}</span>
                          {n.description && (
                            <span className="text-xs text-slate-500">{n.description}</span>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-6 text-sm text-center text-slate-500">
                      {t('header.noNotifications') || 'Sin notificaciones'}
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="p-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onMarkAllAsRead?.()}
                  >
                    {t('header.markAllAsRead') || 'Marcar todo como leído'}
                  </Button>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => onOpenNotifications?.()}
                  >
                    {t('header.viewAll') || 'Ver todas'}
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {/* Mobile Notifications (Dropdown) */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="relative sm:hidden hover:bg-slate-50 transition-colors"
                >
                  <Bell className="w-4 h-4" />
                  {notifications > 0 && (
                    <Badge className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center bg-[#202841] text-white text-xs">
                      {notifications}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="p-2">
                  <DropdownMenuLabel className="px-2 py-1.5">{t('header.notifications')}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notificationsItems && notificationsItems.length > 0 ? (
                    <div className="max-h-80 overflow-y-auto">
                      {notificationsItems.map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          className={`flex flex-col items-start gap-0.5 ${n.unread ? 'bg-slate-50' : ''} ${n.href ? 'cursor-pointer hover:bg-slate-100' : ''}`}
                          onSelect={(e) => {
                            if (n.href) {
                              e.preventDefault();
                              onItemClick?.(n.id);
                              router.push(n.href);
                            }
                          }}
                        >
                          <span className={`text-sm ${n.unread ? 'font-semibold' : 'font-medium'}`}>{n.title}</span>
                          {n.description && (
                            <span className="text-xs text-slate-500">{n.description}</span>
                          )}
                        </DropdownMenuItem>
                      ))}
                    </div>
                  ) : (
                    <div className="px-3 py-6 text-sm text-center text-slate-500">
                      {t('header.noNotifications') || 'Sin notificaciones'}
                    </div>
                  )}
                </div>
                <DropdownMenuSeparator />
                <div className="p-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => onMarkAllAsRead?.()}
                  >
                    {t('header.markAllAsRead') || 'Marcar todo como leído'}
                  </Button>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => onOpenNotifications?.()}
                  >
                    {t('header.viewAll') || 'Ver todas'}
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
} 