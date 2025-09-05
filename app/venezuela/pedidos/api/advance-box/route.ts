import { NextRequest } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest) {
  try {
    const { boxId, nextState } = await req.json();
    if (!boxId || typeof nextState !== 'number') {
      return Response.json({ error: 'boxId y nextState son requeridos' }, { status: 400 });
    }
    const supabase = getSupabaseServiceRoleClient();
    const { error } = await supabase
      .from('boxes')
      .update({ state: nextState })
      .eq('box_id', boxId);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Error actualizando estado de caja' }, { status: 500 });
  }
}
