import { NextRequest, NextResponse } from "next/server";
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userId: string | undefined = body?.userId;
    const userLevel: string = body?.userLevel ?? "Client";
    if (!userId) {
      return NextResponse.json({ error: "userId es requerido" }, { status: 400 });
    }

    let supabase;
    try {
      supabase = getSupabaseServiceRoleClient();
    } catch (err) {
      console.error("[after-signup] Error creando cliente service role:", err);
      return NextResponse.json({ error: "Service role no configurado" }, { status: 500 });
    }

    // upsert en tabla userlevel: columnas id (uuid) y user_level (text)
    const { error } = await supabase
      .from("userlevel")
      .upsert({ id: userId, user_level: userLevel }, { onConflict: "id" });

    if (error) {
      console.error("[after-signup] Error upsert userlevel:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[after-signup] Excepción:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
