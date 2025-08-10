import { AlertFormData } from '../interfaces/Alerts';

export const alertTemplates: Omit<AlertFormData, 'pedidoId' | 'usuario'>[] = [
  {
    type: 'critical',
    priority: 'urgente',
    title: 'Pedido próximo a vencer',
    message: 'PED-{id} - {usuario}: Solo {dias} día(s) restante(s)',
    category: 'Tiempo límite',
    action: 'Acelerar proceso'
  },
  {
    type: 'warning',
    priority: 'media',
    title: 'Error de validación',
    message: 'Pedido {id} - {usuario}: Datos de envío incompletos o incorrectos.',
    category: 'Validación',
    action: 'Revisar datos'
  },
  {
    type: 'info',
    priority: 'baja',
    title: 'Pedido en nueva fase',
    message: 'Pedido {id} - {usuario} ha cambiado su estado a: {estado}.',
    category: 'Estado de pedido',
    action: 'Ver detalles'
  },
  {
    type: 'critical',
    priority: 'alta',
    title: 'Bloqueo de envío',
    message: 'El pedido {id} de {usuario} está bloqueado por falta de pago.',
    category: 'Finanzas',
    action: 'Contactar al cliente'
  },
  {
    type: 'warning',
    priority: 'media',
    title: 'Inventario bajo',
    message: 'El producto del pedido {id} de {usuario} tiene pocas unidades disponibles.',
    category: 'Inventario',
    action: 'Revisar stock'
  },
];

export const sampleUsers: string[] = [
  'María García', 'Carlos Rodríguez', 'Ana Martínez', 'Luis Fernández',
  'Elena Jiménez', 'Roberto Silva', 'Carmen López', 'Diego Morales',
  'Patricia Ruiz', 'Miguel Santos', 'Laura Herrera', 'José Ramírez'
];
