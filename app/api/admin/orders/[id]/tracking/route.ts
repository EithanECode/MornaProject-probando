import { NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });

    const supabase = getSupabaseServiceRoleClient();

    // Obtener box_id del pedido
    const { data: orderRow, error: orderErr } = await supabase
      .from('orders')
      .select('id, box_id')
      .eq('id', id)
      .single();
    if (orderErr) throw orderErr;

    const boxId = (orderRow as any)?.box_id ?? null;
    if (boxId == null) {
      return NextResponse.json({}, { status: 200, headers: { 'Cache-Control': 'no-store' } });
    }

    // Mapear a container_id
    const { data: boxRow, error: boxErr } = await supabase
      .from('boxes')
      .select('container_id')
      .eq('box_id', boxId)
      .maybeSingle();
    if (boxErr) throw boxErr;

    const containerId = (boxRow as any)?.container_id ?? null;
    if (containerId == null) {
      return NextResponse.json({}, { status: 200, headers: { 'Cache-Control': 'no-store' } });
    }

    // Obtener datos de tracking del contenedor
    const { data: containerRow, error: contErr } = await supabase
      .from('containers')
      .select('tracking_number, tracking_company, arrive_date, tracking_link')
      .eq('container_id', containerId)
      .single();
    if (contErr) throw contErr;

    return NextResponse.json(containerRow || {}, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
