import { useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface AdminOrderListItem {
  id: string;
  state: number;
  productName: string;
  description: string;
  client_id: string;
  clientName: string | null;
  asignedEVzla: string | null;
  asignedEChina: string | null;
  created_at: string;
  estimatedBudget: number | null;
  reputation: number | null;
  pdfRoutes: string | null;
}

export function useAdminOrdersList() {
  const supabase = getSupabaseBrowserClient();
  const [data, setData] = useState<AdminOrderListItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [{ data: orders, error: ordersError }, { data: clients, error: clientsError }] = await Promise.all([
        supabase
          .from('orders')
          .select('id, state, productName, description, client_id, asignedEVzla, asignedEChina, created_at, estimatedBudget, reputation, pdfRoutes')
          // FIFO: más antiguos primero
          .order('created_at', { ascending: true }),
        supabase
          .from('clients')
          .select('user_id, name'),
      ]);

      if (ordersError) throw ordersError;
      if (clientsError) throw clientsError;

      const clientMap = new Map((clients ?? []).map((c: any) => [c.user_id, c.name]));

      const result = (orders ?? []).map((o: any) => ({
        id: o.id,
        state: o.state,
        productName: o.productName ?? '',
        description: o.description ?? '',
        client_id: o.client_id,
        clientName: clientMap.get(o.client_id) ?? null,
        asignedEVzla: o.asignedEVzla ?? null,
        asignedEChina: o.asignedEChina ?? null,
        created_at: o.created_at,
        estimatedBudget: o.estimatedBudget ?? null,
        reputation: o.reputation ?? null,
        pdfRoutes: o.pdfRoutes ?? null,
      }));

      setData(result);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();

    // Suscripciones realtime para las tablas orders y clients
    const ordersChannel = supabase
      .channel('admin-orders-list-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('Realtime: Orders changed', payload);
        fetchData();
      })
      .subscribe((status) => {
        console.log('Realtime orders subscription status:', status);
      });

    const clientsChannel = supabase
      .channel('admin-orders-clients-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, (payload) => {
        console.log('Realtime: Clients changed', payload);
        fetchData();
      })
      .subscribe((status) => {
        console.log('Realtime clients subscription status:', status);
      });

    return () => {
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(clientsChannel);
    };
  }, [fetchData, supabase]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
