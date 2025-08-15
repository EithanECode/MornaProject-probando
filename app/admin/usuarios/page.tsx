"use client";

import { useMemo, useState, useEffect } from 'react';
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
import { MoreVertical, Plus, Search, UserCog, Shield, CheckCircle, XCircle, Trash2 } from 'lucide-react';

type UserStatus = 'activo' | 'inactivo';
type UserRole = 'Cliente' | 'Empleado China' | 'Empleado Vzla' | 'Validador Pagos' | 'Admin';

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
  'Validador Pagos': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'Admin': 'bg-purple-100 text-purple-800 border-purple-200',
};

export default function UsuariosPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const [users, setUsers] = useState<User[]>([
    { id: 'USR-001', fullName: 'María González', email: 'maria@empresa.com', role: 'Admin', status: 'activo', createdAt: '2024-04-01T10:00:00Z' },
    { id: 'USR-002', fullName: 'Carlos Pérez', email: 'carlos@empresa.com', role: 'Empleado Vzla', status: 'activo', createdAt: '2024-05-12T14:30:00Z' },
    { id: 'USR-003', fullName: 'Ana Rodríguez', email: 'ana@empresa.com', role: 'Empleado China', status: 'inactivo', createdAt: '2024-03-22T08:15:00Z' },
    { id: 'USR-004', fullName: 'Luis Martínez', email: 'luis@empresa.com', role: 'Validador Pagos', status: 'activo', createdAt: '2024-06-05T09:45:00Z' },
    { id: 'USR-005', fullName: 'Pedro López', email: 'pedro@empresa.com', role: 'Cliente', status: 'activo', createdAt: '2024-07-10T12:05:00Z' },
    { id: 'USR-006', fullName: 'Lucía Méndez', email: 'lucia@empresa.com', role: 'Empleado Vzla', status: 'activo', createdAt: '2024-07-18T16:20:00Z' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | UserStatus>('all');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { toast } = useToast();

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesText =
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
      return matchesText && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

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
    setUsers((prev) =>
      prev.map((u) => (u.id === user.id ? { ...u, status: u.status === 'activo' ? 'inactivo' : 'activo' } : u))
    );
    toast({ title: 'Estado actualizado', description: `${user.fullName} ahora está ${user.status === 'activo' ? 'inactivo' : 'activo'}.` });
  }

  function handleDelete(user: User) {
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    toast({ title: 'Usuario eliminado', description: `${user.fullName} fue eliminado del sistema.` });
  }

  function handleSave() {
    if (!editingUser) return;
    // Validaciones simples
    if (!editingUser.fullName || !editingUser.email) {
      toast({ title: 'Datos incompletos', description: 'Nombre y correo son obligatorios.' });
      return;
    }
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === editingUser.id);
      if (exists) {
        return prev.map((u) => (u.id === editingUser.id ? editingUser : u));
      }
      return [editingUser, ...prev];
    });
    setIsDialogOpen(false);
    setEditingUser(null);
    toast({ title: 'Cambios guardados', description: 'La información del usuario ha sido actualizada.' });
  }

  return (
    <div
      className={
        `min-h-screen flex ` +
        (mounted && theme === 'dark'
          ? 'bg-slate-900'
          : 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50')
      }
    >
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} userRole="admin" />

      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-72' : 'ml-20'}`}>
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Seguridad y acceso</h1>
                <p className="text-sm text-slate-600">Gestión de usuarios y accesos</p>
              </div>
              <div className="flex items-center space-x-2">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={handleOpenCreate} className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingUser && users.some(u => u.id === editingUser.id) ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
                      <DialogDescription>Define el rol, el estado y los datos de contacto.</DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Nombre completo</Label>
                        <Input
                          id="fullName"
                          value={editingUser?.fullName ?? ''}
                          onChange={(e) => setEditingUser((prev) => prev ? { ...prev, fullName: e.target.value } : prev)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Correo</Label>
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
                            <SelectValue placeholder="Seleccionar rol" />
                          </SelectTrigger>
                          <SelectContent>
                            {(['Cliente','Empleado China','Empleado Vzla','Validador Pagos','Admin'] as UserRole[]).map((r) => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Estado</Label>
                        <div className="flex items-center justify-between rounded-md border p-2">
                          <span className="text-sm text-slate-600">Activo</span>
                          <Switch
                            checked={(editingUser?.status ?? 'activo') === 'activo'}
                            onCheckedChange={(checked: boolean) => setEditingUser((prev) => prev ? { ...prev, status: checked ? 'activo' : 'inactivo' } : prev)}
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleSave} className="bg-blue-600 text-white">Guardar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center text-black">Listado de Usuarios</CardTitle>
              <CardDescription>Administra roles, estados y accesos de la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <Input
                      placeholder="Buscar por nombre, correo o ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 w-72"
                    />
                  </div>
                  <Select value={roleFilter} onValueChange={(v: 'all' | UserRole) => setRoleFilter(v)}>
                    <SelectTrigger className="w-56">
                      <SelectValue placeholder="Filtrar por rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los roles</SelectItem>
                      {(['Cliente','Empleado China','Empleado Vzla','Validador Pagos','Admin'] as UserRole[]).map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={(v: 'all' | UserStatus) => setStatusFilter(v)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="activo">Activos</SelectItem>
                      <SelectItem value="inactivo">Inactivos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-slate-700">Usuario</th>
                      <th className="text-left py-3 px-4 text-slate-700">Rol</th>
                      <th className="text-left py-3 px-4 text-slate-700">Estado</th>
                      <th className="text-left py-3 px-4 text-slate-700">Creado</th>
                      <th className="text-left py-3 px-4 text-slate-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback>
                                {user.fullName
                                  .split(' ')
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-slate-900">{user.fullName}</div>
                              <div className="text-sm text-slate-600">{user.email}</div>
                              <div className="text-xs text-slate-400">{user.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${ROLE_COLORS[user.role]} border`}>{user.role}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          {user.status === 'activo' ? (
                            <Badge className="bg-green-100 text-green-800 border border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" /> Activo
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 border border-red-200">
                              <XCircle className="w-3 h-3 mr-1" /> Inactivo
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-sm">
                          {new Date(user.createdAt).toLocaleDateString('es-VE')}
                        </td>
                        <td className="py-3 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0"><MoreVertical className="w-4 h-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEdit(user)}>
                                <UserCog className="w-4 h-4 mr-2" /> Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                                <Shield className="w-4 h-4 mr-2" /> {user.status === 'activo' ? 'Desactivar' : 'Activar'}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(user)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                    {filteredUsers.length === 0 && (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-slate-500">No se encontraron usuarios</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}