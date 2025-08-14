export interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  priority: 'urgente' | 'alta' | 'media' | 'baja';
  title: string;
  message: string;
  category: string;
  action: string;
  pedidoId?: string;
  usuario?: string;
  timestamp: Date;
}

export interface AlertFormData {
  type: 'critical' | 'warning' | 'info';
  priority: 'urgente' | 'alta' | 'media' | 'baja';
  title: string;
  message: string;
  category: string;
  action: string;
  pedidoId?: string;
  usuario?: string;
}