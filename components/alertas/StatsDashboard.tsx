import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, AlertTriangle, CheckCircle2, Bell } from 'lucide-react';

interface StatsDashboardProps {
  stats: {
    total: number;
    critical: number;
    warning: number;
    info: number;
    resolved: number;
  };
}

const StatCard: React.FC<{ 
  title: string; 
  value: number; 
  color: string; 
  icon: React.ReactNode; 
  delay?: number;
  gradient: string;
}> = ({ title, value, color, icon, delay = 0, gradient }) => (
  <Card className={`shadow-lg border-0 bg-gradient-to-r ${gradient} text-white transform hover:-translate-y-1 transition-all duration-300 hover:shadow-xl`} style={{ transitionDelay: `${delay}ms` }}>
    <CardContent className="p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-white/80 text-sm md:text-base font-medium">{title}</p>
          <p className="text-2xl md:text-3xl font-bold transition-all duration-1000">{value}</p>
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-full flex items-center justify-center">
          {icon}
        </div>
      </div>
    </CardContent>
  </Card>
);

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
      <StatCard
        title="Alertas Activas"
        value={stats.total}
        color="indigo"
        gradient="from-indigo-500 to-indigo-600"
        icon={<Bell className="w-5 h-5 md:w-6 md:h-6 animate-bounce" />}
        delay={0}
      />
      <StatCard
        title="Críticas"
        value={stats.critical}
        color="red"
        gradient="from-red-500 to-red-600"
        icon={<AlertCircle className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />}
        delay={200}
      />
      <StatCard
        title="Advertencias"
        value={stats.warning}
        color="yellow"
        gradient="from-yellow-500 to-yellow-600"
        icon={<AlertTriangle className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />}
        delay={400}
      />
      <StatCard
        title="Resueltas Hoy"
        value={stats.resolved}
        color="green"
        gradient="from-green-500 to-green-600"
        icon={<CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 animate-bounce" />}
        delay={600}
      />
    </div>
  );
};

export default StatsDashboard;