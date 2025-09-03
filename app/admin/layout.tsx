"use client";
import { AdminProvider } from '@/lib/AdminContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
      {children}
    </AdminProvider>
  );
}
