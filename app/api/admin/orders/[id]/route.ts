import { NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { NotificationsFactory } from '@/lib/notifications';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const { id } = await params;

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
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const { id } = await params;
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

    // Notificaciones si cambia estado
    try {
      if (typeof body.state === 'number' && data?.id) {
        const orderId = String(data.id);
        const stateNum = body.state as number;
        const stateName = getStateName(stateNum);

        // Obtener client_id
        const { data: orderFull } = await supabase.from('orders').select('client_id').eq('id', id).single();
        if (orderFull?.client_id) {
          const notif = NotificationsFactory.client.orderStatusChanged({ orderId, status: stateName });
          await supabase.from('notifications').insert([
            {
              audience_type: 'user',
              audience_value: orderFull.client_id,
              title: notif.title,
              description: notif.description,
              href: notif.href,
              severity: notif.severity,
              user_id: orderFull.client_id,
              order_id: orderId,
            },
          ]);
        }

        if (stateNum === 4) {
          const notifVzla = NotificationsFactory.venezuela.newAssignedOrder({ orderId });
          await supabase.from('notifications').insert([
            {
              audience_type: 'role',
              audience_value: 'venezuela',
              title: notifVzla.title,
              description: notifVzla.description,
              href: notifVzla.href,
              severity: notifVzla.severity,
              order_id: orderId,
            },
          ]);
        }

        // Notificar a Pagos cuando entre a validación (estado 4)
        if (stateNum === 4) {
          const notifPagos = NotificationsFactory.pagos.newAssignedOrder({ orderId });
          await supabase.from('notifications').insert([
            {
              audience_type: 'role',
              audience_value: 'pagos',
              title: notifPagos.title,
              description: notifPagos.description,
              href: notifPagos.href,
              severity: notifPagos.severity,
              order_id: orderId,
            },
          ]);
        }
      }
    } catch (notifyErr) {
      console.error('Admin update order notification error:', notifyErr);
    }

    return NextResponse.json({ ok: true, data }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('PATCH /api/admin/orders/[id] exception:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

function getStateName(state: number): string {
  const stateNames: Record<number, string> = {
    1: 'Pedido creado',
    2: 'Recibido',
    3: 'Cotizado',
    4: 'Asignado Venezuela',
    5: 'En procesamiento',
    6: 'Preparando envío',
    7: 'Listo para envío',
    8: 'Enviado',
    9: 'En tránsito',
    10: 'En aduana',
    11: 'En almacén Venezuela',
    12: 'Listo para entrega',
    13: 'Entregado',
  };
  return stateNames[state] || 'Estado desconocido';
}
