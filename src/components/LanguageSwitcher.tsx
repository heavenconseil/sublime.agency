"use client";

import { useState } from "react";

export type Language = 'fr' | 'en' | 'es' | 'de' | 'ko' | 'zh' | 'ar';

interface LanguageSwitcherProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  textColorClass: string;
}

export default function LanguageSwitcher({ language, setLanguage, textColorClass }: LanguageSwitcherProps) {
  const [showLanguages, setShowLanguages] = useState(false);
  const languages: Language[] = ['fr', 'en', 'es', 'de', 'ko', 'zh', 'ar'];

  return (
    <>
      {/* Language Switcher - Desktop avec bouton rond */}
      <div 
        className="hidden md:flex absolute bottom-8 right-8 z-50 flex-col items-center gap-3"
        onMouseEnter={() => setShowLanguages(true)}
        onMouseLeave={() => setShowLanguages(false)}
      >
        {/* Liste des langues (apparaît au-dessus du bouton) */}
        {showLanguages && (
          <div className="flex flex-col gap-2 font-mono text-xs items-center">
            {languages.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`transition-all cursor-pointer text-center ${
                  language === lang 
                    ? `${textColorClass} opacity-100 font-bold` 
                    : `${textColorClass} opacity-30 ${
                        textColorClass === 'text-black' ? 'hover:text-white' : 'hover:text-black'
                      } hover:opacity-100`
                }`}
                aria-label={`Change language to ${lang.toUpperCase()}`}
              >
                {lang.toUpperCase()}
              </button>
            ))}
          </div>
        )}
        
        {/* Bouton rond noir */}
        <button
          className={`w-6 h-6 rounded-full cursor-pointer flex items-center justify-center ${
            showLanguages 
              ? 'bg-linear-to-br from-pink-500 via-purple-500 to-blue-500' 
              : textColorClass === 'text-black' ? 'bg-black hover:bg-black/80' : 'bg-white hover:bg-white/80'
          }`}
          aria-label="Toggle language selector"
        >
          {showLanguages && (
            <div className={`w-2 h-2 rounded-full ${textColorClass === 'text-black' ? 'bg-white' : 'bg-black'}`}></div>
          )}
        </button>
      </div>

      {/* Language Switcher - Mobile (toujours visible) */}
      <div className="md:hidden absolute bottom-8 right-8 left-8 z-50 flex flex-row gap-3 justify-center font-mono text-xs">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`transition-all cursor-pointer ${
              language === lang 
                ? `${textColorClass} opacity-100 font-bold` 
                : `${textColorClass} opacity-30 hover:opacity-60`
            }`}
            aria-label={`Change language to ${lang.toUpperCase()}`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>
    </>
  );
}

