"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { getTextColor } from "@/utils/colors";

// Components
import Timer from "@/components/Timer";
import SoundToggle from "@/components/SoundToggle";
import LanguageSwitcher, { Language } from "@/components/LanguageSwitcher";
import InputPrompt from "@/components/InputPrompt";
import LogoDisplay from "@/components/LogoDisplay";
import AiPrompt from "@/components/AiPrompt";
import ResultDisplay, { ResultData } from "@/components/ResultDisplay";

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
  
  // État pour tracker si le son est temporairement coupé par une vidéo
  const [isMutedByVideo, setIsMutedByVideo] = useState(false);
  
  // Langue
  const [language, setLanguage] = useState<Language>('fr');
  
  const mounted = useRef(false);
  // État pour l'opacité du bruit (pour transition douce)
  const [noiseOpacity, setNoiseOpacity] = useState(1);

  // État pour le résultat (prompt utilisateur)
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [isResultVisible, setIsResultVisible] = useState(false);

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
    interval = setInterval(fetchNewTheme, 12000);

    return () => {
        mounted.current = false;
        clearTimeout(initialTimer);
        clearInterval(interval);
        if (colorTimeout) clearTimeout(colorTimeout);
    };
  }, [language, isResultVisible]); // Re-fetch si la langue change OU si l'état de visibilité change (pour relancer le cycle quand on ferme)

  // Gestion de la soumission du prompt utilisateur
  const handlePromptSubmit = async (userPrompt: string) => {
    console.log('[DEBUG] handlePromptSubmit called with:', userPrompt);
    try {
        const res = await fetch('/api/process-prompt', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                prompt: userPrompt, 
                language,
                currentAudio: audioRef.current?.src // Envoyer l'URL du son actuel pour éviter les doublons
            })
        });
        
        console.log('[DEBUG] Response status:', res.status);
        console.log('[DEBUG] Response headers:', Object.fromEntries(res.headers.entries()));
        
        if (!res.ok) throw new Error('Failed to process prompt');
        
        // Vérifier si c'est un stream (text/event-stream) ou du JSON
        const contentType = res.headers.get('content-type');
        console.log('[DEBUG] Content-Type:', contentType);
        
        if (contentType?.includes('text/event-stream') || contentType?.includes('text/plain')) {
            console.log('[DEBUG] Detected streaming response');
            // C'est du streaming (cas TEXTE)
            setResultData({ type: 'text', content: '' });
            setIsResultVisible(true);

            const reader = res.body?.getReader();
            const decoder = new TextDecoder();
            let accumulatedText = '';

            if (reader) {
                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;

                        const chunk = decoder.decode(value, { stream: true });
                        accumulatedText += chunk;
                        setResultData({ type: 'text', content: accumulatedText });
                    }
                } finally {
                    reader.releaseLock();
                }
            }
            return;
        }

        console.log('[DEBUG] Detected JSON response');
        // Sinon, c'est du JSON (audio, video, image)
        const data = await res.json();
        console.log('[DEBUG] Response data:', data);

        // Cas spécial AUDIO : on change juste le son sans afficher l'overlay
        if (data.type === 'audio') {
            if (audioRef.current) {
                audioRef.current.src = data.content;
                if (!isMuted) {
                    await audioRef.current.play();
                }
            }
            // On peut éventuellement afficher un toast ou changer la phrase en bas pour feedback
            // setPhrase(data.caption || "Audio track changed."); <-- Ligne retirée pour ne pas perturber le typewriter
            // return; // On arrête ici, pas d'overlay <-- Ligne retirée précédemment, on laisse continuer
        }
        
        setResultData(data);
        setIsResultVisible(true);

        // Si c'est une vidéo, on coupe le son de fond
        if (data.type === 'video' && audioRef.current) {
            audioRef.current.pause();
            setIsMutedByVideo(true); // Marquer que le son est coupé par la vidéo
        }

    } catch (error) {
        console.error("Error processing prompt:", error);
    }
  };

  // Gestion de la fermeture du résultat
  const handleCloseResult = () => {
    setIsResultVisible(false);
    
    // Relancer le son si l'utilisateur n'est pas muted et que c'était une vidéo
    if (resultData?.type === 'video' && !isMuted && audioRef.current) {
        audioRef.current.play().catch(err => console.log("Audio resume error:", err));
        setIsMutedByVideo(false); // Retirer le flag de mute par vidéo
    }
    
    // Petit délai pour nettoyer les données après l'animation de sortie
    setTimeout(() => {
        setResultData(null);
    }, 500);
  };

  return (
    <main className="relative w-full h-dvh bg-black text-foreground overflow-hidden transition-colors duration-1000">
      
      {/* Shader Background Component */}
      <ShaderBackground
        colors={colors}
        speed={simParams.speed}
        softness={simParams.softness}
        stepsPerColor={simParams.stepsPerColor}
        opacity={noiseOpacity}
      />

      {/* Main Wrapper */}
      <div className="relative z-20 w-full h-full flex items-center justify-center">
        
        {/* Background Audio */}
        <audio ref={audioRef} src="/sounds/01.mp3" loop preload="auto" />

        {/* Timer */}
        <Timer textColorClass={textColorClass} />

        {/* Sound Toggle Button */}
        <SoundToggle 
          isMuted={isMuted || isMutedByVideo} 
          setIsMuted={setIsMuted} 
          textColorClass={textColorClass} 
        />

        {/* Language Switcher */}
        <LanguageSwitcher 
          language={language} 
          setLanguage={setLanguage} 
          textColorClass={textColorClass} 
        />

        {/* Rond clignotant en bas à gauche + Input */}
        <InputPrompt 
          language={language} 
          textColorClass={textColorClass} 
          onSubmit={handlePromptSubmit}
        />

        {/* LOGO ZONE */}
        <div className="flex flex-col items-center justify-center">
          
          {/* Logo */}
          <LogoDisplay 
            language={language} 
            isDarkContent={isDarkContent} 
            textColorClass={textColorClass} 
            isMovedUp={isResultVisible}
          />

          {/* Dynamic AI Prompt Display - Toujours visible */}
          <div>
             <AiPrompt 
                phrase={phrase} 
                textColorClass={textColorClass} 
                audioRef={audioRef} 
             />
          </div>

        </div>

        {/* RESULT DISPLAY OVERLAY */}
        <ResultDisplay 
            data={resultData}
            isVisible={isResultVisible}
            onClose={handleCloseResult}
            textColorClass={textColorClass}
            onSubmit={handlePromptSubmit}
        />

      </div>
    </main>
  );
}
