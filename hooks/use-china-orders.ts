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
  created_at?: string;
}

export function useChinaOrders(refreshTrigger?: number) {
  const { chinaId } = useChinaContext();
  const supabase = getSupabaseBrowserClient();

  const queryKey = chinaId ? `orders-china-${chinaId}-${refreshTrigger || 0}` : 'orders-china-undefined';

  const result = useSupabaseQuery<ChinaOrder[]>(
    queryKey,
    async () => {
      if (!chinaId) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('id, state, reputation, estimatedBudget, productName, client_id, created_at')
        .eq('asignedEChina', chinaId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    { enabled: !!chinaId }
  );

  return result;
}
