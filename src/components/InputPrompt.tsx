"use client";

import { useState, useRef, useEffect } from "react";
import { gsap } from "gsap";
import type { Language } from "./LanguageSwitcher";

interface InputPromptProps {
  language: Language;
  textColorClass: string;
  onSubmit: (value: string) => void;
}

export default function InputPrompt({ language, textColorClass, onSubmit }: InputPromptProps) {
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const leftDotRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPlaceholderIndex, setCurrentPlaceholderIndex] = useState(0);

  // Traductions des placeholders (rotation)
  const placeholders: Record<Language, string[]> = {
    fr: [
      'Comment vas-tu ?',
      'Tu veux changer de musique ?',
      'Voir un case study ?'
    ],
    en: [
      'How are you?',
      'Do you want to change music?',
      'See a case study?'
    ],
    es: [
      '¿Cómo estás?',
      '¿Quieres cambiar de música?',
      '¿Ver un caso de estudio?'
    ],
    de: [
      'Wie geht es dir?',
      'Möchtest du die Musik ändern?',
      'Eine Fallstudie sehen?'
    ],
    ko: [
      '어떻게 지내세요?',
      '음악을 바꾸시겠습니까?',
      '사례 연구를 보시겠습니까?'
    ],
    zh: [
      '你好吗？',
      '你想换音乐吗？',
      '查看案例研究？'
    ],
    ar: [
      'كيف حالك؟',
      'هل تريد تغيير الموسيقى؟',
      'هل تريد رؤية دراسة حالة؟'
    ]
  };

  // Gestion du clic à l'extérieur pour fermer l'input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowInput(false);
      }
    };

    if (showInput) {
      document.addEventListener("mousedown", handleClickOutside);
      // Reset placeholder index when opening
      setCurrentPlaceholderIndex(0);
    } else {
      // Reset input value when closing (optional, but good UX)
      setInputValue("");
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showInput]);

  // Rotation des placeholders toutes les 3 secondes si input est vide
  useEffect(() => {
    if (!showInput || inputValue.length > 0) return;

    const interval = setInterval(() => {
      setCurrentPlaceholderIndex((prev) => (prev + 1) % placeholders[language].length);
    }, 3000);

    return () => clearInterval(interval);
  }, [showInput, inputValue, language]);

  // Animation GSAP pour un effet de battement de cœur (heartbeat)
  useEffect(() => {
    if (leftDotRef.current) {
      // Timeline pour créer un battement complexe (boum-boum... boum-boum...)
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
      
      tl.to(leftDotRef.current, {
        scale: 1.3,
        duration: 0.15,
        ease: "power1.out"
      })
      .to(leftDotRef.current, {
        scale: 1,
        duration: 0.15,
        ease: "power1.in"
      })
      .to(leftDotRef.current, {
        scale: 1.2,
        duration: 0.15,
        ease: "power1.out"
      })
      .to(leftDotRef.current, {
        scale: 1,
        duration: 0.25,
        ease: "power1.in"
      });
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim().length > 0) {
      onSubmit(inputValue);
      // Optionnel : fermer l'input ou le vider ? 
      // UX : On le garde ouvert pour voir ce qu'on a tapé ou on le vide ?
      // Pour l'instant, on le vide pour laisser place au résultat
      setInputValue("");
      setShowInput(false); 
    }
  };

  return (
    <div ref={containerRef} className="absolute bottom-8 left-8 z-50 flex items-center gap-3">
      <button 
        onClick={() => setShowInput(!showInput)}
        className="cursor-pointer"
        aria-label="Toggle input field"
      >
        <div 
          ref={leftDotRef}
          className={`w-6 h-6 rounded-full ${
            textColorClass === 'text-black' ? 'bg-black' : 'bg-white'
          }`}
        ></div>
      </button>
      
      {showInput && (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholders[language][currentPlaceholderIndex]}
          className={`w-48 md:w-64 bg-transparent border-b ${
            textColorClass === 'text-black' ? 'border-black text-black placeholder-black/50' : 'border-white text-white placeholder-white/50'
          } outline-none font-mono text-sm py-1 transition-all duration-500`}
          autoFocus
        />
      )}
    </div>
  );
}
