import { AppNotification, AppRole, NotificationEventPayload } from './types/notifications';

const nowIso = () => new Date().toISOString();

// Helpers de rutas por rol
const hrefs = {
  client: {
    order: (orderId?: string) => `/cliente/mis-pedidos${orderId ? `?id=${orderId}` : ''}`,
    payments: (paymentId?: string) => `/cliente/pagos${paymentId ? `?id=${paymentId}` : ''}`,
  },
  china: {
    quotes: (orderId?: string) => `/china/pedidos${orderId ? `?id=${orderId}` : ''}`,
  },
  pagos: {
    assigned: (orderId?: string) => `/pagos/validacion-pagos${orderId ? `?id=${orderId}` : ''}`,
  },
  admin: {
    management: () => `/admin/gestion`,
  },
  venezuela: {
    assigned: (orderId?: string) => `/venezuela/pedidos${orderId ? `?id=${orderId}` : ''}`,
  },
};

// Generadores por rol según requisitos del usuario
export const NotificationsFactory = {
  client: {
    quoteReady: (p: NotificationEventPayload): AppNotification => ({
      id: `cli-quote-${p.orderId}-${Date.now()}`,
      role: 'client',
      title: 'Tu cotización está lista',
      description: p.orderId ? `Tu cotización del pedido #${p.orderId} está lista` : 'Tu cotización está lista',
      href: hrefs.client.order(p.orderId),
      severity: 'info',
      unread: true,
      createdAt: nowIso(),
    }),
    orderStatusChanged: (p: NotificationEventPayload): AppNotification => ({
      id: `cli-order-${p.orderId}-${Date.now()}`,
      role: 'client',
      title: 'Actualización de pedido',
      description: (() => {
        if (!p.status) return 'Tu pedido cambió de estado';
        // Texto especial para cuando pasa a estado "Asignado Venezuela"
        if (p.status.toLowerCase() === 'asignado venezuela') {
          return 'Tu pedido está en espera de confirmación de pago';
        }
        return `Tu pedido cambió a: ${p.status}`;
      })(),
      href: hrefs.client.order(p.orderId),
      severity: 'info',
      unread: true,
      createdAt: nowIso(),
    }),
    paymentReviewed: (p: NotificationEventPayload): AppNotification => ({
      id: `cli-pay-${p.paymentId || p.orderId}-${Date.now()}`,
      role: 'client',
      title: 'Resultado de pago',
      description: (() => {
        const orderTag = p.orderId ? ` del pedido #${p.orderId}` : '';
        if (!p.status) return `Tu pago${orderTag} fue revisado`;
        // Normalizar mensajes comunes
        const st = p.status.toLowerCase();
        if (st === 'rechazado' || st === 'rechazado ') return `Tu pago${orderTag} fue rechazado`;
        if (st === 'aprobado' || st === 'aprobado ') return `Tu pago${orderTag} fue aprobado`;
        return `Tu pago${orderTag} fue ${p.status}`;
      })(),
      href: hrefs.client.payments(p.paymentId),
      severity: p.status === 'rechazado' ? 'warn' : 'info',
      unread: true,
      createdAt: nowIso(),
    }),
  },
  china: {
    newOrderForQuote: (p: NotificationEventPayload): AppNotification => ({
      id: `cn-quote-${p.orderId}-${Date.now()}`,
      role: 'china',
      title: 'Nuevo pedido para cotización',
      description: p.orderId
        ? `Pedido #${p.orderId} requiere cotización para el empleado chino`
        : 'Nuevo pedido requiere cotización para el empleado chino',
      href: hrefs.china.quotes(p.orderId),
      severity: 'info',
      unread: true,
      createdAt: nowIso(),
    }),
    orderRequiresAttention: (p: NotificationEventPayload): AppNotification => ({
      id: `cn-attn-${p.orderId}-${Date.now()}`,
      role: 'china',
      title: 'Pedido requiere atención',
      description: p.orderId ? `Pedido #${p.orderId} pendiente para gestión en China` : 'Hay pedidos pendientes para China',
      href: hrefs.china.quotes(p.orderId),
      severity: 'info',
      unread: true,
      createdAt: nowIso(),
    }),
  },
  pagos: {
    newAssignedOrder: (p: NotificationEventPayload): AppNotification => ({
      id: `pg-assign-${p.orderId}-${Date.now()}`,
      role: 'pagos',
      title: 'Nuevo pedido asignado',
      description: p.orderId ? `Pedido ${p.orderId} asignado para validación de pago` : 'Nuevo pedido asignado',
      href: hrefs.pagos.assigned(p.orderId),
      severity: 'info',
      unread: true,
      createdAt: nowIso(),
    }),
  },
  admin: {
    managementChanged: (p: NotificationEventPayload): AppNotification => ({
      id: `ad-mgmt-${Date.now()}`,
      role: 'admin',
      title: 'Cambios en gestión',
      description: p.userName && p.configSection
        ? `${p.userName} modificó ${p.configSection}`
        : 'Un usuario realizó cambios en gestión',
      href: hrefs.admin.management(),
      severity: 'info',
      unread: true,
      createdAt: nowIso(),
    }),
  },
  venezuela: {
    newAssignedOrder: (p: NotificationEventPayload): AppNotification => ({
      id: `ve-assign-${p.orderId}-${Date.now()}`,
      role: 'venezuela',
      title: 'Nuevo pedido asignado',
      description: p.orderId ? `Pedido ${p.orderId} asignado` : 'Nuevo pedido asignado',
      href: hrefs.venezuela.assigned(p.orderId),
      severity: 'info',
      unread: true,
      createdAt: nowIso(),
    }),
  },
};

export type NotificationsFactoryType = typeof NotificationsFactory;
