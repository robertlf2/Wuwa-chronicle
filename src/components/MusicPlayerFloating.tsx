import { useState } from 'react';
import { Minus, Music } from 'lucide-react';
import { cn } from '../lib/utils';

export function MusicPlayerFloating() {
  const [hasOpenedMusic, setHasOpenedMusic] = useState(false);
  const [isMusicExpanded, setIsMusicExpanded] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-end gap-0">
      {/* Toggle Button */}
      <button
        onClick={() => {
          setHasOpenedMusic(true);
          setIsMusicExpanded(!isMusicExpanded);
        }}
        className={cn(
          "w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 border relative z-10 scale-[0.6] origin-bottom-right",
          isMusicExpanded 
            ? "bg-cyan-500 text-white border-cyan-400 rotate-12" 
            : "bg-[#1a1a20] text-cyan-400 border-cyan-500/30 hover:bg-[#25252d] hover:border-cyan-400"
        )}
        title={isMusicExpanded ? "Minimize Player" : "Expand Music Player"}
      >
        <Music size={20} className={isMusicExpanded ? "animate-pulse" : ""} />
      </button>

      {/* Music Player iframe container */}
      {hasOpenedMusic && (
        <div className={cn(
          "absolute bottom-10 right-0 bg-[#1a1a20] border border-white/10 rounded-2xl overflow-hidden shadow-2xl w-[320px] h-[180px] origin-bottom-right transition-all duration-300 z-20",
          isMusicExpanded ? "scale-100 opacity-100 pointer-events-auto" : "scale-0 opacity-0 pointer-events-none"
        )}>
          <div className="absolute top-0 right-0 w-full h-8 bg-gradient-to-b from-black/60 to-transparent z-10 pointer-events-none flex justify-end p-2 cursor-move"></div>
          <button 
            onClick={() => setIsMusicExpanded(false)}
            className="absolute top-2 right-2 bg-black/50 p-1.5 rounded-full hover:bg-black text-white hover:text-cyan-400 z-20 transition-colors"
            title="Minimize"
          >
            <Minus size={16} />
          </button>
          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/videoseries?list=PL0ZKduP4GhdILmjjp2rm1OKW81gozycP3&autoplay=1" 
            title="YouTube Music Player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen>
          </iframe>
        </div>
      )}
    </div>
  );
}
