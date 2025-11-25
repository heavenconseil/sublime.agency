"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { getTextColor } from "@/utils/colors";

// Components
import Timer from "@/components/Timer";
import SoundToggle from "@/components/SoundToggle";
import LanguageSwitcher, { Language } from "@/components/LanguageSwitcher";
import LogoDisplay from "@/components/LogoDisplay";
import AiPrompt from "@/components/AiPrompt";
import PartnerLogos from "@/components/PartnerLogos";

// Import dynamique du composant ShaderBackground pour éviter les erreurs SSR
const ShaderBackground = dynamic(() => import('@/components/ShaderBackground'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />
});

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
  const [language, setLanguage] = useState<Language>('fr');
  
  const mounted = useRef(false);

  // État pour tracker si on a déjà eu une interaction utilisateur
  const hasUserInteracted = useRef(false);

  // Démarrer le son au premier clic n'importe où sur la page
  useEffect(() => {
    const handleFirstClick = async () => {
      if (!hasUserInteracted.current && isMuted && audioRef.current) {
        hasUserInteracted.current = true;
        setIsMuted(false);
        
        // Fade-in sur le son
        if (audioRef.current) {
          audioRef.current.volume = 0;
          try {
            await audioRef.current.play();
            
            // Animation du volume de 0 à 0.5 sur 2 secondes
            let currentVolume = 0;
            const targetVolume = 0.5;
            const fadeStep = targetVolume / 40; // 40 steps sur 2000ms = 50ms par step
            
            const fadeInterval = setInterval(() => {
              if (audioRef.current && currentVolume < targetVolume) {
                currentVolume += fadeStep;
                audioRef.current.volume = Math.min(currentVolume, targetVolume);
              } else {
                clearInterval(fadeInterval);
              }
            }, 50);
          } catch (err) {
            console.log("Could not autoplay audio:", err);
          }
        }
      }
    };

    document.addEventListener('click', handleFirstClick);
    
    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, [isMuted]);

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
    let interval: NodeJS.Timeout;

    const fetchNewTheme = async () => {
      // Si un résultat est affiché, on continue quand même le cycle de fond et de phrase
      // La seule chose qu'on ne veut pas perturber c'est l'expérience utilisateur, 
      // mais le brief est clair : "le typewriter doit continuer son travail"

      try {
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
                    // Le crossfade est géré par ShaderBackground
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
    interval = setInterval(fetchNewTheme, 12000);

    return () => {
        mounted.current = false;
        clearTimeout(initialTimer);
        clearInterval(interval);
        if (colorTimeout) clearTimeout(colorTimeout);
    };
  }, [language]); // Re-fetch si la langue change

  return (
    <main className="relative w-full h-dvh bg-white text-foreground overflow-hidden transition-colors duration-1000">
      
      {/* Shader Background Component */}
      <ShaderBackground
        colors={colors}
        speed={simParams.speed}
        softness={simParams.softness}
        stepsPerColor={simParams.stepsPerColor}
      />

      {/* Main Wrapper */}
      <div className="relative z-20 w-full h-full flex items-center justify-center">
        
        {/* Background Audio */}
        <audio ref={audioRef} src="/sounds/01.mp3" loop preload="auto" />

        {/* Timer */}
        <Timer textColorClass={textColorClass} />

        {/* Sound Toggle Button */}
        <SoundToggle 
          isMuted={isMuted} 
          setIsMuted={setIsMuted} 
          textColorClass={textColorClass} 
        />

        {/* Language Switcher */}
        <LanguageSwitcher 
          language={language} 
          setLanguage={setLanguage} 
          textColorClass={textColorClass}
          isMuted={isMuted}
        />

        {/* Partner Logos */}
        <PartnerLogos textColorClass={textColorClass} />

        {/* LOGO ZONE */}
        <div className="flex flex-col items-center justify-center">
          
          {/* Logo */}
          <LogoDisplay 
            language={language} 
            isDarkContent={isDarkContent} 
            textColorClass={textColorClass} 
            isMovedUp={false}
          />

          {/* Dynamic AI Prompt Display - Toujours visible */}
          <div>
             <AiPrompt 
                phrase={phrase} 
                textColorClass={textColorClass} 
                audioRef={audioRef}
                isMuted={isMuted}
             />
          </div>

        </div>

      </div>
    </main>
  );
}
