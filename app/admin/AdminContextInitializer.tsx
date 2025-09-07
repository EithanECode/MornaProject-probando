"use client";
import { useEffect } from "react";
import { useAdminContext } from "@/lib/AdminContext";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminContextInitializer() {
	const { setAdmin } = useAdminContext();

	useEffect(() => {
		const fetchUserData = async () => {
			const supabase = getSupabaseBrowserClient();
			const { data, error } = await supabase.auth.getUser();
			if (error || !data?.user) return;
			const user = data.user;
			const userId = user.id;
			const userEmail = user.email || "";

			// Try to use auth metadata for a friendly name; fallback to email local-part
			const meta: any = user.user_metadata || {};
			const metaName: string = meta.full_name || meta.name || "";
			const fallbackName = userEmail ? userEmail.split("@")[0] : "Administrador";
			const adminName = metaName || fallbackName;

			// Optional: fetch role from userlevel (not required for Sidebar display)
			const { data: levelData } = await supabase
			  .from("userlevel")
			  .select("user_level, user_image")
			  .eq("id", userId)
			  .maybeSingle();

			const userImage = levelData?.user_image || "";

			setAdmin({ adminId: userId, adminName, adminEmail: userEmail, userImage });
		};
		fetchUserData();
	}, [setAdmin]);

	return null;
}
