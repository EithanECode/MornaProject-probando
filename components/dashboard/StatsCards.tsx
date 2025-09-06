"use client";

import { memo } from 'react';
import { Package, Clock, CheckCircle, Plane } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { OrderStats } from '@/lib/types/dashboard';

interface StatsCardsProps {
  stats: OrderStats | null;
  animateStats: boolean;
}

// Memoizar las configuraciones de las tarjetas
const CARD_CONFIGS = [
  {
    id: 'total',
    label: 'Total Pedidos',
    icon: Package,
    gradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200 dark:border-blue-700',
    textColor: 'text-blue-700 dark:text-blue-300',
    valueColor: 'text-blue-800 dark:text-blue-200',
    iconBg: 'bg-blue-100 dark:bg-blue-800/30',
    iconColor: 'text-blue-600 dark:text-blue-400'
  },
  {
    id: 'pending',
    label: 'Pendientes',
    icon: Clock,
    gradient: 'from-yellow-50 to-orange-50',
    borderColor: 'border-yellow-200 dark:border-yellow-700',
    textColor: 'text-yellow-700 dark:text-yellow-300',
    valueColor: 'text-yellow-800 dark:text-yellow-200',
    iconBg: 'bg-yellow-100 dark:bg-yellow-800/30',
    iconColor: 'text-yellow-600 dark:text-yellow-400'
  },
  {
    id: 'completed',
    label: 'Completados',
    icon: CheckCircle,
    gradient: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200 dark:border-green-700',
    textColor: 'text-green-700 dark:text-green-300',
    valueColor: 'text-green-800 dark:text-green-200',
    iconBg: 'bg-green-100 dark:bg-green-800/30',
    iconColor: 'text-green-600 dark:text-green-400'
  },
  {
    id: 'inTransit',
    label: 'En Tránsito',
    icon: Plane,
    gradient: 'from-purple-50 to-violet-50',
    borderColor: 'border-purple-200 dark:border-purple-700',
    textColor: 'text-purple-700 dark:text-purple-300',
    valueColor: 'text-purple-800 dark:text-purple-200',
    iconBg: 'bg-purple-100 dark:bg-purple-800/30',
    iconColor: 'text-purple-600 dark:text-purple-400'
  }
] as const;

// Componente individual de tarjeta memoizado
const StatCard = memo(({ 
  config, 
  value, 
  animateStats, 
  delay 
}: { 
  config: typeof CARD_CONFIGS[number];
  value: number;
  animateStats: boolean;
  delay: number;
}) => {
  const Icon = config.icon;
  
  return (
    <Card className={`bg-gradient-to-r ${config.gradient} ${config.borderColor} shadow-lg hover:shadow-xl transition-all duration-300`}>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm md:text-base font-medium ${config.textColor}`}>{config.label}</p>
            <p className={`text-2xl md:text-3xl font-bold ${config.valueColor} transition-all duration-1000 delay-${delay} ${animateStats ? 'scale-100' : 'scale-0'}`}>
              {value}
            </p>
          </div>
          <div className={`w-10 h-10 md:w-12 md:h-12 ${config.iconBg} rounded-lg flex items-center justify-center`}>
            <Icon className={`w-5 h-5 md:w-6 md:h-6 ${config.iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

const StatsCards = memo(({ stats, animateStats }: StatsCardsProps) => {
  // Usar datos por defecto si stats es null para evitar elementos invisibles
  const defaultStats: OrderStats = {
    total: 0,
    pending: 0,
    completed: 0,
    inTransit: 0
  };
  
  const displayStats = stats || defaultStats;
  
  // Manejar el caso cuando stats es null con skeleton loading
  if (!stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {CARD_CONFIGS.map((config, index) => (
          <Card key={config.id} className={`bg-gradient-to-r ${config.gradient} ${config.borderColor} shadow-lg animate-pulse`}>
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-sm md:text-base font-medium ${config.textColor}`}>{config.label}</p>
                  <div className="h-8 bg-current/20 rounded animate-pulse" />
                </div>
                <div className={`w-10 h-10 md:w-12 md:h-12 ${config.iconBg} rounded-lg flex items-center justify-center`}>
                  <config.icon className={`w-5 h-5 md:w-6 md:h-6 ${config.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
      {CARD_CONFIGS.map((config, index) => (
        <StatCard
          key={config.id}
          config={config}
          value={stats[config.id as keyof OrderStats] as number}
          animateStats={animateStats}
          delay={index * 200}
        />
      ))}
    </div>
  );
});

StatsCards.displayName = 'StatsCards';

export default StatsCards; 