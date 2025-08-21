"use client";
import { useEffect } from "react";
import { useClientContext } from "@/lib/ClientContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ClientContextInitializer() {
  const { setClient } = useClientContext();

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return;
      const userId = data.user.id;
      const userEmail = data.user.email || "";
      let clientName = "";
      let clientRole = "";
      try {
        const { data: clientData } = await supabase
          .from("clients")
          .select("name")
          .eq("user_id", userId)
          .maybeSingle();
        clientName = clientData?.name || "";
        const { data: levelData } = await supabase
          .from("userlevel")
          .select("user_level")
          .eq("id", userId)
          .maybeSingle();
        clientRole = levelData?.user_level || "";
      } catch {}
      setClient({ clientId: userId, clientName, clientEmail: userEmail, clientRole });
    };
    fetchUserData();
  }, [setClient]);

  return null;
}
