export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = getSupabaseServiceRoleClient();

    // Counts using head:true to avoid transferring rows
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
      supabase.from('orders').select('estimatedBudget').eq('state', 1), // sum client-side
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
