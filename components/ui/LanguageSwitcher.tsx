import React, { useState } from 'react';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
];

export function LanguageSwitcher({ lang, setLang }: { lang: 'es' | 'en' | 'zh', setLang: (l: 'es' | 'en' | 'zh') => void }) {
  const [showLangMenu, setShowLangMenu] = useState(false);

  let bg = 'bg-gradient-to-br from-blue-500 to-indigo-600';
  let ring = 'focus:ring-blue-200';
  if (lang === 'en') {
    bg = 'bg-gradient-to-br from-green-500 to-green-700';
    ring = 'focus:ring-green-200';
  }
  if (lang === 'zh') {
    bg = 'bg-gradient-to-br from-red-500 to-red-700';
    ring = 'focus:ring-red-200';
  }

  return (
    <div className="relative mr-2">
      <button
        aria-label="Cambiar idioma"
        onClick={() => setShowLangMenu(v => !v)}
        className={`w-12 h-12 rounded-full ${bg} shadow-lg flex items-center justify-center border-4 border-white hover:scale-105 transition-all duration-300 focus:outline-none ${ring} group`}
        style={{ boxShadow: '0 2px 12px 0 rgba(60,80,180,0.13)' }}
      >
        <span className="sr-only">Cambiar idioma</span>
        <span className="relative">
          <Globe className="w-8 h-8 drop-shadow-lg" />
          <span className="absolute -bottom-1 -right-1 text-base select-none pointer-events-none">
            {languages.find(l => l.code === lang)?.flag}
          </span>
        </span>
      </button>
      {showLangMenu && (
        <div className="absolute top-14 right-0 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 px-4 flex flex-col gap-2 animate-fade-in-up min-w-[120px] z-50">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code as 'es' | 'en' | 'zh'); setShowLangMenu(false); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-slate-900 hover:bg-blue-50 transition-colors duration-200 font-medium ${lang === l.code ? 'bg-blue-100' : ''}`}
            >
              <span className="text-xl">{l.flag}</span> {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
