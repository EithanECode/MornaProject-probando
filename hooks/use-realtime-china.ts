import { useEffect, useRef, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

// Tipos básicos (puedes extenderlos si ya tienes tipos en lib/types)
interface OrderRecord {
  id?: string;
  asignedEChina?: string | null;
  [key: string]: any; // fallback
}

type OrdersUpdateCb = () => void;

// Pequeño debounce para agrupar ráfagas de eventos y evitar múltiples fetchs seguidos
function useDebouncedCallback(cb: OrdersUpdateCb, delay = 150) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestCb = useRef(cb);
  latestCb.current = cb;

  return useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      latestCb.current();
    }, delay);
  }, [delay]);
}

export function useRealtimeChina(onOrdersUpdate: OrdersUpdateCb, chinaId?: string) {
  const supabase = getSupabaseBrowserClient();
  const debouncedUpdate = useDebouncedCallback(onOrdersUpdate, 120);

  useEffect(() => {
    if (!chinaId) {
      console.debug('[Realtime China] No chinaId -> skip subscribe');
      return;
    }

    // NOTA: Se podría filtrar server-side usando filtros (eq) si se habilita en RLS + replication.
    // Por ahora escuchamos todos los eventos de orders y filtramos en cliente.
    const channelName = `china-orders-${chinaId}`;
    console.debug(`[Realtime China] Subscribing channel: ${channelName}`);

    const channel = supabase
      .channel(channelName, { config: { broadcast: { ack: false }, presence: { key: chinaId } } })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        const { eventType } = payload;
        const newRecord = (payload.new || {}) as OrderRecord;
        const oldRecord = (payload.old || {}) as OrderRecord;

        const wasMine = oldRecord?.asignedEChina === chinaId;
        const isMine = newRecord?.asignedEChina === chinaId;

        let relevant = false;
        switch (eventType) {
          case 'INSERT':
            relevant = isMine;
            break;
          case 'DELETE':
            relevant = wasMine;
            break;
          case 'UPDATE':
            // relevante si antes no era mío y ahora sí, o si era mío (cambios internos),
            // o si deja de ser mío (para refrescar la lista y sacarlo)
            relevant = isMine || wasMine;
            break;
          default:
            relevant = false;
        }

        if (relevant) {
          console.debug('[Realtime China] Relevant change', { eventType, id: newRecord.id || oldRecord.id });
          debouncedUpdate();
        }
      })
      .subscribe((status) => {
        console.debug('[Realtime China] Channel status:', status);
      });

    return () => {
      console.debug('[Realtime China] Removing channel:', channelName);
      supabase.removeChannel(channel);
    };
  }, [supabase, chinaId, debouncedUpdate]);
}
