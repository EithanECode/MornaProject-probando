"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface UseChatTypingOptions {
    currentUserId: string | null;
    conversationUserId: string | null;
}

export function useChatTyping({ currentUserId, conversationUserId }: UseChatTypingOptions) {
    const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const channelRef = useRef<any>(null);
    const supabase = getSupabaseBrowserClient();

    // Notificar que el usuario está escribiendo (usando Broadcast - NO toca BD)
    const notifyTyping = useCallback(() => {
        if (!currentUserId || !conversationUserId || !channelRef.current) {
            console.log('⚠️ No se puede notificar typing: falta info o canal');
            return;
        }

        // Limpiar timeout anterior
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Debounce: solo enviar broadcast cada 1 segundo para evitar spam
        const now = Date.now();
        const lastBroadcast = (window as any).__lastTypingBroadcast || 0;

        if (now - lastBroadcast > 1000) {
            console.log('⌨️ Enviando broadcast de typing');

            // Enviar mensaje broadcast (efímero, no se guarda en BD)
            channelRef.current.send({
                type: 'broadcast',
                event: 'typing',
                payload: {
                    userId: currentUserId,
                    isTyping: true,
                    timestamp: now,
                },
            });

            (window as any).__lastTypingBroadcast = now;
        }

        // Auto-limpiar después de 1.5 segundos de inactividad
        typingTimeoutRef.current = setTimeout(() => {
            console.log('⏱️ Timeout: dejó de escribir, enviando typing:false');
            if (channelRef.current) {
                channelRef.current.send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: {
                        userId: currentUserId,
                        isTyping: false,
                        timestamp: Date.now(),
                    },
                });
                (window as any).__lastTypingBroadcast = 0;
            }
        }, 1500);
    }, [currentUserId, conversationUserId]);

    // Detener indicador de "escribiendo"
    const stopTyping = useCallback(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }

        if (channelRef.current && currentUserId) {
            channelRef.current.send({
                type: 'broadcast',
                event: 'typing',
                payload: {
                    userId: currentUserId,
                    isTyping: false,
                    timestamp: Date.now(),
                },
            });
        }
    }, [currentUserId]);

    // Configurar canal de broadcast para escuchar typing del otro usuario
    useEffect(() => {
        if (!currentUserId || !conversationUserId) {
            setIsOtherUserTyping(false);
            return;
        }

        console.log('🔌 Configurando canal broadcast para typing');

        // Crear canal único para esta conversación
        const channelName = `chat:${[currentUserId, conversationUserId].sort().join('-')}`;

        const channel = supabase.channel(channelName);
        channelRef.current = channel;

        // Escuchar eventos de typing
        channel
            .on('broadcast', { event: 'typing' }, (payload) => {
                console.log('📡 Broadcast recibido:', payload);

                const { userId, isTyping } = payload.payload;

                // Solo mostrar si es del otro usuario
                if (userId === conversationUserId) {
                    console.log(`${isTyping ? '✍️' : '🛑'} Otro usuario ${isTyping ? 'está' : 'dejó de'} escribir`);
                    setIsOtherUserTyping(isTyping);
                }
            })
            .subscribe((status) => {
                console.log('📡 Estado del canal broadcast:', status);
            });

        return () => {
            console.log('🔌 Desconectando canal broadcast');
            supabase.removeChannel(channel);
            channelRef.current = null;
            stopTyping();
        };
    }, [currentUserId, conversationUserId, supabase, stopTyping]);

    // Limpiar al desmontar
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            stopTyping();
        };
    }, [stopTyping]);

    return {
        isOtherUserTyping,
        notifyTyping,
        stopTyping,
    };
}
