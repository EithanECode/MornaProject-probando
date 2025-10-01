import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');
  if (!uid) {
    return NextResponse.json({ success: false, error: 'Falta el parámetro uid' }, { status: 400 });
  }

  // Buscar el usuario en Supabase Auth
  const { data, error } = await supabase.auth.admin.getUserById(uid);
  if (error || !data?.user) {
    return NextResponse.json({ success: false, error: 'No se encontró el usuario' }, { status: 404 });
  }
  const user = data.user;
  const meta = user.user_metadata || {};
  const metaName = meta.full_name || meta.name || "";
  const fallbackName = user.email ? user.email.split("@")[0] : "Administrador";
  const name = metaName || fallbackName;
  return NextResponse.json({ success: true, name });
}
