import { useSupabaseQuery } from './use-supabase-query';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export interface AdminOrder {
  id: string;
  estimatedBudget: number;
}

export function useAdminOrders() {
  const supabase = getSupabaseBrowserClient();

  const queryKey = 'orders-admin-all';

  const result = useSupabaseQuery<{
    totalPedidos: number; // activos (state != 5)
    pedidosPendientes: number; // state == 1
    pedidosTransito: number; // state == 2
    pedidosEntregados: number; // state == 5
    totalIngresos: number; // suma de estimatedBudget para state == 1
  }>(
    queryKey,
    async () => {
      // Usar API server (service role) para contar todos los pedidos, sin limitar por usuario
      const res = await fetch('/api/admin/orders/stats', { cache: 'no-store' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch admin orders stats: ${res.status} ${text}`);
      }
      const json = await res.json();
      return json as {
        totalPedidos: number;
        pedidosPendientes: number;
        pedidosTransito: number;
        pedidosEntregados: number;
        totalIngresos: number;
      };
    },
    { enabled: true }
  );

  return result;
}
