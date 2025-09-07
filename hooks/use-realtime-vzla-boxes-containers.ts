import { useEffect, useRef, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface BoxRecord { box_id?: number | string; boxes_id?: number | string; id?: number | string; container_id?: number | string; state?: number; }
interface ContainerRecord { container_id?: number | string; containers_id?: number | string; id?: number | string; state?: number; }

type UpdateCb = () => void;

function useDebouncedCallback(cb: UpdateCb, delay = 150) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestCb = useRef(cb);
  latestCb.current = cb;
  return useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => latestCb.current(), delay);
  }, [delay]);
}

/**
 * Realtime para boxes y containers relacionados a pedidos asignados a un empleado específico.
 * Escucha cambios en tablas boxes y containers y dispara callbacks.
 */
export function useRealtimeVzlaBoxesContainers(onBoxesChange: UpdateCb, onContainersChange: UpdateCb, enabled: boolean = true) {
  const supabase = getSupabaseBrowserClient();
  const debouncedBoxes = useDebouncedCallback(onBoxesChange, 120);
  const debouncedContainers = useDebouncedCallback(onContainersChange, 120);

  useEffect(() => {
    if (!enabled) return;

    const boxesChannel = supabase
      .channel('vzla-boxes-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'boxes' }, (payload) => {
        debouncedBoxes();
      })
      .subscribe((status) => {
        console.debug('[Realtime Boxes] status:', status);
      });

    const containersChannel = supabase
      .channel('vzla-containers-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'containers' }, (payload) => {
        debouncedContainers();
      })
      .subscribe((status) => {
        console.debug('[Realtime Containers] status:', status);
      });

    return () => {
      supabase.removeChannel(boxesChannel);
      supabase.removeChannel(containersChannel);
    };
  }, [supabase, enabled, debouncedBoxes, debouncedContainers]);
}
