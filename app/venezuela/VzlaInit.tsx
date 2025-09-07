"use client";
import { useEffect } from "react";
import { useVzlaContext } from "@/lib/VzlaContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function VzlaInit() {
  const { setVzla } = useVzlaContext();

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return;
      const userId = data.user.id;
      const userEmail = data.user.email || "";
      let vzlaName = "";
      let vzlaRole = "";
      let userImage = "";
      try {
        const { data: vzlaData } = await supabase
          .from("vzla")
          .select("name")
          .eq("user_id", userId)
          .maybeSingle();
        vzlaName = vzlaData?.name || "";
        const { data: levelData } = await supabase
          .from("userlevel")
          .select("user_level, user_image")
          .eq("id", userId)
          .maybeSingle();
        vzlaRole = levelData?.user_level || "";
        userImage = levelData?.user_image || "";
      } catch {}
      setVzla({ vzlaId: userId, vzlaName, vzlaEmail: userEmail, vzlaRole, userImage });
    };
    fetchUserData();
  }, [setVzla]);

  return null;
}
