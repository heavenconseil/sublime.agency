"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SimplexNoise } from '@paper-design/shaders-react';

gsap.registerPlugin(ScrollTrigger);

const services = [
  { 
    title: "Generative media", 
    desc: [
      "Crafting unseen visual narratives.",
      "High-fidelity AI video & imagery designed to elevate brand aesthetics."
    ]
  },
  { 
    title: "Social intelligence", 
    desc: [
      "Decoding cultural signals.",
      "Advanced data analysis to predict trends and align strategy with audience pulse."
    ]
  },
  { 
    title: "Next-gen SEO", 
    desc: [
      "Dominating the new search landscape.",
      "GEO & LLM optimization to ensure visibility in an AI-first world."
    ]
  },
  { 
    title: "Automated systems", 
    desc: [
      "Streamlining creativity.",
      "Bespoke workflows and automation to scale operations without compromising quality."
    ]
  },
  // Duplication pour effet de boucle
  { 
    title: "Generative media", 
    desc: [
      "Crafting unseen visual narratives.",
      "High-fidelity AI video & imagery designed to elevate brand aesthetics."
    ]
  },
  { 
    title: "Social intelligence", 
    desc: [
      "Decoding cultural signals.",
      "Advanced data analysis to predict trends and align strategy with audience pulse."
    ]
  },
  { 
    title: "Next-gen SEO", 
    desc: [
      "Dominating the new search landscape.",
      "GEO & LLM optimization to ensure visibility in an AI-first world."
    ]
  },
];

export default function Home() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const logoContainerRef = useRef<HTMLDivElement>(null);
  const servicesContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 0. SETUP INITIAL
    gsap.set(servicesContainerRef.current, { y: "150vh", opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "top top",
        end: "+=600%", // Augmenté pour accommoder le formulaire
        pin: true,
        scrub: 1,
      }
    });

    // 1. Le logo se déplace vers la gauche
    tl.to(logoContainerRef.current, {
      left: "0%", 
      width: "50%", 
      duration: 1,
      ease: "power2.inOut"
    });

    // 2. Apparition du logo Hopscotch
    tl.to(".hopscotch-logo", {
        opacity: 0.8,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
    }, "-=0.2");

    // 3. APPARITION DU CONTENEUR SERVICES
    tl.to(servicesContainerRef.current, 
      { opacity: 1, duration: 0.5, ease: "power1.in" }, 
      "<" 
    );

    // 4. MOUVEMENT DU CONTENEUR
    tl.to(servicesContainerRef.current, 
      { y: "-350%", duration: 8, ease: "none" }, // Augmenté pour scroller jusqu'au bout du formulaire
      "<" 
    );

    // 5. Gestion de l'opacité "Spotlight"
    const updateOpacity = () => {
      const center = window.innerHeight / 2;
      const items = document.querySelectorAll(".service-item");
      
      items.forEach(item => {
        const rect = item.getBoundingClientRect();
        const itemCenter = rect.top + rect.height / 2;
        const distance = Math.abs(center - itemCenter);
        
        let opacity;
        
        if (distance < 200) {
            opacity = 1;
        } else {
            opacity = 1 - ((distance - 200) / 300);
        }
        
        opacity = Math.max(0.1, Math.min(1, opacity));
        
        const scale = 0.9 + (opacity * 0.15); 
        const blurAmount = opacity === 1 ? 0 : (1 - opacity) * 5;
        
        gsap.set(item, { 
            opacity: opacity, 
            scale: scale, 
            filter: blurAmount > 0 ? `blur(${blurAmount}px)` : "none",
            zIndex: opacity === 1 ? 100 : 10 
        });
      });
    };

    gsap.ticker.add(updateOpacity);

    return () => {
      gsap.ticker.remove(updateOpacity);
    };

  }, { scope: wrapperRef });

  return (
    <main className="relative w-full bg-[#2f2235] text-foreground overflow-x-hidden">
      
      {/* Fond Fixe SimplexNoise */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <SimplexNoise
          width="100%"
          height="100%"
          colors={["#2f2235", "#3f3244", "#60495a", "#a9aca9", "#bfc3ba"]}
          stepsPerColor={3}
          softness={1}
          speed={1}
          scale={1}
        />
      </div>

      {/* Main Wrapper épinglé */}
      <div ref={wrapperRef} className="relative z-20 w-full h-screen overflow-hidden">
        
        {/* LOGO ZONE */}
        <div ref={logoContainerRef} className="absolute inset-0 z-20 flex flex-col items-center justify-center">
           <div className="flex flex-col items-center transform transition-transform duration-700">
             <Image 
              src="/sublimeV1.svg" 
              alt="Sublime Agency Logo" 
              width={250} 
              height={160} 
              className="invert w-48 md:w-72" 
              priority
            />
            <h1 className="mt-6 text-xs font-mono mix-blend-difference text-white text-center">
               heaven.paris ai studio
            </h1>

            {/* HOPSCOTCH LOGO */}
            <div className="hopscotch-logo mt-8 opacity-0 translate-y-4">
                  <Image 
                      src="/Hopscotch_square_tab_black.png" 
                      alt="Hopscotch Groupe" 
                      width={40} 
                      height={40} 
                      className="invert" 
                  />
            </div>
           </div>
        </div>

        {/* SERVICES ZONE */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 z-30 h-full flex items-center justify-center">
            <div ref={servicesContainerRef} className="flex flex-col gap-48 w-full max-w-3xl px-12 opacity-0 translate-y-[150vh]">
                {services.map((service, index) => (
                    <div key={index} className="service-item flex flex-col text-left space-y-6 p-4 rounded-2xl origin-center will-change-transform">
                        <h2 className="text-4xl md:text-7xl font-black text-white leading-tight wrap-break-word">
                            {service.title}
                        </h2>
                        <ul className="space-y-3">
                          {service.desc.map((line, i) => (
                            <li key={i} className="text-sm font-mono font-light leading-relaxed tracking-wide flex items-start">
                              <span className="mr-3 mt-1 text-white/40 text-[10px]">●</span>
                              <span>{line}</span>
                            </li>
                          ))}
                        </ul>
                    </div>
                ))}

                {/* CONTACT FORM BLOCK */}
                <div className="service-item flex flex-col text-left space-y-8 p-4 rounded-2xl origin-center will-change-transform min-h-[40vh] justify-center">
                    <h2 className="text-4xl md:text-6xl font-black text-white leading-tight wrap-break-word mb-8">
                        keep in touch bro
                    </h2>
                    
                    <form className="w-full space-y-10">
                        <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12 border-b border-white/20 pb-2 relative group">
                            <label htmlFor="name" className="text-xs font-mono text-white/50 w-16 shrink-0 uppercase tracking-widest group-hover:text-white transition-colors">name</label>
                            <input 
                                type="text" 
                                id="name"
                                className="bg-transparent w-full text-xl md:text-3xl text-white focus:outline-none placeholder:text-white/5 font-light pb-2"
                                placeholder="John Doe"
                            />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-baseline gap-4 md:gap-12 border-b border-white/20 pb-2 relative group">
                            <label htmlFor="email" className="text-xs font-mono text-white/50 w-16 shrink-0 uppercase tracking-widest group-hover:text-white transition-colors">email</label>
                            <input 
                                type="email" 
                                id="email"
                                className="bg-transparent w-full text-xl md:text-3xl text-white focus:outline-none placeholder:text-white/5 font-light pb-2"
                                placeholder="john@heaven.paris"
                            />
                        </div>

                        <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-12 border-b border-white/20 pb-2 relative group">
                            <label htmlFor="message" className="text-xs font-mono text-white/50 w-16 shrink-0 uppercase tracking-widest mt-2 group-hover:text-white transition-colors">message</label>
                            <textarea 
                                id="message"
                                rows={2}
                                className="bg-transparent w-full text-xl md:text-3xl text-white focus:outline-none placeholder:text-white/5 font-light resize-none"
                                placeholder="Let's build..."
                            />
                        </div>

                        <div className="pt-4">
                            <button type="submit" className="px-8 py-4 border border-white/20 rounded-full text-xs font-mono hover:bg-white hover:text-black hover:border-white transition-all duration-500 uppercase tracking-[0.2em]">
                                Send it
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>

      </div>
      
      <div className="h-[50vh] w-full"></div>
    </main>
  );
}
