"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";

interface VideoShowcaseProps {
  isOpen: boolean;
  onClose: () => void;
  textColorClass: string;
}

const VIDEO_URL =
  "https://player.vimeo.com/progressive_redirect/playback/1174133424/rendition/1080p/file.mp4%20%281080p%29.mp4?loc=external&log_user=0&signature=8110b1168e497e0e22548b07a47af5613d94c14c3b256a9fe3c7f0e5cb47b717";

export default function VideoShowcase({ isOpen, onClose, textColorClass }: VideoShowcaseProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const controlsRowRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const handleClose = useCallback(() => {
    if (!overlayRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        }
        onClose();
      },
    });

    tl.to(videoRef.current, {
      scale: 0.95,
      opacity: 0,
      duration: 0.4,
      ease: "power2.inOut",
    });
    tl.to(
      overlayRef.current,
      {
        opacity: 0,
        duration: 0.3,
        ease: "power2.inOut",
      },
      "-=0.2"
    );
  }, [onClose]);

  // Open animation
  useEffect(() => {
    if (!isOpen || !overlayRef.current || !videoRef.current) return;

    const tl = gsap.timeline();
    timelineRef.current = tl;

    gsap.set(overlayRef.current, { opacity: 0 });
    gsap.set(videoRef.current, { scale: 0.95, opacity: 0 });
    gsap.set(controlsRowRef.current, { opacity: 0 });

    tl.to(overlayRef.current, {
      opacity: 1,
      duration: 0.4,
      ease: "power2.out",
    });
    tl.to(
      videoRef.current,
      {
        scale: 1,
        opacity: 1,
        duration: 0.5,
        ease: "power3.out",
      },
      "-=0.2"
    );
    tl.to(
      controlsRowRef.current,
      {
        opacity: 1,
        duration: 0.3,
        ease: "power2.out",
      },
      "-=0.2"
    );

    // Auto-play
    videoRef.current.play().catch(() => {});

    return () => {
      tl.kill();
    };
  }, [isOpen]);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(pointer: coarse)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Auto-hide controls on desktop when mouse idle
  useEffect(() => {
    if (!isOpen || isMobile || !controlsRowRef.current) return;

    const show = () => {
      gsap.to(controlsRowRef.current, { opacity: 1, duration: 0.3 });
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      hideTimerRef.current = setTimeout(() => {
        if (controlsRowRef.current) {
          gsap.to(controlsRowRef.current, { opacity: 0, duration: 0.6 });
        }
      }, 3000);
    };

    // Show initially then start timer
    show();

    document.addEventListener("mousemove", show);
    return () => {
      document.removeEventListener("mousemove", show);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [isOpen, isMobile]);

  // Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-100 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-2xl" />

      {/* Video + controls */}
      <div className="relative z-10 flex flex-col">
        <video
          ref={videoRef}
          src={VIDEO_URL}
          className="w-[90vw] max-w-5xl aspect-video object-contain rounded-sm"
          controls
          playsInline
          onEnded={handleClose}
          preload="auto"
        />
        <div ref={controlsRowRef} className="mt-3 flex justify-between items-center w-full">
          <button
            ref={closeButtonRef}
            onClick={() => {
              const click = new Audio('/sounds/click.mp3');
              click.play().catch(() => {});
              handleClose();
            }}
            className="font-mono text-sm text-white/70 hover:text-white transition-colors duration-300 cursor-pointer"
            aria-label="Fermer la vidéo"
          >
            [x]
          </button>
          <a
            href="mailto:sublime@heaven.fr"
            className="font-mono text-[10px] text-white/50 hover:text-white/80 transition-colors duration-300"
          >
            sublime@heaven.fr
          </a>
        </div>
      </div>
    </div>
  );
}
