
import { useSupabaseQuery } from './use-supabase-query';

export interface AdminUser {
  name: string;
  email: string;
  role: 'client' | 'employee' | 'administrator';
  created_at: string;
  id: string; // user_id de la tabla users
  status?: 'activo' | 'inactivo';
  user_level?: string;
}

export function useAdminUsers() {
  const queryKey = 'admin-users-api-v1';

  const result = useSupabaseQuery<AdminUser[]>(
    queryKey,
    async () => {
      const res = await fetch('/api/admin/users', { cache: 'no-store' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error || `Request failed with ${res.status}`);
      }
      const data = await res.json();
      return data as AdminUser[];
    },
    {
      enabled: true,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: true,
    }
  );

  return result;
}
