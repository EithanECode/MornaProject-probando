"use client";
import { AdminProvider } from '@/lib/AdminContext';
import AdminContextInitializer from './AdminContextInitializer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminProvider>
  <AdminContextInitializer />
      {children}
    </AdminProvider>
  );
}
