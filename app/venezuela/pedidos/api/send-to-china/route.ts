import { createClient } from '@supabase/supabase-js';

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

// Cambia el estado de un pedido a 2 (Revisando/Enviado a China)
export async function PATCH(request: Request) {
  try {
    const supabase = getSupabaseClient();
    const { orderId } = await request.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Falta orderId' }), { status: 400 });
    }
    const { data, error } = await supabase
      .from('orders')
      .update({ state: 2 })
      .eq('id', orderId)
      .eq('state', 1)
      .select();
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    if (!data || data.length === 0) {
      return new Response(JSON.stringify({ error: 'No se pudo actualizar el estado. Verifica que el pedido esté en estado 1.' }), { status: 409 });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
