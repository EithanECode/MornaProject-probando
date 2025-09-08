"use client";

import React from 'react';
import ConfigurationContent from '@/components/shared/configuration/ConfigurationContent';
import { useChinaContext } from '@/lib/ChinaContext';

export default function ConfiguracionPage() {
  const { setChina } = useChinaContext();
  return (
    <ConfigurationContent role="china" onUserImageUpdate={(url) => setChina({ userImage: url })} />
  );
}
