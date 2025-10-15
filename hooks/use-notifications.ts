"use client";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { AppNotification, AppRole } from '@/lib/types/notifications';
import { useTranslation } from '@/hooks/useTranslation';

type Options = {
  role?: AppRole;
  userId?: string; // requerido si role === 'client'
  limit?: number;
  enabled?: boolean;
};

export type UiNotificationItem = {
  id: string;
  title: string;
  description?: string;
  href?: string;
  unread?: boolean;
};

export function useNotifications({ role, userId, limit = 10, enabled = true }: Options) {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<AppNotification[]>([]);

  const audience = useMemo(() => {
    if (role === 'client') {
      return { type: 'user', value: userId };
    }
    return { type: 'role', value: role };
  }, [role, userId]);

  const fetchNotifications = useCallback(async () => {
    if (!enabled) return;
    if (!audience.value) return;
    setLoading(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowserClient();
      let query = supabase
        .from('notifications')
        .select('id, title, description, href, severity, created_at, unread, audience_type, audience_value, user_id, order_id, payment_id, notification_reads ( user_id )')
        .eq('audience_type', audience.type)
        .eq('audience_value', audience.value)
        .order('created_at', { ascending: false })
        .limit(limit);
      const { data, error } = await query;
      if (error) throw error;
      // Map unread per-user: unread=true if no read record for current user
      const mapped = (Array.isArray(data) ? data : []).map((row: any) => {
        const unreadForUser = userId
          ? !((row.notification_reads || []).some((r: any) => r.user_id === userId))
          : !!row.unread;
        return { ...row, unread: unreadForUser } as AppNotification;
      });
      setItems(mapped);
    } catch (e: any) {
      setError(e?.message || 'Error cargando notificaciones');
    } finally {
      setLoading(false);
    }
  }, [audience.type, audience.value, limit, enabled, userId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Recalcular cuando userId cambie (para que el badge se actualice al tener el id)
  useEffect(() => {
    if (!enabled) return;
    fetchNotifications();
  }, [userId]);

  // Realtime
  useEffect(() => {
    if (!enabled || !audience.value) return;
    const supabase = getSupabaseBrowserClient();
    const channel = supabase
      .channel(`notifications-${audience.type}-${audience.value}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notifications',
        filter: `audience_value=eq.${audience.value}`,
      }, () => {
        fetchNotifications();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, audience.type, audience.value, fetchNotifications]);

  const markAllAsRead = useCallback(async () => {
    if (!audience.value) return;
    const supabase = getSupabaseBrowserClient();
    // Insert read markers for current user for all notifications in scope
    if (!userId) return;
    // Fetch ids first (lightweight)
    const { data } = await supabase
      .from('notifications')
      .select('id')
      .eq('audience_type', audience.type)
      .eq('audience_value', audience.value)
      .order('created_at', { ascending: false })
      .limit(200);
    const ids: string[] = (data || []).map((r: any) => r.id);
    if (ids.length === 0) return;
    // Upsert markers (ignore conflicts)
    const rows = ids.map(id => ({ notification_id: id, user_id: userId }));
    await supabase.from('notification_reads').upsert(rows, { onConflict: 'notification_id,user_id', ignoreDuplicates: true });
    fetchNotifications();
  }, [audience.type, audience.value, fetchNotifications, userId]);

  const markOneAsRead = useCallback(async (id: string) => {
    if (!userId) return;
    const supabase = getSupabaseBrowserClient();
    await supabase.from('notification_reads').upsert({ notification_id: id, user_id: userId }, { onConflict: 'notification_id,user_id', ignoreDuplicates: true });
    fetchNotifications();
  }, [userId, fetchNotifications]);

  const uiItems: UiNotificationItem[] = useMemo(() => {
    return items.map(n => {
      // Intento de i18n: si el título parece una key (contiene ':'), usar traducción; si no, usar original
      let title = n.title;
      let description = n.description;
      // Convención de keys guardadas en title/description: notifications.path:key
      // Ejemplos:
      //   title: notifications.china.readyToPack.title
      //   description: notifications.china.readyToPack.description|{"orderId":"123"}
      const tryTranslate = (raw?: string) => {
        if (!raw) return undefined as string | undefined;
        // Permite payload JSON tras un separador '|'
        const [key, payloadRaw] = raw.split('|');
        if (key?.startsWith('notifications.')) {
          let opts: Record<string, any> | undefined = undefined;
          if (payloadRaw) {
            try { opts = JSON.parse(payloadRaw); } catch {}
          }
          return t(key, opts);
        }
        return raw;
      };
      // Intentar traducir
      const localizedTitle = tryTranslate(title);
      const localizedDesc = tryTranslate(description);
      return {
        id: n.id,
        title: localizedTitle ?? title,
        description: localizedDesc ?? description,
        href: n.href || undefined,
        unread: n.unread,
      };
    });
  }, [items, t]);

  const unreadCount = useMemo(() => items.filter(n => n.unread).length, [items]);

  return {
    loading,
    error,
    items,
    uiItems,
    unreadCount,
    refetch: fetchNotifications,
    markAllAsRead,
  markOneAsRead,
  };
}
