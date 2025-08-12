import { useState, useEffect, useCallback, useRef } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface QueryOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
  cacheTime?: number;
}

interface QueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

// Cache simple para las consultas
const queryCache = new Map<string, { data: any; timestamp: number; staleTime: number }>();

export function useSupabaseQuery<T>(
  queryKey: string,
  queryFn: () => Promise<T>,
  options: QueryOptions = {}
): QueryResult<T> {
  const {
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 5 * 60 * 1000, // 5 minutos
    cacheTime = 10 * 60 * 1000, // 10 minutos
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeQuery = useCallback(async () => {
    if (!enabled) return;

    // Cancelar consulta anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      // Verificar cache
      const cached = queryCache.get(queryKey);
      const now = Date.now();

      if (cached && (now - cached.timestamp) < cached.staleTime) {
        setData(cached.data);
        setLoading(false);
        setIsStale(false);
        return;
      }

      // Si los datos están en cache pero son stale, mostrarlos mientras se actualizan
      if (cached && (now - cached.timestamp) < cacheTime) {
        setData(cached.data);
        setIsStale(true);
      }

      const result = await queryFn();

      // Verificar si la consulta fue cancelada
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      // Actualizar cache
      queryCache.set(queryKey, {
        data: result,
        timestamp: now,
        staleTime,
      });

      setData(result);
      setLoading(false);
      setIsStale(false);
    } catch (err) {
      if (abortControllerRef.current.signal.aborted) {
        return;
      }

      console.error('Error in useSupabaseQuery:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setLoading(false);
    }
  }, [queryKey, queryFn, enabled, staleTime, cacheTime]);

  const refetch = useCallback(async () => {
    // Limpiar cache para forzar refetch
    queryCache.delete(queryKey);
    await executeQuery();
  }, [queryKey, executeQuery]);

  useEffect(() => {
    executeQuery();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [executeQuery]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      const cached = queryCache.get(queryKey);
      if (cached && (Date.now() - cached.timestamp) > cached.staleTime) {
        refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, queryKey, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
    isStale,
  };
}

// Hook especializado para consultas de estadísticas
export function useStatsQuery() {
  return useSupabaseQuery(
    'stats',
    async () => {
      const supabase = getSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("orders")
        .select("state", { count: "exact", head: false });

      if (error) throw error;

      const total = data.length;
      const pending = data.filter((order) => order.state >= 1 && order.state <= 5).length;
      const inTransit = data.filter((order) => order.state === 6 || order.state === 7).length;
      const completed = data.filter((order) => order.state === 8).length;

      return {
        total,
        pending,
        completed,
        inTransit,
      };
    },
    {
      staleTime: 2 * 60 * 1000, // 2 minutos para estadísticas
      refetchOnWindowFocus: true,
    }
  );
}

// Hook especializado para pedidos recientes
export function useRecentOrdersQuery(limit: number = 5) {
  return useSupabaseQuery(
    `recent-orders-${limit}`,
    async () => {
      const supabase = getSupabaseBrowserClient();
      
      // Consulta optimizada
      const { data: orders, error: ordersError } = await supabase
        .from("orders")
        .select("id, state, client_id, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (ordersError) throw ordersError;

      if (!orders || orders.length === 0) {
        return [];
      }

      // Obtener clientes en una sola consulta
      const clientIds = orders.map(order => order.client_id);
      const { data: clients, error: clientError } = await supabase
        .from("clients")
        .select("user_id, name")
        .in("user_id", clientIds);

      if (clientError) throw clientError;

      // Crear mapa de clientes
      const clientMap = new Map(clients?.map(c => [c.user_id, c.name]) || []);

      // Estado labels
      const STATE_LABELS = [
        "", // 0 no se usa
        "Pedido solicitado",
        "Cotización China",
        "Cotización Venezuela",
        "Cliente paga",
        "Re-empacado",
        "En tránsito aéreo",
        "En álmacen Venezuela",
        "Entregado"
      ];

      return orders.map(order => ({
        id: order.id,
        client: clientMap.get(order.client_id) || "Desconocido",
        status: STATE_LABELS[order.state] || "Desconocido",
        progress: Math.round((order.state / 8) * 100),
        eta: "",
      }));
    },
    {
      staleTime: 1 * 60 * 1000, // 1 minuto para pedidos recientes
      refetchOnWindowFocus: true,
    }
  );
}

// Función para limpiar cache
export function clearQueryCache() {
  queryCache.clear();
}

// Función para invalidar consultas específicas
export function invalidateQuery(queryKey: string) {
  queryCache.delete(queryKey);
} 