"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useTypewriter } from "@/hooks/useTypewriter";

interface AiPromptProps {
  phrase: string;
  textColorClass: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

export default function AiPrompt({ phrase, textColorClass, audioRef }: AiPromptProps) {
  // État pour le clignotement
  const [isBlinking, setIsBlinking] = useState(false);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  
  // Refs pour stocker les animations GSAP
  const blinkTween = useRef<gsap.core.Tween | null>(null);
  const cursorTween = useRef<gsap.core.Tween | null>(null);

  const playTypingSound = () => {
    if (audioRef.current) {
        // Logique de son de frappe si nécessaire
    }
  };

  // Utiliser useCallback pour éviter que la fonction change à chaque rendu
  const handleTypingComplete = useCallback(() => {
    setIsBlinking(true);
  }, []);

  useEffect(() => {
    setIsBlinking(false);
  }, [phrase]);

  // Animation du curseur (toujours actif ou conditionnel ?)
  // Dans le code original, le curseur avait toujours "animate-pulse".
  useEffect(() => {
    if (cursorRef.current) {
      cursorTween.current = gsap.to(cursorRef.current, {
        opacity: 0,
        duration: 0.5,
        repeat: -1,
        yoyo: true,
        ease: "steps(1)", // Effet clignotement terminal classique
      });
    }
    return () => {
      cursorTween.current?.kill();
    };
  }, []);

  // Animation du texte complet quand la frappe est terminée
  useEffect(() => {
    if (paragraphRef.current) {
      if (isBlinking) {
        // Lance l'animation de pulse sur le paragraphe
        blinkTween.current = gsap.to(paragraphRef.current, {
          opacity: 0.5,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut"
        });
      } else {
        // Arrête l'animation et remet l'opacité à 1
        if (blinkTween.current) {
            blinkTween.current.kill();
            gsap.to(paragraphRef.current, { opacity: 1, duration: 0.2 });
        }
      }
    }
    return () => {
      // Cleanup uniquement si le composant est démonté, 
      // mais ici on veut aussi gérer le changement d'état isBlinking
    };
  }, [isBlinking]);

  const displayedPhrase = useTypewriter(phrase, 60, playTypingSound, handleTypingComplete);

  return (
    <div className="absolute bottom-32 md:bottom-8 left-0 right-0 flex items-center justify-center h-8 pointer-events-none">
       <p 
         ref={paragraphRef}
         className={`font-mono text-sm md:text-base text-center max-w-md px-4 transition-colors duration-1000 ${textColorClass}`}
       >
          <span className="opacity-50 mr-2">{">"}</span>
          {displayedPhrase}
          <span ref={cursorRef} className="ml-1">_</span>
       </p>
    </div>
  );
}

