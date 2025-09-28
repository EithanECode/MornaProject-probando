"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { 
  Save, 
  RefreshCw, 
  DollarSign, 
  Plane, 
  Ship, 
  Package, 
  Calculator, 
  Clock, 
  Percent,
  Globe,
  Settings,
  AlertTriangle,
  CheckCircle,
  Users,
  Bell,
  Sun,
  Moon,
  Loader2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';
import { useTranslation } from '@/hooks/useTranslation';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import ExchangeRateManager from '@/components/admin/ExchangeRateManager';

interface BusinessConfig {
  // Parámetros de envío
  airShippingRate: number;
  seaShippingRate: number;
  // Eliminados días de entrega

  // Parámetros financieros
  usdRate: number;
  cnyRate: number;
  profitMargin: number;
  // usdDiscountPercent eliminado

  // Parámetros operativos adicionales
  maxQuotationsPerMonth?: number;
  maxModificationsPerOrder?: number;
  quotationValidityDays?: number;
  paymentDeadlineDays?: number;

  // Notificaciones y alertas
  alertsAfterDays?: number;

  // Configuración de accesos
  sessionTimeout: number;
  requireTwoFactor: boolean;

  // Configuración de tasa de cambio
  autoUpdateExchangeRate: boolean;
  autoUpdateExchangeRateCNY: boolean;
}

export default function ConfiguracionPage() {
  // Log cuando el componente se monta
  useEffect(() => {
    console.log('[Admin] Component MOUNTED');
    return () => {
      console.log('[Admin] Component UNMOUNTED');
    };
  }, []);
  
  const { t } = useTranslation();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<BusinessConfig>({
    airShippingRate: 8.50,
    seaShippingRate: 180.00,
    usdRate: 36.25,
    cnyRate: 7.25,
    profitMargin: 25,
    maxQuotationsPerMonth: 5,
    maxModificationsPerOrder: 2,
    quotationValidityDays: 7,
    paymentDeadlineDays: 3,
    alertsAfterDays: 7,
    sessionTimeout: 60,
    requireTwoFactor: false,
    autoUpdateExchangeRate: false,
    autoUpdateExchangeRateCNY: true // CRÍTICO: true desde el inicio
  });
  
  // Referencia al estado base para detectar cambios
  const baseConfigRef = useRef<BusinessConfig | null>(null);
  const [baselineVersion, setBaselineVersion] = useState(0);
  
  // Bandera para evitar que loadConfig se ejecute múltiples veces
  const configLoadedRef = useRef(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  // Callback estable para actualizar la tasa USD
  const handleRateUpdate = useCallback((newRate: number) => {
    setConfig(prev => {
      // Evitar actualización si el valor no ha cambiado
      if (prev.usdRate === newRate) {
        return prev;
      }
      return { ...prev, usdRate: newRate };
    });
  }, []);

  // Callback estable para actualizar la tasa CNY - SIMPLIFICADO
  const handleRateUpdateCNY = useCallback((newRate: number) => {
    console.log('[Admin] handleRateUpdateCNY called with:', newRate);
    // SIMPLIFICADO: Solo actualizar si es diferente
    setConfig(prev => {
      if (prev.cnyRate === newRate) return prev;
      return { ...prev, cnyRate: newRate };
    });
    
    // Forzar detección de cambios para activar el botón de guardar
    setBaselineVersion(v => v + 1);
  }, []);

  // Ref para el debounce de la tasa manual USD y CNY
  const manualRateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const manualRateTimeoutRefCNY = useRef<NodeJS.Timeout | null>(null);

  // Función para guardar tasa manual en la base de datos
  const saveManualRate = useCallback(async (manualRate: number) => {
    if (!manualRate || isNaN(manualRate) || manualRate <= 0) return;
    
    try {
      const response = await fetch('/api/exchange-rate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ manualRate })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Tasa manual guardada",
          description: `${manualRate.toFixed(2)} Bs/USD guardada exitosamente`,
          variant: "default",
          duration: 3000,
        });
      } else {
        throw new Error(data.error || 'Error al guardar tasa manual');
      }
    } catch (error: any) {
      console.error('Error saving manual rate:', error);
      toast({
        title: "Error al guardar tasa",
        description: error.message || "No se pudo guardar la tasa manual",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [toast]);

  // Función para guardar tasa manual CNY en la base de datos
  const saveManualRateCNY = useCallback(async (manualRate: number) => {
    if (!manualRate || isNaN(manualRate) || manualRate <= 0) return;
    
    try {
      const response = await fetch('/api/exchange-rate/cny', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ manualRate })
      });

      const data = await response.json();
      
      if (data.success) {
        toast({
          title: "Tasa CNY manual guardada",
          description: `${manualRate.toFixed(4)} CNY/USD guardada exitosamente`,
          variant: "default",
          duration: 3000,
        });
      } else {
        throw new Error(data.error || 'Error al guardar tasa manual CNY');
      }
    } catch (error: any) {
      console.error('Error saving manual CNY rate:', error);
      toast({
        title: "Error al guardar tasa CNY",
        description: error.message || "No se pudo guardar la tasa manual CNY",
        variant: "destructive",
        duration: 5000,
      });
    }
  }, [toast]);

  // Función para aplicar cambios en la configuración
  const applyCost = useCallback((field: keyof BusinessConfig, raw: string) => {
    const cleaned = sanitizeCost(raw);
    const num = cleaned === '' ? 0 : parseFloat(cleaned);
    const finalValue = isNaN(num) ? 0 : num;
    
    setConfig(prev => {
      const newConfig = { ...prev, [field]: finalValue };
      
      // Guardar inmediatamente en localStorage para persistencia
      localStorage.setItem('businessConfig', JSON.stringify(newConfig));
      
      return newConfig;
    });
    
    // Forzar detección de cambios para activar el botón de guardar
    setBaselineVersion(v => {
      console.log('[Admin] Incrementing baselineVersion from', v, 'to', v + 1, 'for field:', field);
      return v + 1;
    });

    // Si es tasa CNY y la actualización automática está desactivada, guardar en BD
    if (field === 'cnyRate' && !config.autoUpdateExchangeRateCNY && finalValue > 0) {
      if (manualRateTimeoutRefCNY.current) {
        clearTimeout(manualRateTimeoutRefCNY.current);
      }
      manualRateTimeoutRefCNY.current = setTimeout(() => {
        saveManualRateCNY(finalValue);
      }, 1500);
    }

    // Si es tasa USD y la actualización automática está desactivada, guardar en BD
    if (field === 'usdRate' && !config.autoUpdateExchangeRate && finalValue > 0) {
      if (manualRateTimeoutRef.current) {
        clearTimeout(manualRateTimeoutRef.current);
      }
      manualRateTimeoutRef.current = setTimeout(() => {
        saveManualRate(finalValue);
      }, 1500);
    }
  }, [config.autoUpdateExchangeRateCNY, config.autoUpdateExchangeRate, saveManualRateCNY, saveManualRate]);

  // Memoizar el valor de autoUpdate USD para evitar loops infinitos
  const autoUpdateUSD = useMemo(() => config.autoUpdateExchangeRate, [config.autoUpdateExchangeRate]);

  // Hook para manejo de tasa de cambio
  const {
    rate: currentExchangeRate,
    loading: exchangeRateLoading,
    error: exchangeRateError,
    lastUpdated: exchangeRateLastUpdated,
    source: exchangeRateSource,
    refreshRate,
    getTimeSinceUpdate,
    isAutoUpdating
  } = useExchangeRate({
    autoUpdate: autoUpdateUSD,
    interval: 30 * 60 * 1000, // 30 minutos
    onRateUpdate: handleRateUpdate
  });

  // Estado para la tasa CNY (manejado por ExchangeRateManager)
  const [currentExchangeRateCNY, setCurrentExchangeRateCNY] = useState<number | null>(null);
  const [exchangeRateLoadingCNY, setExchangeRateLoadingCNY] = useState(false);
  const [exchangeRateErrorCNY, setExchangeRateErrorCNY] = useState<string | null>(null);
  const [exchangeRateLastUpdatedCNY, setExchangeRateLastUpdatedCNY] = useState<Date | null>(null);
  const [exchangeRateSourceCNY, setExchangeRateSourceCNY] = useState<string>('');
  const [isAutoUpdatingCNY, setIsAutoUpdatingCNY] = useState(true);

  // Callback para recibir actualizaciones del ExchangeRateManager
  const handleExchangeRateUpdate = useCallback((newRate: number) => {
    console.log('[Admin] Received rate update from ExchangeRateManager:', newRate);
    setCurrentExchangeRateCNY(newRate);
    setExchangeRateLastUpdatedCNY(new Date());
    setExchangeRateSourceCNY('Oficial PBOC');
    setExchangeRateLoadingCNY(false);
    setExchangeRateErrorCNY(null);
    
    // También actualizar el config pero NO forzar detección de cambios
    // porque es una actualización automática, no un cambio manual del usuario
    setConfig(prev => {
      if (prev.cnyRate === newRate) return prev;
      return { ...prev, cnyRate: newRate };
    });
  }, []);

  // Funciones para el ExchangeRateManager (simuladas)
  const refreshRateCNY = useCallback(() => {
    console.log('[Admin] Manual refresh CNY requested');
    // El ExchangeRateManager manejará esto internamente
  }, []);

  const getTimeSinceUpdateCNY = useCallback(() => {
    if (!exchangeRateLastUpdatedCNY) return 'Nunca';
    const now = new Date();
    const diffMs = now.getTime() - exchangeRateLastUpdatedCNY.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 1) return 'Hace menos de 1 minuto';
    if (diffMins === 1) return 'Hace 1 minuto';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return 'Hace 1 hora';
    return `Hace ${diffHours} horas`;
  }, [exchangeRateLastUpdatedCNY]);

  useEffect(() => {
    console.log('[Admin] loadConfig useEffect triggered, configLoaded:', configLoadedRef.current);
    
    // Evitar que se ejecute múltiples veces
    if (configLoadedRef.current) {
      console.log('[Admin] loadConfig already executed, skipping...');
      return;
    }
    
    configLoadedRef.current = true;
    console.log('[Admin] loadConfig started...');
    
    const loadConfig = async () => {
      try {
        // 1. Cargar configuración desde localStorage (más confiable)
        const savedConfig = localStorage.getItem('businessConfig');
        console.log('[Admin] Raw localStorage savedConfig:', savedConfig);
        
        let mergedConfig = {
          airShippingRate: 8.50,
          seaShippingRate: 180.00,
          usdRate: 36.25,
          cnyRate: 7.25,
          profitMargin: 25,
          maxQuotationsPerMonth: 5,
          maxModificationsPerOrder: 2,
          quotationValidityDays: 7,
          paymentDeadlineDays: 3,
          alertsAfterDays: 7,
          sessionTimeout: 60,
          requireTwoFactor: false,
          autoUpdateExchangeRate: false,
          autoUpdateExchangeRateCNY: true // Forzar a true por defecto
        };

        if (savedConfig) {
          try {
            const parsedConfig = JSON.parse(savedConfig);
            console.log('[Admin] Parsed localStorage config:', parsedConfig);
            console.log('[Admin] Parsed autoUpdateExchangeRateCNY:', parsedConfig.autoUpdateExchangeRateCNY);
            mergedConfig = { ...mergedConfig, ...parsedConfig };
            // Eliminar campos de días de entrega si existen en localStorage
            console.log('[Admin] After merge with localStorage:', mergedConfig.autoUpdateExchangeRateCNY);
          } catch (e) {
            console.error('Error parsing saved config:', e);
          }
        }

        // 2. Intentar cargar desde la API y hacer merge
        try {
          const response = await fetch('/api/config');
          const data = await response.json();
          
          if (data.success && data.config) {
            console.log('[Admin] API config received:', data.config);
            console.log('[Admin] localStorage autoUpdateExchangeRateCNY:', mergedConfig.autoUpdateExchangeRateCNY);
            console.log('[Admin] API autoUpdateExchangeRateCNY:', data.config.autoUpdateExchangeRateCNY);
            
            // Priorizar localStorage para configuraciones de exchange rate
            mergedConfig = { 
              ...mergedConfig, 
              ...data.config
            };
            console.log('[Admin] Final mergedConfig autoUpdateExchangeRateCNY:', mergedConfig.autoUpdateExchangeRateCNY);
          }
        } catch (apiError) {
          console.error('Error loading config from API, using localStorage only:', apiError);
        }

        // FORZAR autoUpdateExchangeRateCNY a true para evitar loops infinitos
        mergedConfig.autoUpdateExchangeRateCNY = true;
        console.log('[Admin] Forced autoUpdateExchangeRateCNY to true');
        
        // LIMPIAR localStorage para eliminar el valor incorrecto
        const currentSavedConfig = localStorage.getItem('businessConfig');
        if (currentSavedConfig) {
          try {
            const parsedSavedConfig = JSON.parse(currentSavedConfig);
            if (parsedSavedConfig.autoUpdateExchangeRateCNY === false) {
              parsedSavedConfig.autoUpdateExchangeRateCNY = true;
              localStorage.setItem('businessConfig', JSON.stringify(parsedSavedConfig));
              console.log('[Admin] Fixed localStorage autoUpdateExchangeRateCNY to true');
            }
          } catch (e) {
            console.error('Error fixing localStorage:', e);
          }
        }

        // 3. Aplicar configuración final
        console.log('[Admin] loadConfig completed, mergedConfig:', mergedConfig);
        try {
          setConfig(mergedConfig);
          baseConfigRef.current = { ...mergedConfig };
          console.log('[Admin] setConfig completed successfully');
        } catch (error) {
          console.error('[Admin] Error in setConfig:', error);
        }
        
      } catch (error) {
        console.error('Error loading config:', error);
      }
      
      // Recuperar última fecha de guardado
      const savedDate = localStorage.getItem('lastConfigSaved');
      if (savedDate) {
        setLastSaved(new Date(savedDate));
      }
      
      setMounted(true);
    };

    loadConfig();
  }, []);

  // Cleanup effect para el timeout de tasa manual
  useEffect(() => {
    return () => {
      if (manualRateTimeoutRef.current) {
        clearTimeout(manualRateTimeoutRef.current);
      }
      if (manualRateTimeoutRefCNY.current) {
        clearTimeout(manualRateTimeoutRefCNY.current);
      }
    };
  }, []);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Solo guardar los campos globales requeridos
      const configToSave = {
        usd_rate: config.usdRate,
        auto_update_exchange_rate: config.autoUpdateExchangeRate,
        cny_rate: config.cnyRate,
        auto_update_exchange_rate_cny: config.autoUpdateExchangeRateCNY,
        profit_margin: config.profitMargin,
        air_shipping_rate: config.airShippingRate,
        sea_shipping_rate: config.seaShippingRate,
        alerts_after_days: config.alertsAfterDays
      };
      // Guardar configuración en base de datos a través de la API
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(configToSave)
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || 'Error saving configuration');
      }
      const now = new Date();
      setLastSaved(now);
      localStorage.setItem('lastConfigSaved', now.toISOString());
      // Guardar solo los campos globales en localStorage (en camelCase para el frontend)
      localStorage.setItem('businessConfig', JSON.stringify({
        usdRate: config.usdRate,
        autoUpdateExchangeRate: config.autoUpdateExchangeRate,
        cnyRate: config.cnyRate,
        autoUpdateExchangeRateCNY: config.autoUpdateExchangeRateCNY,
        profitMargin: config.profitMargin,
        airShippingRate: config.airShippingRate,
        seaShippingRate: config.seaShippingRate,
        alertsAfterDays: config.alertsAfterDays
      }));
      toast({
        title: t('admin.management.messages.configSaved'),
        description: "Configuración guardada globalmente. Los cambios estarán disponibles para todos los usuarios.",
      });
      // Actualizar baseline para futuras comparaciones
      // Para evitar error de tipo, completar con los campos no globales actuales
      baseConfigRef.current = {
        usdRate: config.usdRate,
        autoUpdateExchangeRate: config.autoUpdateExchangeRate,
        cnyRate: config.cnyRate,
        autoUpdateExchangeRateCNY: config.autoUpdateExchangeRateCNY,
        profitMargin: config.profitMargin,
        airShippingRate: config.airShippingRate,
        seaShippingRate: config.seaShippingRate,
        alertsAfterDays: config.alertsAfterDays,
        sessionTimeout: config.sessionTimeout,
        requireTwoFactor: config.requireTwoFactor,
        maxQuotationsPerMonth: config.maxQuotationsPerMonth,
        maxModificationsPerOrder: config.maxModificationsPerOrder,
        quotationValidityDays: config.quotationValidityDays,
        paymentDeadlineDays: config.paymentDeadlineDays
      };
      setBaselineVersion(v => v + 1); // forzar recomputo de hasChanges
    } catch (error: any) {
      console.error('Error saving config:', error);
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudieron guardar los cambios en la base de datos",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Actualiza el config y guarda inmediatamente si es campo global
  const updateConfig = (field: keyof BusinessConfig, value: any) => {
    setConfig(prev => {
      const newConfig = { ...prev, [field]: value };
      // Si el campo es global, guardar inmediatamente
      if ([
        'usdRate',
        'autoUpdateExchangeRate',
        'cnyRate',
        'autoUpdateExchangeRateCNY',
        'profitMargin',
        'airShippingRate',
        'seaShippingRate',
        'alertsAfterDays'
      ].includes(field)) {
        // Guardar en backend (en snake_case)
        const configToSave = {
          usd_rate: field === 'usdRate' ? value : newConfig.usdRate,
          auto_update_exchange_rate: field === 'autoUpdateExchangeRate' ? value : newConfig.autoUpdateExchangeRate,
          cny_rate: field === 'cnyRate' ? value : newConfig.cnyRate,
          auto_update_exchange_rate_cny: field === 'autoUpdateExchangeRateCNY' ? value : newConfig.autoUpdateExchangeRateCNY,
          profit_margin: field === 'profitMargin' ? value : newConfig.profitMargin,
          air_shipping_rate: field === 'airShippingRate' ? value : newConfig.airShippingRate,
          sea_shipping_rate: field === 'seaShippingRate' ? value : newConfig.seaShippingRate,
          alerts_after_days: field === 'alertsAfterDays' ? value : newConfig.alertsAfterDays
        };
        fetch('/api/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(configToSave)
        });
        // Guardar en localStorage en camelCase para el frontend
        localStorage.setItem('businessConfig', JSON.stringify({
          usdRate: newConfig.usdRate,
          autoUpdateExchangeRate: newConfig.autoUpdateExchangeRate,
          cnyRate: newConfig.cnyRate,
          autoUpdateExchangeRateCNY: newConfig.autoUpdateExchangeRateCNY,
          profitMargin: newConfig.profitMargin,
          airShippingRate: newConfig.airShippingRate,
          seaShippingRate: newConfig.seaShippingRate,
          alertsAfterDays: newConfig.alertsAfterDays
        }));
      }
      return newConfig;
    });
  };

  // Comparar configuraciones usando ref para evitar loops infinitos
  const configRef = useRef(config);
  configRef.current = config;
  
  const hasChanges = useMemo(() => {
    if (!baseConfigRef.current) {
      console.log('[Admin] hasChanges: baseConfigRef.current is null');
      return false;
    }
    
    const hasChangesResult = JSON.stringify(baseConfigRef.current) !== JSON.stringify(configRef.current);
    console.log('[Admin] hasChanges calculation:', {
      baselineVersion,
      hasChanges: hasChangesResult,
      baseConfig: baseConfigRef.current,
      currentConfig: configRef.current
    });
    
    return hasChangesResult;
  }, [baselineVersion]); // Solo depende de baselineVersion, no de config

  // =============================
  // Sanitizadores / Validaciones
  // =============================
  const MAX_COST_INT_DIGITS = 7; // costos: hasta 7 cifras en parte entera
  const MAX_DAY_VALUE = 365;    // días: máximo 365

  const sanitizeCost = (raw: string) => {
    if (raw === '') return '';
    let v = raw.replace(/[^0-9.,]/g, '').replace(',', '.');
    const parts = v.split('.');
    let intPart = parts[0].slice(0, MAX_COST_INT_DIGITS);
    let decPart = parts[1] ? parts[1].slice(0, 2) : '';
    // Evitar que el usuario empiece con ceros largos (pero permitir 0.x)
    if (intPart.length > 1 && intPart.startsWith('0')) {
      intPart = intPart.replace(/^0+/, '') || '0';
    }
    return decPart ? `${intPart}.${decPart}` : intPart;
  };


  // Eliminada función para días de entrega

  const applySingleDay = (field: keyof BusinessConfig, raw: string) => {
    let onlyDigits = raw.replace(/\D/g, '');
    if (onlyDigits.length > 4) onlyDigits = onlyDigits.slice(0,4);
    let num = onlyDigits === '' ? 0 : parseInt(onlyDigits, 10);
    if (num > MAX_DAY_VALUE) num = MAX_DAY_VALUE;
    updateConfig(field, num);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={
        `min-h-screen flex overflow-x-hidden ` +
        (mounted && theme === 'dark'
          ? 'bg-slate-900'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50')
      }
    >
      {/* ExchangeRateManager independiente */}
      <ExchangeRateManager onRateUpdate={handleExchangeRateUpdate} />
      
      <Sidebar 
        isExpanded={sidebarExpanded} 
        setIsExpanded={setSidebarExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={handleMobileMenuClose}
        userRole="admin" 
      />

      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'}`}>
        {/* Header personalizado con botón de guardar */}
        <header className={mounted && theme === 'dark' ? 'bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40' : 'bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40'}>
          <div className="px-4 md:px-5 lg:px-6 py-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 md:gap-6">
              <div className="flex items-center gap-4">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMobileMenuToggle}
                  className="lg:hidden p-2 hover:bg-slate-100 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
                
                <div>
                  <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{t('admin.management.header.title')}</h1>
                  <p className={`text-sm md:text-base ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>{t('admin.management.header.subtitle')}</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                {lastSaved && (
                  <div className={`text-xs md:text-sm ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                    <Clock className="w-4 h-4 inline mr-1" />
                    {t('admin.management.header.lastSaved')} {lastSaved.toLocaleString('es-VE')}
                  </div>
                )}
                <Button 
                  onClick={() => {
                    console.log('[Admin] Save button clicked, hasChanges:', hasChanges, 'isLoading:', isLoading);
                    handleSave();
                  }}
                  disabled={isLoading || !hasChanges}
                  className={`w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg transition-all duration-300 ${(!hasChanges || isLoading) ? 'opacity-50 cursor-not-allowed hover:shadow-lg' : 'hover:shadow-xl'}`}
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? t('admin.management.actions.saving') : (hasChanges ? t('admin.management.actions.save') : t('admin.management.actions.save'))}
                </Button>
              </div>
            </div>
          </div>
        </header>

  <div className={`w-full max-w-none space-y-6 md:space-y-8 ${mounted && theme === 'dark' ? 'bg-slate-900' : ''}`}>
          {/* Alert de advertencia */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>{t('admin.management.warning.title')}</strong> {t('admin.management.warning.description')}
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="shipping" className="space-y-6 md:space-y-8">
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 bg-white/60 backdrop-blur-sm place-items-center">
              <TabsTrigger value="shipping" className="flex items-center space-x-2 text-xs md:text-sm">
                <Package className="w-4 h-4" />
                <span>{t('admin.management.tabs.shipping')}</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center space-x-2 text-xs md:text-sm">
                <DollarSign className="w-4 h-4" />
                <span>{t('admin.management.tabs.financial')}</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2 text-xs md:text-sm">
                <Bell className="w-4 h-4" />
                <span>{t('admin.management.tabs.notifications')}</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB: Configuración de Envíos */}
            <TabsContent value="shipping" className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                {/* Envío Aéreo */}
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-black text-base md:text-lg">
                      <Plane className="w-5 h-5 mr-2 text-blue-600" />
{t('admin.management.shipping.airExpress')}
                    </CardTitle>
                    <CardDescription className="text-black text-sm">
{t('admin.management.shipping.airDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="airRate" className="text-sm md:text-base">{t('admin.management.shipping.ratePerKg')}</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="airRate"
                          type="number"
                          step="0.01"
                          min={0}
                          value={config.airShippingRate}
                          onChange={(e) => applyCost('airShippingRate', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-slate-500">{t('admin.management.shipping.costPerKg')}</p>
                    </div>
                    
                    <Separator />
                    
                    {/* Eliminados campos de días de entrega para envío aéreo */}
                  </CardContent>
                </Card>

                {/* Envío Marítimo */}
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-black text-base md:text-lg">
                      <Ship className="w-5 h-5 mr-2 text-teal-600" />
{t('admin.management.shipping.seaEconomic')}
                    </CardTitle>
                    <CardDescription className="text-black text-sm">
                      {t('admin.management.shipping.seaDescription')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seaRate" className="text-sm md:text-base">{t('admin.management.shipping.ratePerCubicMeter')}</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="seaRate"
                          type="number"
                          step="0.01"
                          min={0}
                          value={config.seaShippingRate}
                          onChange={(e) => applyCost('seaShippingRate', e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-slate-500">{t('admin.management.shipping.costPerCubicMeter')}</p>
                    </div>
                    
                    <Separator />
                    
                    {/* Eliminados campos de días de entrega para envío marítimo */}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB: Configuración Financiera */}
            <TabsContent value="financial" className="space-y-6 md:space-y-8">
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {/* Tarjeta Venezuela */}
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-black text-base md:text-lg">
                      <Globe className="w-5 h-5 mr-2 text-green-600" />
                      {t('admin.management.financial.venezuelaRateTitle') !== 'admin.management.financial.venezuelaRateTitle' ? t('admin.management.financial.venezuelaRateTitle') : 'Tasa Venezuela'}
                    </CardTitle>
                    <CardDescription className="text-black text-sm">
                      {t('admin.management.financial.venezuelaRateDesc') !== 'admin.management.financial.venezuelaRateDesc' ? t('admin.management.financial.venezuelaRateDesc') : 'Valor de cambio USD → Bs'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3 p-4 border border-green-200 rounded-lg bg-green-50/50">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇻🇪</span>
                        <Label className="text-sm font-semibold text-green-800">1 USD = X Bs</Label>
                      </div>
                      <Input
                        id="usdRate"
                        type="number"
                        value={config.usdRate}
                        onChange={e => updateConfig('usdRate', Number(e.target.value))}
                        className="pr-12"
                        title="Actualizar tasa desde BCV"
                        disabled={exchangeRateLoading}
                      />
                      <div className="flex items-center justify-between space-x-2 mt-2">
                        <div className="flex items-center space-x-2">
                          {isAutoUpdating ? (
                            <Wifi className="h-4 w-4 text-green-600" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-gray-400" />
                          )}
                          <Label htmlFor="autoUpdate" className="text-xs cursor-pointer">
                            Auto-actualización BCV
                          </Label>
                        </div>
                        <Switch
                          id="autoUpdate"
                          checked={config.autoUpdateExchangeRate}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({ ...prev, autoUpdateExchangeRate: checked }))
                          }
                        />
                      </div>
                      {exchangeRateLastUpdated && (
                        <div className="text-xs text-gray-600 mt-2">
                          <div className="flex items-center justify-between">
                            <span>Actualizado:</span>
                            <Badge variant="secondary" className="text-xs">
                              {getTimeSinceUpdate()}
                            </Badge>
                          </div>
                          {exchangeRateSource && (
                            <div className="flex items-center justify-between mt-1">
                              <span>Fuente:</span>
                              <span className="font-medium">{exchangeRateSource}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
                {/* Tarjeta China */}
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-black text-base md:text-lg">
                      <Globe className="w-5 h-5 mr-2 text-green-600" />
                      {t('admin.management.financial.chinaRateTitle') !== 'admin.management.financial.chinaRateTitle' ? t('admin.management.financial.chinaRateTitle') : 'Tasa China'}
                    </CardTitle>
                    <CardDescription className="text-black text-sm">
                      {t('admin.management.financial.chinaRateDesc') !== 'admin.management.financial.chinaRateDesc' ? t('admin.management.financial.chinaRateDesc') : 'Valor de cambio USD → CNY'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3 p-4 border border-red-200 rounded-lg bg-red-50/50">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇨🇳</span>
                        <Label className="text-sm font-semibold text-red-800">1 USD = X CNY</Label>
                      </div>
                      <Input
                        id="cnyRate"
                        type="number"
                        step="0.0001"
                        min={0}
                        value={config.autoUpdateExchangeRateCNY ? 
                          (currentExchangeRateCNY !== null ? currentExchangeRateCNY : '') : 
                          config.cnyRate}
                        onChange={(e) => applyCost('cnyRate', e.target.value)}
                        className={exchangeRateErrorCNY ? 'border-red-300 pr-12' : 'pr-12'}
                        disabled={exchangeRateLoadingCNY}
                        placeholder="7.2500"
                      />
                      <div className="flex items-center justify-between space-x-2 mt-2">
                        <div className="flex items-center space-x-2">
                          {isAutoUpdatingCNY ? (
                            <Wifi className="h-4 w-4 text-green-600" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-gray-400" />
                          )}
                          <Label htmlFor="autoUpdateCNY" className="text-xs cursor-pointer">
                            Auto-actualización API
                          </Label>
                        </div>
                        <Switch
                          id="autoUpdateCNY"
                          checked={config.autoUpdateExchangeRateCNY}
                          onCheckedChange={(checked) => 
                            setConfig(prev => ({ ...prev, autoUpdateExchangeRateCNY: checked }))
                          }
                        />
                      </div>
                      {exchangeRateLastUpdatedCNY && (
                        <div className="text-xs text-gray-600 mt-2">
                          <div className="flex items-center justify-between">
                            <span>Actualizado:</span>
                            <Badge variant="secondary" className="text-xs">
                              {getTimeSinceUpdateCNY()}
                            </Badge>
                          </div>
                          {exchangeRateSourceCNY && (
                            <div className="flex items-center justify-between mt-1">
                              <span>Fuente:</span>
                              <span className="font-medium">{exchangeRateSourceCNY}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Alert azul debajo de las tasas */}
              <div className="mt-4">
                <Alert className="border-blue-200 bg-blue-50">
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-700">
                    <strong>Tasas de cambio configuradas.</strong> Recuerde guardar los cambios en <strong>Guardar Configuración</strong> para aplicar todas las modificaciones.
                  </AlertDescription>
                </Alert>
              </div>
              {/* Margen de ganancia debajo del alert */}
              <div className="mt-4">
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm w-full">
                  <CardHeader>
                    <CardTitle className="flex items-center text-black text-base md:text-lg">
                      <Percent className="w-5 h-5 mr-2 text-purple-600" />
                      {t('admin.management.financial.profitMarginTitle') !== 'admin.management.financial.profitMarginTitle' ? t('admin.management.financial.profitMarginTitle') : 'Margen de ganancia'}
                    </CardTitle>
                    <CardDescription className="text-black text-sm">
                      {t('admin.management.financial.profitabilityConfig') !== 'admin.management.financial.profitabilityConfig' ? t('admin.management.financial.profitabilityConfig') : 'Configuración de rentabilidad'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profit" className="text-sm md:text-base">{t('admin.management.financial.profitMargin')}</Label>
                      <Input
                        id="profit"
                        type="number"
                        min={0}
                        value={config.profitMargin}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value >= 0 || e.target.value === "") {
                            updateConfig('profitMargin', isNaN(value) ? 0 : value);
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB: Notificaciones */}
            {/* TAB: Notificaciones */}
            <TabsContent value="notifications" className="space-y-6 md:space-y-8">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-black text-base md:text-lg">
                    <Bell className="w-5 h-5 mr-2 text-red-600" />
                    {t('admin.management.notifications.notificationSystem')}
                  </CardTitle>
                  <CardDescription className="text-black text-sm">
                    {t('admin.management.notifications.description')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="alertDays" className="text-sm md:text-base">{t('admin.management.notifications.alertAfterDays')}</Label>
                    <Input
                      id="alertDays"
                      type="number"
                      min={0}
                      max={365}
                      value={config.alertsAfterDays ?? ''}
                      onChange={(e) => updateConfig('alertsAfterDays', Number(e.target.value))}
                    />
                    <p className="text-xs text-slate-500">{t('admin.management.notifications.alertAfterDaysHelp')}</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Opción Seguridad eliminada */}
          </Tabs>

          {/* Panel de Resumen */}
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-black text-base md:text-lg">
                <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                {t('admin.management.summary.title')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-slate-600">{t('admin.management.summary.airShipping')}</p>
                  <p className="font-bold text-blue-600">{formatCurrency(config.airShippingRate)}/kg</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-slate-600">{t('admin.management.summary.seaShipping')}</p>
                  <p className="font-bold text-teal-600">{formatCurrency(config.seaShippingRate)}/m³</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-slate-600">🇻🇪 USD → Bs</p>
                  <p className="font-bold text-green-600">{config.autoUpdateExchangeRate ? (currentExchangeRate || config.usdRate) : config.usdRate} Bs</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-slate-600">🇨🇳 USD → CNY</p>
                  <p className="font-bold text-red-600">{config.autoUpdateExchangeRateCNY ? (currentExchangeRateCNY || config.cnyRate) : config.cnyRate} CNY</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-slate-600">{t('admin.management.summary.margin')}</p>
                  <p className="font-bold text-purple-600">{config.profitMargin}%</p>
              </div>
            </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}