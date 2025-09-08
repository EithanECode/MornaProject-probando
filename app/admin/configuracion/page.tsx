"use client";

import React from 'react';
import ConfigurationContent from '@/components/shared/configuration/ConfigurationContent';
import { useAdminContext } from '@/lib/AdminContext';

export default function ConfiguracionPage() {
  const { setAdmin } = useAdminContext();
  return (
    <ConfigurationContent
      role="admin"
      onUserImageUpdate={(url) => setAdmin({ userImage: url })}
    />
  );
}