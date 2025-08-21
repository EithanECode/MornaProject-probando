"use client";
import { useEffect } from "react";
import { useChinaContext } from "@/lib/ChinaContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function ChinaContextInitializer() {
  const { setChina } = useChinaContext();

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return;
      const userId = data.user.id;
      const userEmail = data.user.email || "";
      let chinaName = "";
      let chinaRole = "";
      try {
        const { data: chinaData } = await supabase
          .from("china")
          .select("name")
          .eq("user_id", userId)
          .maybeSingle();
        chinaName = chinaData?.name || "";
        const { data: levelData } = await supabase
          .from("userlevel")
          .select("user_level")
          .eq("id", userId)
          .maybeSingle();
        chinaRole = levelData?.user_level || "";
      } catch {}
      setChina({ chinaId: userId, chinaName, chinaEmail: userEmail, chinaRole });
    };
    fetchUserData();
  }, [setChina]);

  return null;
}
