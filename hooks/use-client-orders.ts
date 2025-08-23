import { useSupabaseQuery } from './use-supabase-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useClientContext } from '@/lib/ClientContext';

export interface ClientOrder {
  id: string;
  productName: string;
  estimatedBudget: number;
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
        .select('id, productName, estimatedBudget, state')
        .eq('client_id', clientId);
      if (error) throw error;
      return data || [];
    },
    { enabled: !!clientId }
  );

  return result;
}
