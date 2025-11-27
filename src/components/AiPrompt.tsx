"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { gsap } from "gsap";
import { useTypewriter } from "@/hooks/useTypewriter";

interface AiPromptProps {
  phrase: string;
  textColorClass: string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isMuted: boolean;
}

export default function AiPrompt({ phrase, textColorClass, audioRef, isMuted }: AiPromptProps) {
  // État pour le clignotement
  const [isBlinking, setIsBlinking] = useState(false);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const cursorRef = useRef<HTMLSpanElement>(null);
  
  // Refs pour stocker les animations GSAP
  const blinkTween = useRef<gsap.core.Tween | null>(null);
  const cursorTween = useRef<gsap.core.Tween | null>(null);
  
  // Référence pour le son de typing
  const typingAudioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  
  // Tracker si le typewriter est en cours de frappe
  const isTypingRef = useRef(false);

  // Initialiser le son de typing
  useEffect(() => {
    // Encoder correctement le caractère # dans l'URL
    const audioPath = '/sounds/prompt.mp3';
    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = 0.6; // Volume réduit
    
    // Gérer les erreurs de chargement
    audio.addEventListener('error', (e) => {
      console.error('❌ Erreur de chargement du son de typing');
      console.error('Chemin tenté:', audio.src);
      console.error('Erreur:', e);
    });
    
    audio.addEventListener('loadstart', () => {
      console.log('🔄 Début du chargement du son de typing...');
    });
    
    audio.addEventListener('canplay', () => {
      console.log('✅ Son de typing prêt à être joué');
    });
    
    audio.addEventListener('canplaythrough', () => {
      console.log('✅ Son de typing complètement chargé');
    });
    
    audio.addEventListener('play', () => {
      console.log('▶️ Son de typing démarré');
      isPlayingRef.current = true;
    });
    
    audio.addEventListener('pause', () => {
      console.log('⏸️ Son de typing arrêté');
      isPlayingRef.current = false;
    });
    
    // Précharger le son
    audio.preload = 'auto';
    typingAudioRef.current = audio;
    
    return () => {
      // Cleanup : arrêter et libérer le son quand le composant est démonté
      if (typingAudioRef.current) {
        typingAudioRef.current.pause();
        typingAudioRef.current.src = '';
      }
    };
  }, []);

  // Démarrer le son quand une nouvelle phrase commence (seulement si pas muted)
  useEffect(() => {
    // Nouvelle phrase = typewriter actif
    setIsBlinking(false);
    isTypingRef.current = true;
    
    const startTypingSound = async () => {
      if (typingAudioRef.current && phrase && phrase !== "Initialisation..." && !isMuted) {
        // Réinitialiser le son si nécessaire
        if (isPlayingRef.current) {
          typingAudioRef.current.pause();
          typingAudioRef.current.currentTime = 0;
        }
        
        // Attendre un peu que le son soit prêt
        if (typingAudioRef.current.readyState >= 2) {
          try {
            console.log('🎵 Démarrage du son de typing...');
            await typingAudioRef.current.play();
            console.log('✅ Son de typing joué avec succès');
          } catch (err) {
            console.error("❌ Impossible de jouer le son de typing:", err);
            // Essayer de charger à nouveau
            typingAudioRef.current.load();
            setTimeout(async () => {
              try {
                await typingAudioRef.current?.play();
              } catch (e) {
                console.error("❌ Échec après rechargement:", e);
              }
            }, 100);
          }
        } else {
          // Attendre que le son soit chargé
          typingAudioRef.current.addEventListener('canplay', async () => {
            try {
              await typingAudioRef.current?.play();
            } catch (err) {
              console.error("❌ Impossible de jouer après chargement:", err);
            }
          }, { once: true });
          typingAudioRef.current.load();
        }
      }
    };
    
    startTypingSound();
  }, [phrase]);

  // Couper le son de typing quand isMuted change (mais ne pas le relancer)
  useEffect(() => {
    if (isMuted && typingAudioRef.current && isPlayingRef.current) {
      typingAudioRef.current.pause();
      typingAudioRef.current.currentTime = 0;
    }
  }, [isMuted]);

  const playTypingSound = () => {
    // Le son tourne déjà en boucle, pas besoin de faire quoi que ce soit ici
  };

  // Utiliser useCallback pour éviter que la fonction change à chaque rendu
  const handleTypingComplete = useCallback(() => {
    setIsBlinking(true);
    isTypingRef.current = false; // Typewriter terminé
    // Arrêter le son quand le typewriter termine
    if (typingAudioRef.current) {
      typingAudioRef.current.pause();
      typingAudioRef.current.currentTime = 0; // Reset pour la prochaine fois
    }
  }, []);

  // Animation du curseur (toujours actif ou conditionnel ?)
  // Dans le code original, le curseur avait toujours "animate-pulse".
  useEffect(() => {
    if (cursorRef.current) {
      cursorTween.current = gsap.to(cursorRef.current, {
        opacity: 0,
        duration: 0.1,
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
    <div className="absolute bottom-40 md:bottom-12 left-0 right-0 flex items-center justify-center pointer-events-none">
       <p 
         ref={paragraphRef}
         className={`font-mono text-xs text-center max-w-md transition-colors duration-1000 ${textColorClass}`}
       >
          <span className="opacity-50 mr-2">{">"}</span>
          {displayedPhrase}
          <span ref={cursorRef} className="ml-1">_</span>
       </p>
    </div>
  );
}

