"use client";

import { SimplexNoise } from '@paper-design/shaders-react';
import { useState, useEffect, useRef } from 'react';

interface ShaderBackgroundProps {
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
  // Stocker les couleurs précédentes pour le crossfade
  const [prevColors, setPrevColors] = useState(colors);
  const [currentColors, setCurrentColors] = useState(colors);
  const [crossfadeProgress, setCrossfadeProgress] = useState(1); // 1 = affiche currentColors
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip le premier rendu
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Quand les couleurs changent, démarrer le crossfade
    if (JSON.stringify(colors) !== JSON.stringify(currentColors)) {
      setPrevColors(currentColors);
      setCurrentColors(colors);
      setCrossfadeProgress(0);

      // Animer le crossfade sur 800ms
      const startTime = Date.now();
      const duration = 2000;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Easing ease-in-out
        const eased = progress < 0.5 
          ? 2 * progress * progress 
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        setCrossfadeProgress(eased);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [colors, currentColors]);

  return (
    <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
      {/* Layer précédent (disparaît) */}
      <div 
        className="absolute inset-0"
        style={{ opacity: 1 - crossfadeProgress }}
      >
        <SimplexNoise
          colors={prevColors}
          speed={speed}
          softness={softness}
          stepsPerColor={stepsPerColor}
          width="100%"
          height="100%"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
      
      {/* Layer actuel (apparaît) */}
      <div 
        className="absolute inset-0"
        style={{ opacity: crossfadeProgress }}
      >
        <SimplexNoise
          colors={currentColors}
          speed={speed}
          softness={softness}
          stepsPerColor={stepsPerColor}
          width="100%"
          height="100%"
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      </div>
    </div>
  );
}

