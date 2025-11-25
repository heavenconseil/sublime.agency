"use client";

import { useRef } from "react";

export type Language = 'fr' | 'en' | 'es' | 'de' | 'ko' | 'zh' | 'ar';

interface LanguageSwitcherProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  textColorClass: string;
  isMuted: boolean;
}

export default function LanguageSwitcher({ language, setLanguage, textColorClass, isMuted }: LanguageSwitcherProps) {
  const languages: Language[] = ['fr', 'en', 'es', 'de', 'ko', 'zh', 'ar'];
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleLanguageChange = (lang: Language) => {
    // Jouer le son de clic si pas muted
    if (!isMuted) {
      if (!clickAudioRef.current) {
        clickAudioRef.current = new Audio('/sounds/click.mp3');
      }
      clickAudioRef.current.currentTime = 0;
      clickAudioRef.current.play().catch(() => {});
    }
    setLanguage(lang);
  };

  return (
    <>
      {/* Language Switcher - Desktop (vertical) */}
      <div className="hidden md:flex absolute bottom-8 right-8 z-50 flex-col items-end gap-1 font-mono text-xs">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`transition-all cursor-pointer ${
              language === lang 
                ? `${textColorClass} opacity-100 font-medium` 
                : `${textColorClass} opacity-30 hover:opacity-70`
            }`}
            aria-label={`Change language to ${lang.toUpperCase()}`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Language Switcher - Mobile (horizontal) */}
      <div className="md:hidden absolute bottom-8 right-8 left-8 z-50 flex flex-row gap-3 justify-center font-mono text-xs">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => handleLanguageChange(lang)}
            className={`transition-all cursor-pointer ${
              language === lang 
                ? `${textColorClass} opacity-100 font-medium` 
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

