import { useEffect, useRef, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface OrderRecord {
  id?: string;
  asignedEVzla?: string | null;
  [key: string]: any;
}

type OrdersUpdateCb = () => void;

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

export function useRealtimeVzla(onOrdersUpdate: OrdersUpdateCb, vzlaId?: string) {
  const supabase = getSupabaseBrowserClient();
  const debouncedUpdate = useDebouncedCallback(onOrdersUpdate, 120);

  useEffect(() => {
    if (!vzlaId) {
      console.debug('[Realtime Vzla] No vzlaId -> skip subscribe');
      return;
    }

    const channelName = `vzla-orders-${vzlaId}`;
    console.debug(`[Realtime Vzla] Subscribing channel: ${channelName}`);

    const channel = supabase
      .channel(channelName, { config: { broadcast: { ack: false }, presence: { key: vzlaId } } })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        const { eventType } = payload;
        const newRecord = (payload.new || {}) as OrderRecord;
        const oldRecord = (payload.old || {}) as OrderRecord;

        const wasMine = oldRecord?.asignedEVzla === vzlaId;
        const isMine = newRecord?.asignedEVzla === vzlaId;

        let relevant = false;
        switch (eventType) {
          case 'INSERT':
            relevant = isMine;
            break;
          case 'DELETE':
            relevant = wasMine;
            break;
          case 'UPDATE':
            relevant = isMine || wasMine;
            break;
          default:
            relevant = false;
        }

        if (relevant) {
          console.debug('[Realtime Vzla] Relevant change', { eventType, id: newRecord.id || oldRecord.id });
          debouncedUpdate();
        }
      })
      .subscribe((status) => {
        console.debug('[Realtime Vzla] Channel status:', status);
      });

    return () => {
      console.debug('[Realtime Vzla] Removing channel:', channelName);
      supabase.removeChannel(channel);
    };
  }, [supabase, vzlaId, debouncedUpdate]);
}
