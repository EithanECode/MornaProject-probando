export interface OrderStats {
  total: number;
  pending: number;
  completed: number;
  inTransit: number;
}

export interface WorkflowStep {
  id: string;
  title: string;
  subtitle: string;
  icon: any;
  status: 'completed' | 'active' | 'pending';
  color: string;
}

export interface RecentOrder {
  id: string;
  client: string;
  status: string;
  progress: number;
  eta: string;
} 