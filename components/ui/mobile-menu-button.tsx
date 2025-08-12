"use client";

import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

interface MobileMenuButtonProps {
  onClick: () => void;
  className?: string;
}

export default function MobileMenuButton({ onClick, className = '' }: MobileMenuButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={`lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-all duration-200 hover:shadow-sm active:scale-95 ${className}`}
      onClick={onClick}
      aria-label="Abrir menú de navegación"
    >
      <Menu className="w-5 h-5 text-slate-600" />
    </Button>
  );
} 