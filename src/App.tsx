/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { useTimelineData } from './useTimelineData';
import { TimelineView } from './components/TimelineView';
import { AdminPanel } from './components/AdminPanel';
import { Starfield } from './components/Starfield';
import { MusicPlayerFloating } from './components/MusicPlayerFloating';
import FontTranslator from './components/FontTranslator';
import { Settings, Search, Tag as TagIcon, X, Maximize, Minimize, ChevronLeft, ChevronRight, Home } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState, useMemo, useRef, useEffect } from 'react';
import { cn } from './lib/utils';
import { TimelineEvent } from './types';

function MultiSelectDropdown({ label, options, selected, onChange }: { label: string, options: string[], selected: string[], onChange: (val: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="relative">
      <div 
        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-300 cursor-pointer flex justify-between items-center hover:border-white/30"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>{label}</span>
        <span className="text-xs text-gray-500">▼</span>
      </div>
      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-[#1a1a20] border border-white/10 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto p-2">
          {options.length === 0 ? (
            <div className="p-2 text-xs text-gray-500 text-center">No tags available</div>
          ) : options.map(opt => (
            <div 
              key={opt}
              onClick={() => { onChange(opt); setIsOpen(false); }}
              className={cn("px-3 py-2 text-sm rounded cursor-pointer transition-colors mb-1", selected.includes(opt) ? "bg-orange-500/20 text-orange-400" : "hover:bg-white/5 text-gray-300")}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TimelineLayout({ data }: { data: any }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChars, setSelectedChars] = useState<string[]>([]);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedStories, setSelectedStories] = useState<string[]>([]);
  const [activeEventId, setActiveEventId] = useState<string | undefined>(() => {
    if (!data.events || data.events.length === 0) return undefined;
    const sorted = [...data.events].sort((a, b) => (a.positionX ?? 0) - (b.positionX ?? 0));
    return sorted[0].id;
  });
  const [hasSearched, setHasSearched] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [titlePageOpen, setTitlePageOpen] = useState(data.titlePageEnabled ?? false);

  useEffect(() => {
    const handleStateChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setTitlePageOpen(!!customEvent.detail);
    };
    window.addEventListener('timeline-title-page-state-changed', handleStateChange);
    return () => window.removeEventListener('timeline-title-page-state-changed', handleStateChange);
  }, []);

  // Slowly blinking WuWa-Jitin background random word indicators state
  const jitinWords = useMemo(() => [
    'Resonators',
    'Echo',
    'Resonance Beacon',
    'The Tethys System',
    'Sentinel',
    'Exostride'
  ], []);

  const [topLeftWord, setTopLeftWord] = useState('Resonators');
  const [bottomRightWord, setBottomRightWord] = useState('Sentinel');

  useEffect(() => {
    // Independent offset intervals to feel high-tech and organic
    const tlInterval = setInterval(() => {
      setTopLeftWord(prev => {
        const remaining = jitinWords.filter(w => w !== prev);
        return remaining[Math.floor(Math.random() * remaining.length)];
      });
    }, 6200);

    const brInterval = setInterval(() => {
      setBottomRightWord(prev => {
        const remaining = jitinWords.filter(w => w !== prev);
        return remaining[Math.floor(Math.random() * remaining.length)];
      });
    }, 8400);

    return () => {
      clearInterval(tlInterval);
      clearInterval(brInterval);
    };
  }, [jitinWords]);

  useEffect(() => {
    if (!activeEventId || !data.events.find((e: TimelineEvent) => e.id === activeEventId)) {
      if (data.events && data.events.length > 0) {
        const sorted = [...data.events].sort((a, b) => (a.positionX ?? 0) - (b.positionX ?? 0));
        setActiveEventId(sorted[0].id);
      }
    }
  }, [data.events, activeEventId]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const sortedEvents = useMemo(() => {
    return [...data.events].sort((a, b) => {
      const aPos = a.positionX ?? 0;
      const bPos = b.positionX ?? 0;
      return aPos - bPos;
    });
  }, [data.events]);
  
  const activeIndex = sortedEvents.findIndex(e => e.id === activeEventId);
  const prevEvent = activeIndex > 0 ? sortedEvents[activeIndex - 1] : null;
  const nextEvent = activeIndex < sortedEvents.length - 1 ? sortedEvents[activeIndex + 1] : null;

  const allChars = useMemo(() => Array.from(new Set(data.events.flatMap((e: any) => e.characterTags || []))).sort() as string[], [data.events]);
  const allRegions = useMemo(() => Array.from(new Set(data.events.flatMap((e: any) => e.regionTags || []))).sort() as string[], [data.events]);
  const allStories = useMemo(() => Array.from(new Set(data.events.flatMap((e: any) => e.mainStoryTags || []))).sort() as string[], [data.events]);

  const toggleVal = (setter: any) => (val: string) => {
    setHasSearched(false);
    setter((prev: string[]) => prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]);
  };

  const searchResults = useMemo(() => {
    let filtered = data.events;
    
    if (selectedChars.length > 0) {
      filtered = filtered.filter((event: TimelineEvent) => event.characterTags && selectedChars.every(tag => event.characterTags!.includes(tag)));
    }
    if (selectedRegions.length > 0) {
      filtered = filtered.filter((event: TimelineEvent) => event.regionTags && selectedRegions.every(tag => event.regionTags!.includes(tag)));
    }
    if (selectedStories.length > 0) {
      filtered = filtered.filter((event: TimelineEvent) => event.mainStoryTags && selectedStories.every(tag => event.mainStoryTags!.includes(tag)));
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((event: TimelineEvent) => 
        event.title.toLowerCase().includes(term) ||
        event.content.toLowerCase().includes(term) ||
        (event.characterTags && event.characterTags.some(tag => tag.toLowerCase().includes(term))) ||
        (event.regionTags && event.regionTags.some(tag => tag.toLowerCase().includes(term))) ||
        (event.mainStoryTags && event.mainStoryTags.some(tag => tag.toLowerCase().includes(term)))
      );
    }
    
    return filtered;
  }, [data, searchTerm, selectedChars, selectedRegions, selectedStories]);

  const handleSearchClick = () => {
    setHasSearched(true);
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col items-center py-10 w-full overflow-y-auto relative z-10">

      {/* Header */}
      <div className="mb-8 text-center relative z-10 px-4 md:px-8">
        <img src="./images/title.png" alt="鳴潮編年史" className="h-48 md:h-72 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] object-contain" />
        <p className="text-white font-bold tracking-[0.5em] text-2xl md:text-3xl uppercase drop-shadow-md" style={{ fontFamily: '"Zen Maru Gothic", "M PLUS Rounded 1c", ui-rounded, "Hiragino Maru Gothic ProN", sans-serif' }}>我們生而眺望</p>
      </div>

      {/* Sci-fi Tablet Container */}
      <div 
        ref={containerRef}
        className={cn(
          "relative flex items-center justify-center transition-all duration-300 z-40",
          isFullscreen ? "w-full h-screen max-w-none rounded-none" : "w-[calc(100%-10px)] max-w-full aspect-[16/9] mx-[5px]"
        )}
      >
        
        {/* Left Sci-fi Border Handle */}
        <div className="w-10 md:w-12 h-[80%] rounded-l-2xl bg-gradient-to-b from-[#b0b8c4] via-[#e5e7eb] to-[#b0b8c4] shadow-[inset_-2px_0_10px_rgba(0,0,0,0.5),inset_2px_0_10px_rgba(255,255,255,0.8)] flex flex-col items-center justify-center relative border-y-2 border-l-2 border-[#fff] z-10 -mr-1 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] flex-shrink-0">
          {/* Home / Title Button removed */}

          {/* Action Button */}
          {titlePageOpen ? null : prevEvent ? (
            <button
              onClick={() => setActiveEventId(prevEvent.id)}
              title={prevEvent.title}
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 w-8 h-16 md:w-10 md:h-20 bg-black/60 hover:bg-cyan-900/80 rounded-full flex items-center justify-center text-cyan-400 hover:text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)] border border-cyan-500/50 hover:border-cyan-400 transition-all cursor-pointer backdrop-blur group"
            >
              <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
            </button>
          ) : (
            data.titlePageEnabled && activeIndex === 0 && (
              <button
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('timeline-show-title-page'));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                title="Return to Title"
                className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 w-8 h-16 md:w-10 md:h-20 bg-black/60 hover:bg-cyan-900/80 rounded-full flex items-center justify-center text-cyan-400 hover:text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)] border border-cyan-500/50 hover:border-cyan-400 transition-all cursor-pointer backdrop-blur group animate-pulse"
              >
                <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>
            )
          )}

          {/* Inner groove */}
          <div className="w-1.5 h-[60%] rounded-full bg-[#1f2937] shadow-[inset_0_0_5px_rgba(0,0,0,1)] flex items-center justify-center absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-0">
             {/* Indicator Light */}
             <div className="w-1 h-12 rounded-full bg-cyan-300 animate-[pulse_3s_ease-in-out_infinite] shadow-[0_0_15px_rgba(34,211,238,1)]"></div>
          </div>
        </div>

        {/* Timeline Screen */}
        <div className="flex-1 h-full bg-[#0f0f12] flex flex-col relative overflow-hidden rounded-xl border-2 border-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.4),inset_0_0_40px_rgba(34,211,238,0.15)] z-20 group">
          
          {/* Top Semitransparent Bezel/Border Indicator line */}
          <div className="h-[36px] bg-black/60 border-b border-cyan-500/30 flex items-center justify-between px-4 sm:px-6 relative z-40 select-none flex-shrink-0 backdrop-blur-md">
            {/* Top-Left Jitin Tech Indicator */}
            <div className="pointer-events-none flex items-center gap-2 text-cyan-400 font-jitin text-[11px] sm:text-xs tracking-[0.25em] font-light opacity-90 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee] flex-shrink-0" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={topLeftWord}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8 }}
                  className="animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"
                >
                  {topLeftWord}
                </motion.span>
              </AnimatePresence>
            </div>
            
            {/* High-tech accent lines */}
            <div className="hidden sm:flex items-center gap-1.5 opacity-40">
              <span className="w-8 h-[1px] bg-cyan-500/50" />
              <span className="w-1 h-1 bg-cyan-400 rounded-full" />
              <span className="w-8 h-[1px] bg-cyan-500/50" />
            </div>
          </div>

          {/* Core Interactive Timeline Area */}
          <div className="flex-1 min-h-0 w-full relative">
            <TimelineView data={data} activeEventId={activeEventId} onEventChange={setActiveEventId} />
            
            <button 
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-[110] p-2 bg-black/40 hover:bg-cyan-500/30 border border-cyan-500/30 hover:border-cyan-400 rounded-lg text-cyan-500 hover:text-cyan-300 backdrop-blur-md transition-all drop-shadow-md"
              title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
              {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
            </button>
          </div>

          {/* Bottom Semitransparent Bezel/Border Indicator line */}
          <div className="h-[36px] bg-black/60 border-t border-cyan-500/30 flex items-center justify-between px-4 sm:px-6 relative z-40 select-none flex-shrink-0 backdrop-blur-md">
            {/* High-tech accent lines */}
            <div className="hidden sm:flex items-center gap-1.5 opacity-40">
              <span className="w-8 h-[1px] bg-cyan-500/50" />
              <span className="w-1 h-1 bg-cyan-400 rounded-full" />
              <span className="w-8 h-[1px] bg-cyan-500/50" />
            </div>

            {/* Bottom-Right Jitin Tech Indicator */}
            <div className="pointer-events-none flex items-center gap-2 text-cyan-400 font-jitin text-[11px] sm:text-xs tracking-[0.25em] font-light opacity-90 select-none ml-auto">
              <AnimatePresence mode="wait">
                <motion.span
                  key={bottomRightWord}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.8 }}
                  className="animate-[pulse_4s_cubic-bezier(0.4,0,0.6,1)_infinite]"
                >
                  {bottomRightWord}
                </motion.span>
              </AnimatePresence>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee] flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Right Sci-fi Border Handle */}
        <div className="w-10 md:w-12 h-[80%] rounded-r-2xl bg-gradient-to-b from-[#b0b8c4] via-[#e5e7eb] to-[#b0b8c4] shadow-[inset_2px_0_10px_rgba(0,0,0,0.5),inset_-2px_0_10px_rgba(255,255,255,0.8)] flex flex-col items-center justify-center relative border-y-2 border-r-2 border-[#fff] z-10 -ml-1 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] flex-shrink-0">
          {/* Action Button */}
          {titlePageOpen ? (
            <button
              onClick={() => {
                window.dispatchEvent(new CustomEvent('timeline-hide-title-page'));
              }}
              title="Enter Content"
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 w-8 h-16 md:w-10 md:h-20 bg-black/60 hover:bg-cyan-900/80 rounded-full flex items-center justify-center text-cyan-400 hover:text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)] border border-cyan-500/50 hover:border-cyan-400 transition-all cursor-pointer backdrop-blur group"
            >
              <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : nextEvent ? (
            <button
              onClick={() => setActiveEventId(nextEvent.id)}
              title={nextEvent.title}
              className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-20 w-8 h-16 md:w-10 md:h-20 bg-black/60 hover:bg-cyan-900/80 rounded-full flex items-center justify-center text-cyan-400 hover:text-cyan-300 shadow-[0_0_10px_rgba(34,211,238,0.5)] border border-cyan-500/50 hover:border-cyan-400 transition-all cursor-pointer backdrop-blur group"
            >
              <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          ) : null}

          {/* Inner groove */}
          <div className="w-1.5 h-[60%] rounded-full bg-[#1f2937] shadow-[inset_0_0_5px_rgba(0,0,0,1)] flex items-center justify-center absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 z-0">
             {/* Indicator Light */}
             <div className="w-1 h-12 rounded-full bg-cyan-300 animate-[pulse_3.5s_ease-in-out_infinite] shadow-[0_0_15px_rgba(34,211,238,1)]"></div>
          </div>
        </div>

        {/* Floating Search Action Button & Panel (Inside containerRef for Fullscreen support) */}
        <div className="fixed bottom-6 left-6 z-[60] flex items-end gap-0">
          <button
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all duration-300 border relative z-10 scale-[0.6] origin-bottom-left",
              isSearchExpanded 
                ? "bg-cyan-500 text-white border-cyan-400 rotate-12" 
                : "bg-[#1a1a20] text-cyan-400 border-cyan-500/30 hover:bg-[#25252d] hover:border-cyan-400"
            )}
            title={isSearchExpanded ? "關閉搜尋" : "開啟搜尋"}
          >
            {isSearchExpanded ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Floating Search Panel */}
          {isSearchExpanded && (
            <div className="absolute bottom-10 left-0 bg-[#1a1a20]/95 backdrop-blur-md border border-cyan-500/30 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(34,211,238,0.2)] w-[320px] sm:w-[450px] md:w-[480px] max-h-[75vh] flex flex-col p-5 origin-bottom-left animate-in fade-in zoom-in-95 z-20">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/15">
                <h3 className="font-serif text-lg flex items-center gap-2 text-cyan-400 font-bold">
                  <Search size={18} />
                  編年史內容檢索
                </h3>
                <button 
                  onClick={() => setIsSearchExpanded(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                  title="Minimize"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto pr-1 space-y-4 max-h-[50vh] custom-scrollbar">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">角色 (Character)</label>
                    <MultiSelectDropdown label="選擇角色" options={allChars} selected={selectedChars} onChange={toggleVal(setSelectedChars)} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">區域 (Region)</label>
                    <MultiSelectDropdown label="選擇區域" options={allRegions} selected={selectedRegions} onChange={toggleVal(setSelectedRegions)} />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-1">主線 (Main Story)</label>
                    <MultiSelectDropdown label="選擇主線" options={allStories} selected={selectedStories} onChange={toggleVal(setSelectedStories)} />
                  </div>
                </div>

                {/* Selected Tags Block */}
                {(selectedChars.length > 0 || selectedRegions.length > 0 || selectedStories.length > 0) && (
                  <div className="bg-black/30 border border-white/10 rounded-xl p-3">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-cyan-500 mb-2 flex items-center gap-2">
                      <TagIcon size={12} />
                      已選擇的標籤
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedChars.map(tag => (
                        <button
                          key={`char-${tag}`}
                          onClick={() => toggleVal(setSelectedChars)(tag)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider transition-all border bg-orange-500/20 border-orange-500/50 text-orange-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 flex items-center gap-1"
                        >
                          {tag} <X size={10} />
                        </button>
                      ))}
                      {selectedRegions.map(tag => (
                        <button
                          key={`reg-${tag}`}
                          onClick={() => toggleVal(setSelectedRegions)(tag)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider transition-all border bg-blue-500/20 border-blue-500/50 text-blue-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 flex items-center gap-1"
                        >
                          {tag} <X size={10} />
                        </button>
                      ))}
                      {selectedStories.map(tag => (
                        <button
                          key={`story-${tag}`}
                          onClick={() => toggleVal(setSelectedStories)(tag)}
                          className="px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wider transition-all border bg-purple-500/20 border-purple-500/50 text-purple-400 hover:bg-red-500/20 hover:border-red-500/50 hover:text-red-400 flex items-center gap-1"
                        >
                          {tag} <X size={10} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input 
                    type="text" 
                    placeholder="請輸入文本" 
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setHasSearched(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSearchClick();
                    }}
                    className="w-full bg-black/40 border border-white/15 rounded-xl pl-10 pr-3 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-gray-600"
                  />
                </div>

                <div className="flex justify-center">
                  <button 
                    onClick={handleSearchClick}
                    className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold uppercase tracking-widest text-xs rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  >
                    開始檢索
                  </button>
                </div>

                {/* Search Results */}
                {hasSearched && (
                  <div className="border border-white/10 rounded-xl bg-black/30 p-3 mt-2">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-2">
                      搜尋結果 ({searchResults.length})
                    </div>
                    <div className="flex flex-col gap-1.5 max-h-40 overflow-y-auto custom-scrollbar">
                      {searchResults.map((ev: TimelineEvent) => (
                        <button
                          key={ev.id}
                          onClick={() => {
                            setActiveEventId(ev.id);
                          }}
                          className={cn(
                            "px-3 py-2 rounded border border-white/5 text-xs transition-colors text-left font-sans truncate",
                            activeEventId === ev.id ? "bg-cyan-500/20 border-cyan-500 text-cyan-300 font-semibold" : "bg-white/5 hover:bg-white/10 text-gray-300"
                          )}
                        >
                          {ev.title || 'Untitled Event'}
                        </button>
                      ))}
                      {searchResults.length === 0 && (
                        <div className="text-xs text-gray-500">No events found matching your filter.</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Floating Music Player (Inside containerRef for Fullscreen support) */}
        <MusicPlayerFloating />
      </div>

      {/* Font Translator Area */}
      <FontTranslator />

      {/* Top Right Action Button Panel */}
      <div className="absolute top-4 right-4 md:top-6 md:right-6 flex items-center gap-3 md:gap-4 z-50">
        {/* Discord Join Button */}
        <motion.a
          href="https://discord.gg/3NG4ZPYc"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative inline-block overflow-hidden rounded-xl shadow-[0_0_15px_rgba(88,101,242,0.15)] hover:shadow-[0_0_25px_rgba(88,101,242,0.45)] border border-[#5865f2]/20 hover:border-[#5865f2]/50 transition-all duration-300 bg-black/40"
          title="加入 Discord 社群"
        >
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#5865f2]" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#5865f2]" />
          
          <img 
            src="./images/JoinDc.png" 
            alt="Join Discord" 
            className="h-12 md:h-16 w-auto object-contain transition-all hover:brightness-110 active:brightness-95"
            referrerPolicy="no-referrer"
          />
        </motion.a>

        {/* Game Download Button */}
        <motion.a
          href="https://wutheringwaves.kurogames.com/zh-tw/main/"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative inline-block overflow-hidden rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.15)] hover:shadow-[0_0_25px_rgba(34,211,238,0.45)] border border-[#22d3ee]/20 hover:border-[#22d3ee]/50 transition-all duration-300 bg-black/40"
          title="前往《鳴潮》官方網站"
        >
          <span className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-400" />
          <span className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-400" />

          <img 
            src="./images/DownloadButton.png" 
            alt="Download Game" 
            className="h-12 md:h-16 w-auto object-contain transition-all hover:brightness-110 active:brightness-95"
            referrerPolicy="no-referrer"
          />
        </motion.a>

        {/* Admin Panel Link */}
        <Link 
          to="/admin" 
          className="p-3 bg-black/60 border border-white/10 hover:border-cyan-500/50 hover:text-cyan-400 text-gray-300 rounded-xl shadow-lg transition-all hover:scale-105 flex items-center justify-center backdrop-blur-md h-12 w-12 md:h-16 md:w-16 transition-all duration-300"
        >
          <Settings className="size-5 md:size-7" />
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  const { data, loading, saveData } = useTimelineData();

  if (loading) {
    return <div className="flex h-screen w-full bg-[#08080a]"></div>;
  }

  const basename = window.location.pathname.startsWith('/Wuwa-chronicle') ? '/Wuwa-chronicle' : '/';

  return (
    <BrowserRouter basename={basename}>
      <div className="relative min-h-screen">
        <Starfield />
        <Routes>
          <Route path="/" element={<TimelineLayout data={data} />} />
          <Route path="/admin" element={<AdminPanel data={data} onSave={saveData} />} />
          <Route path="*" element={<TimelineLayout data={data} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
