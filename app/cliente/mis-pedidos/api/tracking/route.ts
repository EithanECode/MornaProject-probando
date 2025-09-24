import { NextRequest } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const clientId = searchParams.get('client_id');
    if (!clientId) {
      return Response.json({ error: 'client_id es requerido' }, { status: 400 });
    }

    const supabase = getSupabaseServiceRoleClient();

    // 1) Pedidos del cliente con box_id
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('id, box_id')
      .eq('client_id', clientId);
    if (ordersErr) throw ordersErr;

    const boxIds = (orders || [])
      .map((o: any) => o.box_id)
      .filter((v: any) => v !== null && v !== undefined);

    let boxToContainer: Record<string | number, string | number | null> = {};
    if (boxIds.length > 0) {
      const { data: boxesRows, error: boxesErr } = await supabase
        .from('boxes')
        .select('box_id, container_id')
        .in('box_id', boxIds as any);
      if (boxesErr) throw boxesErr;
      (boxesRows || []).forEach((b: any) => {
        if (b?.box_id !== undefined) boxToContainer[b.box_id] = b?.container_id ?? null;
      });
    }

    const containerIds = Object.values(boxToContainer).filter((v) => v !== null && v !== undefined);

    type ContainerTrack = {
      tracking_number?: string | null;
      tracking_company?: string | null;
      arrive_date?: string | null;
      ['arrive-data']?: string | null;
    };
    const containerInfo: Record<string | number, ContainerTrack> = {};
    if (containerIds.length > 0) {
      const { data: containersRows, error: containersErr } = await supabase
        .from('containers')
        .select('container_id, tracking_number, tracking_company, arrive_date')
        .in('container_id', containerIds as any);
      if (containersErr) throw containersErr;
      (containersRows || []).forEach((c: any) => {
        const cid = c?.container_id;
        if (cid !== undefined) containerInfo[cid] = c as ContainerTrack;
      });
    }

    // Construir mapas por pedido
    const tnMap: Record<string, string | null> = {};
    const tcMap: Record<string, string | null> = {};
    const adMap: Record<string, string | null> = {};

    (orders || []).forEach((row: any) => {
      const containerId = row.box_id != null ? (boxToContainer[row.box_id] ?? null) : null;
      const cInfo = containerId != null ? containerInfo[containerId] : undefined;
      const arrive = cInfo?.arrive_date ?? null;
      const oid = String(row.id);
      tnMap[oid] = cInfo?.tracking_number ?? null;
      tcMap[oid] = cInfo?.tracking_company ?? null;
      adMap[oid] = arrive;
    });

    return Response.json({ tnMap, tcMap, adMap });
  } catch (e: any) {
    return Response.json({ error: e?.message || 'Error obteniendo tracking' }, { status: 500 });
  }
}
