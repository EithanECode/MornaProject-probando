"use client";
import { ChinaProvider } from "@/lib/ChinaContext";
import ChinaContextInitializer from "./ChinaContextInitializer";

export default function ChinaLayout({ children }: { children: React.ReactNode }) {
  return (
    <ChinaProvider>
      <ChinaContextInitializer />
      {children}
    </ChinaProvider>
  );
}
