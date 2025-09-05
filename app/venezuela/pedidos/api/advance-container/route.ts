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
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Error actualizando estado de contenedor' }, { status: 500 });
  }
}
