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
  // Resolver userId automáticamente si no se pasa
  const [resolvedUserId, setResolvedUserId] = useState<string | undefined>(userId);

  // Helpers para fallback local (persistencia en navegador por usuario/ámbito)
  const getLocalKey = useCallback(() => {
    const audienceKey = `${role ?? 'unknown'}:${userId ?? 'unknown'}`;
    const uid = resolvedUserId ?? 'unknown';
    return `notif_reads:${audienceKey}:${uid}`;
  }, [role, userId, resolvedUserId]);

  const getLocalReadIds = useCallback((): Set<string> => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(getLocalKey()) : null;
      if (!raw) return new Set();
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr.filter(Boolean));
    } catch {}
    return new Set();
  }, [getLocalKey]);

  const saveLocalReadIds = useCallback((ids: Set<string>) => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(getLocalKey(), JSON.stringify(Array.from(ids)));
    } catch {}
  }, [getLocalKey]);

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
      // Intentar resolver el userId actual si no lo tenemos aún
      if (!resolvedUserId) {
        try {
          const { data } = await supabase.auth.getUser();
          const uid = data?.user?.id;
          if (uid) setResolvedUserId(uid);
        } catch {}
      }
      // 1) Traer notificaciones para el público indicado
      const { data: notifData, error: notifErr } = await supabase
        .from('notifications')
        .select('id, title, description, href, severity, created_at, unread, audience_type, audience_value, user_id, order_id, payment_id')
        .eq('audience_type', audience.type)
        .eq('audience_value', audience.value)
        .order('created_at', { ascending: false })
        .limit(limit);
      if (notifErr) throw notifErr;

      const rows = Array.isArray(notifData) ? notifData : [];

      // 2) Si tenemos userId, consultar qué notificaciones ya están marcadas como leídas para ese usuario
      let readIds = new Set<string>();
      const uidForRead = resolvedUserId;
      if (uidForRead && rows.length > 0) {
        const ids = rows.map((r: any) => r.id).filter(Boolean);
        if (ids.length > 0) {
          const { data: readRows, error: readErr } = await supabase
            .from('notification_reads')
            .select('notification_id')
            .eq('user_id', uidForRead)
            .in('notification_id', ids as any);
          if (!readErr && Array.isArray(readRows)) {
            readIds = new Set(readRows.map((r: any) => r.notification_id));
          }
        }
      }

      // 2b) Fallback local: fusionar con los IDs guardados en localStorage
      if (resolvedUserId) {
        const localIds = getLocalReadIds();
        if (localIds.size > 0) {
          localIds.forEach((l) => readIds.add(l));
        }
      }

      // 3) Mapear unread por usuario usando readIds; si no hay uid, usar flag unread de la fila
      const mapped = rows.map((row: any) => {
        const unreadForUser = uidForRead ? !readIds.has(row.id) : !!row.unread;
        return { ...row, unread: unreadForUser } as AppNotification;
      });
      setItems(mapped);
    } catch (e: any) {
      setError(e?.message || 'Error cargando notificaciones');
    } finally {
      setLoading(false);
    }
  }, [audience.type, audience.value, limit, enabled, resolvedUserId]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // Recalcular cuando userId cambie (para que el badge se actualice al tener el id)
  useEffect(() => {
    if (!enabled) return;
    fetchNotifications();
  }, [resolvedUserId]);

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
    // Asegurar userId: resolverlo si aún no está
    let uid = resolvedUserId;
    if (!uid) {
      try {
        const { data } = await supabase.auth.getUser();
        uid = data?.user?.id;
        if (uid) setResolvedUserId(uid);
      } catch {}
      if (!uid) return; // sin user no podemos marcar como leídas per-user
    }
    // Fetch ids first (lightweight)
    const { data } = await supabase
      .from('notifications')
      .select('id')
      .eq('audience_type', audience.type)
      .eq('audience_value', audience.value)
      .order('created_at', { ascending: false });
    const ids: string[] = (data || []).map((r: any) => r.id);
    if (ids.length === 0) return;
    // Upsert markers (ignore conflicts)
    const rows = ids.map(id => ({ notification_id: id, user_id: uid! }));
    await supabase.from('notification_reads').upsert(rows, { onConflict: 'notification_id,user_id', ignoreDuplicates: true });
    // Fallback local: guardar todos como leídos
    try {
      const current = getLocalReadIds();
      ids.forEach(id => current.add(id));
      saveLocalReadIds(current);
    } catch {}
    fetchNotifications();
  }, [audience.type, audience.value, fetchNotifications, resolvedUserId, getLocalReadIds, saveLocalReadIds]);

  const markOneAsRead = useCallback(async (id: string) => {
    const supabase = getSupabaseBrowserClient();
    // Asegurar userId
    let uid = resolvedUserId;
    if (!uid) {
      try {
        const { data } = await supabase.auth.getUser();
        uid = data?.user?.id;
        if (uid) setResolvedUserId(uid);
      } catch {}
      if (!uid) return;
    }
    await supabase.from('notification_reads').upsert({ notification_id: id, user_id: uid }, { onConflict: 'notification_id,user_id', ignoreDuplicates: true });
    // Fallback local: guardar este ID como leído
    try {
      const current = getLocalReadIds();
      current.add(id);
      saveLocalReadIds(current);
    } catch {}
    fetchNotifications();
  }, [resolvedUserId, fetchNotifications, getLocalReadIds, saveLocalReadIds]);

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
