import { NextRequest } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, title, quantity, description, specifications, url } = body || {};

    if (!id) {
      return Response.json({ error: 'Falta id del pedido' }, { status: 400 });
    }

    // Validaciones mínimas
    if (typeof title !== 'string' || !title.trim()) {
      return Response.json({ error: 'El título es obligatorio' }, { status: 400 });
    }
    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      return Response.json({ error: 'Cantidad inválida' }, { status: 400 });
    }

  const supabase = getSupabaseServiceRoleClient();

    // Construir objeto de actualización con columnas conocidas
    const updates: Record<string, any> = {
      productName: title.trim(),
      quantity: qty,
      description: typeof description === 'string' ? description.trim() : null,
      specifications: typeof specifications === 'string' ? specifications.trim() : null,
      pdfRoutes: typeof url === 'string' ? url.trim() : null,
    };

    // Intentar actualización solo si el pedido está en estado 1 (pendiente)
    const idNum = Number(id);
    const idFilter: any = Number.isFinite(idNum) ? idNum : id;

    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', idFilter)
      .eq('state', 1)
      .select('id');

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }
    if (!data || data.length === 0) {
      return Response.json({ error: 'No se pudo actualizar. Verifica el ID y que el pedido esté en estado 1.' }, { status: 409 });
    }

    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e.message || 'Error actualizando pedido' }, { status: 500 });
  }
}
