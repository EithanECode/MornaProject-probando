"use client";

import { Package, Clock, CheckCircle, Plane } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { OrderStats } from '@/lib/types/dashboard';

interface StatsCardsProps {
  stats: OrderStats;
  animateStats: boolean;
}

export default function StatsCards({ stats, animateStats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Pedidos</p>
              <p className={`text-3xl font-bold transition-all duration-1000 ${animateStats ? 'scale-100' : 'scale-0'}`}>
                {stats.total}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Package className="w-6 h-6 animate-bounce" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium">Pendientes</p>
              <p className={`text-3xl font-bold transition-all duration-1000 delay-200 ${animateStats ? 'scale-100' : 'scale-0'}`}>
                {stats.pending}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Completados</p>
              <p className={`text-3xl font-bold transition-all duration-1000 delay-400 ${animateStats ? 'scale-100' : 'scale-0'}`}>
                {stats.completed}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 animate-pulse" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-none shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">En Tránsito</p>
              <p className={`text-3xl font-bold transition-all duration-1000 delay-600 ${animateStats ? 'scale-100' : 'scale-0'}`}>
                {stats.inTransit}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <div className="relative">
                <Plane className="w-6 h-6 animate-bounce" style={{ animationDuration: '2s' }} />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 