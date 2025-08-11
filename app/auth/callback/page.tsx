"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AuthCallbackPage() {
  useEffect(() => {
    const run = async () => {
      try {
        const supabase = getSupabaseBrowserClient();
        const { data } = await supabase.auth.getSession();
        if (data?.session) {
          // Intento idempotente de crear/actualizar el nivel del usuario
          const userId = data.session.user.id;
          try {
            await fetch("/api/auth/after-signup", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId, userLevel: "Client" }),
            });
          } catch {}
          window.location.replace("/gestion");
        } else {
          window.location.replace("/login-register");
        }
      } catch {
        window.location.replace("/login-register");
      }
    };
    run();
  }, []);

  return (
    <main className="flex items-center justify-center h-[60vh]">
      <p className="text-sm text-muted-foreground">Procesando autenticación…</p>
    </main>
  );
}
