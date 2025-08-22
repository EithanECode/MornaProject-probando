import { createClient } from '@supabase/supabase-js';

// Usa variables privadas para el backend
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Esta función obtiene los pedidos con el nombre del cliente
async function getOrdersWithClientName() {
  // Traer pedidos
  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('id, quantity, productName, deliveryType, shippingType, state, client_id, asignedEVzla');
  if (ordersError) throw ordersError;

  // Traer clientes
  const { data: clients, error: clientsError } = await supabase
    .from('clients')
    .select('user_id, name');
  if (clientsError) throw clientsError;

  // Join manual en JS
  return orders.map(order => {
    const client = clients.find(c => c.user_id === order.client_id);
    return {
      id: order.id,
      quantity: order.quantity,
      productName: order.productName,
      deliveryType: order.deliveryType,
      shippingType: order.shippingType,
      state: order.state,
      asignedEVzla: order.asignedEVzla,
      clientName: client ? client.name : null,
    };
  });
}

// API Route para Next.js App Router (app router)
export async function GET() {
  try {
    // Obtener el parámetro de empleado (asignedEVzla) de la query
    const url = new URL(globalThis.request?.url || '', 'http://localhost');
    const empleadoId = url.searchParams.get('asignedEVzla');

    let orders = await getOrdersWithClientName();
    if (empleadoId) {
      orders = orders.filter(order => order.asignedEVzla === empleadoId);
    } else {
      // Si no se pasa el parámetro, solo mostrar los que tienen asignedEVzla no null
      orders = orders.filter(order => order.asignedEVzla);
    }
    return Response.json(orders);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
