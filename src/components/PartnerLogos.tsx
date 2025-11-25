"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

interface PartnerLogosProps {
  textColorClass: string;
}

export default function PartnerLogos({ textColorClass }: PartnerLogosProps) {
  const [currentLogo, setCurrentLogo] = useState<'hopscotch' | 'heaven'>('hopscotch');
  // Refs pour chaque logo
  const hopscotchRef = useRef<HTMLImageElement>(null);
  const heavenRef = useRef<HTMLImageElement>(null);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initial setup
    if (hopscotchRef.current && heavenRef.current) {
      // Hopscotch visible au début
      gsap.set(hopscotchRef.current, { y: 0, opacity: 1 });
      // Heaven caché en bas
      gsap.set(heavenRef.current, { y: 20, opacity: 0 });
    }

    intervalRef.current = setInterval(() => {
      setCurrentLogo(prev => {
        const next = prev === 'hopscotch' ? 'heaven' : 'hopscotch';
        
        const outgoingRef = prev === 'hopscotch' ? hopscotchRef.current : heavenRef.current;
        const incomingRef = next === 'hopscotch' ? hopscotchRef.current : heavenRef.current;

        if (outgoingRef && incomingRef) {
          // Timeline pour synchroniser
          const tl = gsap.timeline();

          // 1. Le logo actuel part vers le haut
          tl.to(outgoingRef, {
            y: -20,
            opacity: 0,
            duration: 0.8,
            ease: "power3.inOut"
          }, 0); // Démarrer à t=0

          // 2. Le nouveau logo arrive du bas
          tl.fromTo(incomingRef, 
            { y: 20, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: "power3.inOut"
            }, 0.1); // Léger décalage (0.1s) pour l'effet de chasse
        }
        
        return next;
      });
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="absolute bottom-8 left-8 z-50 h-8 w-32 overflow-hidden">
      <div className="relative w-full h-full">
        <a 
          href="https://hopscotch.one" 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute top-2 left-0"
        >
          <Image
            ref={hopscotchRef}
            src="/hopscotch2.png"
            alt="Hopscotch"
            width={80}
            height={30}
            className={`h-6 w-auto transition-colors duration-1000 ${textColorClass === 'text-black' ? '' : 'invert'}`}
            priority
          />
        </a>
        <a 
          href="https://heaven.paris" 
          target="_blank" 
          rel="noopener noreferrer"
          className="absolute top-2 left-0"
        >
          <Image
            ref={heavenRef}
            src="/heaven.png"
            alt="Heaven"
            width={80}
            height={30}
            className={`h-6 w-auto transition-colors duration-1000 ${textColorClass === 'text-black' ? '' : 'invert'}`}
            priority
          />
        </a>
      </div>
    </div>
  );
}
