"use client";

import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/useTranslation';

interface HeaderProps {
  notifications: number;
  onMenuToggle?: () => void;
  title?: string;
  subtitle?: string;
  hideTitle?: boolean;
  showTitleOnMobile?: boolean;
}

export default function Header({ 
  notifications, 
  onMenuToggle, 
  title = "Dashboard", 
  subtitle = "Resumen de la operación",
  hideTitle = false,
  showTitleOnMobile = false,
}: HeaderProps) {
  const { t } = useTranslation();
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
            {/* Desktop Notifications */}
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
            
            {/* Mobile Notifications */}
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
          </div>
        </div>
      </div>
    </header>
  );
} 