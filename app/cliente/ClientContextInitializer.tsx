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
      let userImage = "";
      try {
        const { data: clientData } = await supabase
          .from("clients")
          .select("name")
          .eq("user_id", userId)
          .maybeSingle();
        clientName = clientData?.name || "";
        const { data: levelData } = await supabase
          .from("userlevel")
          .select("user_level, user_image")
          .eq("id", userId)
          .maybeSingle();
        clientRole = levelData?.user_level || "";
        userImage = levelData?.user_image || "";
      } catch {}
      setClient({ clientId: userId, clientName, clientEmail: userEmail, clientRole, userImage });
    };
    fetchUserData();
  }, [setClient]);

  return null;
}
