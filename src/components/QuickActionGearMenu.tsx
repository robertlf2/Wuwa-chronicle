import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings, 
  Search, 
  Maximize, 
  Minimize, 
  Smartphone, 
  Music
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
      className="landscape-gear-widget fixed bottom-3 left-3 sm:bottom-6 sm:left-6 z-[130] flex flex-col items-start select-none"
    >
      {/* Vertically Expanded Menu Items (Expands upward) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.92 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex flex-col-reverse gap-2.5 items-start mb-3"
          >
            {/* 1. 搜尋 (Search) */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => handleAction(onToggleSearch, true)}
              className="group flex items-center gap-2.5 focus:outline-none"
              title={isSearchOpen ? "關閉搜尋" : "搜尋編年史"}
            >
              <div className={cn(
                "w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 border shadow-lg",
                isSearchOpen
                  ? "bg-cyan-500 text-black border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                  : "bg-[#121620]/95 text-cyan-400 border-cyan-500/40 hover:bg-[#1a2130] hover:border-cyan-300 hover:text-white shadow-[0_0_15px_rgba(34,211,238,0.25)]"
              )}>
                <Search size={20} />
              </div>
              <span className={cn(
                "px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium tracking-wider backdrop-blur-md shadow-lg transition-all",
                isSearchOpen 
                  ? "bg-cyan-950/80 border-cyan-400 text-cyan-200" 
                  : "bg-black/85 border-white/10 text-gray-200 group-hover:text-white group-hover:border-cyan-500/40"
              )}>
                搜尋內容
              </span>
            </motion.button>

            {/* 2. 全螢幕 (Fullscreen) */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => handleAction(onToggleFullscreen, false)}
              className="group flex items-center gap-2.5 focus:outline-none"
              title={isFullscreen ? "退出全螢幕" : "全螢幕瀏覽 (隱藏網址列)"}
            >
              <div className={cn(
                "w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 border shadow-lg",
                isFullscreen
                  ? "bg-cyan-500 text-black border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                  : "bg-[#121620]/95 text-cyan-400 border-cyan-500/40 hover:bg-[#1a2130] hover:border-cyan-300 hover:text-white shadow-[0_0_15px_rgba(34,211,238,0.25)]"
              )}>
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </div>
              <span className={cn(
                "px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium tracking-wider backdrop-blur-md shadow-lg transition-all",
                isFullscreen 
                  ? "bg-cyan-950/80 border-cyan-400 text-cyan-200" 
                  : "bg-black/85 border-white/10 text-gray-200 group-hover:text-white group-hover:border-cyan-500/40"
              )}>
                {isFullscreen ? "退出全螢幕" : "全螢幕模式"}
              </span>
            </motion.button>

            {/* 3. APP模式 (PWA App Guide / Install) */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => handleAction(onOpenAppMode, true)}
              className="group flex items-center gap-2.5 focus:outline-none"
              title={isInstallable ? "安裝至手機桌面 (無網址列 App 模式)" : "手機無網址列 App 模式教學"}
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-[#121620]/95 text-cyan-400 border border-cyan-500/40 hover:bg-[#1a2130] hover:border-cyan-300 hover:text-white shadow-[0_0_15px_rgba(34,211,238,0.25)] transition-all duration-300 relative">
                <Smartphone size={20} />
                {isInstallable && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#f59e0b]" />
                )}
              </div>
              <span className="px-3 py-1.5 rounded-xl bg-black/85 border border-white/10 text-xs sm:text-sm font-medium text-gray-200 tracking-wider backdrop-blur-md shadow-lg group-hover:text-white group-hover:border-cyan-500/40 transition-all flex items-center gap-1.5">
                {isInstallable ? "安裝 APP" : "APP 模式"}
                {isInstallable && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">可安裝</span>
                )}
              </span>
            </motion.button>

            {/* 5. 音樂 (Music Player) */}
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={() => handleAction(onToggleMusic, false)}
              className="group flex items-center gap-2.5 focus:outline-none"
              title={isMusicOpen ? "收起背景音樂" : "開啟背景音樂"}
            >
              <div className={cn(
                "w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all duration-300 border shadow-lg",
                isMusicOpen
                  ? "bg-cyan-500 text-black border-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.6)]"
                  : "bg-[#121620]/95 text-cyan-400 border-cyan-500/40 hover:bg-[#1a2130] hover:border-cyan-300 hover:text-white shadow-[0_0_15px_rgba(34,211,238,0.25)]"
              )}>
                <Music size={20} className={isMusicOpen ? "animate-pulse" : ""} />
              </div>
              <span className={cn(
                "px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium tracking-wider backdrop-blur-md shadow-lg transition-all",
                isMusicOpen 
                  ? "bg-cyan-950/80 border-cyan-400 text-cyan-200" 
                  : "bg-black/85 border-white/10 text-gray-200 group-hover:text-white group-hover:border-cyan-500/40"
              )}>
                {isMusicOpen ? "收起音樂" : "背景音樂"}
              </span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Gear Floating Trigger Button (點按齒輪按鈕之後垂直向上展開，再次點按縮回) */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center transition-all duration-300 border relative z-20 backdrop-blur-md",
          isOpen 
            ? "bg-cyan-500 text-black border-cyan-300 shadow-[0_0_25px_rgba(34,211,238,0.7)]" 
            : "bg-[#121620]/95 text-cyan-400 border-cyan-500/40 hover:bg-[#1a2130] hover:border-cyan-300 hover:text-white shadow-[0_0_20px_rgba(34,211,238,0.35)]"
        )}
        title={isOpen ? "收起功能選單" : "功能選單 (全螢幕、搜尋、APP、音樂)"}
        aria-label="功能選單"
        aria-expanded={isOpen}
      >
        <Settings 
          className={cn(
            "size-6 transition-transform duration-300",
            isOpen ? "rotate-90 text-black" : "text-cyan-400"
          )} 
        />
        {/* Subtle decorative tech rings */}
        <span className="absolute -inset-1 rounded-full border border-cyan-400/20 pointer-events-none animate-pulse" />
      </motion.button>
    </div>
  );
}
