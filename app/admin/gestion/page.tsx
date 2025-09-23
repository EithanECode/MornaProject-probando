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

interface BusinessConfig {
  // Parámetros de envío
  airShippingRate: number;
  seaShippingRate: number;
  airDeliveryDays: { min: number; max: number };
  seaDeliveryDays: { min: number; max: number };
  
  // Parámetros financieros
  usdRate: number;
  profitMargin: number;
  usdDiscountPercent: number;
  
  // Parámetros operativos adicionales
  maxQuotationsPerMonth?: number;
  maxModificationsPerOrder?: number;
  quotationValidityDays?: number;
  paymentDeadlineDays?: number;
  
  // Notificaciones y alertas
  emailNotifications: boolean;
  whatsappNotifications: boolean;
  alertsAfterDays: number;
  
  // Configuración de accesos
  sessionTimeout: number;
  requireTwoFactor: boolean;
  
  // Configuración de tasa de cambio
  autoUpdateExchangeRate: boolean;
}

export default function ConfiguracionPage() {
  const { t } = useTranslation();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState<BusinessConfig>({
    airShippingRate: 8.50,
    seaShippingRate: 180.00,
    airDeliveryDays: { min: 15, max: 20 },
    seaDeliveryDays: { min: 35, max: 45 },
    usdRate: 36.25,
    profitMargin: 25,
    usdDiscountPercent: 5,
    maxQuotationsPerMonth: 5,
    maxModificationsPerOrder: 2,
    quotationValidityDays: 7,
    paymentDeadlineDays: 3,
    emailNotifications: true,
    whatsappNotifications: true,
    alertsAfterDays: 2,
    sessionTimeout: 60,
    requireTwoFactor: false,
    autoUpdateExchangeRate: false
  });
  // Referencia al estado base para detectar cambios
  const baseConfigRef = useRef<BusinessConfig | null>(null);
  const [baselineVersion, setBaselineVersion] = useState(0);
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  // Callback estable para actualizar la tasa
  const handleRateUpdate = useCallback((newRate: number) => {
    setConfig(prev => ({ ...prev, usdRate: newRate }));
  }, []);

  // Ref para el debounce de la tasa manual
  const manualRateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    autoUpdate: config.autoUpdateExchangeRate,
    interval: 30 * 60 * 1000, // 30 minutos
    onRateUpdate: handleRateUpdate
  });

  useEffect(() => {
    const loadConfig = async () => {
      try {
        // 1. Cargar configuración desde localStorage (más confiable)
        const savedConfig = localStorage.getItem('businessConfig');
        let mergedConfig = { ...config };

        if (savedConfig) {
          try {
            const parsedConfig = JSON.parse(savedConfig);
            mergedConfig = { ...mergedConfig, ...parsedConfig };
          } catch (e) {
            console.error('Error parsing saved config:', e);
          }
        }

        // 2. Intentar cargar desde la API y hacer merge
        try {
          const response = await fetch('/api/config');
          const data = await response.json();
          
          if (data.success && data.config) {
            // Priorizar localStorage para autoUpdateExchangeRate
            mergedConfig = { 
              ...mergedConfig, 
              ...data.config,
              autoUpdateExchangeRate: mergedConfig.autoUpdateExchangeRate // Mantener valor de localStorage
            };
          }
        } catch (apiError) {
          console.error('Error loading config from API, using localStorage only:', apiError);
        }

        // 3. Aplicar configuración final
        setConfig(mergedConfig);
        baseConfigRef.current = { ...mergedConfig };
        
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
      // Guardar configuración en base de datos a través de la API
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config)
      });

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error saving configuration');
      }
      
      const now = new Date();
      setLastSaved(now);
      localStorage.setItem('lastConfigSaved', now.toISOString());
      
      // *** CLAVE: Guardar configuración en localStorage para persistencia ***
      localStorage.setItem('businessConfig', JSON.stringify(config));
      
      toast({
        title: t('admin.management.messages.configSaved'),
        description: "Configuración guardada globalmente. Los cambios estarán disponibles para todos los usuarios.",
      });

      // Actualizar baseline para futuras comparaciones
      baseConfigRef.current = { ...config };
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

  const updateConfig = (field: keyof BusinessConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  // Comparar configuraciones (stringify simple dado el tamaño pequeño)
  const hasChanges = useMemo(() => {
    if (!baseConfigRef.current) return false;
    return JSON.stringify(baseConfigRef.current) !== JSON.stringify(config);
  }, [config, baselineVersion]);

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

  const applyCost = (field: keyof BusinessConfig, raw: string) => {
    const cleaned = sanitizeCost(raw);
    const num = cleaned === '' ? 0 : parseFloat(cleaned);
    const finalValue = isNaN(num) ? 0 : num;
    
    updateConfig(field, finalValue);
    
    // Si es tasa USD y la actualización automática está desactivada, guardar en BD
    if (field === 'usdRate' && !config.autoUpdateExchangeRate && finalValue > 0) {
      // Limpiar timeout anterior
      if (manualRateTimeoutRef.current) {
        clearTimeout(manualRateTimeoutRef.current);
      }
      
      // Configurar nuevo timeout con debounce
      manualRateTimeoutRef.current = setTimeout(() => {
        saveManualRate(finalValue);
      }, 1500); // 1.5 segundos después de que el usuario deje de escribir
    }
  };

  const applyDayValue = (group: 'airDeliveryDays' | 'seaDeliveryDays', sub: 'min' | 'max', raw: string) => {
    let onlyDigits = raw.replace(/\D/g, '');
    if (onlyDigits.length > 4) onlyDigits = onlyDigits.slice(0,4);
    let num = onlyDigits === '' ? 0 : parseInt(onlyDigits, 10);
    if (num > MAX_DAY_VALUE) num = MAX_DAY_VALUE;
    updateConfig(group, { ...config[group], [sub]: num });
  };

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
          <p className="mt-4 text-gray-600">{t('admin.management.common.loading')}</p>
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
                  onClick={handleSave}
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

        <div className={`p-4 md:p-5 lg:p-6 space-y-6 md:space-y-8 ${mounted && theme === 'dark' ? 'bg-slate-900' : ''}`}>
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="airMin" className="text-sm">{t('admin.management.shipping.minDays')}</Label>
                        <Input
                          id="airMin"
                          type="number"
                          min={0}
                          max={365}
                          value={config.airDeliveryDays.min}
                          onChange={(e) => applyDayValue('airDeliveryDays','min', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="airMax" className="text-sm">{t('admin.management.shipping.maxDays')}</Label>
                        <Input
                          id="airMax"
                          type="number"
                          min={0}
                          max={365}
                          value={config.airDeliveryDays.max}
                          onChange={(e) => applyDayValue('airDeliveryDays','max', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="w-full justify-center">
                      {t('common.eta')}: {config.airDeliveryDays.min}-{config.airDeliveryDays.max} {t('common.dias')}
                    </Badge>
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
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="seaMin" className="text-sm">{t('admin.management.shipping.minDays')}</Label>
                        <Input
                          id="seaMin"
                          type="number"
                          min={0}
                          max={365}
                          value={config.seaDeliveryDays.min}
                          onChange={(e) => applyDayValue('seaDeliveryDays','min', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seaMax" className="text-sm">{t('admin.management.shipping.maxDays')}</Label>
                        <Input
                          id="seaMax"
                          type="number"
                          min={0}
                          max={365}
                          value={config.seaDeliveryDays.max}
                          onChange={(e) => applyDayValue('seaDeliveryDays','max', e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="w-full justify-center">
                      {t('common.eta')}: {config.seaDeliveryDays.min}-{config.seaDeliveryDays.max} {t('common.dias')}
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB: Configuración Financiera */}
            <TabsContent value="financial" className="space-y-6 md:space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-black text-base md:text-lg">
                      <Globe className="w-5 h-5 mr-2 text-green-600" />
{t('admin.management.financial.exchangeRate')}
                    </CardTitle>
                    <CardDescription className="text-black text-sm">
                      {t('admin.management.financial.usdValue')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="usdRate" className="text-sm md:text-base">{t('admin.management.financial.usdRate')}</Label>
                      <div className="flex gap-2">
                        <Input
                          id="usdRate"
                          type="number"
                          step="0.01"
                          min={0}
                          value={config.usdRate}
                          onChange={(e) => applyCost('usdRate', e.target.value)}
                          className={exchangeRateError ? 'border-red-300' : ''}
                          disabled={exchangeRateLoading}
                        />
                        {config.autoUpdateExchangeRate ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={refreshRate}
                            disabled={exchangeRateLoading}
                            className="shrink-0"
                            title="Actualizar tasa desde BCV"
                          >
                            {exchangeRateLoading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => saveManualRate(config.usdRate)}
                            disabled={!config.usdRate || config.usdRate <= 0}
                            className="shrink-0"
                            title="Guardar tasa manual"
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Switch para auto-actualización */}
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        {isAutoUpdating ? (
                          <Wifi className="h-4 w-4 text-green-600" />
                        ) : (
                          <WifiOff className="h-4 w-4 text-gray-400" />
                        )}
                        <Label htmlFor="autoUpdate" className="text-sm cursor-pointer">
                          Actualizar automáticamente según tasa oficial BCV
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

                    {/* Información de estado */}
                    {exchangeRateLastUpdated && (
                      <div className="text-xs text-gray-600 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Última actualización:</span>
                          <Badge variant="secondary" className="text-xs">
                            {getTimeSinceUpdate()}
                          </Badge>
                        </div>
                        {exchangeRateSource && (
                          <div className="flex items-center justify-between">
                            <span>Fuente:</span>
                            <span className="font-medium">{exchangeRateSource}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Alert de estado */}
                    <Alert className={exchangeRateError ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                      {exchangeRateError ? (
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                      ) : (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      <AlertDescription className={exchangeRateError ? 'text-red-700' : 'text-green-700'}>
                        {exchangeRateError || (
                          config.autoUpdateExchangeRate 
                            ? 'Actualización automática activada cada 30 minutos desde BCV. Recuerde guardar los cambios en "Guardar Configuración" para aplicar todas las modificaciones.'
                            : 'Modo manual activo. Recuerde guardar los cambios en "Guardar Configuración" para aplicar todas las modificaciones.'
                        )}
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-black text-base md:text-lg">
                      <Percent className="w-5 h-5 mr-2 text-purple-600" />
                      {t('admin.management.financial.marginsDiscounts')}
                    </CardTitle>
                    <CardDescription className="text-black text-sm">
                      {t('admin.management.financial.profitabilityConfig')}
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
                    <div className="space-y-2">
                      <Label htmlFor="discount" className="text-sm md:text-base">{t('admin.management.financial.usdDiscount')}</Label>
                      <Input
                        id="discount"
                        type="number"
                        min={0}
                        value={config.usdDiscountPercent}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value >= 0 || e.target.value === "") {
                            updateConfig('usdDiscountPercent', isNaN(value) ? 0 : value);
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications" className="text-sm md:text-base">{t('admin.management.notifications.email')}</Label>
                          <p className="text-xs md:text-sm text-slate-500">{t('admin.management.notifications.emailDesc')}</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={config.emailNotifications}
                          onCheckedChange={(checked: boolean) => updateConfig('emailNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="whatsapp-notifications" className="text-sm md:text-base">{t('admin.management.notifications.whatsapp')}</Label>
                          <p className="text-xs md:text-sm text-slate-500">{t('admin.management.notifications.whatsappDesc')}</p>
                        </div>
                        <Switch
                          id="whatsapp-notifications"
                          checked={config.whatsappNotifications}
                          onCheckedChange={(checked: boolean) => updateConfig('whatsappNotifications', checked)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="alertDays" className="text-sm md:text-base">{t('admin.management.notifications.alertAfterDays')}</Label>
                      <Input
                        id="alertDays"
                        type="number"
                        min={0}
                        max={365}
                        value={config.alertsAfterDays}
                        onChange={(e) => applySingleDay('alertsAfterDays', e.target.value)}
                      />
                      <p className="text-xs text-slate-500">{t('admin.management.notifications.alertAfterDaysHelp')}</p>
                    </div>
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
                  <p className="text-slate-600">{t('admin.management.summary.usdRate')}</p>
                  <p className="font-bold text-green-600">{config.usdRate} Bs</p>
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