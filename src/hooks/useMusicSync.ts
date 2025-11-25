"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface ThemeBundle {
  id: string;
  phrase: string;
  colors: string[];
  speed: number;
  softness: number;
  stepsPerColor: number;
  audioBase64?: string;
  audioUrl?: string;
  status: "generating-theme" | "generating-music" | "ready" | "playing" | "done";
}

interface UseMusicSyncOptions {
  language: string;
  isMuted: boolean;
  enabled: boolean;
  canPlay?: boolean; // Attendre avant de jouer (intro)
}

export function useMusicSync({ language, isMuted, enabled, canPlay = true }: UseMusicSyncOptions) {
  const [currentBundle, setCurrentBundle] = useState<ThemeBundle | null>(null);
  const [nextBundle, setNextBundle] = useState<ThemeBundle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs pour éviter les closures stale
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const nextBundleRef = useRef<ThemeBundle | null>(null);
  const isMutedRef = useRef(isMuted);
  const languageRef = useRef(language);
  const canPlayRef = useRef(canPlay);
  const isGeneratingRef = useRef(false);
  const bundleIdCounter = useRef(0);

  // Sync refs avec state
  useEffect(() => {
    nextBundleRef.current = nextBundle;
  }, [nextBundle]);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    canPlayRef.current = canPlay;
  }, [canPlay]);

  // Générer un ID unique
  const generateBundleId = () => {
    bundleIdCounter.current += 1;
    return `bundle-${bundleIdCounter.current}-${Date.now()}`;
  };

  // Convertir base64 en URL blob
  const base64ToAudioUrl = (base64: string): string => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: "audio/mpeg" });
    return URL.createObjectURL(blob);
  };

  // Générer un bundle complet (thème + musique) via l'API hybride
  const generateFullBundle = useCallback(async (): Promise<ThemeBundle> => {
    const id = generateBundleId();
    const currentLanguage = languageRef.current;
    
    // Appel à l'API unifiée qui gère cache Supabase + génération temps réel
    const response = await fetch(`/api/get-theme?lang=${currentLanguage}`);
    if (!response.ok) throw new Error("Failed to get theme");
    const data = await response.json();
    
    console.log(`Bundle ready (${data.source}):`, data.phrase);

    // Gérer l'audio selon la source (cache = URL, realtime = base64)
    let audioUrl: string;
    if (data.audioUrl) {
      // Depuis le cache Supabase
      audioUrl = data.audioUrl;
    } else if (data.audioBase64) {
      // Généré en temps réel
      audioUrl = base64ToAudioUrl(data.audioBase64);
    } else {
      throw new Error("No audio data received");
    }

    return {
      id,
      phrase: data.phrase,
      colors: data.colors,
      speed: data.speed,
      softness: data.softness,
      stepsPerColor: data.stepsPerColor,
      audioBase64: data.audioBase64,
      audioUrl,
      status: "ready",
    };
  }, []); // Pas de dépendance car on utilise la ref

  // Générer le prochain bundle en arrière-plan
  const startGeneratingNext = useCallback(async () => {
    if (isGeneratingRef.current) return;
    isGeneratingRef.current = true;

    try {
      console.log("Starting next bundle generation...");
      const bundle = await generateFullBundle();
      setNextBundle(bundle);
      nextBundleRef.current = bundle;
      console.log("Next bundle ready!");
    } catch (err) {
      console.error("Error generating next bundle:", err);
    } finally {
      isGeneratingRef.current = false;
    }
  }, [generateFullBundle]);

  // Jouer un bundle et configurer la transition
  const playAndSetupTransition = useCallback((bundle: ThemeBundle) => {
    if (!bundle.audioUrl) return;

    // Fade out l'ancien audio
    if (currentAudioRef.current) {
      const oldAudio = currentAudioRef.current;
      let volume = oldAudio.volume;
      const fadeOut = setInterval(() => {
        volume -= 0.1;
        if (volume <= 0) {
          clearInterval(fadeOut);
          oldAudio.pause();
          URL.revokeObjectURL(oldAudio.src);
        } else {
          oldAudio.volume = Math.max(0, volume);
        }
      }, 100);
    }

    // Créer et jouer le nouvel audio
    const audio = new Audio(bundle.audioUrl);
    audio.volume = isMutedRef.current ? 0 : 1;
    currentAudioRef.current = audio;
    
    // Ne jouer que si canPlay est true ET pas muted
    if (!isMutedRef.current && canPlayRef.current) {
      audio.play().catch(console.error);
    }

    // Quand l'audio se termine, transition automatique
    audio.onended = () => {
      console.log("Audio ended, checking for next bundle...");
      const next = nextBundleRef.current;
      
      if (next && next.status === "ready") {
        console.log("Transitioning to:", next.phrase);
        
        // Mettre à jour l'état
        setCurrentBundle({ ...next, status: "playing" });
        setNextBundle(null);
        nextBundleRef.current = null;
        
        // Jouer le nouveau bundle
        playAndSetupTransition(next);
        
        // Commencer à générer le suivant
        startGeneratingNext();
      } else {
        console.log("Next bundle not ready yet, waiting...");
        // Attendre que le prochain soit prêt
        const checkInterval = setInterval(() => {
          const nextCheck = nextBundleRef.current;
          if (nextCheck && nextCheck.status === "ready") {
            clearInterval(checkInterval);
            console.log("Next bundle now ready, transitioning...");
            
            setCurrentBundle({ ...nextCheck, status: "playing" });
            setNextBundle(null);
            nextBundleRef.current = null;
            
            playAndSetupTransition(nextCheck);
            startGeneratingNext();
          }
        }, 500);
      }
    };
  }, [startGeneratingNext]);

  // Ref pour éviter la double initialisation
  const hasInitializedRef = useRef(false);

  // Initialisation (une seule fois)
  useEffect(() => {
    if (!enabled || hasInitializedRef.current) return;
    hasInitializedRef.current = true;

    let cancelled = false;

    const init = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Générer le premier bundle
        const bundle = await generateFullBundle();
        
        if (cancelled) return;

        setCurrentBundle({ ...bundle, status: "playing" });
        
        // Configurer l'audio (sera joué quand l'utilisateur unmute)
        playAndSetupTransition(bundle);
        
        // Commencer à générer le suivant
        startGeneratingNext();

      } catch (err) {
        console.error("Init error:", err);
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unknown error");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    init();

    return () => {
      cancelled = true;
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        if (currentAudioRef.current.src) {
          URL.revokeObjectURL(currentAudioRef.current.src);
        }
      }
    };
  }, [enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  // Gérer le mute/unmute
  useEffect(() => {
    if (currentAudioRef.current) {
      if (isMuted) {
        currentAudioRef.current.volume = 0;
      } else {
        currentAudioRef.current.volume = 1;
        // Ne jouer que si canPlay est aussi true
        if (currentAudioRef.current.paused && canPlayRef.current) {
          currentAudioRef.current.play().catch(console.error);
        }
      }
    }
  }, [isMuted]);

  // Démarrer la lecture quand canPlay devient true (après l'intro)
  useEffect(() => {
    if (canPlay && currentAudioRef.current && !isMuted) {
      if (currentAudioRef.current.paused) {
        currentAudioRef.current.play().catch(console.error);
      }
    }
  }, [canPlay, isMuted]);

  // Skip manuel
  const skip = useCallback(() => {
    const next = nextBundleRef.current;
    if (next && next.status === "ready") {
      setCurrentBundle({ ...next, status: "playing" });
      setNextBundle(null);
      nextBundleRef.current = null;
      playAndSetupTransition(next);
      startGeneratingNext();
    }
  }, [playAndSetupTransition, startGeneratingNext]);

  return {
    currentBundle,
    nextBundle,
    isLoading,
    error,
    skip,
    isNextReady: nextBundle?.status === "ready",
  };
}
