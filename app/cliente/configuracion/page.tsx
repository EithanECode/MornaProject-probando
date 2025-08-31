"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Lock, 
  Globe, 
  Bell, 
  Shield, 
  Palette, 
  Camera, 
  Save, 
  Eye, 
  EyeOff,
  Upload,
  Trash2,
  CheckCircle,
  AlertCircle,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ConfiguracionPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  // Datos específicos para cliente
  const roleData = {
    nombre: 'Cliente Morna',
    email: 'cliente@morna.com',
    telefono: '+58 412-555-1234',
    rol: 'Cliente',
    color: 'bg-blue-500'
  };

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: roleData.nombre,
    email: roleData.email,
    telefono: roleData.telefono,
    idioma: 'es',
    zonaHoraria: 'America/Caracas',
    fotoPerfil: null as File | null,
    fotoPreview: '/images/logos/logo.png'
  });

  // Estados de contraseña
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrentPassword: false,
    showNewPassword: false,
    showConfirmPassword: false
  });

  // Estados de notificaciones (específicas para cliente)
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    notificacionesMarketing: true,
    notificacionesPedidos: true,
    actualizacionesSistema: true
  });

  // Estados de seguridad
  const [security, setSecurity] = useState({
    autenticacionDosFactores: false,
    sesionesActivas: Math.floor(Math.random() * 3) + 1,
    ultimoAcceso: new Date().toLocaleString('es-VE'),
    ipUltimoAcceso: `192.168.1.${Math.floor(Math.random() * 255)}`
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [field]: value }));
  };

  const handleSecurityChange = (field: string, value: boolean | number) => {
    setSecurity(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, fotoPerfil: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, fotoPreview: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    toast({
      title: "Perfil actualizado",
      description: "Los cambios se han guardado correctamente.",
      variant: "default",
    });
  };

  const handleSavePassword = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Contraseña actualizada",
      description: "Tu contraseña se ha cambiado exitosamente.",
      variant: "default",
    });

    setPasswordData(prev => ({
      ...prev,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }));
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notificaciones actualizadas",
      description: "Las preferencias de notificaciones se han guardado.",
      variant: "default",
    });
  };

  const handleSaveSecurity = () => {
    toast({
      title: "Configuración de seguridad actualizada",
      description: "Los cambios de seguridad se han aplicado.",
      variant: "default",
    });
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen flex overflow-x-hidden ${
      theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'
    }`}>
      <Sidebar
        isExpanded={sidebarExpanded}
        setIsExpanded={setSidebarExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        userRole="client"
      />

      <main className={`transition-all duration-300 flex-1 ${
        sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'
      }`}>
        {/* Header */}
        <header className={mounted && theme === 'dark' ? 'bg-slate-800/80 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-40' : 'bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40'}>
          <div className="px-4 md:px-5 lg:px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>

              <div>
                <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Configuración</h1>
                <p className={`text-sm md:text-base ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>Gestiona tu perfil, seguridad y preferencias</p>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <div className="p-4 md:p-5 lg:p-6 space-y-6 md:space-y-8">
          <Tabs defaultValue="perfil" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:w-auto lg:grid-cols-4 gap-1">
              <TabsTrigger value="perfil" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <User className="w-3 h-3 md:w-4 md:h-4" />
                <span>Perfil</span>
              </TabsTrigger>
              <TabsTrigger value="seguridad" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Lock className="w-3 h-3 md:w-4 md:h-4" />
                <span>Seguridad</span>
              </TabsTrigger>
              <TabsTrigger value="notificaciones" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Bell className="w-3 h-3 md:w-4 md:h-4" />
                <span>Notificaciones</span>
              </TabsTrigger>
              <TabsTrigger value="preferencias" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Globe className="w-3 h-3 md:w-4 md:h-4" />
                <span>Preferencias</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Perfil */}
            <TabsContent value="perfil" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información del perfil */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        Información Personal
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">Nombre completo</Label>
                          <Input
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                            placeholder="Tu nombre completo"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Correo electrónico</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            placeholder="tu@email.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefono">Teléfono</Label>
                          <Input
                            id="telefono"
                            value={formData.telefono}
                            onChange={(e) => handleInputChange('telefono', e.target.value)}
                            placeholder="+58 412-123-4567"
                          />
                        </div>
                                                 <div className="space-y-2">
                           <Label htmlFor="idioma">Idioma</Label>
                           <Select value={formData.idioma} onValueChange={(value) => handleInputChange('idioma', value)}>
                             <SelectTrigger>
                               <SelectValue placeholder="Selecciona un idioma" />
                             </SelectTrigger>
                             <SelectContent>
                               <SelectItem value="es">🇪🇸 Español</SelectItem>
                               <SelectItem value="en">🇺🇸 English</SelectItem>
                               <SelectItem value="zh">🇨🇳 中文</SelectItem>
                             </SelectContent>
                           </Select>
                         </div>
                      </div>
                      <Button onClick={handleSaveProfile} className="w-full md:w-auto">
                        <Save className="w-4 h-4 mr-2" />
                        Guardar cambios
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Cambio de contraseña */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Cambiar Contraseña
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="currentPassword">Contraseña actual</Label>
                        <div className="relative">
                          <Input
                            id="currentPassword"
                            type={passwordData.showCurrentPassword ? "text" : "password"}
                            value={passwordData.currentPassword}
                            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                            placeholder="Ingresa tu contraseña actual"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setPasswordData(prev => ({ ...prev, showCurrentPassword: !prev.showCurrentPassword }))}
                          >
                            {passwordData.showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">Nueva contraseña</Label>
                          <div className="relative">
                            <Input
                              id="newPassword"
                              type={passwordData.showNewPassword ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                              placeholder="Nueva contraseña"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setPasswordData(prev => ({ ...prev, showNewPassword: !prev.showNewPassword }))}
                            >
                              {passwordData.showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={passwordData.showConfirmPassword ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                              placeholder="Confirma la nueva contraseña"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setPasswordData(prev => ({ ...prev, showConfirmPassword: !prev.showConfirmPassword }))}
                            >
                              {passwordData.showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                      <Button onClick={handleSavePassword} className="w-full md:w-auto">
                        <Save className="w-4 h-4 mr-2" />
                        Cambiar contraseña
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Foto de perfil */}
                <div className="space-y-6">
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        Foto de Perfil
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                          <img
                            src={formData.fotoPreview}
                            alt="Foto de perfil"
                            className="w-32 h-32 rounded-full object-cover border-4 border-slate-200 dark:border-slate-600"
                          />
                          <Badge className="absolute -bottom-2 -right-2 bg-green-500">
                            <CheckCircle className="w-3 h-3" />
                          </Badge>
                        </div>
                        <div className="space-y-2 w-full">
                          <Button variant="outline" className="w-full" onClick={() => document.getElementById('file-upload')?.click()}>
                            <Upload className="w-4 h-4 mr-2" />
                            Cambiar foto
                          </Button>
                          <input
                            id="file-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                          />
                          <Button variant="outline" className="w-full" onClick={() => setFormData(prev => ({ ...prev, fotoPreview: '/images/logos/logo.png' }))}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar foto
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Información de la cuenta */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Información de la Cuenta
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Rol</span>
                        <Badge className={roleData.color}>{roleData.rol}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Estado</span>
                        <Badge className="bg-green-500">Activo</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Miembro desde</span>
                        <span className="text-sm font-medium">Enero 2024</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">Último acceso</span>
                        <span className="text-sm font-medium">{security.ultimoAcceso}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Tab Seguridad */}
            <TabsContent value="seguridad" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Configuración de Seguridad
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Autenticación de dos factores</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Añade una capa extra de seguridad a tu cuenta
                        </p>
                      </div>
                      <Switch
                        checked={security.autenticacionDosFactores}
                        onCheckedChange={(checked) => handleSecurityChange('autenticacionDosFactores', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Sesiones activas</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {security.sesionesActivas} dispositivos conectados
                      </p>
                      <Button variant="outline" size="sm">
                        Ver todas las sesiones
                      </Button>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>IP del último acceso</Label>
                      <p className="text-sm font-mono text-slate-600 dark:text-slate-400">
                        {security.ipUltimoAcceso}
                      </p>
                    </div>
                    <Button onClick={handleSaveSecurity} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar configuración
                    </Button>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Actividad Reciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Inicio de sesión exitoso</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Hace 2 horas</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Cambio de contraseña</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Hace 3 días</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Nuevo dispositivo detectado</p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">Hace 1 semana</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Tab Notificaciones */}
            <TabsContent value="notificaciones" className="space-y-6">
              <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Preferencias de Notificaciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notificaciones por email</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Recibe actualizaciones importantes por correo electrónico
                        </p>
                      </div>
                      <Switch
                        checked={notifications.emailNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('emailNotifications', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notificaciones push</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Recibe notificaciones en tiempo real en tu navegador
                        </p>
                      </div>
                      <Switch
                        checked={notifications.pushNotifications}
                        onCheckedChange={(checked) => handleNotificationChange('pushNotifications', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notificaciones de marketing</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Ofertas especiales y contenido promocional
                        </p>
                      </div>
                      <Switch
                        checked={notifications.notificacionesMarketing}
                        onCheckedChange={(checked) => handleNotificationChange('notificacionesMarketing', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notificaciones de pedidos</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Actualizaciones sobre el estado de tus pedidos
                        </p>
                      </div>
                      <Switch
                        checked={notifications.notificacionesPedidos}
                        onCheckedChange={(checked) => handleNotificationChange('notificacionesPedidos', checked)}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Actualizaciones del sistema</Label>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Notificaciones sobre nuevas versiones y mejoras
                        </p>
                      </div>
                      <Switch
                        checked={notifications.actualizacionesSistema}
                        onCheckedChange={(checked) => handleNotificationChange('actualizacionesSistema', checked)}
                      />
                    </div>
                  </div>
                  <Button onClick={handleSaveNotifications} className="w-full md:w-auto">
                    <Save className="w-4 h-4 mr-2" />
                    Guardar preferencias
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab Preferencias */}
            <TabsContent value="preferencias" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Configuración Regional
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="zonaHoraria">Zona horaria</Label>
                      <Select value={formData.zonaHoraria} onValueChange={(value) => handleInputChange('zonaHoraria', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona tu zona horaria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/Caracas">Caracas (UTC-4)</SelectItem>
                          <SelectItem value="America/New_York">Nueva York (UTC-5)</SelectItem>
                          <SelectItem value="America/Los_Angeles">Los Ángeles (UTC-8)</SelectItem>
                          <SelectItem value="Europe/Madrid">Madrid (UTC+1)</SelectItem>
                          <SelectItem value="Asia/Shanghai">Shanghai (UTC+8)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="formatoFecha">Formato de fecha</Label>
                      <Select defaultValue="dd/mm/yyyy">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el formato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="formatoHora">Formato de hora</Label>
                      <Select defaultValue="24h">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el formato" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24h">24 horas</SelectItem>
                          <SelectItem value="12h">12 horas (AM/PM)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Apariencia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Tema</Label>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant={mounted && theme === 'light' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTheme('light')}
                          className="flex-1 min-w-0 flex items-center gap-2"
                        >
                          <Sun className="w-4 h-4" />
                          Claro
                        </Button>
                        <Button
                          variant={mounted && theme === 'dark' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTheme('dark')}
                          className="flex-1 min-w-0 flex items-center gap-2"
                        >
                          <Moon className="w-4 h-4" />
                          Oscuro
                        </Button>
                        <Button
                          variant={mounted && theme === 'system' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTheme('system')}
                          className="flex-1 min-w-0 flex items-center gap-2"
                        >
                          <Monitor className="w-4 h-4" />
                          Sistema
                        </Button>
                      </div>
                      {mounted && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          Tema actual: {theme === 'light' ? 'Claro' : theme === 'dark' ? 'Oscuro' : 'Sistema'}
                        </p>
                      )}
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Tamaño de fuente</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tamaño" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Pequeño</SelectItem>
                          <SelectItem value="medium">Mediano</SelectItem>
                          <SelectItem value="large">Grande</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>Densidad de la interfaz</Label>
                      <Select defaultValue="comfortable">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la densidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">Compacta</SelectItem>
                          <SelectItem value="comfortable">Cómoda</SelectItem>
                          <SelectItem value="spacious">Espaciosa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
