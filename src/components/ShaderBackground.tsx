"use client";

import { SimplexNoise } from '@paper-design/shaders-react';
import { useState, useEffect, useRef, useMemo } from 'react';

interface ShaderBackgroundProps {
  colors: string[];
  speed: number;
  softness: number;
  stepsPerColor: number;
}

interface LayerParams {
  colors: string[];
  speed: number;
  softness: number;
  stepsPerColor: number;
}

export default function ShaderBackground({ 
  colors, 
  speed, 
  softness, 
  stepsPerColor
}: ShaderBackgroundProps) {
  // Système ping-pong : 2 layers fixes (A et B) qui alternent
  // Chaque layer a ses propres params pour éviter les sauts
  const initialParams = useMemo(() => ({ colors, speed, softness, stepsPerColor }), []);
  
  const [layerA, setLayerA] = useState<LayerParams>(initialParams);
  const [layerB, setLayerB] = useState<LayerParams>(initialParams);
  const [activeLayer, setActiveLayer] = useState<'A' | 'B'>('A');
  const [opacity, setOpacity] = useState(1);
  
  const lastColorsRef = useRef(JSON.stringify(colors));
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const colorsStr = JSON.stringify(colors);
    
    // Skip si même couleurs
    if (colorsStr === lastColorsRef.current) return;
    lastColorsRef.current = colorsStr;

    // Annuler l'animation précédente si en cours
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Préparer le layer inactif avec TOUS les nouveaux params
    const newParams = { colors, speed, softness, stepsPerColor };
    const nextLayer = activeLayer === 'A' ? 'B' : 'A';
    if (nextLayer === 'A') {
      setLayerA(newParams);
    } else {
      setLayerB(newParams);
    }

    // Attendre un frame pour que le nouveau layer soit prêt
    requestAnimationFrame(() => {
      // Démarrer le crossfade
      const startTime = Date.now();
      const duration = 4000;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing très doux des deux côtés
        const eased = progress < 0.5
          ? 4 * Math.pow(progress, 3)
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        setOpacity(eased);

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Transition terminée : switcher le layer actif
          setActiveLayer(nextLayer);
          setOpacity(1);
          animationRef.current = null;
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    });

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [colors]); // Seulement colors, pas activeLayer

  const isTransitioning = opacity < 1;

  return (
    <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
      {/* Layer A */}
      {(activeLayer === 'A' || isTransitioning) && (
        <div 
          className="absolute inset-0"
          style={{ 
            opacity: activeLayer === 'A' 
              ? (isTransitioning ? 1 - opacity * 0.5 : 1)
              : opacity,
            zIndex: activeLayer === 'A' ? 1 : 2
          }}
        >
          <SimplexNoise
            colors={layerA.colors}
            speed={layerA.speed}
            softness={layerA.softness}
            stepsPerColor={layerA.stepsPerColor}
            width="100%"
            height="100%"
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
      )}
      
      {/* Layer B */}
      {(activeLayer === 'B' || isTransitioning) && (
        <div 
          className="absolute inset-0"
          style={{ 
            opacity: activeLayer === 'B' 
              ? (isTransitioning ? 1 - opacity * 0.5 : 1)
              : opacity,
            zIndex: activeLayer === 'B' ? 1 : 2
          }}
        >
          <SimplexNoise
            colors={layerB.colors}
            speed={layerB.speed}
            softness={layerB.softness}
            stepsPerColor={layerB.stepsPerColor}
            width="100%"
            height="100%"
            style={{ width: '100%', height: '100%', display: 'block' }}
          />
        </div>
      )}
    </div>
  );
}

