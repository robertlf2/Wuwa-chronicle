import { useState, useEffect } from 'react';
import { Minus, Music } from 'lucide-react';
import { cn } from '../lib/utils';

interface MusicPlayerFloatingProps {
  isOpen?: boolean;
  onToggle?: () => void;
  showTriggerButton?: boolean;
}

export function MusicPlayerFloating({
  isOpen: controlledIsOpen,
  onToggle: controlledOnToggle,
  showTriggerButton = false,
}: MusicPlayerFloatingProps) {
  const [internalHasOpened, setInternalHasOpened] = useState(false);
  const [internalExpanded, setInternalExpanded] = useState(false);

  const isControlled = controlledIsOpen !== undefined;
  const isExpanded = isControlled ? controlledIsOpen : internalExpanded;

  useEffect(() => {
    if (isControlled && controlledIsOpen) {
      setInternalHasOpened(true);
    }
  }, [isControlled, controlledIsOpen]);

  const handleToggle = () => {
    if (isControlled) {
      if (controlledOnToggle) controlledOnToggle();
    } else {
      setInternalHasOpened(true);
      setInternalExpanded(!internalExpanded);
    }
  };

  const handleClose = () => {
    if (isControlled) {
      if (controlledOnToggle && controlledIsOpen) controlledOnToggle();
    } else {
      setInternalExpanded(false);
    }
  };

  return (
    <div className={cn(
      "landscape-music-widget fixed z-[125]",
      showTriggerButton ? "bottom-3 right-3 sm:bottom-6 sm:right-6 flex items-end gap-0" : "bottom-14 right-3 sm:bottom-18 sm:right-6 pointer-events-none"
    )}>
      {/* Optional Trigger Button (Hidden when controlled by QuickActionGearMenu) */}
      {showTriggerButton && (
        <button
          onClick={handleToggle}
          className={cn(
            "w-11 h-11 lg:w-12 lg:h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 border relative z-10 lg:scale-[0.6] lg:origin-bottom-right pointer-events-auto",
            isExpanded 
              ? "bg-cyan-500 text-white border-cyan-400 rotate-12" 
              : "bg-[#1a1a20] text-cyan-400 border-cyan-500/30 hover:bg-[#25252d] hover:border-cyan-400"
          )}
          title={isExpanded ? "收起音樂" : "聽音樂"}
        >
          <Music size={20} className={isExpanded ? "animate-pulse" : ""} />
        </button>
      )}

      {/* Music Player iframe container */}
      {internalHasOpened && (
        <div className={cn(
          "landscape-music-panel absolute bottom-0 right-0 bg-[#1a1a20]/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_35px_rgba(0,0,0,0.8)] w-[min(360px,calc(100vw-24px))] h-[190px] origin-bottom-right transition-all duration-300 z-20 pointer-events-auto",
          isExpanded ? "scale-100 opacity-100" : "scale-0 opacity-0 pointer-events-none"
        )}>
          {/* Top Title & Close Bar */}
          <div className="absolute top-0 right-0 left-0 h-9 bg-gradient-to-b from-black/80 to-transparent z-10 flex justify-between items-center px-3 pointer-events-auto">
            <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-medium tracking-wider">
              <Music size={14} className="animate-pulse" />
              <span>鳴潮精選音樂</span>
            </div>
            <button 
              onClick={handleClose}
              className="bg-black/60 p-1 rounded-full hover:bg-black text-gray-300 hover:text-cyan-400 z-20 transition-colors"
              title="收起音樂面板"
            >
              <Minus size={14} />
            </button>
          </div>

          <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/videoseries?list=PL0ZKduP4GhdILmjjp2rm1OKW81gozycP3&autoplay=1" 
            title="YouTube Music Player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="pt-6"
          >
          </iframe>
        </div>
      )}
    </div>
  );
}
