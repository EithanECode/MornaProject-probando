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
    .select('id, quantity, productName, deliveryType, shippingType, state, client_id, asignedEVzla, description, pdfRoutes');
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
      client_id: order.client_id, // Aseguramos que se incluya el client_id
      description: order.description ?? '',
      pdfRoutes: order.pdfRoutes ?? '',
    };
  });
}

// API Route para Next.js App Router (app router)
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Obtener todos los pedidos, sin filtrar por asignedEVzla
    const orders = await getOrdersWithClientName();
    return Response.json(orders);
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
