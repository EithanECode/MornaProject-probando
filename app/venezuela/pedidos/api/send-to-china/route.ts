import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Cambia el estado de un pedido a 4 (Enviado)
export async function PATCH(request: Request) {
  try {
    const { orderId } = await request.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: 'Falta orderId' }), { status: 400 });
    }
    const { error } = await supabase
      .from('orders')
      .update({ state: 4 })
      .eq('id', orderId);
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
