"use client";

import { useEffect, useState, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import type { TypingPayload } from '@/lib/types/chat';

interface UseChatTypingOptions {
    currentUserId: string | null;
    conversationUserId: string | null;
}

export function useChatTyping({ currentUserId, conversationUserId }: UseChatTypingOptions) {
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    const supabase = getSupabaseBrowserClient();

    // Enviar estado de "escribiendo..."
    const setTyping = useCallback(async (isTyping: boolean) => {
        if (!currentUserId || !conversationUserId) return;

        try {
            await supabase
                .from('chat_typing_status')
                .upsert({
                    user_id: currentUserId,
                    typing_to_id: conversationUserId,
                    is_typing: isTyping,
                    updated_at: new Date().toISOString(),
                }, {
                    onConflict: 'user_id,typing_to_id',
                });
        } catch (err) {
            console.error('Error setting typing status:', err);
        }
    }, [currentUserId, conversationUserId, supabase]);

    // Notificar que el usuario está escribiendo (con timeout automático)
    const notifyTyping = useCallback(() => {
        // Limpiar timeout anterior
        if (typingTimeout) {
            clearTimeout(typingTimeout);
        }

        // Enviar estado de "escribiendo"
        setTyping(true);

        // Auto-limpiar después de 3 segundos
        const timeout = setTimeout(() => {
            setTyping(false);
        }, 3000);

        setTypingTimeout(timeout);
    }, [setTyping, typingTimeout]);

    // Detener indicador de "escribiendo"
    const stopTyping = useCallback(() => {
        if (typingTimeout) {
            clearTimeout(typingTimeout);
            setTypingTimeout(null);
        }
        setTyping(false);
    }, [setTyping, typingTimeout]);

    // Escuchar estado de typing del otro usuario
    useEffect(() => {
        if (!currentUserId || !conversationUserId) {
            setIsOtherUserTyping(false);
            return;
        }

        const channel = supabase
            .channel(`typing-status-${currentUserId}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'chat_typing_status',
                    filter: `typing_to_id=eq.${currentUserId}`,
                },
                (payload) => {
                    const typingStatus = payload.new as any;

                    // Solo mostrar si es del usuario con quien estamos chateando
                    if (typingStatus.user_id === conversationUserId) {
                        setIsOtherUserTyping(typingStatus.is_typing);

                        // Auto-ocultar después de 5 segundos si no hay actualización
                        if (typingStatus.is_typing) {
                            setTimeout(() => {
                                setIsOtherUserTyping(false);
                            }, 5000);
                        }
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            stopTyping();
        };
    }, [currentUserId, conversationUserId, supabase, stopTyping]);

    // Limpiar al desmontar
    useEffect(() => {
        return () => {
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
            stopTyping();
        };
    }, [typingTimeout, stopTyping]);

    return {
        isOtherUserTyping,
        notifyTyping,
        stopTyping,
    };
}
