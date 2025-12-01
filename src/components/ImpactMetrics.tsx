"use client";

import { useState, useEffect } from "react";

interface ImpactMetricsProps {
  textColorClass: string;
  apiCalls: number;
}

// Coefficients d'estimation (sources: Green Web Foundation, Shift Project)
const CO2_PER_API_CALL = 0.2;
const CO2_PER_SECOND = 0.0001;
const WATER_PER_API_CALL = 0.5;
const WATER_PER_SECOND = 0.0002;

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export default function ImpactMetrics({ textColorClass, apiCalls }: ImpactMetricsProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [ramMB, setRamMB] = useState<number | null>(null);
  const [hasMemoryAPI, setHasMemoryAPI] = useState(false);

  useEffect(() => {
    const perf = performance as Performance & { memory?: PerformanceMemory };
    setHasMemoryAPI(!!perf.memory);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(s => s + 1);
      
      const perf = performance as Performance & { memory?: PerformanceMemory };
      if (perf.memory) {
        setRamMB(perf.memory.usedJSHeapSize / 1024 / 1024);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const co2 = (apiCalls * CO2_PER_API_CALL) + (elapsedSeconds * CO2_PER_SECOND);
  const water = (apiCalls * WATER_PER_API_CALL) + (elapsedSeconds * WATER_PER_SECOND);

  return (
    <div className={`font-mono text-[10px] opacity-50 transition-colors duration-1000 ${textColorClass} flex flex-col gap-0.5`}>
      <div className="flex items-center gap-2">
        <span>CO₂</span>
        <span>{co2.toFixed(2)}g</span>
      </div>
      <div className="flex items-center gap-2">
        <span>H₂O</span>
        <span>{water.toFixed(2)}mL</span>
      </div>
      {hasMemoryAPI && ramMB !== null && (
        <div className="flex items-center gap-2">
          <span>RAM</span>
          <span>{ramMB.toFixed(1)}MB</span>
        </div>
      )}
    </div>
  );
}
