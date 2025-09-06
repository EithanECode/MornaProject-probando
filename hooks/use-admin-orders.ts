import { useState, useEffect, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface AdminOrder {
  id: string;
  estimatedBudget: number;
}

export function useAdminOrders() {
  const supabase = getSupabaseBrowserClient();
  const [data, setData] = useState<{
    totalPedidos: number;
    pedidosPendientes: number;
    pedidosTransito: number;
    pedidosEntregados: number;
    totalIngresos: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        totalActivosRes,
        pendientesRes,
        transitoRes,
        entregadosRes,
        ingresosRes,
      ] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact', head: true }).neq('state', 5),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('state', 1),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('state', 2),
        supabase.from('orders').select('id', { count: 'exact', head: true }).eq('state', 5),
        supabase.from('orders').select('estimatedBudget').eq('state', 1),
      ]);

      if (totalActivosRes.error) throw totalActivosRes.error;
      if (pendientesRes.error) throw pendientesRes.error;
      if (transitoRes.error) throw transitoRes.error;
      if (entregadosRes.error) throw entregadosRes.error;
      if (ingresosRes.error) throw ingresosRes.error;

      const totalPedidos = totalActivosRes.count ?? 0;
      const pedidosPendientes = pendientesRes.count ?? 0;
      const pedidosTransito = transitoRes.count ?? 0;
      const pedidosEntregados = entregadosRes.count ?? 0;
      const totalIngresos = (ingresosRes.data ?? []).reduce((acc: number, row: any) => acc + (row.estimatedBudget ?? 0), 0);

      setData({ totalPedidos, pedidosPendientes, pedidosTransito, pedidosEntregados, totalIngresos });
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchData();

    // Suscripción realtime para la tabla orders
    const ordersChannel = supabase
      .channel('admin-orders-stats-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        console.log('Realtime: Orders stats changed', payload);
        fetchData();
      })
      .subscribe((status) => {
        console.log('Realtime orders stats subscription status:', status);
      });

    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, [fetchData, supabase]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch };
}
