import { AppNotification, AppRole, NotificationEventPayload } from './types/notifications';

const nowIso = () => new Date().toISOString();

// Helpers de rutas por rol
const hrefs = {
  client: {
    order: (orderId?: string) => `/cliente/mis-pedidos${orderId ? `?id=${orderId}` : ''}`,
    // Redirigir pagos del cliente al listado de pedidos tras remover /cliente/pagos
    payments: (paymentId?: string) => `/cliente/mis-pedidos${paymentId ? `?paymentId=${paymentId}` : ''}`,
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
    orderCreated: (p: NotificationEventPayload): AppNotification => ({
      id: `cli-created-${p.orderId}-${Date.now()}`,
      role: 'client',
      title: 'notifications.client.orderCreated.title',
      description: `notifications.client.orderCreated.description|${JSON.stringify({ orderId: p.orderId })}`,
      href: hrefs.client.order(p.orderId),
      severity: 'info',
      unread: true,
      createdAt: nowIso(),
    }),
    quoteReady: (p: NotificationEventPayload): AppNotification => ({
      id: `cli-quote-${p.orderId}-${Date.now()}`,
      role: 'client',
      title: 'notifications.client.quoteReady.title',
      description: `notifications.client.quoteReady.description|${JSON.stringify({ orderId: p.orderId })}`,
      href: hrefs.client.order(p.orderId),
      severity: 'info',
      unread: true,
      createdAt: nowIso(),
    }),
    orderStatusChanged: (p: NotificationEventPayload): AppNotification => ({
      id: `cli-order-${p.orderId}-${Date.now()}`,
      role: 'client',
      title: 'notifications.client.orderStatusChanged.title',
      description: 'notifications.client.orderStatusChanged.description',
      href: hrefs.client.order(p.orderId),
      severity: 'info',
      unread: true,
      createdAt: nowIso(),
    }),
    paymentReviewed: (p: NotificationEventPayload): AppNotification => ({
      id: `cli-pay-${p.paymentId || p.orderId}-${Date.now()}`,
      role: 'client',
      title: 'notifications.client.paymentReviewed.title',
      description: `notifications.client.paymentReviewed.${
        p.status?.toLowerCase().includes('rechaz') ? 'descRejected' : p.status?.toLowerCase().includes('aprob') ? 'descApproved' : 'descReviewed'
      }|${JSON.stringify({ orderId: p.orderId })}`,
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
      title: 'notifications.china.newOrderForQuote.title',
      description: `notifications.china.newOrderForQuote.description|${JSON.stringify({ orderId: p.orderId })}`,
      href: hrefs.china.quotes(p.orderId),
      severity: 'info',
      unread: true,
      createdAt: nowIso(),
    }),
    orderRequiresAttention: (p: NotificationEventPayload): AppNotification => ({
      id: `cn-attn-${p.orderId}-${Date.now()}`,
      role: 'china',
      title: 'notifications.china.orderRequiresAttention.title',
      description: `notifications.china.orderRequiresAttention.description|${JSON.stringify({ orderId: p.orderId })}`,
      href: hrefs.china.quotes(p.orderId),
      severity: 'info',
      unread: true,
      createdAt: nowIso(),
    }),
    readyToPack: (p: NotificationEventPayload): AppNotification => ({
      id: `cn-pack-${p.orderId}-${Date.now()}`,
      role: 'china',
      title: 'notifications.china.readyToPack.title',
      description: `notifications.china.readyToPack.description|${JSON.stringify({ orderId: p.orderId })}`,
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
      title: 'notifications.pagos.newAssignedOrder.title',
      description: `notifications.pagos.newAssignedOrder.description|${JSON.stringify({ orderId: p.orderId })}`,
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
      title: 'notifications.venezuela.newAssignedOrder.title',
      description: `notifications.venezuela.newAssignedOrder.description|${JSON.stringify({ orderId: p.orderId })}`,
      href: hrefs.venezuela.assigned(p.orderId),
      severity: 'info',
      unread: true,
      createdAt: nowIso(),
    }),
  },
};

export type NotificationsFactoryType = typeof NotificationsFactory;
