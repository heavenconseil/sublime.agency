"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { Language } from "./LanguageSwitcher";

interface LogoDisplayProps {
  language: Language;
  isDarkContent: boolean;
  textColorClass: string;
  isMovedUp: boolean;
  onLogoClick?: () => void;
}

export default function LogoDisplay({ language, isDarkContent, textColorClass, isMovedUp, onLogoClick }: LogoDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  // Traductions de la tagline
  const taglines: Record<Language, string> = {
    fr: 'Studio IA Premium & Primé',
    en: 'Premium Award-winning AI Studio',
    es: 'Premium Estudio de IA galardonado',
    de: 'Premium Preisgekröntes KI-Studio',
    ko: 'Premium 수상 경력의 AI 스튜디오',
    zh: 'Premium 屡获殊荣的人工智能工作室',
    ar: 'Premium استوديو الذكاء الاصطناعي الحائز على جوائز'
  };

  // Animation GSAP pour déplacer le logo
  useEffect(() => {
    if (containerRef.current) {
      // Calculer la position cible pour l'alignement "top"
      // Le timer est à top-8 (32px). On veut s'aligner avec lui visuellement.
      // Le centre de l'écran est à 0.
      // La hauteur de l'écran est window.innerHeight.
      // La position actuelle est le centre vertical.
      // On doit remonter de (hauteur/2) - padding_top - moitié_hauteur_logo
      
      const targetY = -(window.innerHeight / 2) + 60; // 60px padding top approx pour s'aligner avec Timer/Sound

      if (isMovedUp) {
        gsap.to(containerRef.current, {
          y: targetY, 
          scale: 0.8, // Légèrement plus grand (était 0.6)
          duration: 0.8,
          ease: "power3.inOut"
        });
      } else {
        gsap.to(containerRef.current, {
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.inOut"
        });
      }
    }
  }, [isMovedUp]);

  return (
    <div ref={containerRef} className="relative flex flex-col items-center z-30">
       {/* Logo - apparaît en premier */}
       <button 
          onClick={onLogoClick}
          className="cursor-pointer opacity-0 animate-[fadeInUp_1.5s_ease-out_0.5s_forwards]"
        >
          <Image 
              src="/sublimeV1.svg" 
              alt="Sublime Agency Logo" 
              width={250} 
              height={160} 
              className={`w-48 md:w-36 transition-all duration-1000 ${isDarkContent ? '' : 'invert mix-blend-difference'}`} 
              priority
            />
        </button>
        {/* Tagline - apparaît 1s après le logo */}
        <h1 className={`mt-6 text-xs font-mono text-center opacity-0 animate-[fadeInUp_1s_ease-out_1.5s_forwards] transition-colors duration-1000 ${textColorClass}`}
            style={{ opacity: 0 }}>
            <span className="opacity-50">{taglines[language]}</span>
        </h1>
    </div>
  );
}

