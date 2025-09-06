"use client";
import { useEffect } from 'react';
import { getSupabaseBrowserClient, debugSupabaseRealtime } from '@/lib/supabase/client';

interface Options {
  intervalMs?: number;
  logEvents?: boolean;
  enabled?: boolean;
}

/**
 * Hook de depuración para observar el estado de los canales realtime.
 * Úsalo temporalmente en desarrollo.
 */
export function useSupabaseRealtimeDebug({ intervalMs = 10000, logEvents = true, enabled = process.env.NODE_ENV !== 'production' }: Options = {}) {
  useEffect(() => {
    if (!enabled) return;
    const client = getSupabaseBrowserClient();

    if (logEvents) {
      // @ts-ignore acceso interno
      const originalOn = client.realtime.channel.bind?.(client.realtime.channel);
      console.debug('[RealtimeDebug] Cliente listo.');
    }

    debugSupabaseRealtime();
    const id = setInterval(() => {
      debugSupabaseRealtime();
    }, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, logEvents, enabled]);
}
