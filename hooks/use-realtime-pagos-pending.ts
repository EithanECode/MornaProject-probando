import { useEffect, useState, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Hook para obtener en tiempo real la cantidad de pagos pendientes (state=4) para el rol pagos.
 */
export function useRealtimePagosPending() {
  const [pending, setPending] = useState<number | null>(null);
  const supabase = getSupabaseBrowserClient();

  const fetchPending = useCallback(async () => {
    const { count, error } = await supabase
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .eq('state', 4);
    if (!error && typeof count === 'number') setPending(count);
  }, [supabase]);

  useEffect(() => {
    fetchPending();
    const channel = supabase
      .channel('pagos-pending-sidebar')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchPending();
      })
      .subscribe();
    const interval = setInterval(fetchPending, 12000);
    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [fetchPending, supabase]);

  return pending;
}
