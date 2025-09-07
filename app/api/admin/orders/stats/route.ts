export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { PENDING_STATES, TRANSIT_STATES, DELIVERED_STATES } from '@/lib/constants/orderStates';

export async function GET() {
  try {
    const supabase = getSupabaseServiceRoleClient();

    // Counts using head:true to avoid transferring rows
    // Construir filtros con in() para reducir llamadas múltiples si se quisiera;
    // aquí mantenemos múltiples queries por simplicidad y head:true.
    const [totalActivosRes, pendientesRes, transitoRes, entregadosRes, ingresosRes] = await Promise.all([
      supabase.from('orders').select('id', { count: 'exact', head: true }).in('state', [...PENDING_STATES, ...TRANSIT_STATES, ...DELIVERED_STATES]),
      supabase.from('orders').select('id', { count: 'exact', head: true }).in('state', PENDING_STATES as any),
      supabase.from('orders').select('id', { count: 'exact', head: true }).in('state', TRANSIT_STATES as any),
      supabase.from('orders').select('id', { count: 'exact', head: true }).in('state', DELIVERED_STATES as any),
      supabase.from('orders').select('estimatedBudget').in('state', PENDING_STATES as any),
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

    return NextResponse.json(
      { totalPedidos, pedidosPendientes, pedidosTransito, pedidosEntregados, totalIngresos },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (err: any) {
    console.error('GET /api/admin/orders/stats error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
