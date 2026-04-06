import React, { useState, useRef, useEffect } from 'react';
import ParticleBackground from './components/ParticleBackground';
import MusicPlayer from './components/MusicPlayer';
import QuickNav from './components/QuickNav';
import ZoomSlider from './components/ZoomSlider';
import { motion } from 'motion/react';
import { Compass, Rewind, Map, Crosshair, Maximize, Minimize } from 'lucide-react';

const BASE_TIMELINE_URL = "https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=v2%3A2PACX-1vSBFI7hOMRksTKM_VI393NMw66SVlvvkLiAkyfTgQ_l_k5VptvqcSsc08M9Adnqb7apGgnPOJIQXPgl&font=Default&lang=zh-cn&hash_bookmark=true&initial_zoom=2&theme=contrast&width=100%25&height=1020";

export default function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      wrapperRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const goToEvent = (hash: string) => {
    if (iframeRef.current) {
      const newUrl = hash ? `${BASE_TIMELINE_URL}#${hash}` : BASE_TIMELINE_URL;
      iframeRef.current.src = newUrl;
    }
  };

  const placeholderEvents = [
    { id: "event-tl-nerkns", title: "測試事件 (nerkns)" },
    { id: "event-placeholder-1", title: "預留按鈕 1" },
    { id: "event-placeholder-2", title: "預留按鈕 2" },
    { id: "event-placeholder-3", title: "預留按鈕 3" },
    { id: "event-placeholder-4", title: "預留按鈕 4" },
  ];

  return (
    <div className="min-h-screen text-gray-100 font-sans selection:bg-cyan-500/30">
      <ParticleBackground />
      
      <main className="w-full max-w-[1920px] mx-auto px-4 md:px-8 py-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-4 flex flex-col items-center"
        >
          <img 
            src="https://duk.tw/1ndC0B.png" 
            alt="極地科考隊" 
            referrerPolicy="no-referrer"
            className="w-full max-w-3xl h-auto mb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] object-contain scale-x-110"
          />
          <p 
            className="text-gray-200 max-w-2xl mx-auto text-2xl md:text-3xl tracking-[0.25em] font-black"
            style={{ 
              fontFamily: '"Noto Serif TC", serif', 
              textShadow: '0 2px 10px rgba(255,255,255,0.2), 0 4px 6px rgba(0,0,0,0.8)' 
            }}
          >
            我們生而眺望
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-12 relative"
        >
          {/* Decorative elements around timeline */}
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-blue-600 rounded-2xl blur opacity-20"></div>
          <div 
            ref={wrapperRef}
            className={`relative bg-gray-900/60 backdrop-blur-xl shadow-2xl ${
              isFullscreen 
                ? 'w-full h-full p-0 rounded-none border-none' 
                : 'p-2 rounded-2xl border border-gray-700/50 h-[800px] lg:h-[1050px]'
            }`}
          >
            <MusicPlayer isFullscreen={isFullscreen} />
            <QuickNav onNavigate={goToEvent} isFullscreen={isFullscreen} />
            <ZoomSlider zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} isFullscreen={isFullscreen} />
            <button 
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800/80 hover:bg-teal-500/80 text-gray-200 hover:text-white rounded-lg backdrop-blur-md border border-gray-600/50 transition-all shadow-lg"
              title={isFullscreen ? "退出全螢幕" : "全螢幕模式"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <div className={`w-full h-full overflow-hidden relative ${isFullscreen ? 'rounded-none' : 'rounded-xl'}`}>
              <iframe 
                ref={iframeRef}
                src={BASE_TIMELINE_URL}
                style={{
                  width: `${10000 / zoomLevel}%`,
                  height: `${10000 / zoomLevel}%`,
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: 'top left',
                  border: 'none'
                }}
                allowFullScreen
                className="absolute top-0 left-0"
                title="Game Timeline"
              ></iframe>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
