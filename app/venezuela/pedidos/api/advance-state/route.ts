import { NextRequest } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest) {
  try {
    const { orderId, nextState } = await req.json();
    if (!orderId || typeof nextState !== 'number') {
      return Response.json({ error: 'orderId y nextState son requeridos' }, { status: 400 });
    }
    const supabase = getSupabaseServiceRoleClient();
    const { error } = await supabase
      .from('orders')
      .update({ state: nextState })
      .eq('id', orderId);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Error actualizando estado' }, { status: 500 });
  }
}
