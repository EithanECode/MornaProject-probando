"use client";

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { ChatMessage, SendMessagePayload } from '@/lib/types/chat';

interface UseChatMessagesOptions {
    conversationUserId: string | null;
    currentUserId: string | null;
    currentUserRole: 'admin' | 'china';
}

export function useChatMessages({ conversationUserId, currentUserId, currentUserRole }: UseChatMessagesOptions) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const supabase = getSupabaseBrowserClient();

    // Cargar mensajes de la conversación
    const loadMessages = useCallback(async () => {
        if (!conversationUserId || !currentUserId) {
            setMessages([]);
            setLoading(false);
            return;
        }

        try {
            // Solo mostrar loading si NO hay mensajes aún (primera carga)
            if (messages.length === 0) {
                setLoading(true);
            }
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('chat_messages')
                .select('*')
                .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${conversationUserId}),and(sender_id.eq.${conversationUserId},receiver_id.eq.${currentUserId})`)
                .order('created_at', { ascending: true });

            if (fetchError) {
                throw fetchError;
            }

            setMessages(data || []);
        } catch (err) {
            console.error('Error loading messages:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    }, [conversationUserId, currentUserId, supabase, messages.length]);

    // Enviar mensaje
    const sendMessage = useCallback(async (payload: SendMessagePayload) => {
        if (!currentUserId) {
            setError('No hay usuario autenticado');
            return false;
        }

        try {
            setSending(true);
            setError(null);

            // Determinar rol del receptor
            const receiverRole = currentUserRole === 'admin' ? 'china' : 'admin';

            // Crear mensaje optimista (se muestra instantáneamente)
            const optimisticMessage: ChatMessage = {
                id: `temp-${Date.now()}`, // ID temporal
                sender_id: currentUserId,
                sender_role: currentUserRole,
                receiver_id: payload.receiver_id,
                receiver_role: receiverRole,
                message: payload.message || null,
                file_url: payload.file_url || null,
                file_name: payload.file_name || null,
                file_type: payload.file_type || null,
                file_size: payload.file_size || null,
                read: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            // Agregar mensaje optimísticamente (aparece instantáneamente)
            setMessages(prev => [...prev, optimisticMessage]);

            // Guardar en BD en segundo plano
            const { data: newMessage, error: insertError } = await supabase
                .from('chat_messages')
                .insert({
                    sender_id: currentUserId,
                    sender_role: currentUserRole,
                    receiver_id: payload.receiver_id,
                    receiver_role: receiverRole,
                    message: payload.message || null,
                    file_url: payload.file_url || null,
                    file_name: payload.file_name || null,
                    file_type: payload.file_type || null,
                    file_size: payload.file_size || null,
                    read: false,
                })
                .select()
                .single();

            if (insertError) {
                // Si falla, quitar el mensaje optimista
                setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
                throw insertError;
            }

            // Reemplazar mensaje temporal con el real (tiene ID de BD)
            setMessages(prev =>
                prev.map(msg => msg.id === optimisticMessage.id ? newMessage : msg)
            );

            return true;
        } catch (err) {
            console.error('Error sending message:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
            return false;
        } finally {
            setSending(false);
        }
    }, [currentUserId, currentUserRole, supabase]);

    // Marcar mensajes como leídos
    const markAsRead = useCallback(async (conversationUserId: string) => {
        if (!currentUserId) return;

        try {
            const { error } = await supabase
                .from('chat_messages')
                .update({ read: true })
                .eq('sender_id', conversationUserId)
                .eq('receiver_id', currentUserId)
                .eq('read', false);

            if (error) {
                console.error('Error marking messages as read:', error);
                return;
            }

            // Actualizar mensajes localmente
            setMessages(prev =>
                prev.map(msg =>
                    msg.sender_id === conversationUserId && !msg.read
                        ? { ...msg, read: true }
                        : msg
                )
            );
        } catch (err) {
            console.error('Error marking messages as read:', err);
        }
    }, [currentUserId, supabase]);

    // Cargar mensajes al montar o cuando cambie la conversación
    useEffect(() => {
        loadMessages();
    }, [loadMessages]);

    // Marcar como leídos cuando se abra la conversación
    useEffect(() => {
        if (conversationUserId && messages.length > 0) {
            markAsRead(conversationUserId);
        }
    }, [conversationUserId, messages.length, markAsRead]);

    return {
        messages,
        loading,
        sending,
        error,
        sendMessage,
        markAsRead,
        refetch: loadMessages,
    };
}
