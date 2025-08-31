import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Plus } from 'lucide-react';

interface EmptyStateProps {
  onGenerateSample: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ onGenerateSample }) => {
  return (
    <Card className="shadow-lg border-0 bg-white/70 backdrop-blur-sm">
      <CardContent className="p-8 md:p-12">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <Bell className="w-8 h-8 md:w-10 md:h-10 text-blue-600 dark:text-blue-400" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">
              No hay alertas activas
            </h3>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-md">
              ¡Excelente! Parece que todo está funcionando correctamente. No hay alertas que requieran atención inmediata.
            </p>
          </div>
          
          <Button
            onClick={onGenerateSample}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generar alertas de ejemplo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmptyState;