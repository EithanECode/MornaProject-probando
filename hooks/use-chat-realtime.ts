"use client";

import { useEffect, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { ChatMessage } from '@/lib/types/chat';

interface UseChatRealtimeOptions {
    currentUserId: string | null;
    onNewMessage?: (message: ChatMessage) => void;
    onMessageRead?: (messageId: string) => void;
}

export function useChatRealtime({
    currentUserId,
    onNewMessage,
    onMessageRead,
}: UseChatRealtimeOptions) {
    const supabase = getSupabaseBrowserClient();

    // Suscribirse a nuevos mensajes
    useEffect(() => {
        if (!currentUserId) return;

        const channel = supabase
            .channel(`chat-messages-${currentUserId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `receiver_id=eq.${currentUserId}`,
                },
                (payload) => {
                    const newMessage = payload.new as ChatMessage;
                    console.log('📨 Nuevo mensaje recibido:', newMessage);

                    if (onNewMessage) {
                        onNewMessage(newMessage);
                    }
                }
            )
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'chat_messages',
                    filter: `sender_id=eq.${currentUserId}`,
                },
                (payload) => {
                    const updatedMessage = payload.new as ChatMessage;

                    // Si el mensaje fue marcado como leído
                    if (updatedMessage.read && onMessageRead) {
                        console.log('✅ Mensaje marcado como leído:', updatedMessage.id);
                        onMessageRead(updatedMessage.id);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId, onNewMessage, onMessageRead, supabase]);

    return null;
}
