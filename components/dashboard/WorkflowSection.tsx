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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="relative">
              <div className={`
                p-4 rounded-xl border-2 transition-all duration-500 hover:shadow-lg cursor-pointer
                ${step.status === 'completed' ? 'bg-green-50 border-green-200 shadow-sm' : ''}
                ${step.status === 'active' ? 'bg-blue-50 border-blue-200 shadow-md ring-2 ring-blue-400 ring-opacity-50' : ''}
                ${step.status === 'pending' ? 'bg-gray-50 border-gray-200' : ''}
              `}>
                <div className="text-center space-y-2">
                  <div className={`
                    w-12 h-12 mx-auto rounded-full flex items-center justify-center transition-all duration-300
                    ${step.status === 'completed' ? 'bg-green-100' : ''}
                    ${step.status === 'active' ? 'bg-blue-100 animate-pulse' : ''}
                    ${step.status === 'pending' ? 'bg-gray-100' : ''}
                  `}>
                    <step.icon className={`w-6 h-6 ${step.color} ${
                      step.status === 'active' ? 'animate-bounce' : ''
                    }`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{step.title}</p>
                    <p className="text-xs text-slate-500">{step.subtitle}</p>
                  </div>
                </div>
              </div>
              
              {index < workflowSteps.length - 1 && (
                <div className="hidden md:block absolute top-8 -right-2 w-4 h-4">
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 