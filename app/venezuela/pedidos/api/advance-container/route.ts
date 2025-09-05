import { NextRequest } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest) {
  try {
    const { containerId, nextState } = await req.json();
    if (!containerId || typeof nextState !== 'number') {
      return Response.json({ error: 'containerId y nextState son requeridos' }, { status: 400 });
    }
    const supabase = getSupabaseServiceRoleClient();
    const { error } = await supabase
      .from('containers')
      .update({ state: nextState })
      .eq('container_id', containerId);
    if (error) throw error;

    // Si el contenedor fue marcado como recibido (p.ej. nextState === 4),
    // actualizar en cascada: cajas -> estado 5, pedidos -> estado 10
    if (nextState === 4) {
      // Obtener ids de las cajas del contenedor
      const { data: boxes, error: boxesErr } = await supabase
        .from('boxes')
        .select('box_id')
        .eq('container_id', containerId);
      if (boxesErr) throw boxesErr;

      const boxIds = (boxes || [])
        .map((b: any) => b.box_id)
        .filter((id: any) => id !== null && id !== undefined);

      if (boxIds.length > 0) {
        // Actualizar cajas a estado 5
        const { error: updBoxesErr } = await supabase
          .from('boxes')
          .update({ state: 5 })
          .in('box_id', boxIds as any);
        if (updBoxesErr) throw updBoxesErr;

        // Actualizar pedidos de esas cajas a estado 10
        const { error: updOrdersErr } = await supabase
          .from('orders')
          .update({ state: 10 })
          .in('box_id', boxIds as any);
        if (updOrdersErr) throw updOrdersErr;
      }
    }

    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Error actualizando estado de contenedor' }, { status: 500 });
  }
}
