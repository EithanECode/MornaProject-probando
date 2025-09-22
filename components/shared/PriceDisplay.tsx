"use client";

import { useCurrencyConverter } from '@/hooks/useCurrencyConverter';
import { Loader2, RefreshCw, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface PriceDisplayProps {
  amount: number;
  currency?: 'USD' | 'VES';
  showBoth?: boolean;
  showRefresh?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'inline' | 'badge';
  className?: string;
  emphasizeBolivars?: boolean;
}

export function PriceDisplay({
  amount,
  currency = 'USD',
  showBoth = true,
  showRefresh = false,
  size = 'md',
  variant = 'default',
  className = '',
  emphasizeBolivars = true
}: PriceDisplayProps) {
  const { convert, currentRate, isLoading, error, lastUpdated, refreshRate } = useCurrencyConverter();
  
  const conversion = convert(amount, currency);

  // Estilos según tamaño
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg font-semibold'
  };

  // Renderizado según variante
  switch (variant) {
    case 'card':
      return (
        <div className={`bg-gradient-to-r from-blue-50 to-orange-50 p-4 rounded-lg border ${className}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-gray-700">Precio</span>
            </div>
            {showRefresh && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshRate}
                      disabled={isLoading}
                      className="h-8 w-8 p-0"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RefreshCw className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Actualizar tasa</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          
          <div className="space-y-1">
            <div className={`${sizeClasses[size]} text-blue-600 font-semibold`}>
              {conversion.formatted.usd}
            </div>
            {showBoth && (
              <div className={`${emphasizeBolivars ? 'text-lg font-bold text-orange-600' : 'text-gray-600'}`}>
                {conversion.formatted.bolivars}
              </div>
            )}
          </div>
          
          {lastUpdated && (
            <div className="text-xs text-gray-500 mt-2">
              Tasa: {currentRate.toFixed(2)} Bs/USD
              <br />
              Actualizado: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      );

    case 'badge':
      return (
        <div className={`flex flex-wrap gap-2 ${className}`}>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {conversion.formatted.usd}
          </Badge>
          {showBoth && (
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              {conversion.formatted.bolivars}
            </Badge>
          )}
        </div>
      );

    case 'inline':
      return (
        <span className={`${sizeClasses[size]} ${className}`}>
          {showBoth ? conversion.formatted.both : 
           currency === 'USD' ? conversion.formatted.usd : conversion.formatted.bolivars}
        </span>
      );

    default:
      return (
        <div className={`${className}`}>
          <div className={`${sizeClasses[size]} flex items-center gap-2`}>
            <span className="text-blue-600 font-semibold">
              {conversion.formatted.usd}
            </span>
            {showBoth && (
              <>
                <span className="text-gray-400">≈</span>
                <span className={`${emphasizeBolivars ? 'text-orange-600 font-bold' : 'text-gray-600'}`}>
                  {conversion.formatted.bolivars}
                </span>
              </>
            )}
            {showRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshRate}
                disabled={isLoading}
                className="h-6 w-6 p-0 ml-2"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
              </Button>
            )}
          </div>
          
          {error && (
            <div className="text-xs text-red-500 mt-1">
              Error: {error}
            </div>
          )}
        </div>
      );
  }
}
