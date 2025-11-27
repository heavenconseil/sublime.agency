"use client";

import { useRef, useMemo, useEffect } from "react";
import { gsap } from "gsap";

export type Language = 'fr' | 'en' | 'es' | 'de' | 'ko' | 'zh' | 'ar';

interface LanguageSwitcherProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  textColorClass: string;
  isMuted: boolean;
}

export default function LanguageSwitcher({ language, setLanguage, textColorClass, isMuted }: LanguageSwitcherProps) {
  const allLanguages: Language[] = ['fr', 'en', 'es', 'de', 'ko', 'zh', 'ar'];
  const clickAudioRef = useRef<HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileContainerRef = useRef<HTMLDivElement>(null);

  // Réorganiser les langues avec la sélectionnée en dernier
  const orderedLanguages = useMemo(() => {
    const others = allLanguages.filter(l => l !== language);
    return [...others, language];
  }, [language]);

  // Animation quand la langue change
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.children,
        { opacity: 0, y: -10 },
        { 
          opacity: 1, 
          y: 0, 
          duration: 0.3, 
          stagger: 0.05,
          ease: "power2.out"
        }
      );
    }
    if (mobileContainerRef.current) {
      gsap.fromTo(
        mobileContainerRef.current.children,
        { opacity: 0, x: -10 },
        { 
          opacity: 1, 
          x: 0, 
          duration: 0.3, 
          stagger: 0.05,
          ease: "power2.out"
        }
      );
    }
  }, [language]);

  const handleLanguageChange = (e: React.MouseEvent, lang: Language) => {
    e.stopPropagation();
    
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
      {/* Language Switcher - Desktop (vertical) - sélectionnée en bas */}
      <div ref={containerRef} className="hidden md:flex flex-col items-end gap-0.5 font-mono text-[10px]">
        {orderedLanguages.map((lang) => (
          <button
            key={lang}
            onClick={(e) => handleLanguageChange(e, lang)}
            className={`transition-all cursor-pointer ${textColorClass} ${
              language === lang 
                ? `opacity-50 underline underline-offset-4` 
                : `opacity-30 hover:opacity-50`
            }`}
            aria-label={`Change language to ${lang.toUpperCase()}`}
          >
            {lang.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Language Switcher - Mobile (horizontal) - sélectionnée à droite */}
      <div ref={mobileContainerRef} className="md:hidden flex flex-row gap-2 justify-center items-center font-mono text-[10px]">
        {orderedLanguages.map((lang) => (
          <button
            key={lang}
            onClick={(e) => handleLanguageChange(e, lang)}
            className={`transition-all cursor-pointer ${textColorClass} ${
              language === lang 
                ? `opacity-50 underline underline-offset-4` 
                : `opacity-30 hover:opacity-50`
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

