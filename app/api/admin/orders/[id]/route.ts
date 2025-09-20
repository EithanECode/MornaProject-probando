import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const id = params.id;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }

    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('DELETE /api/admin/orders/[id] error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ ok: true }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('DELETE /api/admin/orders/[id] exception:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const id = params.id;
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }

    const body = await req.json().catch(() => ({}));
    const update: Record<string, any> = {};

    // Allow updating select fields
    if (typeof body.description === 'string') update.description = body.description;
    if (typeof body.state === 'number' && body.state >= 1 && body.state <= 8) update.state = body.state;
    if (typeof body.pdfRoutes === 'string') update.pdfRoutes = body.pdfRoutes;
    if (Array.isArray(body.imgs)) update.imgs = body.imgs;
    if (Array.isArray(body.links)) update.links = body.links;
  // Nota: Asignaciones se omiten por ahora hasta confirmar columnas/valores exactos

    if (Object.keys(update).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }

    const { data, error } = await supabase
      .from('orders')
      .update(update)
      .eq('id', id)
  .select('id, state, description, pdfRoutes, imgs, links')
      .single();

    if (error) {
      console.error('PATCH /api/admin/orders/[id] error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ ok: true, data }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('PATCH /api/admin/orders/[id] exception:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
