import { useEffect, useRef, useCallback } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

/**
 * Hook de realtime específico para la pantalla de Validación de Pagos (Venezuela).
 * Escucha cambios en la tabla `orders` SOLO cuando afectan registros en estado 4 (pendiente de validación)
 * asignados al validador actual. Dispara un callback para que la UI recargue la lista.
 *
 * Cubre variaciones de nombre de columna de asignación: `asigned`, `asignnedEVzla`, `asignedEVzla`.
 */
type UpdateCb = () => void;

interface OrderRecord {
  id?: string | number;
  state?: number | null;
  asigned?: string | null;           // posible nombre 1
  asignnedEVzla?: string | null;     // posible nombre 2 (typo histórico)
  asignedEVzla?: string | null;      // posible nombre 3
  [key: string]: any;                // fallback
}

function useDebouncedCallback(cb: UpdateCb, delay = 150) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const latestCb = useRef(cb);
  latestCb.current = cb;
  return useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => latestCb.current(), delay);
  }, [delay]);
}

export function useRealtimeVzlaPayments(onPendingOrdersChange: UpdateCb, vzlaId?: string) {
  const supabase = getSupabaseBrowserClient();
  const debounced = useDebouncedCallback(onPendingOrdersChange, 120);

  useEffect(() => {
    if (!vzlaId) return;

    const channelName = `vzla-payments-${vzlaId}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        const { eventType } = payload;
        const newR = (payload.new || {}) as OrderRecord;
        const oldR = (payload.old || {}) as OrderRecord;

        const oldAssigned = [oldR.asigned, oldR.asignnedEVzla, oldR.asignedEVzla].includes(vzlaId);
        const newAssigned = [newR.asigned, newR.asignnedEVzla, newR.asignedEVzla].includes(vzlaId);

  // Conjunto de interés: registros con state >=4
  // state == 4 => pendiente; state 5..13 => completados
  const oldRelevant = (oldR.state ?? 0) >= 4;
  const newRelevant = (newR.state ?? 0) >= 4;
  const oldPending = oldR.state === 4;
  const newPending = newR.state === 4;

        let relevant = false;
        switch (eventType) {
          case 'INSERT':
            // Nuevo pedido relevante (>=4) asignado al usuario
            relevant = newAssigned && newRelevant;
            break;
          case 'UPDATE':
            // Cambia asignación o estado dentro del rango relevante
            relevant = (oldAssigned || newAssigned) && (oldRelevant || newRelevant);
            break;
          case 'DELETE':
            // Se elimina un pedido relevante del usuario
            relevant = oldAssigned && oldRelevant;
            break;
        }

        if (relevant) {
          debounced();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, vzlaId, debounced]);
}
