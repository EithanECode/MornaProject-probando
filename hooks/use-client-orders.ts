import { useSupabaseQuery } from './use-supabase-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useClientContext } from '@/lib/ClientContext';
import { useEffect } from 'react';

export interface ClientOrder {
  id: string;
  productName: string;
  estimatedBudget: number;
  totalQuote: number;
  state: number;
}

export function useClientOrders() {
  const { clientId } = useClientContext();
  const supabase = getSupabaseBrowserClient();

  const queryKey = clientId ? `orders-client-${clientId}` : 'orders-client-undefined';

  const result = useSupabaseQuery<ClientOrder[]>(
    queryKey,
    async () => {
      if (!clientId) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('id, productName, estimatedBudget, totalQuote, state')
        .eq('client_id', clientId);
      if (error) throw error;
      return data || [];
    },
    { enabled: !!clientId }
  );

  // Agregar realtime
  useEffect(() => {
    if (!clientId) return;

    const ordersChannel = supabase
      .channel(`client-orders-${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
          filter: `client_id=eq.${clientId}`,
        },
        (payload) => {
          console.log('Realtime: Client orders changed', payload);
          result.refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [clientId, supabase, result.refetch]);

  return result;
}
