"use client";

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex">
      <Sidebar isExpanded={sidebarExpanded} setIsExpanded={setSidebarExpanded} />
      <main className={`flex-1 transition-all duration-200 ease-out ${sidebarExpanded ? 'ml-72' : 'ml-20'}`}>
        {children}
      </main>
    </div>
  );
} 