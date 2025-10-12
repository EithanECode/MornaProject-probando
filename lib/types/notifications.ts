export type NotificationSeverity = 'info' | 'warn' | 'critical';

export type AppRole = 'client' | 'china' | 'venezuela' | 'pagos' | 'admin';

export interface AppNotification {
  id: string;
  role: AppRole;
  title: string;
  description?: string;
  href?: string;
  severity: NotificationSeverity;
  unread: boolean;
  createdAt: string; // ISO
}

export interface NotificationEventPayload {
  // Campos comunes
  orderId?: string;
  userName?: string;
  configSection?: string;
  paymentId?: string;
  status?: string; // nuevo estado de pedido o de pago
}
