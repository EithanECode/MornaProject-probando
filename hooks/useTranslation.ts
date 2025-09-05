"use client";

import { useLanguage } from '@/lib/LanguageContext';
import esTranslations from '@/lib/translations/es.json';
import enTranslations from '@/lib/translations/en.json';

type TranslationKey = string;

const translations = {
  es: esTranslations,
  en: enTranslations,
  zh: esTranslations // Por ahora usar español para chino, lo cambiaremos después
};

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: TranslationKey, options?: { count?: number }): string => {
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
    
    // Manejar interpolaciones simples
    if (options?.count !== undefined) {
      result = result.replace('{{count}}', options.count.toString());
    }

    return result;
  };

  return { t, language };
}
