"use client";

import { Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RecentOrder } from '@/lib/types/dashboard';

interface RecentOrdersProps {
  orders: RecentOrder[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card className="lg:col-span-2 shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Package className="w-5 h-5 mr-2 text-blue-600" />
          Pedidos Recientes
        </CardTitle>
        <CardDescription>
          Seguimiento de pedidos en tiempo real
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{order.id}</p>
                  <p className="text-sm text-slate-600">{order.client}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">{order.status}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress value={order.progress} className="w-20 h-2" />
                    <span className="text-xs text-slate-500">{order.progress}%</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  ETA: {order.eta}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 