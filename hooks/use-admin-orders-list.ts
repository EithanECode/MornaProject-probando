import { useSupabaseQuery } from './use-supabase-query';

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
  return useSupabaseQuery<AdminOrderListItem[]>(
    'admin-orders-list',
    async () => {
      const res = await fetch('/api/admin/orders', { cache: 'no-store' });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch admin orders: ${res.status} ${text}`);
      }
      const json = await res.json();
      return json as AdminOrderListItem[];
    },
    { enabled: true }
  );
}
