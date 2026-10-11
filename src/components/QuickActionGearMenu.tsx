import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Search, 
  Maximize, 
  Minimize, 
  Smartphone, 
  Music,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { cn } from '../lib/utils';

interface QuickActionGearMenuProps {
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isSearchOpen: boolean;
  onToggleSearch: () => void;
  isMusicOpen: boolean;
  onToggleMusic: () => void;
  isInstallable: boolean;
  onOpenAppMode: () => void;
  zoomScale: number;
  onZoomScaleChange: (zoom: number) => void;
}

export function QuickActionGearMenu({
  isFullscreen,
  onToggleFullscreen,
  isSearchOpen,
  onToggleSearch,
  isMusicOpen,
  onToggleMusic,
  isInstallable,
  onOpenAppMode,
  zoomScale,
  onZoomScaleChange,
}: QuickActionGearMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const handleAction = (actionFn: () => void, closeAfter = false) => {
    actionFn();
    if (closeAfter) {
      setIsOpen(false);
    }
  };

  return (
    <div 
      ref={menuRef}
      className="landscape-gear-widget fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-[130] flex flex-col items-end select-none"
    >
      {/* Vertically Expanded Menu Items (Expands upward) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex flex-col-reverse gap-2 items-end mb-2.5"
          >
            {/* 1. 放大縮小拉桿 (Zoom Scale Slider) */}
            <motion.div
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 justify-end"
            >
              <div 
                className="bg-[#121620]/95 border border-cyan-500/40 hover:border-cyan-400/60 shadow-[0_0_15px_rgba(34,211,238,0.25)] rounded-2xl px-2.5 py-1.5 flex items-center gap-1.5 backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => onZoomScaleChange(Math.max(80, zoomScale - 10))}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-300 hover:bg-white/10 active:scale-90 transition-all"
                  title="縮小 (-10%)"
                >
                  <ZoomOut size={13} />
                </button>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-bold text-gray-400 select-none hidden xs:inline">
                    縮小
                  </span>
                  <input
                    type="range"
                    min="80"
                    max="180"
                    step="5"
                    value={zoomScale}
                    onChange={(e) => onZoomScaleChange(Number(e.target.value))}
                    className="w-16 sm:w-22 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
                  />
                  <span className="text-[9px] font-bold text-cyan-400 select-none hidden xs:inline">
                    放大
                  </span>
                  <button
                    type="button"
                    onClick={() => onZoomScaleChange(100)}
                    className="text-[10px] font-mono font-bold text-cyan-300 hover:text-white min-w-[2.2rem] text-center select-none bg-cyan-950/60 px-1 py-0.5 rounded border border-cyan-500/30 hover:border-cyan-400 transition-all"
                    title="點擊還原 100%"
                  >
                    {zoomScale}%
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onZoomScaleChange(Math.min(180, zoomScale + 10))}
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-400 hover:text-cyan-300 hover:bg-white/10 active:scale-90 transition-all"
                  title="放大 (+10%)"
                >
                  <ZoomIn size={13} />
                </button>
              </div>

              <div 
                className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full flex items-center justify-center bg-[#121620]/95 text-cyan-400 border border-cyan-500/40 shadow-[0_0_12px_rgba(34,211,238,0.2)] flex-shrink-0"
                title={`畫面縮放 (${zoomScale}%)`}
              >
                <ZoomIn size={16} />
              </div>
            </motion.div>

            {/* 2. 搜尋 (Search) */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => handleAction(onToggleSearch, true)}
              className="group flex items-center gap-2 justify-end focus:outline-none"
              title={isSearchOpen ? "關閉搜尋" : "搜尋編年史"}
            >
              <span className={cn(
                "px-2.5 py-1 rounded-xl border text-xs font-medium tracking-wider backdrop-blur-md shadow-lg transition-all",
                isSearchOpen 
                  ? "bg-cyan-950/80 border-cyan-400 text-cyan-200" 
                  : "bg-black/85 border-white/10 text-gray-200 group-hover:text-white group-hover:border-cyan-500/40"
              )}>
                搜尋內容
              </span>
              <div className={cn(
                "w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full flex items-center justify-center transition-all duration-300 border shadow-lg flex-shrink-0",
                isSearchOpen
                  ? "bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                  : "bg-[#121620]/95 text-cyan-400 border-cyan-500/40 group-hover:bg-[#1a2130] group-hover:border-cyan-300 group-hover:text-white shadow-[0_0_12px_rgba(34,211,238,0.25)]"
              )}>
                <Search size={16} />
              </div>
            </motion.button>

            {/* 3. 全螢幕 (Fullscreen) */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => handleAction(onToggleFullscreen, false)}
              className="group flex items-center gap-2 justify-end focus:outline-none"
              title={isFullscreen ? "退出全螢幕" : "全螢幕模式"}
            >
              <span className={cn(
                "px-2.5 py-1 rounded-xl border text-xs font-medium tracking-wider backdrop-blur-md shadow-lg transition-all",
                isFullscreen 
                  ? "bg-cyan-950/80 border-cyan-400 text-cyan-200" 
                  : "bg-black/85 border-white/10 text-gray-200 group-hover:text-white group-hover:border-cyan-500/40"
              )}>
                {isFullscreen ? "退出全螢幕" : "全螢幕模式"}
              </span>
              <div className={cn(
                "w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full flex items-center justify-center transition-all duration-300 border shadow-lg flex-shrink-0",
                isFullscreen
                  ? "bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                  : "bg-[#121620]/95 text-cyan-400 border-cyan-500/40 group-hover:bg-[#1a2130] group-hover:border-cyan-300 group-hover:text-white shadow-[0_0_12px_rgba(34,211,238,0.25)]"
              )}>
                {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
              </div>
            </motion.button>

            {/* 4. APP模式 (PWA App Guide / Install) */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => handleAction(onOpenAppMode, true)}
              className="group flex items-center gap-2 justify-end focus:outline-none"
              title={isInstallable ? "安裝至手機桌面 (無網址列 App 模式)" : "手機無網址列 App 模式教學"}
            >
              <span className="px-2.5 py-1 rounded-xl bg-black/85 border border-white/10 text-xs font-medium text-gray-200 tracking-wider backdrop-blur-md shadow-lg group-hover:text-white group-hover:border-cyan-500/40 transition-all flex items-center gap-1.5">
                {isInstallable && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">可安裝</span>
                )}
                {isInstallable ? "安裝 APP" : "APP 模式"}
              </span>
              <div className="w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full flex items-center justify-center bg-[#121620]/95 text-cyan-400 border border-cyan-500/40 group-hover:bg-[#1a2130] group-hover:border-cyan-300 group-hover:text-white shadow-[0_0_12px_rgba(34,211,238,0.25)] transition-all duration-300 relative flex-shrink-0">
                <Smartphone size={16} />
                {isInstallable && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#f59e0b]" />
                )}
              </div>
            </motion.button>

            {/* 5. 音樂 (Music Player) */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => handleAction(onToggleMusic, false)}
              className="group flex items-center gap-2 justify-end focus:outline-none"
              title={isMusicOpen ? "收起背景音樂" : "開啟背景音樂"}
            >
              <span className={cn(
                "px-2.5 py-1 rounded-xl border text-xs font-medium tracking-wider backdrop-blur-md shadow-lg transition-all",
                isMusicOpen 
                  ? "bg-cyan-950/80 border-cyan-400 text-cyan-200" 
                  : "bg-black/85 border-white/10 text-gray-200 group-hover:text-white group-hover:border-cyan-500/40"
              )}>
                {isMusicOpen ? "收起音樂" : "背景音樂"}
              </span>
              <div className={cn(
                "w-8.5 h-8.5 sm:w-9.5 sm:h-9.5 rounded-full flex items-center justify-center transition-all duration-300 border shadow-lg flex-shrink-0",
                isMusicOpen
                  ? "bg-cyan-500 text-black border-cyan-300 shadow-[0_0_15px_rgba(34,211,238,0.6)]"
                  : "bg-[#121620]/95 text-cyan-400 border-cyan-500/40 group-hover:bg-[#1a2130] group-hover:border-cyan-300 group-hover:text-white shadow-[0_0_12px_rgba(34,211,238,0.25)]"
              )}>
                <Music size={16} className={isMusicOpen ? "animate-pulse" : ""} />
              </div>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Gear Floating Trigger Button (點按齒輪按鈕之後垂直向上展開，再次點按縮回) */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 border relative z-20 backdrop-blur-md shadow-md",
          isOpen 
            ? "bg-cyan-500 text-black border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.7)]" 
            : "bg-[#121620]/95 text-cyan-400 border-cyan-500/40 hover:bg-[#1a2130] hover:border-cyan-300 hover:text-white shadow-[0_0_15px_rgba(34,211,238,0.3)]"
        )}
        title={isOpen ? "收起功能選單" : "功能選單 (縮放、搜尋、全螢幕、APP、音樂)"}
        aria-label="功能選單"
        aria-expanded={isOpen}
      >
        <Settings 
          className={cn(
            "size-4 sm:size-4.5 transition-transform duration-300",
            isOpen ? "rotate-90 text-black" : "text-cyan-400"
          )} 
        />
        {/* Subtle decorative tech rings */}
        <span className="absolute -inset-0.5 rounded-full border border-cyan-400/20 pointer-events-none animate-pulse" />
      </motion.button>
    </div>
  );
}
