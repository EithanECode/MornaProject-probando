"use client";

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';

export default function ReportesPage() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} />

      <main className={`flex-1 transition-all duration-300 ${sidebarExpanded ? 'ml-72' : 'ml-20'}`}>
        <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-40">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-slate-900">Reportes</h1>
            <p className="text-sm text-slate-600">Generación y visualización de reportes</p>
          </div>
        </header>

        <div className="p-6 space-y-6">
          <div className="bg-white/70 rounded-xl border border-slate-200 p-6">
            <p className="text-slate-600">Placeholder de Reportes. Implementar filtros y visualizaciones.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

