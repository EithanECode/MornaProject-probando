export type TFunction = (key: string, options?: Record<string, any>) => string;
"use client";

import { useLanguage } from '@/lib/LanguageContext';
import esTranslations from '@/lib/translations/es.json';
import enTranslations from '@/lib/translations/en.json';
import zhTranslations from '@/lib/translations/zk.json';

type TranslationKey = string;

const translations = {
  es: esTranslations,
  en: enTranslations,
  zh: zhTranslations
};

export function useTranslation() {
  const { language } = useLanguage();

  const t = (key: TranslationKey, options?: Record<string, any>): string => {
    const keys = key.split('.');
    let current: any = translations[language];
    let usedLanguage = language;

    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        // Fallback al español si no se encuentra la traducción
        current = translations.es;
        usedLanguage = 'es';
        for (const fallbackKey of keys) {
          if (current && typeof current === 'object' && fallbackKey in current) {
            current = current[fallbackKey];
          } else {
            console.log('[i18n][MISS]', { lang: language, key, tried: keys });
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

    console.log('[i18n][HIT]', { lang: usedLanguage, key, result });
    return result;
  };

  return { t, language };
}
