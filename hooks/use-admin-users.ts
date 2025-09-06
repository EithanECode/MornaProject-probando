
import { useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface AdminUser {
  name: string;
  email: string;
  role: 'client' | 'employee' | 'administrator';
  created_at: string;
  id: string; // user_id de la tabla users
  status?: 'activo' | 'inactivo';
  user_level?: string;
}

export function useAdminUsers() {
  const supabase = getSupabaseBrowserClient();
  const [data, setData] = useState<AdminUser[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Request failed with ${res.status}`);
      }
      const result = await res.json();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    // Suscripciones realtime para las tablas relevantes
    const employeesChannel = supabase
      .channel('admin-employees-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, (payload) => {
        console.log('Realtime: Employees changed', payload);
        fetchData();
      })
      .subscribe((status) => {
        console.log('Realtime employees subscription status:', status);
      });

    const clientsChannel = supabase
      .channel('admin-clients-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, (payload) => {
        console.log('Realtime: Clients changed', payload);
        fetchData();
      })
      .subscribe((status) => {
        console.log('Realtime clients subscription status:', status);
      });

    const adminsChannel = supabase
      .channel('admin-administrators-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'administrators' }, (payload) => {
        console.log('Realtime: Administrators changed', payload);
        fetchData();
      })
      .subscribe((status) => {
        console.log('Realtime administrators subscription status:', status);
      });

    const userlevelChannel = supabase
      .channel('admin-userlevel-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'userlevel' }, (payload) => {
        console.log('Realtime: Userlevel changed', payload);
        fetchData();
      })
      .subscribe((status) => {
        console.log('Realtime userlevel subscription status:', status);
      });

    return () => {
      supabase.removeChannel(employeesChannel);
      supabase.removeChannel(clientsChannel);
      supabase.removeChannel(adminsChannel);
      supabase.removeChannel(userlevelChannel);
    };
  }, [fetchData, supabase]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
