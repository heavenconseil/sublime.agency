"use client";

import Image from "next/image";
import dynamic from 'next/dynamic';

import { LiquidMetal } from '@paper-design/shaders-react';
import { SimplexNoise } from '@paper-design/shaders-react';



export default function Home() {
  return (
    <main className="relative flex h-screen w-full flex-col items-center justify-center bg-[#2f2235] text-foreground overflow-hidden">
      <div className="absolute inset-0 z-0">


{/* 
        <LiquidMetal
          // image="/sublimeV1.svg"
          width="100%"
          height="100%"
          colorBack="#000000"
          colorTint="#FFF"
          shape="metaballs"
          repetition={1}
          softness={0.2}
          shiftRed={-0.4}
          shiftBlue={0.4}
          distortion={0.2}
          contour={0.1}
          angle={200}
          speed={1}
          scale={0.12}
          fit="cover"
        /> */}



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


      
      
      <div className="relative z-10 flex h-full flex-col items-center justify-end pb-24 pointer-events-none">
        <div className="flex items-center justify-center"></div>
          <Image src="/sublimeV1.svg" alt="Sublime Agency Logo" width={150} height={100} className="invert" />
          <h1 className="text-sm font-light tracking-wider mix-blend-difference text-white opacity-80 pt-6">
            heaven.paris ai studio 
          </h1>

      </div>
    </main>
  );
}
