import { useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface ClientInfo {
  user_id: string;
  name: string;
}

export function useClientsInfo() {
  const supabase = getSupabaseBrowserClient();
  const [data, setData] = useState<ClientInfo[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: result, error: fetchError } = await supabase
        .from('clients')
        .select('user_id, name');
      if (fetchError) throw fetchError;
      setData(result || []);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();

    // Suscripción realtime para la tabla clients
    const clientsChannel = supabase
      .channel('admin-clients-info-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(clientsChannel);
    };
  }, [fetchData, supabase]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
