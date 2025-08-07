import { 
  Package, 
  RefreshCw, 
  BarChart3, 
  CheckCircle, 
  Plane, 
  MapPin 
} from 'lucide-react';
import { WorkflowStep, RecentOrder } from '@/lib/types/dashboard';

export const INITIAL_STATS = {
  total: 156,
  pending: 23,
  completed: 128,
  inTransit: 5
};

export const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: 'solicitud',
    title: 'Pedido Solicitado',
    subtitle: 'Cliente realiza pedido',
    icon: Package,
    status: 'completed',
    color: 'text-blue-500'
  },
  {
    id: 'cotizacion',
    title: 'Cotización China',
    subtitle: 'Verificación de precios',
    icon: RefreshCw,
    status: 'completed',
    color: 'text-orange-500'
  },
  {
    id: 'cotizacion-vzla',
    title: 'Cotización Venezuela',
    subtitle: 'Precio final al cliente',
    icon: BarChart3,
    status: 'active',
    color: 'text-green-500'
  },
  {
    id: 'pago',
    title: 'Cliente Paga',
    subtitle: 'Confirmación de pago',
    icon: CheckCircle,
    status: 'pending',
    color: 'text-gray-500'
  },
  {
    id: 'empaque',
    title: 'Re-empacar China',
    subtitle: 'Preparación para envío',
    icon: Package,
    status: 'pending',
    color: 'text-gray-500'
  },
  {
    id: 'transito',
    title: 'En Tránsito',
    subtitle: 'Aéreo/Marítimo',
    icon: Plane,
    status: 'pending',
    color: 'text-gray-500'
  },
  {
    id: 'almacen',
    title: 'Almacén Vzla',
    subtitle: 'Llegada a Venezuela',
    icon: MapPin,
    status: 'pending',
    color: 'text-gray-500'
  },
  {
    id: 'entregado',
    title: 'Entregado',
    subtitle: 'Entrega final',
    icon: CheckCircle,
    status: 'pending',
    color: 'text-gray-500'
  }
];

export const RECENT_ORDERS: RecentOrder[] = [
  { id: '#ORD-001', client: 'Maria González', status: 'En tránsito aéreo', progress: 65, eta: '2 días' },
  { id: '#ORD-002', client: 'Carlos Pérez', status: 'En almacén Vzla', progress: 85, eta: '1 día' },
  { id: '#ORD-003', client: 'Ana Rodriguez', status: 'Cotización China', progress: 25, eta: '5 días' },
  { id: '#ORD-004', client: 'Luis Martinez', status: 'Re-empacado', progress: 45, eta: '7 días' }
]; 