"use client";

import { getSupabaseBrowserClient } from "./client";

export async function signOut() {
  const supabase = getSupabaseBrowserClient();
  await supabase.auth.signOut();
}
