import { NextResponse, NextRequest } from 'next/server';
import { getSupabaseServiceRoleClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = getSupabaseServiceRoleClient();

    const [{ data: orders, error: ordersError }, { data: clients, error: clientsError }] = await Promise.all([
      supabase
        .from('orders')
        .select('id, state, productName, description, client_id, asignedEVzla, asignedEChina, created_at, estimatedBudget, reputation, pdfRoutes'),
      supabase
        .from('clients')
        .select('user_id, name'),
    ]);

    if (ordersError) throw ordersError;
    if (clientsError) throw clientsError;

    const clientMap = new Map((clients ?? []).map((c: any) => [c.user_id, c.name]));

    const result = (orders ?? []).map((o: any) => ({
      id: o.id,
      state: o.state,
      productName: o.productName ?? '',
      description: o.description ?? '',
      client_id: o.client_id,
      clientName: clientMap.get(o.client_id) ?? null,
      asignedEVzla: o.asignedEVzla ?? null,
      asignedEChina: o.asignedEChina ?? null,
      created_at: o.created_at,
      estimatedBudget: o.estimatedBudget ?? null,
      reputation: o.reputation ?? null,
      pdfRoutes: o.pdfRoutes ?? null,
    }));

    return NextResponse.json(result, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('GET /api/admin/orders error:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}

// Crear nuevo pedido (administración) usando service role para evitar restricciones RLS del cliente.
// Valida campos mínimos y devuelve el registro insertado.
export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabaseServiceRoleClient();
    const body = await req.json().catch(() => ({}));

    const {
      client_id,
      productName,
      description = '',
      quantity,
      estimatedBudget,
      deliveryType, // destino en Venezuela (según implementación actual)
      shippingType, // tipo de envío: doorToDoor | air | maritime
      imgs = [],
      links = [],
      pdfRoutes = null,
      state = 1,
      order_origin = 'vzla'
    } = body || {};

    const errors: string[] = [];
    if (!client_id || typeof client_id !== 'string') errors.push('client_id requerido');
    if (!productName || typeof productName !== 'string') errors.push('productName requerido');
    if (quantity === undefined || quantity === null || isNaN(Number(quantity)) || Number(quantity) <= 0) errors.push('quantity inválido');
    if (estimatedBudget === undefined || estimatedBudget === null || isNaN(Number(estimatedBudget)) || Number(estimatedBudget) < 0) errors.push('estimatedBudget inválido');
    if (!deliveryType || typeof deliveryType !== 'string') errors.push('deliveryType requerido');
    if (!shippingType || typeof shippingType !== 'string') errors.push('shippingType requerido');

    if (errors.length) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400, headers: { 'Cache-Control': 'no-store' } });
    }

    // Sanitizar links/imagenes (posibles constraints de longitud / formato)
    const sanitizeUrl = (u: any) => {
      if (typeof u !== 'string') return null;
      let raw = u.trim();
      if (!/^https?:\/\//i.test(raw)) return null;
      try {
        const urlObj = new URL(raw);
        // Canonizar: quitar query y fragment para evitar caracteres % problemáticos en regex del constraint
        const canonical = `${urlObj.origin}${urlObj.pathname}`;
        raw = decodeURIComponent(canonical); // decodificar %XX si es seguro
      } catch { /* ignore and keep raw */ }
      // Remover caracteres potencialmente no permitidos (solo dejar un subconjunto seguro)
      raw = raw.replace(/[^A-Za-z0-9._~:/#?&=+\-]/g, '-');
      if (raw.length > 255) raw = raw.slice(0,255);
      // Validación final simple
      if (!/^https?:\/\/[A-Za-z0-9./_~:=+\-]+$/i.test(raw)) return null;
      return raw;
    };
    const safeImgs = Array.isArray(imgs) ? imgs.map(sanitizeUrl).filter(Boolean) : [];
    const safeLinksRaw = Array.isArray(links) ? links.map(sanitizeUrl).filter(Boolean) : [];
    // Si el constraint exige máx 1 link, recortar.
    const safeLinks = safeLinksRaw.slice(0,1);

    const insertPayload: Record<string, any> = {
      client_id,
      productName,
      description,
      quantity: Number(quantity),
      estimatedBudget: Number(estimatedBudget),
      deliveryType, // en la BD actual se está usando así desde el cliente
      shippingType,
      imgs: safeImgs,
      links: safeLinks,
      pdfRoutes,
      state: Number(state) || 1,
      order_origin,
      elapsed_time: null,
      asignedEVzla: null,
    };

    let { data, error } = await supabase
      .from('orders')
      .insert([insertPayload])
      .select('*')
      .single();

    // Fallback: si el constraint de links falla, reintentar sin links
    if (error && /links?_check/i.test(error.message || '')) {
      console.warn('[orders] links constraint violated, retrying without links/imgs', {
        message: error.message,
        details: error.details,
        attemptedLinks: insertPayload.links,
      });
      const retryPayload = { ...insertPayload, links: [], imgs: [] };
      const retry = await supabase
        .from('orders')
        .insert([retryPayload])
        .select('*')
        .single();
      data = retry.data;
      error = retry.error as any;
      if (!error) {
        return NextResponse.json({ ok: true, data, warning: 'links_removed_due_to_constraint' }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
      }
    }

    if (error) {
      console.error('POST /api/admin/orders insert error:', error.message, { details: error.details, payload: insertPayload });
      return NextResponse.json({ error: error.message, details: error.details }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }

    return NextResponse.json({ ok: true, data }, { status: 201, headers: { 'Cache-Control': 'no-store' } });
  } catch (err: any) {
    console.error('POST /api/admin/orders exception:', err?.message || err);
    return NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
