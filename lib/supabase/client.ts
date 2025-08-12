"use client";

import { createClient } from "@supabase/supabase-js";

/**
 * Crea un cliente de Supabase del lado del navegador.
 * Lee las variables públicas en tiempo de ejecución para evitar fallos si no existen en build.
 */
export function getSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltan variables de entorno de Supabase. Define NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey);
}
