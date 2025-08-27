import { useSupabaseQuery } from './use-supabase-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { useChinaContext } from '@/lib/ChinaContext';

export interface ChinaOrder {
  id: string;
  state: number;
  reputation?: number;
  estimatedBudget: number;
  productName: string;
  client_id: string;
}

export function useChinaOrders() {
  const { chinaId } = useChinaContext();
  const supabase = getSupabaseBrowserClient();

  const queryKey = chinaId ? `orders-china-${chinaId}` : 'orders-china-undefined';

  const result = useSupabaseQuery<ChinaOrder[]>(
    queryKey,
    async () => {
      if (!chinaId) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('id, state, reputation, estimatedBudget, productName, client_id')
        .eq('asignedEChina', chinaId);
      if (error) throw error;
      return data || [];
    },
    { enabled: !!chinaId }
  );

  return result;
}
