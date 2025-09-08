"use client";

import React from 'react';
import ConfigurationContent from '@/components/shared/configuration/ConfigurationContent';
import { useVzlaContext } from '@/lib/VzlaContext';

export default function ConfiguracionPage() {
  const { setVzla } = useVzlaContext();
  return (
    <ConfigurationContent role="venezuela" onUserImageUpdate={(url) => setVzla({ userImage: url })} />
  );
}
