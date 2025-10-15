'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Ruta descontinuada: /cliente/pagos
export default function ClientePagosRemoved() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/cliente/mis-pedidos');
  }, [router]);
  return null;
}