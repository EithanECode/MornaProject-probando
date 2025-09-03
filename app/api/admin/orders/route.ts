import { NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = getSupabaseServiceRoleClient();

    const [{ data: orders, error: ordersError }, { data: clients, error: clientsError }] = await Promise.all([
      supabase
        .from('orders')
        .select('id, state, productName, description, client_id, asignedEVzla, asignedEChina, created_at, estimatedBudget, reputation, pdfRoutes'),
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

    return NextResponse.json(result, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('GET /api/admin/orders error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
