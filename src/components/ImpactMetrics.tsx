"use client";

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";

interface ImpactMetricsProps {
  textColorClass: string;
  apiCalls: number; // Nombre d'appels API (OpenAI, ElevenLabs)
}

// Coefficients d'estimation (sources: Green Web Foundation, Shift Project)
const CO2_PER_API_CALL = 0.2; // ~0.2g CO2 par requête IA moyenne
const CO2_PER_SECOND = 0.0001; // Consommation client idle
const WATER_PER_API_CALL = 0.5; // ~0.5mL par requête (refroidissement data center)
const WATER_PER_SECOND = 0.0002; // mL

// Type pour performance.memory (Chrome only)
interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

type MetricType = 'co2' | 'h2o' | 'ram';

export default function ImpactMetrics({ textColorClass, apiCalls }: ImpactMetricsProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [ramMB, setRamMB] = useState<number | null>(null);
  const [hasMemoryAPI, setHasMemoryAPI] = useState(false);
  const [currentMetric, setCurrentMetric] = useState<MetricType>('co2');
  
  const metricRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Durées d'affichage pour chaque métrique
  const METRIC_DURATION = 4000;

  // Vérifier si l'API memory est disponible (Chrome/Chromium only)
  useEffect(() => {
    const perf = performance as Performance & { memory?: PerformanceMemory };
    setHasMemoryAPI(!!perf.memory);
  }, []);

  // Timer pour le temps écoulé + RAM
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(s => s + 1);
      
      // Mesurer la RAM si disponible
      const perf = performance as Performance & { memory?: PerformanceMemory };
      if (perf.memory) {
        const usedMB = perf.memory.usedJSHeapSize / 1024 / 1024;
        setRamMB(usedMB);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Cycle entre les métriques avec animation
  useEffect(() => {
    const metrics: MetricType[] = hasMemoryAPI ? ['co2', 'h2o', 'ram'] : ['co2', 'h2o'];
    
    const scheduleNext = () => {
      timeoutRef.current = setTimeout(() => {
        // Animation de sortie horizontale
        if (metricRef.current) {
          gsap.to(metricRef.current, {
            x: -20,
            opacity: 0,
            duration: 0.4,
            ease: "power2.in",
            onComplete: () => {
              // Changer la métrique
              setCurrentMetric(prev => {
                const currentIndex = metrics.indexOf(prev);
                const nextIndex = (currentIndex + 1) % metrics.length;
                return metrics[nextIndex];
              });
              
              // Animation d'entrée horizontale
              if (metricRef.current) {
                gsap.fromTo(metricRef.current,
                  { x: 20, opacity: 0 },
                  { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
                );
              }
            }
          });
        }
        scheduleNext();
      }, METRIC_DURATION);
    };

    scheduleNext();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [hasMemoryAPI]);

  // Calculs
  const co2 = (apiCalls * CO2_PER_API_CALL) + (elapsedSeconds * CO2_PER_SECOND);
  const water = (apiCalls * WATER_PER_API_CALL) + (elapsedSeconds * WATER_PER_SECOND);

  const renderMetric = () => {
    switch (currentMetric) {
      case 'co2':
        return (
          <>
            <span>CO₂</span>
            <span>{co2.toFixed(2)}g</span>
          </>
        );
      case 'h2o':
        return (
          <>
            <span>H₂O</span>
            <span>{water.toFixed(2)}mL</span>
          </>
        );
      case 'ram':
        return hasMemoryAPI && ramMB !== null ? (
          <>
            <span>RAM</span>
            <span>{ramMB.toFixed(1)}MB</span>
          </>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <div className={`font-mono text-[10px] opacity-50 transition-colors duration-1000 ${textColorClass}`}>
      <div ref={metricRef} className="flex items-center gap-2">
        {renderMetric()}
      </div>
    </div>
  );
}
