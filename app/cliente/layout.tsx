
"use client";
import { ClientProvider } from "@/lib/ClientContext";
import ClientContextInitializer from "./ClientContextInitializer";

export default function ClienteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientProvider>
      <ClientContextInitializer />
      {children}
    </ClientProvider>
  );
}
