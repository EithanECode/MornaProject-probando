import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';
import { NotificationsFactory } from '@/lib/notifications';

export const revalidate = 0;

interface UpdateStateRequest {
  state: number;
  changed_by?: string;
  notes?: string;
  ip_address?: string;
  user_agent?: string;
}

// PUT /api/orders/[id]/state - Actualizar estado del pedido
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'ID de pedido inválido' },
        { status: 400 }
      );
    }

    const body: UpdateStateRequest = await request.json();
    const { state, changed_by, notes, ip_address, user_agent } = body;

    // Validar estado
    if (!state || state < 1 || state > 13) {
      return NextResponse.json(
        { error: 'Estado inválido. Debe estar entre 1 y 13' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceRoleClient();

    // Verificar que el pedido existe y obtener estado actual
    const { data: currentOrder, error: orderError } = await supabase
      .from('orders')
      .select('id, state')
      .eq('id', orderId)
      .single();

    if (orderError || !currentOrder) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el estado realmente cambió
    if (currentOrder.state === state) {
      return NextResponse.json({
        success: true,
        message: 'Estado sin cambios',
        orderId,
        state,
        previousState: currentOrder.state
      });
    }

    // Obtener información del request
    const clientIP = ip_address || 
      request.headers.get('x-forwarded-for') || 
      request.headers.get('x-real-ip') || 
      'unknown';
    
    const clientUserAgent = user_agent || 
      request.headers.get('user-agent') || 
      'unknown';

    // Actualizar estado del pedido
    const { error: updateError } = await supabase
      .from('orders')
      .update({ state })
      .eq('id', orderId);

    if (updateError) {
      console.error('Error updating order state:', updateError);
      return NextResponse.json(
        { error: 'Error al actualizar el estado del pedido' },
        { status: 500 }
      );
    }

    // El trigger se encarga de registrar en order_state_history automáticamente
    // Pero podemos agregar información adicional manualmente si es necesario
    if (changed_by || notes || ip_address || user_agent) {
      // Actualizar el registro más reciente con información adicional
      const { error: historyUpdateError } = await supabase
        .from('order_state_history')
        .update({
          changed_by: changed_by || 'system',
          notes: notes || 'Estado actualizado vía API',
          ip_address: clientIP,
          user_agent: clientUserAgent
        })
        .eq('order_id', orderId)
        .eq('state', state)
        .order('timestamp', { ascending: false })
        .limit(1);

      if (historyUpdateError) {
        console.error('Error updating history metadata:', historyUpdateError);
        // No fallar la operación por esto
      }
    }

    // Obtener el registro actualizado del historial
    const { data: historyRecord, error: historyError } = await supabase
      .from('order_state_history')
      .select('*')
      .eq('order_id', orderId)
      .eq('state', state)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    // Emitir notificaciones (no bloqueantes)
    try {
      // Obtener datos necesarios del pedido (cliente)
      const { data: updatedOrder } = await supabase
        .from('orders')
        .select('id, state, client_id')
        .eq('id', orderId)
        .single();

  const stateName = getStateName(state);

      if (updatedOrder?.client_id) {
        if (state === 3) {
          // Solo enviar la notificación específica de cotización lista para evitar duplicados
          const clientNotif = NotificationsFactory.client.quoteReady({ orderId: String(orderId) });
          await supabase.from('notifications').insert([
            {
              audience_type: 'user',
              audience_value: updatedOrder.client_id,
              title: clientNotif.title,
              description: clientNotif.description,
              href: clientNotif.href,
              severity: clientNotif.severity,
              user_id: updatedOrder.client_id,
              order_id: String(orderId),
            },
          ]);
        } else {
          const notif = NotificationsFactory.client.orderStatusChanged({ orderId: String(orderId), status: stateName });
          await supabase.from('notifications').insert([
            {
              audience_type: 'user',
              audience_value: updatedOrder.client_id,
              title: notif.title,
              description: notif.description,
              href: notif.href,
              severity: notif.severity,
              user_id: updatedOrder.client_id,
              order_id: String(orderId),
            },
          ]);
        }
      }

      // Notificar a Venezuela cuando se asigne a Vzla (estado 4)
      if (state === 4) {
        const notifVzla = NotificationsFactory.venezuela.newAssignedOrder({ orderId: String(orderId) });
        await supabase.from('notifications').insert([
          {
            audience_type: 'role',
            audience_value: 'venezuela',
            title: notifVzla.title,
            description: notifVzla.description,
            href: notifVzla.href,
            severity: notifVzla.severity,
            order_id: String(orderId),
          },
        ]);
      }

      // Notificar a Pagos cuando entre a validación (estado 4)
      if (state === 4) {
        const notifPagos = NotificationsFactory.pagos.newAssignedOrder({ orderId: String(orderId) });
        await supabase.from('notifications').insert([
          {
            audience_type: 'role',
            audience_value: 'pagos',
            title: notifPagos.title,
            description: notifPagos.description,
            href: notifPagos.href,
            severity: notifPagos.severity,
            order_id: String(orderId),
          },
        ]);
      }

      // Notificar a China cuando requiera cotización (estado 3) y avisar al cliente que la cotización está lista
      if (state === 3) {
        const notifChina = NotificationsFactory.china.newOrderForQuote({ orderId: String(orderId) });
        await supabase.from('notifications').insert([
          {
            audience_type: 'role',
            audience_value: 'china',
            title: notifChina.title,
            description: notifChina.description,
            href: notifChina.href,
            severity: notifChina.severity,
            order_id: String(orderId),
          },
        ]);
        if (updatedOrder?.client_id) {
          const clientNotif = NotificationsFactory.client.quoteReady({ orderId: String(orderId) });
          await supabase.from('notifications').insert([
            {
              audience_type: 'user',
              audience_value: updatedOrder.client_id,
              title: clientNotif.title,
              description: clientNotif.description,
              href: clientNotif.href,
              severity: clientNotif.severity,
              user_id: updatedOrder.client_id,
              order_id: String(orderId),
            },
          ]);
        }
      }

      // Notificar a China cuando pase a pendiente para China (estado 2)
      if (state === 2) {
        const notifChina2 = NotificationsFactory.china.orderRequiresAttention({ orderId: String(orderId) });
        await supabase.from('notifications').insert([
          {
            audience_type: 'role',
            audience_value: 'china',
            title: notifChina2.title,
            description: notifChina2.description,
            href: notifChina2.href,
            severity: notifChina2.severity,
            order_id: String(orderId),
          },
        ]);
      }
    } catch (notifyErr) {
      console.error('Order state notification error:', notifyErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Estado actualizado correctamente',
      orderId,
      state,
      previousState: currentOrder.state,
      timestamp: historyRecord?.timestamp || new Date().toISOString(),
      historyId: historyRecord?.id || null
    });

  } catch (error: any) {
    console.error('Error in state update API:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// GET /api/orders/[id]/state - Obtener estado actual del pedido
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { error: 'ID de pedido inválido' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseServiceRoleClient();

    // Obtener estado actual del pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('id, state, created_at')
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }

    // Obtener último cambio de estado del historial
    const { data: lastChange, error: historyError } = await supabase
      .from('order_state_history')
      .select('*')
      .eq('order_id', orderId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single();

    const stateName = getStateName(order.state);

    return NextResponse.json({
      success: true,
      orderId,
      state: order.state,
      stateName,
      createdAt: order.created_at,
      lastChange: lastChange || null
    });

  } catch (error: any) {
    console.error('Error in get state API:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Función helper para obtener el nombre del estado
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
    13: 'Entregado'
  };

  return stateNames[state] || 'Estado desconocido';
}
