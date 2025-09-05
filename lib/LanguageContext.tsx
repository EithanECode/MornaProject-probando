"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = 'es' | 'en' | 'zh';

export type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('es');
  const [mounted, setMounted] = useState(false);

  // Cargar idioma desde localStorage al montar el componente
  useEffect(() => {
    const savedLanguage = localStorage.getItem('pita-language') as Language;
    if (savedLanguage && ['es', 'en', 'zh'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
    setMounted(true);
  }, []);

  // Función para cambiar idioma y guardarlo en localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('pita-language', lang);
    
    // Cambiar el atributo lang del documento HTML
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  };

  // No renderizar hasta que se monte para evitar hidration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
