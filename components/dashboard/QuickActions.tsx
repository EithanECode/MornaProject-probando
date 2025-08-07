"use client";

import { Plus, RefreshCw, Plane, Ship } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function QuickActions() {
  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Pedido (China)
          </Button>
          <Button className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Pedido (Vzla)
          </Button>
          <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            Avanzar Todos los Pedidos
          </Button>
        </CardContent>
      </Card>

      {/* Transport Methods */}
      <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg">Métodos de Envío</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-200">
              <Plane className="w-8 h-8 mx-auto mb-2 text-blue-600 animate-bounce" style={{ animationDuration: '3s' }} />
              <p className="text-xs font-semibold text-blue-900">Aéreo</p>
              <p className="text-xs text-blue-600">15-20 días</p>
            </div>
            <div className="p-3 bg-teal-50 rounded-lg text-center border border-teal-200">
              <Ship className="w-8 h-8 mx-auto mb-2 text-teal-600" style={{ 
                animation: 'float 4s ease-in-out infinite',
              }} />
              <p className="text-xs font-semibold text-teal-900">Marítimo</p>
              <p className="text-xs text-teal-600">35-45 días</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 