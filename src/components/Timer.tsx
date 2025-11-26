"use client";

import { useState, useEffect } from "react";

interface TimerProps {
  textColorClass: string;
}

export default function Timer({ textColorClass }: TimerProps) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime((t) => t + 10); // +10ms
    }, 10);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const milliseconds = Math.floor((ms % 1000) / 10); // 2 chiffres
    return `${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`font-mono text-xs transition-colors duration-1000 ${textColorClass}`}>
      {formatTime(time)}
    </div>
  );
}

