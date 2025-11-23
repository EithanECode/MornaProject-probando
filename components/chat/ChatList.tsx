"use client";

import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, MessageCircle } from 'lucide-react';
import type { ChatConversation } from '@/lib/types/chat';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from 'react';

interface ChatListProps {
    onSelectConversation: (userId: string, userName: string) => void;
    selectedUserId: string | null;
    currentUserId: string | null;
}

export function ChatList({ onSelectConversation, selectedUserId, currentUserId }: ChatListProps) {
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const supabase = getSupabaseBrowserClient();

    useEffect(() => {
        const loadConversations = async () => {
            if (!currentUserId) {
                setConversations([]);
                setLoading(false);
                return;
            }

            try {
                setLoading(true);

                console.log('🔍 Cargando conversaciones para admin:', currentUserId);

                // Obtener todos los mensajes donde el admin es sender o receiver
                const { data: messages, error: messagesError } = await supabase
                    .from('chat_messages')
                    .select('*')
                    .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
                    .order('created_at', { ascending: false });

                if (messagesError) {
                    console.error('❌ Error loading messages:', messagesError);
                    setConversations([]);
                    setLoading(false);
                    return;
                }

                console.log('📨 Mensajes obtenidos:', messages?.length);

                // Agrupar por usuario (China)
                const conversationsMap = new Map<string, ChatConversation>();

                for (const msg of messages || []) {
                    const chinaUserId = msg.sender_id === currentUserId ? msg.receiver_id : msg.sender_id;

                    if (!conversationsMap.has(chinaUserId)) {
                        // Contar mensajes no leídos
                        const unreadCount = (messages || []).filter(
                            m => m.sender_id === chinaUserId && m.receiver_id === currentUserId && !m.read
                        ).length;

                        conversationsMap.set(chinaUserId, {
                            user_id: chinaUserId,
                            user_email: '', // Lo obtendremos después
                            user_name: 'Usuario',
                            last_message: msg.message,
                            last_message_time: msg.created_at,
                            unread_count: unreadCount,
                            last_file_url: msg.file_url,
                        });
                    }
                }

                const conversationsList = Array.from(conversationsMap.values());

                // Obtener información de usuarios desde userlevel
                for (const conv of conversationsList) {
                    const { data: userData } = await supabase
                        .from('userlevel')
                        .select('id, user_level')
                        .eq('id', conv.user_id)
                        .single();

                    if (userData) {
                        conv.user_name = `Usuario ${userData.user_level}`;
                    }
                }

                console.log('✅ Conversaciones procesadas:', conversationsList);
                setConversations(conversationsList);
            } catch (error) {
                console.error('❌ Exception loading conversations:', error);
                setConversations([]);
            } finally {
                setLoading(false);
            }
        };

        loadConversations();
        const interval = setInterval(loadConversations, 30000);
        return () => clearInterval(interval);
    }, [currentUserId, supabase]);

    const filteredConversations = conversations.filter((conv) =>
        conv.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.user_email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Buscador */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    type="text"
                    placeholder="Buscar conversación..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-50 border-slate-200 focus:border-blue-300 focus:ring-blue-200 transition-all"
                />
            </div>

            {/* Lista */}
            <ScrollArea className="h-[500px] pr-4">
                {filteredConversations.length === 0 ? (
                    <div className="text-center py-12">
                        <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-500">
                            {searchQuery ? 'No se encontraron conversaciones' : 'No hay conversaciones aún'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredConversations.map((conv) => (
                            <button
                                key={conv.user_id}
                                onClick={() => onSelectConversation(conv.user_id, conv.user_name)}
                                className={`w-full p-4 rounded-xl transition-all duration-300 text-left group ${selectedUserId === conv.user_id
                                    ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-md'
                                    : 'bg-white hover:bg-slate-50 border-2 border-slate-100 hover:border-slate-200 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="relative">
                                        <Avatar className="w-12 h-12 border-2 border-white shadow-sm">
                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold">
                                                {conv.user_name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        {conv.unread_count > 0 && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                                                <span className="text-[10px] text-white font-bold">{conv.unread_count}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-slate-800 truncate group-hover:text-blue-600 transition-colors">
                                                {conv.user_name}
                                            </h3>
                                            {conv.last_message_time && (
                                                <span className="text-xs text-slate-400 shrink-0 ml-2">
                                                    {format(new Date(conv.last_message_time), 'HH:mm', { locale: es })}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-slate-500 truncate mb-2">
                                            {conv.user_email}
                                        </p>

                                        {conv.last_message && (
                                            <p className="text-sm text-slate-600 truncate">
                                                {conv.last_file_url ? '📎 Archivo adjunto' : conv.last_message}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
}
