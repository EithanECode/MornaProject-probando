"use client";

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

interface LanguageSwitcherProps {
  position?: 'fixed-bottom-right' | 'inline';
  className?: string;
}

const containerStyles: Record<string, React.CSSProperties> = {
  'fixed-bottom-right': {
    position: 'fixed',
    bottom: '16px',
    right: '16px',
    background: 'rgba(255,255,255,0.85)',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '6px 10px',
    fontSize: '0.85rem',
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(6px)'
  },
  inline: {}
};

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ position = 'fixed-bottom-right', className }) => {
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  return (
    <div style={containerStyles[position]} className={className}>
      <label htmlFor="lang-switch" style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
        {t('auth.common.languageLabel')}
      </label>
      <select
        id="lang-switch"
        value={language}
        onChange={(e) => setLanguage(e.target.value as any)}
        style={{
          padding: '2px 6px',
          borderRadius: '4px',
          border: '1px solid #aaa',
          background: '#fff',
          cursor: 'pointer'
        }}
      >
        <option value="es">🇪🇸 Español</option>
        <option value="en">🇬🇧 English</option>
        <option value="zh">🇨🇳 中文</option>
      </select>
    </div>
  );
};

export default LanguageSwitcher;
