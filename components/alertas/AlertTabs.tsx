import * as React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface AlertTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  counts: { critical: number; warning: number; resolved: number };
}

const AlertTabs: React.FC<AlertTabsProps> = ({ activeTab, onTabChange, counts }) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger
          value="critical"
          className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700 data-[state=active]:shadow-lg transition-all"
        >
          <span className="font-semibold">Alertas Críticas</span>
          <span className="ml-2 bg-red-500 text-white rounded-full px-2 text-xs">{counts.critical}</span>
        </TabsTrigger>
        <TabsTrigger
          value="warning"
          className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-700 data-[state=active]:shadow-lg transition-all"
        >
          <span className="font-semibold">Advertencias</span>
          <span className="ml-2 bg-yellow-400 text-white rounded-full px-2 text-xs">{counts.warning}</span>
        </TabsTrigger>
        <TabsTrigger
          value="resolved"
          className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:shadow-lg transition-all"
        >
          <span className="font-semibold">Resueltas</span>
          <span className="ml-2 bg-green-500 text-white rounded-full px-2 text-xs">{counts.resolved}</span>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default AlertTabs;
