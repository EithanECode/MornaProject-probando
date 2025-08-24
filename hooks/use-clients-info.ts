import { useSupabaseQuery } from './use-supabase-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface ClientInfo {
  user_id: string;
  name: string;
}

export function useClientsInfo() {
  const supabase = getSupabaseBrowserClient();

  const result = useSupabaseQuery<ClientInfo[]>(
    'clients-info',
    async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('user_id, name');
      if (error) throw error;
      return data || [];
    }
  );

  return result;
}
