"use client";

import Image from "next/image";
import { SimplexNoise } from '@paper-design/shaders-react';
import { useState, useEffect, useRef, useCallback } from "react";

// Hook simple pour l'effet machine à écrire
function useTypewriter(text: string, speed: number = 50, onType?: () => void, onComplete?: () => void) {
  const [displayedText, setDisplayedText] = useState("");
  const lastLength = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    lastLength.current = 0;
  }, [text]); // Reset complet si le texte change

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeoutId = setTimeout(() => {
        const nextIndex = currentIndex + 1;
        setDisplayedText(text.substring(0, nextIndex));
        setCurrentIndex(nextIndex);

        // Logique de son (si onType existait)
        if (onType) onType();

        if (nextIndex >= text.length) {
          if (onComplete) onComplete();
        }
      }, speed);

      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, text, speed, onType, onComplete]);

  return displayedText;
}

// Fonction utilitaire pour calculer la luminance
function getLuminance(hex: string) {
  const c = hex.substring(1);      // strip #
  const rgb = parseInt(c, 16);   // convert rrggbb to decimal
  const r = (rgb >> 16) & 0xff;  // extract red
  const g = (rgb >>  8) & 0xff;  // extract green
  const b = (rgb >>  0) & 0xff;  // extract blue

  // Formule standard de luminance relative (perçue)
  // 0.2126 R + 0.7152 G + 0.0722 B
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Fonction pour déterminer si le texte doit être noir ou blanc
function getTextColor(colors: string[]) {
  if (!colors || colors.length === 0) return "text-white";
  
  // Moyenne des luminances
  let totalLuminance = 0;
  colors.forEach(c => totalLuminance += getLuminance(c));
  const avgLuminance = totalLuminance / colors.length;
  
  // Seuil (128 est la moitié de 255, on ajuste souvent autour de 140-150 pour le confort)
  return avgLuminance > 140 ? "text-black" : "text-white";
}

// Composant Timer
function Timer({ textColorClass }: { textColorClass: string }) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 10); // +10ms
    }, 10);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10); // 2 chiffres
    return `${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`absolute top-8 left-8 z-50 font-mono text-xs md:text-sm opacity-50 transition-colors duration-1000 ${textColorClass}`}>
      {formatTime(time)}
    </div>
  );
}

export default function Home() {
  // États séparés
  const [phrase, setPhrase] = useState("Initialisation...");
  const [colors, setColors] = useState(["#2f2235", "#3f3244", "#60495a", "#a9aca9", "#bfc3ba"]);
  // État dérivé pour la couleur du texte/logo
  const [textColorClass, setTextColorClass] = useState("text-white");
  const [isDarkContent, setIsDarkContent] = useState(false);

  const [simParams, setSimParams] = useState({ speed: 1, softness: 1, stepsPerColor: 3 });
  
  // Muted par défaut
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Langue
  const [language, setLanguage] = useState<'fr' | 'en' | 'es' | 'de' | 'ko' | 'zh' | 'ar'>('fr');
  
  // État pour le clignotement
  const [isBlinking, setIsBlinking] = useState(false);

  const playTypingSound = () => {
    if (audioRef.current) {
        // Logique de son de frappe si nécessaire, 
        // mais ici on utilise le son de fond 01.mp3 qui est une ambiance.
        // Si vous voulez un son de frappe en plus, il faudrait un 2ème élément audio.
        // Pour l'instant, je laisse vide ou je réintègre la logique si vous avez le fichier type.mp3
    }
  };

  // Utiliser useCallback pour éviter que la fonction change à chaque rendu
  const handleTypingComplete = useCallback(() => {
    setIsBlinking(true);
  }, []);

  const displayedPhrase = useTypewriter(phrase, 60, playTypingSound, handleTypingComplete);
  const mounted = useRef(false);
  // État pour l'opacité du bruit (pour transition douce)
  const [noiseOpacity, setNoiseOpacity] = useState(1);

  useEffect(() => {
    const playAudio = async () => {
        if (audioRef.current) {
            audioRef.current.volume = 0.5;
            try {
                if (!isMuted) {
                    await audioRef.current.play();
                } else {
                    audioRef.current.pause();
                }
            } catch (err) {
                console.log("Audio playback error:", err);
            }
        }
    };
    playAudio();
  }, [isMuted]);

  useEffect(() => {
    mounted.current = true;
    let colorTimeout: NodeJS.Timeout;

    const fetchNewTheme = async () => {
      try {
        // Arrêter le clignotement avant de commencer une nouvelle phrase
        setIsBlinking(false);
        
        const res = await fetch(`/api/generate-theme?lang=${language}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        
        if (mounted.current) {
            // 1. Lance l'écriture de la nouvelle phrase
            setPhrase(data.phrase);

            // 2. Calcule la durée de l'écriture pour changer les couleurs à la fin
            const typingDuration = data.phrase.length * 60; // 60ms par char
            
            // Nettoyer le timeout précédent s'il existe
            if (colorTimeout) clearTimeout(colorTimeout);

            colorTimeout = setTimeout(() => {
                if (mounted.current) {
                    // Petit effet de transition sur le noise
                    setNoiseOpacity(0);
                    setTimeout(() => {
                        setColors(data.colors);
                        
                        // Calculer la nouvelle couleur de texte
                        const newTextColor = getTextColor(data.colors);
                        setTextColorClass(newTextColor);
                        setIsDarkContent(newTextColor === "text-black");

                        setSimParams({
                            speed: data.speed,
                            softness: data.softness,
                            stepsPerColor: data.stepsPerColor
                        });
                        setNoiseOpacity(1);
                    }, 500); // Changement de couleur pendant que l'opacité est basse
                }
            }, typingDuration + 200); // +200ms de pause après la fin
        }
      } catch (error) {
        console.error("Error fetching theme:", error);
      }
    };

    // Premier appel rapide après 2s
    const initialTimer = setTimeout(fetchNewTheme, 2000);

    // Ensuite toutes les 12 secondes
    const interval = setInterval(fetchNewTheme, 12000);

    return () => {
        mounted.current = false;
        clearTimeout(initialTimer);
        clearInterval(interval);
        if (colorTimeout) clearTimeout(colorTimeout);
    };
  }, [language]); // Re-fetch si la langue change

  return (
    <main className="relative w-full h-dvh bg-black text-foreground overflow-hidden transition-colors duration-1000">
      
      {/* Fond Fixe SimplexNoise */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none transition-opacity duration-2000 ease-in-out"
        style={{ opacity: noiseOpacity }}
      >
        <SimplexNoise
          width="100%"
          height="100%"
          colors={colors}
          stepsPerColor={simParams.stepsPerColor}
          softness={simParams.softness}
          speed={simParams.speed}
          scale={1}
        />
      </div>

      {/* Main Wrapper */}
      <div className="relative z-20 w-full h-full flex items-center justify-center">
        
        {/* Background Audio */}
        <audio ref={audioRef} src="/sounds/01.mp3" loop preload="auto" />

        {/* Timer */}
        <Timer textColorClass={textColorClass} />

        {/* Sound Toggle Button */}
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`absolute top-8 right-8 z-50 mix-blend-difference opacity-50 hover:opacity-100 transition-opacity cursor-pointer ${textColorClass}`}
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <line x1="1" y1="1" x2="23" y2="23"></line>
              <path d="M9 9v6a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"></path>
              <path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="23"></line>
              <line x1="8" y1="23" x2="16" y2="23"></line>
            </svg>
          )}
        </button>

        {/* Language Switcher */}
        <div className="absolute bottom-8 right-8 z-50 flex flex-col gap-2 font-mono text-xs md:text-sm">
          {(['fr', 'en', 'es', 'de', 'ko', 'zh', 'ar'] as const).map((lang) => (
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

        {/* LOGO ZONE */}
        <div className="flex flex-col items-center justify-center space-y-8">
          
          {/* Logo */}
          <div className="relative">
             <Image 
                src="/sublimeV1.svg" 
                alt="Sublime Agency Logo" 
                width={250} 
                height={160} 
                className={`w-48 md:w-72 transition-all duration-1000 ${isDarkContent ? '' : 'invert mix-blend-difference'}`} 
                priority
              />
              <h1 className={`mt-6 text-xs font-mono text-center opacity-50 transition-colors duration-1000 ${textColorClass}`}>
                  premium AI studio 
              </h1>
          </div>

          {/* Dynamic AI Prompt Display */}
          <div className="absolute bottom-32 md:bottom-12 left-0 right-0 flex items-center justify-center h-8 pointer-events-none">
             <p className={`font-mono text-sm md:text-base text-center max-w-md px-4 transition-colors duration-1000 ${textColorClass} ${isBlinking ? 'animate-pulse' : ''}`}>
                <span className="opacity-50 mr-2">{">"}</span>
                {displayedPhrase}
                <span className="animate-pulse ml-1">_</span>
             </p>
          </div>

        </div>

      </div>
    </main>
  );
}