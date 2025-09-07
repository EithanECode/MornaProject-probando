// Centralized order state mappings
// Numeric states (DB): 1..13
// 1 creado, 2 recibido, 3 cotizado, 4-7 procesando, 8-9 enviado, 10-12 etapas finales, 13 entregado

export const PENDING_STATES = [1,2,3] as const; // Esperando pago / recibido / cotizado
export const TRANSIT_STATES = [4,5,6,7,8,9,10,11,12] as const; // Procesando y en tránsito hasta listo entrega
export const DELIVERED_STATES = [13] as const; // Entregado

// (Opcional) estados cancelados si se define uno en DB (no oficial todavía)
export const CANCELLED_STATES: number[] = []; // agregar aquí cuando exista

export const ALL_ACTIVE_STATES = [
  ...PENDING_STATES,
  ...TRANSIT_STATES,
  ...DELIVERED_STATES,
];

export const isPendingState = (s?: number | null) => !!s && PENDING_STATES.includes(s as any);
export const isTransitState = (s?: number | null) => !!s && TRANSIT_STATES.includes(s as any);
export const isDeliveredState = (s?: number | null) => !!s && DELIVERED_STATES.includes(s as any);

export const mapNumericToUI = (s?: number | null): 'esperando-pago' | 'pendiente-china' | 'pendiente-vzla' | 'en-transito' | 'entregado' | 'cancelado' => {
  if (!s) return 'esperando-pago';
  if (s === 1) return 'esperando-pago';
  if (s === 2 || s === 3) return 'pendiente-china';
  if (s === 4) return 'pendiente-vzla';
  if (TRANSIT_STATES.includes(s as any)) return 'en-transito';
  if (DELIVERED_STATES.includes(s as any)) return 'entregado';
  return 'pendiente-china';
};
