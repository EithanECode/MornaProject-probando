"use client";

import React from 'react';
import ConfigurationContent from '@/components/shared/configuration/ConfigurationContent';

// Pagos no tiene (todavía) un contexto propio con setPagos; si se crea luego se puede pasar onUserImageUpdate
// Reutilizamos el componente compartido indicando role="pagos" para permitir estilos o condiciones futuras.

export default function ConfiguracionPagosPage() {
  return (
    <ConfigurationContent role="pagos" />
  );
}
