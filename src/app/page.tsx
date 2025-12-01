"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { getTextColor } from "@/utils/colors";

// Components
import Timer from "@/components/Timer";
import SoundToggle from "@/components/SoundToggle";
import LanguageSwitcher, { Language } from "@/components/LanguageSwitcher";
import LogoDisplay from "@/components/LogoDisplay";
import AiPrompt from "@/components/AiPrompt";
import PartnerLogos from "@/components/PartnerLogos";
import ImpactMetrics from "@/components/ImpactMetrics";
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from "@/components/ui/drawer";

// Hooks
import { useMusicSync } from "@/hooks/useMusicSync";

// Messages de chargement localisés pour le mode musique (incluant l'invitation à cliquer)
const LOADING_MESSAGES: Record<string, string[]> = {
  fr: [
    "Génération de l'ambiance...",
    "Cliquez n'importe où pour lancer l'expérience...",
    "Composition musicale en cours...",
    "Cliquez n'importe où pour lancer l'expérience...",
    "Harmonisation des couleurs...",
    "Cliquez n'importe où pour lancer l'expérience...",
    "Synchronisation de l'expérience...",
    "Cliquez n'importe où pour lancer l'expérience...",
  ],
  en: [
    "Generating atmosphere...",
    "Click anywhere to start the experience",
    "Composing music...",
    "Click anywhere to start the experience",
    "Harmonizing colors...",
    "Click anywhere to start the experience",
    "Synchronizing experience...",
    "Click anywhere to start the experience",
  ],
  es: [
    "Generando ambiente...",
    "Haz clic en cualquier lugar para iniciar",
    "Componiendo música...",
    "Haz clic en cualquier lugar para iniciar",
    "Armonizando colores...",
    "Haz clic en cualquier lugar para iniciar",
    "Sincronizando experiencia...",
    "Haz clic en cualquier lugar para iniciar",
  ],
  de: [
    "Atmosphäre wird erzeugt...",
    "Klicken Sie irgendwo, um zu starten",
    "Musik wird komponiert...",
    "Klicken Sie irgendwo, um zu starten",
    "Farben werden harmonisiert...",
    "Klicken Sie irgendwo, um zu starten",
    "Erlebnis wird synchronisiert...",
    "Klicken Sie irgendwo, um zu starten",
  ],
  ko: [
    "분위기 생성 중...",
    "아무 곳이나 클릭하여 시작하세요",
    "음악 작곡 중...",
    "아무 곳이나 클릭하여 시작하세요",
    "색상 조화 중...",
    "아무 곳이나 클릭하여 시작하세요",
    "경험 동기화 중...",
    "아무 곳이나 클릭하여 시작하세요",
  ],
  zh: [
    "正在生成氛围...",
    "点击任意位置开始体验",
    "正在创作音乐...",
    "点击任意位置开始体验",
    "正在协调色彩...",
    "点击任意位置开始体验",
    "正在同步体验...",
    "点击任意位置开始体验",
  ],
  ar: [
    "جارٍ توليد الأجواء...",
    "انقر في أي مكان للبدء",
    "جارٍ تأليف الموسيقى...",
    "انقر في أي مكان للبدء",
    "جارٍ تنسيق الألوان...",
    "انقر في أي مكان للبدء",
    "جارٍ مزامنة التجربة...",
    "انقر في أي مكان للبدء",
  ],
};

// Import dynamique du composant ShaderBackground pour éviter les erreurs SSR
const ShaderBackground = dynamic(() => import('@/components/ShaderBackground'), {
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-black" />
});

export default function Home() {
  // Mode musique synchronisée (activé par défaut)
  const [musicMode, setMusicMode] = useState(true);
  
  // États séparés
  const [phrase, setPhrase] = useState("Initialisation...");
  const [colors, setColors] = useState(["#2f2235", "#3f3244", "#60495a", "#a9aca9", "#bfc3ba"]);
  // État dérivé pour la couleur du texte/logo
  const [textColorClass, setTextColorClass] = useState("text-white");
  const [isDarkContent, setIsDarkContent] = useState(false);

  const [simParams, setSimParams] = useState(() => ({
    speed: 0.5 + Math.random() * 1.5,        // 0.5 à 2
    softness: 0.5 + Math.random() * 1.5,     // 0.5 à 2
    stepsPerColor: Math.floor(2 + Math.random() * 4)  // 2 à 5
  }));
  
  // Muted par défaut
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Langue
  const [language, setLanguage] = useState<Language>('fr');
  const previousLanguageRef = useRef<Language>(language);
  
  const mounted = useRef(false);
  
  // Index pour les messages de chargement
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  
  // Bloquer le switch de thème temporairement après un changement de langue
  const [languageSwitchLock, setLanguageSwitchLock] = useState(false);
  
  // Délai minimum de 20 secondes avant de passer au premier thème
  const [introCompleted, setIntroCompleted] = useState(false);
  
  // Compteur d'appels API pour les métriques d'impact
  const [apiCalls, setApiCalls] = useState(0);
  
  // État du drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIntroCompleted(true);
    }, 20000); // 20 secondes
    
    return () => clearTimeout(timer);
  }, []);

  // Hook pour la musique synchronisée
  const { 
    currentBundle,
    nextBundle,
    isNextReady,
    isLoading: isMusicLoading,
    error: musicError 
  } = useMusicSync({ 
    language, 
    isMuted, 
    enabled: musicMode,
    canPlay: introCompleted, // Ne jouer qu'après l'intro de 12s
    onApiCall: () => setApiCalls(c => c + 1)
  });

  // Traduction en temps réel quand la langue change
  useEffect(() => {
    const prevLang = previousLanguageRef.current;
    previousLanguageRef.current = language;
    
    // Ne pas traduire si c'est le premier render ou si on est en loading
    if (prevLang === language || isMusicLoading) return;
    
    // Ne pas traduire les messages de chargement
    const loadingMessages = Object.values(LOADING_MESSAGES).flat();
    if (loadingMessages.includes(phrase)) return;
    
    // Bloquer le switch de thème pendant 5 secondes pour laisser le typewriter finir
    setLanguageSwitchLock(true);
    const unlockTimer = setTimeout(() => {
      setLanguageSwitchLock(false);
    }, 5000);
    
    // Traduire la phrase actuelle
    const translateCurrentPhrase = async () => {
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: phrase, targetLang: language }),
        });
        if (response.ok) {
          const { translated } = await response.json();
          setPhrase(translated);
        }
      } catch (err) {
        console.error("Translation error:", err);
      }
    };
    
    translateCurrentPhrase();
    
    return () => clearTimeout(unlockTimer);
  }, [language, phrase, isMusicLoading]);
  
  // Cycler les messages de chargement pendant l'intro (12 premières secondes)
  useEffect(() => {
    // Continuer tant que l'intro n'est pas terminée
    if (!musicMode || introCompleted) return;
    
    const messages = LOADING_MESSAGES[language] || LOADING_MESSAGES['fr'];
    
    // Afficher le premier message
    setPhrase(messages[0]);
    
    const interval = setInterval(() => {
      setLoadingMessageIndex(prev => {
        const next = (prev + 1) % messages.length;
        setPhrase(messages[next]);
        return next;
      });
    }, 3000);
    
    return () => clearInterval(interval);
  }, [musicMode, introCompleted, language]);

  // Ref pour tracker le dernier bundle synchronisé
  const lastSyncedBundleId = useRef<string | null>(null);

  // Synchroniser les états quand on est en mode musique et qu'un bundle est prêt
  useEffect(() => {
    if (!musicMode || !currentBundle || isMusicLoading || !introCompleted) return;
    
    // Éviter de re-sync le même bundle (sauf si la langue a changé)
    const isNewBundle = lastSyncedBundleId.current !== currentBundle.id;
    const needsTranslation = isNewBundle || !languageSwitchLock;
    
    if (!isNewBundle && languageSwitchLock) return;
    
    lastSyncedBundleId.current = currentBundle.id;
    
    // 1. TYPEWRITER D'ABORD - démarre immédiatement
    const syncPhrase = async () => {
      if (language === 'en') {
        setPhrase(currentBundle.phrase);
      } else {
        try {
          const response = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: currentBundle.phrase, targetLang: language }),
          });
          if (response.ok) {
            const { translated } = await response.json();
            setPhrase(translated);
          } else {
            setPhrase(currentBundle.phrase);
          }
        } catch {
          setPhrase(currentBundle.phrase);
        }
      }
    };
    
    if (needsTranslation) {
      syncPhrase();
    }
    
    // 2. COULEURS APRÈS - avec délai pour que le typewriter "commande"
    const colorsTimeout = setTimeout(() => {
      setColors(currentBundle.colors);
      
      const newTextColor = getTextColor(currentBundle.colors);
      setTextColorClass(newTextColor);
      setIsDarkContent(newTextColor === "text-black");
      
      setSimParams({
        speed: currentBundle.speed,
        softness: currentBundle.softness,
        stepsPerColor: currentBundle.stepsPerColor
      });
    }, 1500); // 1.5s après le début du typewriter
    
    // Fade out 01.mp3 quand la musique générée prend le relais
    if (audioRef.current && !audioRef.current.paused) {
      const audio = audioRef.current;
      let volume = audio.volume;
      const fadeOut = setInterval(() => {
        volume -= 0.05;
        if (volume <= 0) {
          clearInterval(fadeOut);
          audio.pause();
          audio.volume = 0.5;
        } else {
          audio.volume = volume;
        }
      }, 100);
    }
    
    return () => clearTimeout(colorsTimeout);
  }, [musicMode, currentBundle, isMusicLoading, introCompleted, language, languageSwitchLock]);

  // État pour tracker si on a déjà eu une interaction utilisateur
  const hasUserInteracted = useRef(false);

  // Démarrer le son au premier clic n'importe où sur la page
  useEffect(() => {
    const handleFirstClick = async () => {
      if (!hasUserInteracted.current && isMuted) {
        hasUserInteracted.current = true;
        setIsMuted(false);
        
        // Jouer 01.mp3 avec fade-in SEULEMENT si pas de thème encore chargé
        // (sinon useMusicSync gère la musique du thème)
        const shouldPlayDefault = !currentBundle || !introCompleted;
        
        if (audioRef.current && shouldPlayDefault) {
          audioRef.current.volume = 0;
          try {
            await audioRef.current.play();
            
            // Animation du volume de 0 à 0.5 sur 2 secondes
            let currentVolume = 0;
            const targetVolume = 0.5;
            const fadeStep = targetVolume / 40;
            
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
        // En mode musique, le hook useMusicSync gère la musique générée
      }
    };

    document.addEventListener('click', handleFirstClick);
    
    return () => {
      document.removeEventListener('click', handleFirstClick);
    };
  }, [isMuted, currentBundle, introCompleted]);

  useEffect(() => {
    const playAudio = async () => {
        if (audioRef.current) {
            audioRef.current.volume = 0.5;
            try {
                if (!isMuted) {
                    // Ne jouer 01.mp3 que si on n'a pas encore de thème généré
                    // (sinon useMusicSync gère la musique du thème)
                    if (!currentBundle || !introCompleted) {
                      await audioRef.current.play();
                    }
                } else {
                    audioRef.current.pause();
                }
            } catch (err) {
                console.log("Audio playback error:", err);
            }
        }
    };
    playAudio();
  }, [isMuted, currentBundle, introCompleted]);

  // Mode classique (sans musique synchronisée)
  useEffect(() => {
    // Si on est en mode musique, ne pas lancer les fetches classiques
    if (musicMode) return;
    
    mounted.current = true;
    let colorTimeout: NodeJS.Timeout;
    let interval: NodeJS.Timeout;

    const fetchNewTheme = async () => {
      try {
        const res = await fetch(`/api/generate-theme?lang=${language}`);
        setApiCalls(c => c + 1); // Incrémenter le compteur
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
  }, [language, musicMode]); // Re-fetch si la langue change ou si on quitte le mode musique

  return (
    <main className="relative w-full h-dvh bg-white text-foreground overflow-hidden transition-colors duration-1000">
      
      {/* Shader Background Component - fade in à l'arrivée */}
      <div className="opacity-0 animate-[fadeIn_2s_ease-out_0.3s_forwards] absolute inset-0">
        <ShaderBackground
          colors={colors}
          speed={simParams.speed}
          softness={simParams.softness}
          stepsPerColor={simParams.stepsPerColor}
        />
      </div>

      {/* Main Wrapper */}
      <div 
        className="relative z-20 w-full h-full flex items-center justify-center"
      >
        
        {/* Background Audio - joue pendant le chargement en mode musique aussi */}
        <audio ref={audioRef} src="/sounds/01.mp3" loop preload="auto" />

        {/* Timer + Impact Metrics - delay 3s */}
        <div className="opacity-0 animate-[fadeInUp_1s_ease-out_3s_forwards] absolute top-4 left-4 md:top-8 md:left-8 z-50" onClick={(e) => e.stopPropagation()}>
          <Timer textColorClass={textColorClass} />
          <div className="mt-3">
            <ImpactMetrics textColorClass={textColorClass} apiCalls={apiCalls} />
          </div>
        </div>

        {/* Sound Toggle Button - delay 5s */}
        <div className="opacity-0 animate-[fadeInUp_1s_ease-out_5s_forwards] absolute top-4 right-4 md:top-8 md:right-8 z-50" onClick={(e) => e.stopPropagation()}>
          <SoundToggle 
            isMuted={isMuted} 
            setIsMuted={setIsMuted} 
            textColorClass={textColorClass} 
          />
        </div>

        {/* Language Switcher - delay 7s */}
        <div className="opacity-0 animate-[fadeInUp_1s_ease-out_7s_forwards] absolute bottom-20 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-auto md:bottom-8 md:right-8 z-50" onClick={(e) => e.stopPropagation()}>
          <LanguageSwitcher 
            language={language} 
            setLanguage={setLanguage} 
            textColorClass={textColorClass}
            isMuted={isMuted}
          />
        </div>

        {/* Partner Logos - delay 9s */}
        <div className="opacity-0 animate-[fadeInUp_1s_ease-out_9s_forwards] absolute bottom-4 left-1/2 -translate-x-1/2 md:translate-x-0 md:bottom-8 md:left-8 z-50" onClick={(e) => e.stopPropagation()}>
          <PartnerLogos textColorClass={textColorClass} />
        </div>

        {/* LOGO ZONE - les animations sont gérées dans le composant */}
        <div className="flex flex-col items-center justify-center">
          <LogoDisplay 
            language={language} 
            isDarkContent={isDarkContent} 
            textColorClass={textColorClass} 
            isMovedUp={false}
            onLogoClick={() => setDrawerOpen(true)}
          />
        </div>

        {/* Dynamic AI Prompt Display - apparaît après la tagline */}
        <div className="opacity-0 animate-[fadeInUp_1s_ease-out_2.5s_forwards] absolute bottom-40 md:bottom-8 left-0 right-0">
          <AiPrompt 
            phrase={phrase} 
            textColorClass={textColorClass} 
            audioRef={audioRef}
            isMuted={isMuted}
          />
        </div>

      </div>

      {/* Drawer déclenché par le logo */}
      <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DrawerContent className="h-[35vh] w-screen bg-black/50 backdrop-blur-md border-none text-white font-mono px-[3vw]">
          <DrawerTitle className="sr-only">Sublime Agency Services</DrawerTitle>
          <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-8">
            <div className="flex flex-row gap-8 md:gap-16">
              <p className="text-xs opacity-70">Generative Campaigns</p>
              <p className="text-xs opacity-70">Conversational Bots</p>
              <p className="text-xs opacity-70">AI Tools and Platforms</p>
            </div>
            <a href="mailto:sublime@heaven.fr" className="text-xs opacity-70 hover:opacity-100 transition-opacity mt-10">
              sublime@heaven.fr
            </a>
          </div>
        </DrawerContent>
      </Drawer>
    </main>
  );
}
