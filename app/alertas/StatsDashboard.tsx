import React from 'react';

interface StatsDashboardProps {
  stats: {
    total: number;
    critical: number;
    warning: number;
    info: number;
    resolved: number;
  };
}


const colorGradients: Record<string, string> = {
  indigo: 'from-indigo-500 to-indigo-600',
  red: 'from-red-700 to-red-900',
  yellow: 'from-yellow-600 to-yellow-800',
  green: 'from-green-700 to-green-900',
};

const StatCard: React.FC<{ title: string; value: number; color: string; icon: React.ReactNode; delay?: number }> = ({ title, value, color, icon, delay = 0 }) => (
  <div
    className={`bg-gradient-to-r ${colorGradients[color] || ''} text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 rounded-lg`}
    style={{ transitionDelay: `${delay}ms` }}
  >
    <div className="p-6 flex items-center justify-between">
      <div>
        <p className={`text-${color}-100 text-sm font-medium`}>{title}</p>
        <p className={`text-3xl font-bold transition-all duration-1000 ${value ? 'scale-100' : 'scale-0'}`}>{value}</p>
      </div>
      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
        {icon}
      </div>
    </div>
  </div>
);


import { AlertCircle, AlertTriangle, CheckCircle2, Bell } from 'lucide-react';

const StatsDashboard: React.FC<StatsDashboardProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <StatCard
        title="Alertas Activas"
        value={stats.total}
        color="indigo"
        icon={<Bell className="w-6 h-6 animate-bounce" />}
        delay={0}
      />
      <StatCard
        title="Críticas"
        value={stats.critical}
        color="red"
        icon={<AlertCircle className="w-6 h-6 animate-pulse" />}
        delay={200}
      />
      <StatCard
        title="Advertencias"
        value={stats.warning}
        color="yellow"
        icon={<AlertTriangle className="w-6 h-6 animate-pulse" />}
        delay={400}
      />
      <StatCard
        title="Resueltas Hoy"
        value={stats.resolved}
        color="green"
        icon={<CheckCircle2 className="w-6 h-6 animate-bounce" />}
        delay={600}
      />
    </div>
  );
};

export default StatsDashboard;