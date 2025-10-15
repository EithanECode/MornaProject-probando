"use client";

// Esta página fue descontinuada. Redirigimos al dashboard de cliente.
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
export default function Removed() {
  const router = useRouter();
  useEffect(() => { router.replace('/cliente'); }, [router]);
  return null;
}