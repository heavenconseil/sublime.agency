import { useState, useEffect, useRef } from "react";

export function useTypewriter(text: string, speed: number = 50, onType?: () => void, onComplete?: () => void) {
  const [displayedText, setDisplayedText] = useState("");
  const lastLength = useRef(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    setDisplayedText("");
    setCurrentIndex(0);
    lastLength.current = 0;
  }, [text]); // Reset complet si le texte change

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeoutId = setTimeout(() => {
        const nextIndex = currentIndex + 1;
        setDisplayedText(text.substring(0, nextIndex));
        setCurrentIndex(nextIndex);

        // Logique de son (si onType existait)
        if (onType) onType();

        if (nextIndex >= text.length) {
          if (onComplete) onComplete();
        }
      }, speed);

      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, text, speed, onType, onComplete]);

  return displayedText;
}

