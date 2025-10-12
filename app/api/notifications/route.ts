import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Campos esperados mínimos
    const {
      audience_type, // 'user' | 'role'
      audience_value, // userId o nombre rol
      title,
      description,
      href,
      severity = 'info',
      user_id,
      order_id,
      payment_id,
    } = body || {};

    if (!audience_type || !audience_value || !title) {
      return NextResponse.json({ error: 'audience_type, audience_value y title son requeridos' }, { status: 400 });
    }

    const supabase = getSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('notifications')
      .insert([{ audience_type, audience_value, title, description, href, severity, user_id, order_id, payment_id }])
      .select('*')
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error creando notificación' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { all = true, id, user_id } = body || {};
    if (!user_id) {
      return NextResponse.json({ error: 'user_id requerido para marcar leído por usuario' }, { status: 400 });
    }
    const supabase = getSupabaseServiceRoleClient();
    if (!all && id) {
      const { error } = await supabase
        .from('notification_reads')
        .upsert({ notification_id: id, user_id }, { onConflict: 'notification_id,user_id', ignoreDuplicates: true });
      if (error) throw error;
    } else {
      // Marcar todas: obtener ids y upsert en bloque
      const { data, error } = await supabase
        .from('notifications')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      const ids = (data || []).map((r: any) => r.id);
      if (ids.length) {
        const rows = ids.map((nid: string) => ({ notification_id: nid, user_id }));
        const { error: upErr } = await supabase
          .from('notification_reads')
          .upsert(rows, { onConflict: 'notification_id,user_id', ignoreDuplicates: true });
        if (upErr) throw upErr;
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error actualizando notificaciones' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const audience_type = searchParams.get('audience_type');
    const audience_value = searchParams.get('audience_value');
    const limit = Number(searchParams.get('limit') || '20');
    if (!audience_type || !audience_value) {
      return NextResponse.json({ error: 'audience_type y audience_value son requeridos' }, { status: 400 });
    }
    const supabase = getSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('audience_type', audience_type)
      .eq('audience_value', audience_value)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Error listando notificaciones' }, { status: 500 });
  }
}
