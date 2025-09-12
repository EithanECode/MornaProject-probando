"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  User,
  Globe,
  Palette,
  Camera,
  Eye,
  EyeOff,
  Upload,
  Trash2,
  Sun,
  Moon,
  Monitor,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/lib/LanguageContext';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export type ConfigurationRole = 'admin' | 'china' | 'venezuela' | 'client';

interface ConfigurationContentProps {
  role: ConfigurationRole;
  onUserImageUpdate?: (url?: string) => void;
}

export default function ConfigurationContent({ role, onUserImageUpdate }: ConfigurationContentProps) {
  const MAX_FIELD_LENGTH = 50; // Límite requerido para nombre, email y contraseñas
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  // Datos base (simulados) — se pueden adaptar por rol si hace falta más adelante
  const roleData = {
    nombre: 'Administrador Principal',
    email: 'admin@morna.com',
    telefono: '+58 412-123-4567',
    rol: role === 'admin' ? 'Administrador' : role,
    color: 'bg-purple-500'
  };

  // Estados del formulario
  const [formData, setFormData] = useState({
    nombre: roleData.nombre,
    email: roleData.email,
    telefono: roleData.telefono,
    idioma: language,
    zonaHoraria: 'America/Caracas',
    fotoPerfil: null as File | null,
    fotoPreview: null as string | null
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
  const [changingPassword, setChangingPassword] = useState(false);

  // Estados de seguridad mínimos (solo para mostrar info de cuenta)
  const [security, setSecurity] = useState({
    ultimoAcceso: new Date().toLocaleString('es-VE'),
    ipUltimoAcceso: `192.168.1.${Math.floor(Math.random() * 255)}`
  });

  // UI state
  const [deletingPhoto, setDeletingPhoto] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Cargar imagen de perfil desde la base de datos
    const loadUserImage = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from('userlevel')
          .select('user_image')
          .eq('id', user.id)
          .single();

        if (data && data.user_image && !error) {
          setFormData(prev => ({ ...prev, fotoPreview: data.user_image }));
        } else {
          setFormData(prev => ({ ...prev, fotoPreview: null }));
        }
      }
    };

    loadUserImage();
  }, []);

  // Sincronizar idioma del contexto con el formulario
  useEffect(() => {
    setFormData(prev => ({ ...prev, idioma: language }));
  }, [language]);

  const handleInputChange = (field: string, value: string) => {
    // Solo limitar longitud para campos solicitados
    const limitedValue = ['nombre', 'email'].includes(field) ? value.slice(0, MAX_FIELD_LENGTH) : value;
    setFormData(prev => ({ ...prev, [field]: limitedValue }));

    if (field === 'idioma' && ['es', 'en', 'zh'].includes(limitedValue)) {
      setLanguage(limitedValue as 'es' | 'en' | 'zh');
    }
  };

  const handlePasswordChange = (field: string, value: string) => {
    const limitedValue = value.slice(0, MAX_FIELD_LENGTH);
    setPasswordData(prev => ({ ...prev, [field]: limitedValue }));
  };

  const handleSavePassword = async () => {
    try {
      // Validaciones de longitud (solo al guardar)
      if (
        passwordData.currentPassword.length > MAX_FIELD_LENGTH ||
        passwordData.newPassword.length > MAX_FIELD_LENGTH ||
        passwordData.confirmPassword.length > MAX_FIELD_LENGTH
      ) {
        toast({ title: t('common.error'), description: `Los campos de contraseña no pueden exceder ${MAX_FIELD_LENGTH} caracteres.`, variant: 'destructive' });
        return;
      }
      if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        toast({ title: t('common.error'), description: t('common.fillRequiredFields'), variant: 'destructive' });
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast({ title: t('admin.configuration.messages.passwordMismatch'), description: '', variant: 'destructive' });
        return;
      }
      if (passwordData.newPassword.length < 6) {
        toast({ title: t('common.error'), description: 'La nueva contraseña debe tener al menos 6 caracteres.', variant: 'destructive' });
        return;
      }

      setChangingPassword(true);
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.email) {
        toast({ title: t('common.error'), description: 'Usuario no autenticado.', variant: 'destructive' });
        return;
      }

      // Reautenticar con la contraseña actual
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: passwordData.currentPassword,
      });
      if (signInError) {
        toast({ title: t('common.error'), description: 'La contraseña actual es incorrecta.', variant: 'destructive' });
        return;
      }

      // Actualizar contraseña
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword,
      });
      if (updateError) {
        toast({ title: t('common.error'), description: `No se pudo actualizar la contraseña: ${updateError.message}`, variant: 'destructive' });
        return;
      }

      // Limpiar campos y notificar
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        showCurrentPassword: false,
        showNewPassword: false,
        showConfirmPassword: false,
      });
      toast({ title: t('admin.configuration.messages.passwordUpdated'), description: t('admin.configuration.messages.passwordUpdatedDesc'), variant: 'default' });
    } catch (e: any) {
      toast({ title: t('common.error'), description: e?.message || 'Error al actualizar la contraseña.', variant: 'destructive' });
    } finally {
      setChangingPassword(false);
    }
  };

  // Convertir imagen a JPEG
  const convertToJPEG = (file: File): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const supabase = getSupabaseBrowserClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: 'Error', description: 'Usuario no autenticado.', variant: 'destructive' });
      return;
    }

    const jpegBlob = await convertToJPEG(file);
    if (!jpegBlob) {
      toast({ title: 'Error', description: 'No se pudo convertir la imagen.', variant: 'destructive' });
      return;
    }

    const fileName = `${user.id}-avatar-${Date.now()}.jpg`;
    const { data, error } = await supabase.storage
      .from('avatar')
      .upload(fileName, jpegBlob, { upsert: true });

    if (error) {
      toast({ title: 'Error', description: `No se pudo subir la imagen: ${error.message}` , variant: 'destructive' });
      return;
    }

    const { data: urlData } = supabase.storage.from('avatar').getPublicUrl(fileName);

    // Guardar URL en tabla userlevel
    const { error: updateError } = await supabase
      .from('userlevel')
      .update({ user_image: urlData.publicUrl })
      .eq('id', user.id);

    if (updateError) {
      toast({ title: 'Error', description: `No se pudo guardar la URL: ${updateError.message}`, variant: 'destructive' });
      return;
    }

  // Estado local + callback al contenedor
    setFormData(prev => ({ ...prev, fotoPreview: urlData.publicUrl }));
    onUserImageUpdate?.(urlData.publicUrl);

    toast({ title: 'Éxito', description: 'Foto de perfil actualizada.', variant: 'default' });
  };

  const handleDeletePhoto = async () => {
    if (deletingPhoto) return;
    setDeletingPhoto(true);
    try {
      const supabase = getSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: 'Error', description: 'Usuario no autenticado.', variant: 'destructive' });
        return;
      }

      // Listar archivos y eliminar los del usuario
      const { data: files, error: listError } = await supabase.storage.from('avatar').list();
      if (listError) {
        // Continuar incluso si falla el listado
      }
      const userFiles = (files || []).filter(f => f.name.startsWith(`${user.id}-avatar`));
      const fileNames = userFiles.map(f => f.name);
      if (fileNames.length > 0) {
        await supabase.storage.from('avatar').remove(fileNames);
      }

      // Limpiar referencia en la tabla
      await supabase.from('userlevel').update({ user_image: null }).eq('id', user.id);

      // Estado local + callback
      setFormData(prev => ({ ...prev, fotoPreview: null }));
      onUserImageUpdate?.(undefined);

      toast({ title: 'Foto eliminada', description: 'La foto de perfil ha sido eliminada.', variant: 'default' });
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo eliminar la foto.', variant: 'destructive' });
    } finally {
      setDeletingPhoto(false);
    }
  };

  const handleSaveProfile = () => {
    // Validaciones de longitud solo al guardar (el input ya está limitado, esto es por seguridad extra)
    if (formData.nombre.length > MAX_FIELD_LENGTH || formData.email.length > MAX_FIELD_LENGTH) {
      toast({ title: t('common.error'), description: `Nombre y correo no pueden exceder ${MAX_FIELD_LENGTH} caracteres.`, variant: 'destructive' });
      return;
    }

    if (formData.idioma && ['es', 'en', 'zh'].includes(formData.idioma)) {
      setLanguage(formData.idioma as 'es' | 'en' | 'zh');
    }
    toast({ title: t('admin.configuration.messages.profileUpdated'), description: t('admin.configuration.messages.profileUpdatedDesc'), variant: 'default' });
  };

  if (!mounted) return null;

  return (
    <div className={`min-h-screen flex overflow-x-hidden ${theme === 'dark' ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50'}`}>
      <Sidebar
        isExpanded={sidebarExpanded}
        setIsExpanded={setSidebarExpanded}
        isMobileMenuOpen={isMobileMenuOpen}
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        userRole={role}
      />

      <main className={`transition-all duration-300 flex-1 ${sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'}`}>
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
                <h1 className={`text-xl md:text-2xl lg:text-3xl font-bold ${mounted && theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                  {t('admin.configuration.title')}
                </h1>
                <p className={`text-sm md:text-base ${mounted && theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {t('admin.configuration.subtitle')}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Contenido principal */}
        <div className="p-4 md:p-5 lg:p-6 space-y-6 md:space-y-8">
          <Tabs defaultValue="perfil" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-2 lg:w-auto lg:grid-cols-2 gap-1">
              <TabsTrigger value="perfil" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <User className="w-3 h-3 md:w-4 md:h-4" />
                <span>{t('admin.configuration.tabs.profile')}</span>
              </TabsTrigger>
              <TabsTrigger value="preferencias" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Globe className="w-3 h-3 md:w-4 md:h-4" />
                <span>{t('admin.configuration.tabs.preferences')}</span>
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
                        {t('admin.configuration.profile.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="nombre">{t('admin.configuration.profile.fields.name')}</Label>
                          <Input
                            id="nombre"
                            value={formData.nombre}
                            onChange={(e) => handleInputChange('nombre', e.target.value)}
                            maxLength={MAX_FIELD_LENGTH}
                            placeholder={t('admin.configuration.profile.placeholders.name')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{t('admin.configuration.profile.fields.email')}</Label>
                          <Input
                            id="email"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            maxLength={MAX_FIELD_LENGTH}
                            placeholder={t('admin.configuration.profile.placeholders.email')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="telefono">{t('admin.configuration.profile.fields.phone')}</Label>
                          <Input
                            id="telefono"
                            value={formData.telefono}
                            onChange={(e) => handleInputChange('telefono', e.target.value)}
                            placeholder={t('admin.configuration.profile.placeholders.phone')}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="idioma">{t('admin.configuration.profile.fields.language')}</Label>
                          <Select value={String(formData.idioma)} onValueChange={(value) => handleInputChange('idioma', value)}>
                            <SelectTrigger>
                              <SelectValue placeholder={t('admin.configuration.profile.placeholders.selectLanguage')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="es">🇪🇸 {t('common.spanish')}</SelectItem>
                              <SelectItem value="en">🇺🇸 {t('common.english')}</SelectItem>
                              <SelectItem value="zh">🇨🇳 {t('common.chinese')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleSaveProfile}>
                          <Save className="w-4 h-4 mr-2" />
                          {t('common.save')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Cambiar contraseña */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {t('admin.configuration.password.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t('admin.configuration.password.fields.current')}</Label>
                          <div className="relative">
                            <Input
                              type={passwordData.showCurrentPassword ? 'text' : 'password'}
                              value={passwordData.currentPassword}
                              onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                              maxLength={MAX_FIELD_LENGTH}
                              placeholder={t('admin.configuration.password.placeholders.current')}
                            />
                            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500" onClick={() => setPasswordData(p => ({ ...p, showCurrentPassword: !p.showCurrentPassword }))}>
                              {passwordData.showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>{t('admin.configuration.password.fields.new')}</Label>
                          <div className="relative">
                            <Input
                              type={passwordData.showNewPassword ? 'text' : 'password'}
                              value={passwordData.newPassword}
                              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                              maxLength={MAX_FIELD_LENGTH}
                              placeholder={t('admin.configuration.password.placeholders.new')}
                            />
                            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500" onClick={() => setPasswordData(p => ({ ...p, showNewPassword: !p.showNewPassword }))}>
                              {passwordData.showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>{t('admin.configuration.password.fields.confirm')}</Label>
                          <div className="relative">
                            <Input
                              type={passwordData.showConfirmPassword ? 'text' : 'password'}
                              value={passwordData.confirmPassword}
                              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                              maxLength={MAX_FIELD_LENGTH}
                              placeholder={t('admin.configuration.password.placeholders.confirm')}
                            />
                            <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500" onClick={() => setPasswordData(p => ({ ...p, showConfirmPassword: !p.showConfirmPassword }))}>
                              {passwordData.showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={handleSavePassword} disabled={changingPassword}>
                          <Save className="w-4 h-4 mr-2" />
                          {changingPassword ? t('common.loading') : t('common.save')}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Foto de perfil + Info de la cuenta */}
                <div className="space-y-6">
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Camera className="w-5 h-5" />
                        {t('admin.configuration.profile.profilePicture.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex items-center justify-center">
                          {formData.fotoPreview ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={formData.fotoPreview} alt="avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-14 h-14 md:w-16 md:h-16 text-slate-500" />
                          )}
                        </div>
                        <div className="space-y-2 w-full">
                          <label htmlFor="avatar-upload" className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 hover:bg-slate-50 cursor-pointer text-sm w-full justify-center">
                            <Upload className="w-4 h-4" /> {t('admin.configuration.profile.profilePicture.uploadButton')}
                          </label>
                          <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                className="inline-flex items-center gap-2 w-full justify-center"
                                disabled={!formData.fotoPreview || deletingPhoto}
                              >
                                <Trash2 className="w-4 h-4" /> {t('admin.configuration.profile.profilePicture.deleteButton')}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>{t('admin.configuration.profile.profilePicture.confirmDeleteTitle')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                  {t('common.actionCannotBeUndone')}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={handleDeletePhoto}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                  disabled={deletingPhoto}
                                >
                                  {deletingPhoto ? t('common.loading') : t('common.delete')}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <User className="w-5 h-5" />
                        {t('admin.configuration.profile.accountInfo.title')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{t('admin.configuration.profile.accountInfo.role')}</span>
                        <Badge className="bg-purple-500">{roleData.rol}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{t('admin.configuration.profile.accountInfo.accountStatus')}</span>
                        <Badge className="bg-green-500">{t('admin.configuration.profile.accountInfo.statuses.Activo')}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{t('admin.configuration.profile.accountInfo.memberSince')}</span>
                        <span className="text-sm font-medium">{t('admin.configuration.profile.accountInfo.months.Enero')} 2024</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">{t('admin.configuration.profile.accountInfo.lastLogin')}</span>
                        <span className="text-sm font-medium">{security.ultimoAcceso}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 dark:text-slate-400">IP</span>
                        <span className="text-sm font-mono">{security.ipUltimoAcceso}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* Tab Preferencias */}
            <TabsContent value="preferencias" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      {t('admin.configuration.preferences.regional.title')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="zonaHoraria">{t('admin.configuration.preferences.timezone.title')}</Label>
                      <Select value={formData.zonaHoraria} onValueChange={(value) => handleInputChange('zonaHoraria', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('admin.configuration.preferences.timezone.placeholder')} />
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
                      <Label htmlFor="formatoFecha">{t('admin.configuration.preferences.dateFormat.title')}</Label>
                      <Select defaultValue="dd/mm/yyyy">
                        <SelectTrigger>
                          <SelectValue placeholder={t('admin.configuration.preferences.dateFormat.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dd/mm/yyyy">DD/MM/YYYY</SelectItem>
                          <SelectItem value="mm/dd/yyyy">MM/DD/YYYY</SelectItem>
                          <SelectItem value="yyyy-mm-dd">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="formatoHora">{t('admin.configuration.preferences.timeFormat.title')}</Label>
                      <Select defaultValue="24h">
                        <SelectTrigger>
                          <SelectValue placeholder={t('admin.configuration.preferences.timeFormat.placeholder')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="24h">{t('admin.configuration.preferences.timeFormat.24h')}</SelectItem>
                          <SelectItem value="12h">{t('admin.configuration.preferences.timeFormat.12h')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/80 backdrop-blur-sm border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      {t('admin.configuration.preferences.theme.appearance')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t('admin.configuration.preferences.theme.title')}</Label>
                      <div className="flex gap-2 flex-wrap">
                        <Button
                          variant={mounted && theme === 'light' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTheme('light')}
                          className="flex-1 min-w-0 flex items-center gap-2"
                        >
                          <Sun className="w-4 h-4" />
                          {t('admin.configuration.preferences.theme.light')}
                        </Button>
                        <Button
                          variant={mounted && theme === 'dark' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTheme('dark')}
                          className="flex-1 min-w-0 flex items-center gap-2"
                        >
                          <Moon className="w-4 h-4" />
                          {t('admin.configuration.preferences.theme.dark')}
                        </Button>
                        <Button
                          variant={mounted && theme === 'system' ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setTheme('system')}
                          className="flex-1 min-w-0 flex items-center gap-2"
                        >
                          <Monitor className="w-4 h-4" />
                          {t('admin.configuration.preferences.theme.system')}
                        </Button>
                      </div>
                      {mounted && (
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                          {t('admin.configuration.preferences.theme.currentTheme')}: {theme === 'light' ? t('admin.configuration.preferences.theme.light') : theme === 'dark' ? t('admin.configuration.preferences.theme.dark') : t('admin.configuration.preferences.theme.system')}
                        </p>
                      )}
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>{t('admin.configuration.preferences.theme.fontSize')}</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona el tamaño" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">{t('admin.configuration.preferences.theme.fontSizes.small')}</SelectItem>
                          <SelectItem value="medium">{t('admin.configuration.preferences.theme.fontSizes.medium')}</SelectItem>
                          <SelectItem value="large">{t('admin.configuration.preferences.theme.fontSizes.large')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <Label>{t('admin.configuration.preferences.theme.interfaceDensity')}</Label>
                      <Select defaultValue="comfortable">
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona la densidad" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="compact">{t('admin.configuration.preferences.theme.densities.compact')}</SelectItem>
                          <SelectItem value="comfortable">{t('admin.configuration.preferences.theme.densities.comfortable')}</SelectItem>
                          <SelectItem value="spacious">{t('admin.configuration.preferences.theme.densities.spacious')}</SelectItem>
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
