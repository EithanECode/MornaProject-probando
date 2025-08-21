"use client";
import { VzlaProvider } from "@/lib/VzlaContext";
import VzlaInit from "./VzlaInit";

export default function VenezuelaLayout({ children }: { children: React.ReactNode }) {
  return (
    <VzlaProvider>
  <VzlaInit />
      {children}
    </VzlaProvider>
  );
}
