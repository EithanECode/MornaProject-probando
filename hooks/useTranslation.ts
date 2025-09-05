"use client";

import { useLanguage } from '@/lib/LanguageContext';
import esTranslations from '../lib/translations/es.json';
import enTranslations from '../lib/translations/en.json';

type TranslationKey = string;

const translations = {
  es: esTranslations,
  en: enTranslations,
  zh: esTranslations // Por ahora usar español para chino, lo cambiaremos después
};

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: TranslationKey, options?: Record<string, any>): string => {
    const keys = key.split('.');
    let current: any = translations[language];

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback al español si no se encuentra la traducción
        current = translations.es;
        for (const fallbackKey of keys) {
          if (current && typeof current === 'object' && fallbackKey in current) {
            current = current[fallbackKey];
          } else {
            return key; // Devolver la clave si no se encuentra
          }
        }
        break;
      }
    }

    let result = typeof current === 'string' ? current : key;

    // Interpolación de variables en la cadena
    if (options) {
      Object.entries(options).forEach(([k, v]) => {
        result = result.replace(new RegExp(`{{\s*${k}\s*}}`, 'g'), String(v));
      });
    }

    return result;
  };

  return { t, language };
}
