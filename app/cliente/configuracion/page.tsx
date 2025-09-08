"use client";

import React from 'react';
import ConfigurationContent from '@/components/shared/configuration/ConfigurationContent';
import { useClientContext } from '@/lib/ClientContext';

export default function ConfiguracionPage() {
  const { setClient } = useClientContext();
  return (
    <ConfigurationContent role="client" onUserImageUpdate={(url) => setClient({ userImage: url })} />
  );
}
