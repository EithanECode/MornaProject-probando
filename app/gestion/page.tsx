"use client";

import { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
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
  Moon
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
}

export default function ConfiguracionPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
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
    requireTwoFactor: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedDate = localStorage.getItem('lastConfigSaved');
    if (savedDate) {
      setLastSaved(new Date(savedDate));
    }
    setMounted(true);
  }, []);

  const handleSave = async () => {
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const now = new Date();
    setLastSaved(now);
    localStorage.setItem('lastConfigSaved', now.toISOString());
    
    setIsLoading(false);
    
    toast({
      title: "Configuración guardada",
      description: "Los parámetros del negocio se han actualizado correctamente.",
    });
  };

  const updateConfig = (field: keyof BusinessConfig, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-VE', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div
      className={
        `min-h-screen flex ` +
        (mounted && theme === 'dark'
          ? 'bg-slate-900'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50')
      }
    >
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} />

      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-72' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Gestión del Sistema</h1>
                <p className="text-sm text-slate-600">Ajuste los parametros de gestión del sistema</p>
              </div>
              <div className="flex items-center space-x-4">
                {lastSaved && (
                  <div className="text-sm text-slate-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Guardado: {lastSaved.toLocaleString('es-VE')}
                  </div>
                )}
                {/* Switch tema claro/oscuro removido, el tema es global */}
                <Button 
                  onClick={handleSave}
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  {isLoading ? 'Guardando...' : 'Guardar Configuración'}
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Alert de advertencia */}
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Advertencia:</strong> Los cambios en estos parámetros afectan directamente las operaciones del negocio. 
              Asegúrate de comunicar cualquier modificación al equipo operativo.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="shipping" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-white/60 backdrop-blur-sm place-items-center">
              <TabsTrigger value="shipping" className="flex items-center space-x-2">
                <Package className="w-4 h-4" />
                <span>Envíos</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4" />
                <span>Financiero</span>
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center space-x-2">
                <Bell className="w-4 h-4" />
                <span>Notificaciones</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB: Configuración de Envíos */}
            <TabsContent value="shipping" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Envío Aéreo */}
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-black">
                      <Plane className="w-5 h-5 mr-2 text-blue-600" />
                      Envío Aéreo Express
                    </CardTitle>
                    <CardDescription className="text-black">
                      Tarifas y tiempos para envíos rápidos por avión
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="airRate">Tarifa por Kg Volumétrico</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="airRate"
                          type="number"
                          step="0.01"
                          min={0}
                          value={config.airShippingRate}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (value >= 0 || e.target.value === "") {
                              updateConfig('airShippingRate', isNaN(value) ? 0 : value);
                            }
                          }}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-slate-500">Costo por kilogramo volumétrico</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="airMin">Días Mínimos</Label>
                        <Input
                          id="airMin"
                          type="number"
                          min={0}
                          value={config.airDeliveryDays.min}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 0 || e.target.value === "") {
                              updateConfig('airDeliveryDays', {
                                ...config.airDeliveryDays,
                                min: isNaN(value) ? 0 : value
                              });
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="airMax">Días Máximos</Label>
                        <Input
                          id="airMax"
                          type="number"
                          min={0}
                          value={config.airDeliveryDays.max}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 0 || e.target.value === "") {
                              updateConfig('airDeliveryDays', {
                                ...config.airDeliveryDays,
                                max: isNaN(value) ? 0 : value
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="w-full justify-center">
                      ETA: {config.airDeliveryDays.min}-{config.airDeliveryDays.max} días
                    </Badge>
                  </CardContent>
                </Card>

                {/* Envío Marítimo */}
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-black">
                      <Ship className="w-5 h-5 mr-2 text-teal-600" />
                      Envío Marítimo Económico
                    </CardTitle>
                    <CardDescription className="text-black">
                      Opciones y costos para envíos por barco
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="seaRate">Tarifa por Metro Cúbico</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <Input
                          id="seaRate"
                          type="number"
                          step="0.01"
                          min={0}
                          value={config.seaShippingRate}
                          onChange={(e) => {
                            const value = parseFloat(e.target.value);
                            if (value >= 0 || e.target.value === "") {
                              updateConfig('seaShippingRate', isNaN(value) ? 0 : value);
                            }
                          }}
                          className="pl-10"
                        />
                      </div>
                      <p className="text-xs text-slate-500">Costo por metro cúbico</p>
                    </div>
                    
                    <Separator />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="seaMin">Días Mínimos</Label>
                        <Input
                          id="seaMin"
                          type="number"
                          min={0}
                          value={config.seaDeliveryDays.min}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 0 || e.target.value === "") {
                              updateConfig('seaDeliveryDays', {
                                ...config.seaDeliveryDays,
                                min: isNaN(value) ? 0 : value
                              });
                            }
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="seaMax">Días Máximos</Label>
                        <Input
                          id="seaMax"
                          type="number"
                          min={0}
                          value={config.seaDeliveryDays.max}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 0 || e.target.value === "") {
                              updateConfig('seaDeliveryDays', {
                                ...config.seaDeliveryDays,
                                max: isNaN(value) ? 0 : value
                              });
                            }
                          }}
                        />
                      </div>
                    </div>
                    
                    <Badge variant="outline" className="w-full justify-center">
                      ETA: {config.seaDeliveryDays.min}-{config.seaDeliveryDays.max} días
                    </Badge>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* TAB: Configuración Financiera */}
            <TabsContent value="financial" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-black">
                      <Globe className="w-5 h-5 mr-2 text-green-600" />
                      Tasa de Cambio
                    </CardTitle>
                    <CardDescription className="text-black">
                      Valor del dólar estadounidense
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="usdRate">1 USD = X Bs</Label>
                      <Input
                        id="usdRate"
                        type="number"
                        step="0.01"
                        min={0}
                        value={config.usdRate}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          if (value >= 0 || e.target.value === "") {
                            updateConfig('usdRate', isNaN(value) ? 0 : value);
                          }
                        }}
                      />
                    </div>
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Actualizar diariamente según el mercado paralelo
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center text-black">
                      <Percent className="w-5 h-5 mr-2 text-purple-600" />
                      Márgenes y Descuentos
                    </CardTitle>
                    <CardDescription className="text-black">
                      Configuración de rentabilidad
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profit">Margen de Ganancia (%)</Label>
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
                      <Label htmlFor="discount">Descuento por Pago en USD (%)</Label>
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
            <TabsContent value="notifications" className="space-y-6">
              <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-black">
                    <Bell className="w-5 h-5 mr-2 text-red-600" />
                    Sistema de Notificaciones
                  </CardTitle>
                  <CardDescription className="text-black">
                    Configuración de alertas y comunicaciones
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="email-notifications">Notificaciones por Email</Label>
                          <p className="text-sm text-slate-500">Enviar alertas por correo electrónico</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={config.emailNotifications}
                          onCheckedChange={(checked: boolean) => updateConfig('emailNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="whatsapp-notifications">Notificaciones por WhatsApp</Label>
                          <p className="text-sm text-slate-500">Enviar alertas por WhatsApp</p>
                        </div>
                        <Switch
                          id="whatsapp-notifications"
                          checked={config.whatsappNotifications}
                          onCheckedChange={(checked: boolean) => updateConfig('whatsappNotifications', checked)}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="alertDays">Alertar después de (días)</Label>
                      <Input
                        id="alertDays"
                        type="number"
                        min={0}
                        value={config.alertsAfterDays}
                        onChange={(e) => {
                          const value = parseInt(e.target.value);
                          if (value >= 0 || e.target.value === "") {
                            updateConfig('alertsAfterDays', isNaN(value) ? 0 : value);
                          }
                        }}
                      />
                      <p className="text-xs text-slate-500">Días sin atención antes de generar alerta</p>
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
              <CardTitle className="flex items-center text-black">
                <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                Resumen de Configuración Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-slate-600">Envío Aéreo</p>
                  <p className="font-bold text-blue-600">{formatCurrency(config.airShippingRate)}/kg</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-slate-600">Envío Marítimo</p>
                  <p className="font-bold text-teal-600">{formatCurrency(config.seaShippingRate)}/m³</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-slate-600">Tasa USD</p>
                  <p className="font-bold text-green-600">{config.usdRate} Bs</p>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <p className="text-slate-600">Margen</p>
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