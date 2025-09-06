'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  MessageSquare, 
  Phone,
  Package,
  Mail
} from 'lucide-react';

// Tipos
interface ChatSupport {
  id: string;
  clientName: string;
  clientId: string;
  lastMessage: string;
  lastMessageTime: string;
  status: 'active' | 'waiting' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  unreadMessages: number;
  orderId?: string;
  email: string;
  phone?: string;
}

// Datos mock
const CHAT_SUPPORT: ChatSupport[] = [
  {
    id: 'CHAT-001',
    clientName: 'Luis Martínez',
    clientId: 'CL-004',
    lastMessage: '¿Cuándo llegará mi pedido?',
    lastMessageTime: '2 min ago',
    status: 'active',
    priority: 'high',
    unreadMessages: 3,
    orderId: 'ORD-2024-004',
    email: 'luis.martinez@email.com',
    phone: '+58 412-123-4567'
  },
  {
    id: 'CHAT-002',
    clientName: 'Patricia López',
    clientId: 'CL-005',
    lastMessage: 'Quiero modificar mi pedido',
    lastMessageTime: '15 min ago',
    status: 'waiting',
    priority: 'medium',
    unreadMessages: 1,
    email: 'patricia.lopez@email.com'
  },
  {
    id: 'CHAT-003',
    clientName: 'Roberto Silva',
    clientId: 'CL-006',
    lastMessage: 'Gracias por la entrega',
    lastMessageTime: '1 hora ago',
    status: 'resolved',
    priority: 'low',
    unreadMessages: 0,
    orderId: 'ORD-2024-005',
    email: 'roberto.silva@email.com',
    phone: '+58 414-987-6543'
  },
  {
    id: 'CHAT-004',
    clientName: 'Carmen Ruiz',
    clientId: 'CL-007',
    lastMessage: 'Tengo un problema con el pago',
    lastMessageTime: '30 min ago',
    status: 'active',
    priority: 'high',
    unreadMessages: 2,
    email: 'carmen.ruiz@email.com',
    phone: '+58 416-555-1234'
  }
];

export default function VenezuelaSoportePage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return [
          'bg-red-100 text-red-800 border-red-200',
          'hover:bg-red-50 hover:border-red-300 hover:ring-1 hover:ring-red-200',
          'dark:hover:brightness-110 dark:hover:ring-1 dark:hover:ring-red-400/20',
          'transition-colors'
        ].join(' ');
      case 'medium':
        return [
          'bg-yellow-100 text-yellow-800 border-yellow-200',
          'hover:bg-yellow-50 hover:border-yellow-300 hover:ring-1 hover:ring-yellow-200',
          'dark:hover:brightness-110 dark:hover:ring-1 dark:hover:ring-yellow-400/20',
          'transition-colors'
        ].join(' ');
      case 'low':
        return [
          'bg-green-100 text-green-800 border-green-200',
          'hover:bg-green-50 hover:border-green-300 hover:ring-1 hover:ring-green-200',
          'dark:hover:brightness-110 dark:hover:ring-1 dark:hover:ring-green-400/20',
          'transition-colors'
        ].join(' ');
      default:
        return [
          'bg-gray-100 text-gray-800 border-gray-200',
          'hover:bg-gray-50 hover:border-gray-300 hover:ring-1 hover:ring-gray-200',
          'dark:hover:brightness-110 dark:hover:ring-1 dark:hover:ring-gray-400/20',
          'transition-colors'
        ].join(' ');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return [
          'bg-green-100 text-green-800 border-green-200',
          // light theme hover (softer)
          'hover:bg-green-50 hover:border-green-300 hover:ring-1 hover:ring-green-200',
          // dark theme hover (subtle brightness + tinted ring)
          'dark:hover:brightness-110 dark:hover:ring-1 dark:hover:ring-green-400/20',
          'transition-colors'
        ].join(' ');
      case 'waiting':
        return [
          'bg-orange-100 text-orange-800 border-orange-200',
          'hover:bg-orange-50 hover:border-orange-300 hover:ring-1 hover:ring-orange-200',
          'dark:hover:brightness-110 dark:hover:ring-1 dark:hover:ring-orange-400/20',
          'transition-colors'
        ].join(' ');
      case 'resolved':
        return [
          'bg-gray-100 text-gray-800 border-gray-200',
          'hover:bg-gray-50 hover:border-gray-300 hover:ring-1 hover:ring-gray-200',
          'dark:hover:brightness-110 dark:hover:ring-1 dark:hover:ring-gray-400/20',
          'transition-colors'
        ].join(' ');
      default:
        return [
          'bg-gray-100 text-gray-800 border-gray-200',
          'hover:bg-gray-50 hover:border-gray-300 hover:ring-1 hover:ring-gray-200',
          'dark:hover:brightness-110 dark:hover:ring-1 dark:hover:ring-gray-400/20',
          'transition-colors'
        ].join(' ');
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'waiting': return 'Esperando';
      case 'resolved': return 'Resuelto';
      default: return 'Desconocido';
    }
  };

  const filteredChats = CHAT_SUPPORT.filter(chat => {
    const matchesSearch = 
      chat.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.clientId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || chat.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || chat.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    active: CHAT_SUPPORT.filter(c => c.status === 'active').length,
    waiting: CHAT_SUPPORT.filter(c => c.status === 'waiting').length,
    resolved: CHAT_SUPPORT.filter(c => c.status === 'resolved').length,
    totalUnread: CHAT_SUPPORT.reduce((sum, chat) => sum + chat.unreadMessages, 0)
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
        userRole="venezuela"
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarExpanded ? 'lg:ml-72 lg:w-[calc(100%-18rem)]' : 'lg:ml-24 lg:w-[calc(100%-6rem)]'
      } w-full`}>
        <Header 
          notifications={stats.totalUnread}
          onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          title="Soporte al Cliente"
          subtitle="Gestiona chats y consultas de clientes"
        />
        
        <div className="p-4 md:p-5 lg:p-6 space-y-6">
          {/* Header de la página */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 md:p-6 text-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-6">
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Soporte al Cliente</h1>
                <p className="text-green-100 mt-1 text-sm md:text-base">Gestiona chats y consultas de clientes</p>
              </div>
              <div className="grid grid-cols-3 md:flex md:items-center md:space-x-4 gap-4">
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs md:text-sm text-green-100">Activos</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{stats.waiting}</p>
                  <p className="text-xs md:text-sm text-green-100">Esperando</p>
                </div>
                <div className="text-center">
                  <p className="text-xl md:text-2xl font-bold">{stats.totalUnread}</p>
                  <p className="text-xs md:text-sm text-green-100">Sin Leer</p>
                </div>
              </div>
            </div>
          </div>

          {/* Barra de búsqueda compacta y alineada a la derecha */}
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
            <CardHeader className="py-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">Lista de chats</CardTitle>
                <div className="w-full sm:w-auto flex items-center justify-end gap-2 md:gap-3 flex-wrap">
                  <Input
                    placeholder="Buscar por cliente o mensaje..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 w-56 md:w-64 px-3"
                  />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-10 w-40 md:w-48 px-3 whitespace-nowrap truncate">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los estados</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="waiting">Esperando</SelectItem>
                      <SelectItem value="resolved">Resuelto</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger className="h-10 w-40 md:w-48 px-3 whitespace-nowrap truncate">
                      <SelectValue placeholder="Prioridad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas las prioridades</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="low">Baja</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Lista de Chats */}
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 lg:gap-6">
            {filteredChats.map((chat) => (
              <Card key={chat.id} className="bg-white/80 backdrop-blur-sm border-slate-200 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{chat.clientName}</CardTitle>
                      <p className="text-sm text-slate-600">{chat.clientId}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getPriorityColor(chat.priority)}>
                        {chat.priority === 'high' ? 'Alta' : chat.priority === 'medium' ? 'Media' : 'Baja'}
                      </Badge>
                      <Badge className={getStatusColor(chat.status)}>
                        {getStatusText(chat.status)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm text-slate-600">{chat.lastMessage}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>Último mensaje:</span>
                      <span className="font-medium">{chat.lastMessageTime}</span>
                    </div>
                    {chat.unreadMessages > 0 && (
                      <div className="flex items-center justify-between text-sm">
                        <span>Mensajes sin leer:</span>
                        <Badge className="bg-red-100 text-red-800">
                          {chat.unreadMessages}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-600">{chat.email}</span>
                    </div>
                    {chat.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">{chat.phone}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-[#202841]/90 text-white hover:bg-[#202841]"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Abrir Chat</span>
                      <span className="sm:hidden">Chat</span>
                    </Button>
                    {chat.orderId && (
                      <Button variant="outline" size="sm" className="flex-shrink-0">
                        <Package className="w-4 h-4" />
                      </Button>
                    )}
                    {chat.phone && (
                      <Button variant="outline" size="sm" className="flex-shrink-0">
                        <Phone className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Estado vacío */}
          {filteredChats.length === 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-slate-200">
              <CardContent className="p-8 md:p-12 text-center">
                <MessageSquare className="w-12 h-12 md:w-16 md:h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-base md:text-lg font-semibold text-slate-900 mb-2">No hay chats activos</h3>
                <p className="text-sm md:text-base text-slate-600">Todos los chats han sido resueltos o no hay coincidencias con los filtros.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
} 