"use client";

import { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

export type ResultType = 'text' | 'video' | 'image' | 'audio';

export interface ResultData {
  type: ResultType;
  content: string;
  caption?: string;
}

interface ResultDisplayProps {
  data: ResultData | null;
  isVisible: boolean;
  onClose: () => void;
  textColorClass: string;
  onSubmit: (value: string) => void;
}

export default function ResultDisplay({ data, isVisible, onClose, textColorClass, onSubmit }: ResultDisplayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  
  // Animation d'entrée / sortie
  useEffect(() => {
    if (containerRef.current) {
      if (isVisible) {
        gsap.fromTo(containerRef.current,
          { opacity: 0, y: 20, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out", delay: 0.2 }
        );
        // Focus input when result appears? Maybe not intrusive.
      } else {
        gsap.to(containerRef.current, {
          opacity: 0,
          y: 20,
          scale: 0.95,
          duration: 0.4,
          ease: "power3.in"
        });
      }
    }
  }, [isVisible, data]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim().length > 0) {
      onSubmit(inputValue);
      setInputValue("");
    }
  };

  if (!data) return null;

  return (
    <div 
      ref={containerRef}
      className={`absolute inset-0 flex flex-col items-center justify-center z-40 pointer-events-none ${isVisible ? 'pointer-events-auto' : ''}`}
    >
      {/* Contenu Principal */}
      <div className={`relative max-w-4xl w-full p-8 flex flex-col items-center gap-6 ${textColorClass}`}>
        
        {/* Bouton Fermer (Retour) */}
        <button 
          onClick={onClose}
          className={`absolute -top-12 right-8 md:right-0 opacity-50 hover:opacity-100 transition-opacity cursor-pointer font-mono text-xl pointer-events-auto`}
          aria-label="Close"
        >
          ✕
        </button>

        {/* Rendu Conditionnel selon le Type */}
        <div className="w-full flex justify-center pointer-events-auto min-h-[300px] items-center">
            
            {data.type === 'text' && (
                <p className="text-sm md:text-base font-mono text-left leading-relaxed max-w-2xl animate-fade-in">
                    {data.content}
                </p>
            )}

            {data.type === 'image' && (
                <div className="relative w-full max-w-md aspect-square md:aspect-video bg-white/5 border border-white/10 rounded-lg overflow-hidden animate-fade-in">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                        src={data.content} 
                        alt="AI Generated Result" 
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            {data.type === 'video' && (
                <div className="relative w-full max-w-3xl aspect-video bg-black border border-white/10 rounded-lg overflow-hidden shadow-2xl animate-fade-in">
                    {data.content.includes('vimeo.com') || data.content.includes('youtube.com') || data.content.includes('youtu.be') ? (
                        <iframe
                            src={data.content}
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                            title="Video player"
                        />
                    ) : (
                        <video 
                            src={data.content} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
            )}

            {data.type === 'audio' && (
                <div className="flex flex-col items-center gap-6 animate-fade-in">
                    <div className="w-20 h-20 rounded-full border border-current flex items-center justify-center opacity-80">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18V5l12-2v13"></path>
                            <circle cx="6" cy="18" r="3"></circle>
                            <circle cx="18" cy="16" r="3"></circle>
                        </svg>
                    </div>
                    <p className="text-lg md:text-xl font-mono text-center max-w-xl">
                        {data.caption || "Voici une nouvelle ambiance sonore."}
                    </p>
                </div>
            )}

        </div>

        {/* Caption optionnelle */}
        {data.caption && data.type !== 'audio' && (
            <p className="text-xs md:text-sm font-mono opacity-60 mt-4 text-center max-w-lg">
                {`// ${data.caption}`}
            </p>
        )}

        {/* Secondary Input Prompt for Continuous Conversation */}
        <div className="mt-8 w-full max-w-md flex items-center gap-3 border-b border-current pb-2 pointer-events-auto opacity-80 hover:opacity-100 transition-opacity">
            <span className="text-xs opacity-50 font-mono">{">"}</span>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Continue the conversation..."
                className="bg-transparent w-full outline-none font-mono text-sm placeholder-current/30"
                autoFocus
            />
        </div>

      </div>
    </div>
  );
}

