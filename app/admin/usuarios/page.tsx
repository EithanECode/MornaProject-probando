"use client";

import { useMemo, useState, useEffect } from 'react';
import { useAdminUsers } from '@/hooks/use-admin-users';
import { useTranslation } from '@/hooks/useTranslation';

// Estilos para animaciones
const animationStyles = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes fadeOut {
    from {
      opacity: 1;
      transform: translateY(0);
    }
    to {
      opacity: 0;
      transform: translateY(-20px);
    }
  }
`;

// Inyectar estilos en el head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = animationStyles;
  document.head.appendChild(style);
}
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  MoreVertical, 
  Plus, 
  Search, 
  UserCog, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Trash2,
  Filter,
  Users,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  Settings,
  Eye,
  Edit3,
  Archive,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import Header from '@/components/layout/Header';

type UserStatus = 'activo' | 'inactivo';
type UserRole = 'Cliente' | 'Empleado China' | 'Empleado Vzla' | 'Admin';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string; // ISO
}

const ROLE_COLORS: Record<UserRole, string> = {
  'Cliente': 'bg-slate-100 text-slate-800 border-slate-200',
  'Empleado China': 'bg-red-100 text-red-800 border-red-200',
  'Empleado Vzla': 'bg-blue-100 text-blue-800 border-blue-200',
  'Admin': 'bg-purple-100 text-purple-800 border-purple-200',
};

export default function UsuariosPage() {
  const { t } = useTranslation();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const { data: fetchedUsers } = useAdminUsers();
  const [users, setUsers] = useState<User[]>([]);

  // Mapear datos reales del hook a la estructura de la tabla
  useEffect(() => {
    if (Array.isArray(fetchedUsers)) {
      const mapped: User[] = fetchedUsers.map(u => {
        // Preferir user_level para distinguir China/Vzla/Client/Admin
        const lvl = (u as any).user_level?.toLowerCase?.() ?? '';
        let uiRole: UserRole;
        if (lvl === 'admin') uiRole = 'Admin';
        else if (lvl === 'client') uiRole = 'Cliente';
        else if (lvl === 'china') uiRole = 'Empleado China';
        else if (lvl === 'vzla' || lvl === 'venezuela') uiRole = 'Empleado Vzla';
        else {
          // fallback to old mapping
          uiRole = u.role === 'administrator' ? 'Admin' : u.role === 'employee' ? 'Empleado Vzla' : 'Cliente';
        }
        return {
          id: u.id,
          fullName: u.name || 'Sin nombre',
          email: u.email || '—',
          role: uiRole,
          status: (u as any).status === 'inactivo' ? 'inactivo' : 'activo',
          createdAt: u.created_at || '',
        };
      });
      setUsers(mapped);
    }
  }, [fetchedUsers]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');
  const [animationKey, setAnimationKey] = useState(0);

  // Paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Handlers para actualizar filtros con animación
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setAnimationKey(prev => prev + 1);
  };

  const handleRoleFilterChange = (value: 'all' | UserRole) => {
    setRoleFilter(value);
    setAnimationKey(prev => prev + 1);
  };

  const handleStatusFilterChange = (value: 'all' | UserStatus) => {
    setStatusFilter(value);
    setAnimationKey(prev => prev + 1);
  };

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { toast } = useToast();

  const filteredUsers = useMemo(() => {
    const filtered = users.filter((u) => {
      const matchesText =
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesText && matchesRole && matchesStatus;
    });
    
    return filtered;
  }, [users, searchTerm, roleFilter, statusFilter]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filteredUsers.length / pageSize)), [filteredUsers.length, pageSize]);
  const pagedUsers = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, page, pageSize]);

  // Resetear a la primera página al cambiar filtros o dataset
  useEffect(() => {
    setPage(1);
  }, [searchTerm, roleFilter, statusFilter, users.length]);

  function handleOpenCreate() {
    setEditingUser({
      id: `USR-${Math.floor(100 + Math.random() * 900)}`,
      fullName: '',
      email: '',
      role: 'Empleado Vzla',
      status: 'activo',
      createdAt: new Date().toISOString(),
    });
    setIsDialogOpen(true);
  }

  function handleOpenEdit(user: User) {
    setEditingUser({ ...user });
    setIsDialogOpen(true);
  }

  function handleToggleStatus(user: User) {
    const next = user.status === 'activo' ? 'inactivo' : 'activo';
    // Optimistic update
    setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: next } : u)));
    fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, status: next }),
    }).then(async (res) => {
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Error' }));
        // Rollback
        setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: user.status } : u)));
        toast({ title: 'Error al actualizar', description: error || 'No se pudo cambiar el estado' });
        return;
      }
      toast({ title: 'Estado actualizado', description: `${user.fullName} ahora está ${next}.` });
    }).catch(() => {
      setUsers((prev) => prev.map((u) => (u.id === user.id ? { ...u, status: user.status } : u)));
      toast({ title: 'Error al actualizar', description: 'No se pudo cambiar el estado' });
    });
  }

  function handleDelete(user: User) {
    const prevUsers = users;
    // Optimistic remove
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: user.id, hard: false }),
    }).then(async (res) => {
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Error' }));
        setUsers(prevUsers);
        toast({ title: 'Error al eliminar', description: error || 'No se pudo eliminar' });
        return;
      }
      toast({ title: 'Usuario eliminado', description: `${user.fullName} fue eliminado del sistema.` });
    }).catch(() => {
      setUsers(prevUsers);
      toast({ title: 'Error al eliminar', description: 'No se pudo eliminar' });
    });
  }

  function handleSave() {
    if (!editingUser) return;
    // Validaciones simples
    if (!editingUser.fullName || !editingUser.email) {
      toast({ title: 'Datos incompletos', description: 'Nombre y correo son obligatorios.' });
      return;
    }
    const isNew = !/^[0-9a-fA-F-]{36}$/.test(editingUser.id); // id temporal no UUID
    const dbRole: 'administrator' | 'client' | 'employee' = editingUser.role === 'Admin' ? 'administrator' : editingUser.role === 'Cliente' ? 'client' : 'employee';
    const userLevel = editingUser.role === 'Admin'
      ? 'Admin'
      : editingUser.role === 'Cliente'
      ? 'Client'
      : (editingUser.role === 'Empleado China' ? 'China' : 'Vzla');
    const prevUsers = users;

    if (isNew) {
      // Crear usuario nuevo
      fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName: editingUser.fullName, email: editingUser.email, role: dbRole, userLevel }),
      }).then(async (res) => {
        if (!res.ok) {
          const { error } = await res.json().catch(() => ({ error: 'Error' }));
          toast({ title: 'Error al crear', description: error || 'No se pudo crear el usuario' });
          return;
        }
        const created = await res.json();
        // Insertar en lista con datos reales
        const mapped: User = {
          id: created.id,
          fullName: created.name || editingUser.fullName,
          email: created.email || editingUser.email,
          role: (created.user_level?.toLowerCase?.() === 'china') ? 'Empleado China'
                : (created.user_level?.toLowerCase?.() === 'vzla' || created.user_level?.toLowerCase?.() === 'venezuela') ? 'Empleado Vzla'
                : (dbRole === 'administrator' ? 'Admin' : dbRole === 'client' ? 'Cliente' : 'Empleado Vzla'),
          status: 'activo',
          createdAt: created.created_at || new Date().toISOString(),
        };
        setUsers((prev) => [mapped, ...prev]);
        setIsDialogOpen(false);
        setEditingUser(null);
        toast({ title: t('admin.users.messages.userCreated'), description: t('admin.users.messages.userCreatedDesc') });
      }).catch(() => {
        toast({ title: 'Error al crear', description: 'No se pudo crear el usuario' });
      });
      return;
    }

    // Actualizar usuario existente
    const payload: any = {
      id: editingUser.id,
      fullName: editingUser.fullName,
      email: editingUser.email,
      role: dbRole,
      userLevel,
    };
    // Optimistic apply
    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
    fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(async (res) => {
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Error' }));
        setUsers(prevUsers);
        toast({ title: t('admin.users.messages.errorSaving'), description: error || t('admin.users.messages.couldNotSave') });
        return;
      }
      setIsDialogOpen(false);
      setEditingUser(null);
      toast({ title: t('admin.users.messages.changesSaved'), description: t('admin.users.messages.changesSavedDesc') });
    }).catch(() => {
      setUsers(prevUsers);
      toast({ title: t('admin.users.messages.errorSaving'), description: t('admin.users.messages.couldNotSave') });
    });
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
        onMobileMenuClose={() => setIsMobileMenuOpen(false)}
        userRole="admin" 
      />

      <main className={`flex-1 transition-all duration-300 min-w-0 ${sidebarExpanded ? 'lg:ml-72' : 'lg:ml-20'}`}>
        <Header 
          notifications={3}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title={t('admin.users.subtitle')}
          subtitle={t('admin.users.description')}
        />

        <div className="p-4 md:p-5 lg:p-6 space-y-4 md:space-y-5 lg:space-y-6">
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl flex items-center text-black">
                <Users className="w-4 h-4 md:w-5 md:h-5 mr-2 text-blue-600" />
{t('admin.users.listTitle')}
              </CardTitle>
              <CardDescription className="text-sm md:text-base">{t('admin.users.listDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-hidden">
              {/* Filtros Mejorados */}
              <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-4 md:p-5 lg:p-6 mb-4 md:mb-5 lg:mb-6 border border-slate-200">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex flex-col gap-3 md:gap-4 w-full">
                    <div className="relative w-full">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 z-10" />
                      <Input
                        placeholder={t('admin.users.search')}
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pl-10 w-full bg-white/80 backdrop-blur-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full">
                      <Select value={roleFilter} onValueChange={handleRoleFilterChange}>
                        <SelectTrigger className="w-full sm:w-auto bg-white/80 backdrop-blur-sm border-slate-300 focus:border-blue-500">
                          <Filter className="w-4 h-4 mr-2 text-slate-400" />
                          <SelectValue placeholder={t('admin.users.filters.role')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">{t('admin.users.filters.allRoles')}</SelectItem>
                          {(['Cliente','Empleado China','Empleado Vzla','Admin'] as UserRole[]).map((r) => (
                            <SelectItem key={r} value={r}>{t(`admin.users.roles.${r}` as any)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {/* <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                        <SelectTrigger className="w-full sm:w-auto bg-white/80 backdrop-blur-sm border-slate-300 focus:border-blue-500">
                          <UserCheck className="w-4 h-4 mr-2 text-slate-400" />
                          <SelectValue placeholder="Filtrar por estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos</SelectItem>
                          <SelectItem value="activo">Activos</SelectItem>
                          <SelectItem value="inactivo">Inactivos</SelectItem>
                        </SelectContent>
                      </Select> */}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button onClick={handleOpenCreate} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl text-sm md:text-base w-full sm:w-auto">
                          <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" /> {t('admin.users.form.newUser')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{editingUser && users.some(u => u.id === editingUser.id) ? t('admin.users.form.editUser') : t('admin.users.form.createUser')}</DialogTitle>
                          <DialogDescription>{t('admin.users.form.description')}</DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                          <div className="space-y-2">
                            <Label htmlFor="fullName">{t('admin.users.form.fullName')}</Label>
                            <Input
                              id="fullName"
                              value={editingUser?.fullName ?? ''}
                              onChange={(e) => setEditingUser((prev) => prev ? { ...prev, fullName: e.target.value } : prev)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="email">{t('admin.users.form.email')}</Label>
                            <Input
                              id="email"
                              type="email"
                              value={editingUser?.email ?? ''}
                              onChange={(e) => setEditingUser((prev) => prev ? { ...prev, email: e.target.value } : prev)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Rol</Label>
                            <Select
                              value={editingUser?.role ?? 'Empleado Vzla'}
                              onValueChange={(val: UserRole) => setEditingUser((prev) => prev ? { ...prev, role: val } : prev)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder={t('admin.users.form.selectRole')} />
                              </SelectTrigger>
                              <SelectContent>
                                {(['Cliente','Empleado China','Empleado Vzla','Admin'] as UserRole[]).map((r) => (
                                  <SelectItem key={r} value={r}>{t(`admin.users.roles.${r}` as any)}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* <div className="space-y-2">
                            <Label>Estado</Label>
                            <div className="flex items-center justify-between rounded-md border p-2">
                              <span className="text-sm text-slate-600">Activo</span>
                              <Switch
                                checked={(editingUser?.status ?? 'activo') === 'activo'}
                                onCheckedChange={(checked: boolean) => setEditingUser((prev) => prev ? { ...prev, status: checked ? 'activo' : 'inactivo' } : prev)}
                              />
                            </div>
                          </div> */}
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>{t('admin.users.form.cancel')}</Button>
                          <Button onClick={handleSave} className="bg-blue-600 text-white">{t('admin.users.form.save')}</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                  </div>
                </div>
              </div>

                            {/* Vista Desktop - Tabla */}
                            <div className="hidden lg:block rounded-xl border border-slate-200 bg-white/50 backdrop-blur-sm overflow-x-auto">
                              <div className="min-h-[400px] transition-all duration-700 ease-in-out">
                                <table className="w-full table-fixed min-w-full">
                                  <thead className="bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200">
                                    <tr>
                                      <th className="text-left py-4 px-6 text-slate-700 font-semibold" style={{width: '40%'}}>
                                        <div className="flex items-center gap-2">
                                          <Users className="w-4 h-4" />
{t('admin.users.table.user')}
                                        </div>
                                      </th>
                                      <th className="text-left py-4 px-6 text-slate-700 font-semibold" style={{width: '15%'}}>
                                        <div className="flex items-center gap-2">
                                          <Shield className="w-4 h-4" />
{t('admin.users.table.role')}
                                        </div>
                                      </th>
                                      <th className="text-left py-4 px-6 text-slate-700 font-semibold" style={{width: '15%'}}>
                                        <div className="flex items-center gap-2">
                                          <Calendar className="w-4 h-4" />
{t('admin.users.table.createdAt')}
                                        </div>
                                      </th>
                                      <th className="text-left py-4 px-6 text-slate-700 font-semibold" style={{width: '15%'}}>
                                        <div className="flex items-center gap-2">
                                          <Settings className="w-4 h-4" />
{t('admin.users.table.actions')}
                                        </div>
                                      </th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-100">
                                    {pagedUsers.map((user, index) => (
                                      <tr 
                                        key={`${user.id}-${animationKey}`}
                                        className="hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-slate-50/50 transition-all duration-300 ease-out group"
                                        style={{
                                          animationDelay: `${index * 50}ms`,
                                          animation: 'fadeInUp 0.6s ease-out forwards'
                                        }}
                                      >
                                        <td className="py-4 px-6" style={{width: '40%'}}>
                                          <div className="flex items-center gap-4">
                                            <Avatar className="h-12 w-12 ring-2 ring-slate-100 group-hover:ring-blue-200 transition-all duration-200 flex-shrink-0">
                                              <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 font-semibold">
                                                {user.fullName
                                                  .split(' ')
                                                  .map((n) => n[0])
                                                  .slice(0, 2)
                                                  .join('')}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0 flex-1">
                                              <div className="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors truncate">{user.fullName}</div>
                                              <div className="text-sm text-slate-600 flex items-center gap-1 truncate">
                                                <Mail className="w-3 h-3 flex-shrink-0" />
                                                <span className="truncate">{user.email}</span>
                                              </div>
                                              <div className="text-xs text-slate-400 font-mono truncate">{user.id}</div>
                                            </div>
                                          </div>
                                        </td>
                                        <td className="py-4 px-6" style={{width: '15%'}}>
                                          <Badge className={`${ROLE_COLORS[user.role]} border font-medium px-3 py-1`}>
                                            {t(`admin.users.roles.${user.role}` as any)}
                                          </Badge>
                                        </td>
                                        <td className="py-4 px-6" style={{width: '15%'}}>
                                          <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                            <span className="truncate">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-VE') : '—'}</span>
                                          </div>
                                        </td>
                                        <td className="py-4 px-6" style={{width: '15%'}}>
                                          <div className="flex items-center gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleOpenEdit(user)}
                                              className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                                            >
                                              <Edit3 className="w-4 h-4" />
                                            </Button>
                                            {/* <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleToggleStatus(user)}
                                              className={`h-8 w-8 p-0 transition-all duration-200 ${
                                                user.status === 'activo' 
                                                  ? 'hover:bg-red-100 hover:text-red-700' 
                                                  : 'hover:bg-green-100 hover:text-green-700'
                                              }`}
                                            >
                                              {user.status === 'activo' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                            </Button> */}
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleDelete(user)}
                                              className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                                            >
                                              <Trash2 className="w-4 h-4" />
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>

                            {/* Vista Mobile/Tablet - Cards */}
                            <div className="lg:hidden space-y-3 md:space-y-4">
                              {pagedUsers.map((user, index) => (
                                <div
                                  key={`${user.id}-${animationKey}`}
                                  className="bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 p-4 md:p-5 hover:shadow-lg transition-all duration-300 group"
                                  style={{
                                    animationDelay: `${index * 50}ms`,
                                    animation: 'fadeInUp 0.6s ease-out forwards'
                                  }}
                                >
                                                                                                        <div className="flex flex-col gap-3 md:gap-4 w-full">
                                     <div className="flex items-center gap-3 md:gap-4 w-full">
                                       <Avatar className="h-12 w-12 md:h-14 md:w-14 ring-2 ring-slate-100 group-hover:ring-blue-200 transition-all duration-200 flex-shrink-0">
                                         <AvatarFallback className="bg-gradient-to-br from-blue-100 to-blue-200 text-blue-800 font-semibold text-sm md:text-base">
                                           {user.fullName
                                             .split(' ')
                                             .map((n) => n[0])
                                             .slice(0, 2)
                                             .join('')}
                                         </AvatarFallback>
                                       </Avatar>
                                       <div className="min-w-0 flex-1">
                                         <div className="font-semibold text-slate-900 group-hover:text-blue-900 transition-colors text-sm md:text-base">{user.fullName}</div>
                                         <div className="text-xs md:text-sm text-slate-600 flex items-center gap-1 mt-1">
                                           <Mail className="w-3 h-3 flex-shrink-0" />
                                           <span className="truncate">{user.email}</span>
                                         </div>
                                         <div className="text-xs text-slate-400 font-mono mt-1">{user.id}</div>
                                       </div>
                                     </div>
                                     <div className="flex flex-col gap-2 w-full">
                                       <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                                         <Badge className={`${ROLE_COLORS[user.role]} border font-medium px-2 py-1 text-xs`}>
                                           {user.role}
                                         </Badge>
                                         {user.status === 'activo' ? (
                                           <Badge className="bg-green-100 text-green-800 border border-green-200 font-medium px-2 py-1 text-xs">
                                             <CheckCircle className="w-3 h-3 mr-1" /> Activo
                                           </Badge>
                                         ) : (
                                           <Badge className="bg-red-100 text-red-800 border border-red-200 font-medium px-2 py-1 text-xs">
                                             <XCircle className="w-3 h-3 mr-1" /> Inactivo
                                           </Badge>
                                         )}
                                       </div>
                                       <div className="flex items-center gap-1 text-xs text-slate-500">
                                         <Calendar className="w-3 h-3" />
                                         <span>{new Date(user.createdAt).toLocaleDateString('es-VE')}</span>
                                       </div>
                                     </div>
                                   </div>
                                                                     <div className="flex items-center justify-end gap-1 md:gap-2 mt-3 md:mt-4 pt-3 md:pt-4 border-t border-slate-100 w-full">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleOpenEdit(user)}
                                      className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-blue-100 hover:text-blue-700 transition-all duration-200"
                                    >
                                      <Edit3 className="w-3 h-3 md:w-4 md:h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleToggleStatus(user)}
                                      className={`h-7 w-7 md:h-8 md:w-8 p-0 transition-all duration-200 ${
                                        user.status === 'activo' 
                                          ? 'hover:bg-red-100 hover:text-red-700' 
                                          : 'hover:bg-green-100 hover:text-green-700'
                                      }`}
                                    >
                                      {user.status === 'activo' ? <UserX className="w-3 h-3 md:w-4 md:h-4" /> : <UserCheck className="w-3 h-3 md:w-4 md:h-4" />}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDelete(user)}
                                      className="h-7 w-7 md:h-8 md:w-8 p-0 hover:bg-red-100 hover:text-red-700 transition-all duration-200"
                                    >
                                      <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Estado vacío */}
                            {filteredUsers.length === 0 && (
                              <div className="text-center py-12 md:py-16">
                                <div 
                                  className="flex flex-col items-center gap-3 md:gap-4 text-slate-500"
                                  style={{
                                    animation: 'fadeInUp 0.6s ease-out forwards'
                                  }}
                                >
                                  <Users className="w-10 h-10 md:w-12 md:h-12 text-slate-300" />
                                  <p className="text-base md:text-lg font-medium">No se encontraron usuarios</p>
                                  <p className="text-xs md:text-sm">Intenta ajustar los filtros de búsqueda</p>
                                </div>
                              </div>
                            )}
                            {/* Controles de paginación */}
                            {filteredUsers.length > 0 && (
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                                <div className="text-xs text-slate-600">
                                  Mostrando {Math.min((page - 1) * pageSize + 1, filteredUsers.length)}–{Math.min(page * pageSize, filteredUsers.length)} de {filteredUsers.length}
                                </div>
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-600">Por página</span>
                                    <Select value={String(pageSize)} onValueChange={(v) => setPageSize(parseInt(v))}>
                                      <SelectTrigger className="h-8 w-[84px]">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="20">20</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                                      <ChevronLeft className="w-4 h-4" />
                                    </Button>
                                    <span className="text-xs text-slate-600 w-14 text-center">{page}/{totalPages}</span>
                                    <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                                      <ChevronRight className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}