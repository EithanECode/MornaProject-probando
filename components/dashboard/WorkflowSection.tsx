"use client";

import { TrendingUp, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WorkflowStep } from '@/lib/types/dashboard';

interface WorkflowSectionProps {
  workflowSteps: WorkflowStep[];
}

export default function WorkflowSection({ workflowSteps }: WorkflowSectionProps) {
  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900 flex items-center">
              <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
              Flujo de Trabajo
            </CardTitle>
            <CardDescription className="text-slate-600">
              Seguimiento completo del proceso de pedidos
            </CardDescription>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            23 pedidos activos
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {/* Contenedor principal */}
        <div className="relative">
          {/* Línea de conexión horizontal */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2 z-0"></div>
          
          {/* Contenedor de pasos con scroll horizontal en móviles */}
          <div className="flex flex-nowrap overflow-x-auto gap-4 lg:gap-6 pb-4 scrollbar-hide">
            {workflowSteps.map((step, index) => (
              <div key={step.id} className="relative flex-shrink-0 w-[140px] lg:w-auto lg:flex-1">
                <div className={`
                  p-3 rounded-xl border-2 transition-all duration-500 hover:shadow-lg cursor-pointer
                  flex flex-col items-center justify-start h-[160px] relative z-10 bg-white
                  ${step.status === 'completed' ? 'border-green-200 shadow-sm' : ''}
                  ${step.status === 'active' ? 'border-blue-200 shadow-md ring-2 ring-blue-400 ring-opacity-50' : ''}
                  ${step.status === 'pending' ? 'border-gray-200' : ''}
                `}>
                  {/* Icono */}
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 mb-2 flex-shrink-0
                    ${step.status === 'completed' ? 'bg-green-100' : ''}
                    ${step.status === 'active' ? 'bg-blue-100 animate-pulse' : ''}
                    ${step.status === 'pending' ? 'bg-gray-100' : ''}
                  `}>
                    <step.icon className={`w-5 h-5 ${step.color} ${
                      step.status === 'active' ? 'animate-bounce' : ''
                    }`} />
                  </div>
                  
                  {/* Texto */}
                  <div className="text-center flex-1 flex flex-col justify-center space-y-1 px-1">
                    <p className="text-xs font-semibold text-slate-900 leading-tight line-clamp-2">{step.title}</p>
                    <p className="text-xs text-slate-500 leading-tight line-clamp-2">{step.subtitle}</p>
                  </div>
                </div>
                
                {/* Flecha de conexión */}
                {index < workflowSteps.length - 1 && (
                  <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 z-20">
                    <div className="bg-white rounded-full p-1 shadow-sm border border-gray-200">
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Indicador de scroll en móviles */}
          <div className="flex justify-center mt-4 lg:hidden">
            <div className="flex space-x-2">
              {workflowSteps.map((_, index) => (
                <div key={index} className="w-2 h-2 rounded-full bg-gray-300"></div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 