"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

interface PartnerLogosProps {
  textColorClass: string;
}

export default function PartnerLogos({ textColorClass }: PartnerLogosProps) {
  const hopscotchRef = useRef<HTMLImageElement>(null);
  const heavenRef = useRef<HTMLImageElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Durées d'affichage: Heaven 90% (18s), Hopscotch 10% (2s)
  const HEAVEN_DURATION = 18000;
  const HOPSCOTCH_DURATION = 2000;

  const animateTransition = (from: 'hopscotch' | 'heaven', to: 'hopscotch' | 'heaven') => {
    const outgoingRef = from === 'hopscotch' ? hopscotchRef.current : heavenRef.current;
    const incomingRef = to === 'hopscotch' ? hopscotchRef.current : heavenRef.current;

    if (outgoingRef && incomingRef) {
      const tl = gsap.timeline();

      tl.to(outgoingRef, {
        y: -20,
        opacity: 0,
        duration: 0.8,
        ease: "power3.inOut"
      }, 0);

      tl.fromTo(incomingRef, 
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.inOut"
        }, 0.1);
    }
  };

  const scheduleNextTransition = (current: 'hopscotch' | 'heaven') => {
    const duration = current === 'heaven' ? HEAVEN_DURATION : HOPSCOTCH_DURATION;
    const next = current === 'heaven' ? 'hopscotch' : 'heaven';

    timeoutRef.current = setTimeout(() => {
      animateTransition(current, next);
      scheduleNextTransition(next);
    }, duration);
  };

  useEffect(() => {
    if (hopscotchRef.current && heavenRef.current) {
      gsap.set(heavenRef.current, { y: 0, opacity: 1 });
      gsap.set(hopscotchRef.current, { y: 20, opacity: 0 });
    }

    scheduleNextTransition('heaven');

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <a 
      href="https://heaven.paris" 
      target="_blank" 
      rel="noopener noreferrer"
      className="h-8 w-32 overflow-hidden flex justify-center md:justify-start"
    >
      <div className="relative w-full h-full flex justify-center md:justify-start">
        <Image
          ref={hopscotchRef}
          src="/hopscotch2.png"
          alt="Hopscotch"
          width={80}
          height={30}
          className={`absolute top-2 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 h-6 w-auto transition-colors duration-1000 ${textColorClass === 'text-black' ? '' : 'invert'}`}
          priority
        />
        <Image
          ref={heavenRef}
          src="/heaven.png"
          alt="Heaven"
          width={80}
          height={30}
          className={`absolute top-2 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 h-6 w-auto transition-colors duration-1000 ${textColorClass === 'text-black' ? '' : 'invert'}`}
          priority
        />
      </div>
    </a>
  );
}
