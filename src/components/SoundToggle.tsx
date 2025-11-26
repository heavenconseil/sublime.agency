"use client";

interface SoundToggleProps {
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  textColorClass: string;
}

export default function SoundToggle({ isMuted, setIsMuted, textColorClass }: SoundToggleProps) {
  return (
    <button 
      onClick={() => setIsMuted(!isMuted)}
      className={`mix-blend-difference opacity-50 hover:opacity-100 transition-opacity cursor-pointer ${textColorClass}`}
      aria-label={isMuted ? "Unmute" : "Mute"}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="24" 
        height="24" 
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        {/* Bar 1 - smallest */}
        <rect x="0" y="11" width="1" height="2" className={isMuted ? "" : "animate-equalizer-1"} />
        {/* Bar 2 */}
        <rect x="2" y="10" width="1" height="4" className={isMuted ? "" : "animate-equalizer-2"} />
        {/* Bar 3 */}
        <rect x="4" y="9" width="1" height="6" className={isMuted ? "" : "animate-equalizer-3"} />
        {/* Bar 4 */}
        <rect x="6" y="8" width="1" height="8" className={isMuted ? "" : "animate-equalizer-1"} />
        {/* Bar 5 */}
        <rect x="8" y="6" width="1" height="12" className={isMuted ? "" : "animate-equalizer-2"} />
        {/* Bar 6 - tallest */}
        <rect x="10" y="5" width="1" height="14" className={isMuted ? "" : "animate-equalizer-3"} />
        {/* Bar 7 - tallest */}
        <rect x="12" y="5" width="1" height="14" className={isMuted ? "" : "animate-equalizer-1"} />
        {/* Bar 8 */}
        <rect x="14" y="6" width="1" height="12" className={isMuted ? "" : "animate-equalizer-2"} />
        {/* Bar 9 */}
        <rect x="16" y="8" width="1" height="8" className={isMuted ? "" : "animate-equalizer-3"} />
        {/* Bar 10 */}
        <rect x="18" y="9" width="1" height="6" className={isMuted ? "" : "animate-equalizer-1"} />
        {/* Bar 11 */}
        <rect x="20" y="10" width="1" height="4" className={isMuted ? "" : "animate-equalizer-2"} />
        {/* Bar 12 - smallest */}
        <rect x="22" y="11" width="1" height="2" className={isMuted ? "" : "animate-equalizer-3"} />
      </svg>
    </button>
  );
}

