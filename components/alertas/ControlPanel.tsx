import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CheckCircle, RefreshCw, Search } from 'lucide-react';

interface ControlPanelProps {
  onGenerateNewAlert: () => void;
  onResolveAll: () => void;
  onRefresh: () => void;
  onSearchChange: (query: string) => void;
  onTypeFilterChange: (type: string) => void;
  onPriorityFilterChange: (priority: string) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ 
  onGenerateNewAlert, 
  onResolveAll, 
  onRefresh, 
  onSearchChange,
  onTypeFilterChange,
  onPriorityFilterChange
}) => {
  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 md:gap-6">
          {/* Filtros y búsqueda */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Buscar alertas..."
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select onValueChange={(value) => onTypeFilterChange(value)}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Tipo (Todos)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tipo (Todos)</SelectItem>
                <SelectItem value="critical">Críticas</SelectItem>
                <SelectItem value="warning">Advertencias</SelectItem>
                <SelectItem value="info">Informativas</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={(value) => onPriorityFilterChange(value)}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Prioridad (Todas)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Prioridad (Todas)</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Media</SelectItem>
                <SelectItem value="baja">Baja</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={onGenerateNewAlert}
              className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Alerta
            </Button>
            <Button
              onClick={onResolveAll}
              variant="outline"
              className="w-full sm:w-auto border-gray-300 hover:bg-gray-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Resolver Todo
            </Button>
            <Button
              onClick={onRefresh}
              variant="outline"
              className="w-full sm:w-auto border-blue-300 hover:bg-blue-50"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ControlPanel;