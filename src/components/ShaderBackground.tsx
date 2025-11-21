"use client";

import { SimplexNoise } from '@paper-design/shaders-react';

interface ShaderBackgroundProps {
  colors: string[];
  speed: number;
  softness: number;
  stepsPerColor: number;
  opacity: number;
}

export default function ShaderBackground({ 
  colors, 
  speed, 
  softness, 
  stepsPerColor, 
  opacity 
}: ShaderBackgroundProps) {
  return (
    <div 
      className="absolute inset-0 w-full h-full" 
      style={{ opacity, transition: 'opacity 0.5s ease-in-out', zIndex: 0 }}
    >
      <SimplexNoise
        colors={colors}
        speed={speed}
        softness={softness}
        stepsPerColor={stepsPerColor}
        width="100%"
        height="100%"
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}

