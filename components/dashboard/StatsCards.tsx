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
    gradient: 'from-blue-500 to-blue-600',
    textColor: 'text-blue-100',
    animation: 'animate-bounce'
  },
  {
    id: 'pending',
    label: 'Pendientes',
    icon: Clock,
    gradient: 'from-orange-500 to-orange-600',
    textColor: 'text-orange-100',
    animation: 'animate-pulse'
  },
  {
    id: 'completed',
    label: 'Completados',
    icon: CheckCircle,
    gradient: 'from-green-500 to-green-600',
    textColor: 'text-green-100',
    animation: 'animate-pulse'
  },
  {
    id: 'inTransit',
    label: 'En Tránsito',
    icon: Plane,
    gradient: 'from-purple-500 to-purple-600',
    textColor: 'text-purple-100',
    animation: 'animate-bounce',
    animationDuration: '2s'
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
    <Card className={`stats-card bg-gradient-to-r ${config.gradient} text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`${config.textColor} text-sm font-medium`}>{config.label}</p>
            <p className={`text-3xl font-bold transition-all duration-1000 delay-${delay} ${animateStats ? 'scale-100' : 'scale-0'}`}>
              {value}
            </p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Icon 
              className={`w-6 h-6 ${config.animation}`}
              style={config.animationDuration ? { animationDuration: config.animationDuration } : undefined}
            />
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CARD_CONFIGS.map((config, index) => (
          <Card key={config.id} className={`bg-gradient-to-r ${config.gradient} text-white border-none shadow-lg animate-pulse`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className={`${config.textColor} text-sm font-medium`}>{config.label}</p>
                  <div className="h-8 bg-white/20 rounded animate-pulse" />
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <config.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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