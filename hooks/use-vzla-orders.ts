import { useSupabaseQuery } from './use-supabase-query';
import { useVzlaContext } from '@/lib/VzlaContext';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export function useVzlaOrders() {
  const { vzlaId } = useVzlaContext();
  const queryKey = `orders-vzla-${vzlaId}`;
  const queryFn = async () => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase
      .from('orders')
      .select('id, state, reputation, asignedEVzla')
      .eq('asignedEVzla', vzlaId);
    if (error) throw new Error(error.message);
    return data;
  };
  const { data, loading, error, refetch, isStale } = useSupabaseQuery(queryKey, queryFn);
  return { data, loading, error, refetch, isStale };
}
