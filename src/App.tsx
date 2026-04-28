import React, { useState, useRef, useEffect } from 'react';
import ParticleBackground from './components/ParticleBackground';
import MusicPlayer from './components/MusicPlayer';
import QuickNav from './components/QuickNav';
import ZoomSlider from './components/ZoomSlider';
import { motion, AnimatePresence } from 'motion/react';
import { Compass, Rewind, Map, Crosshair, Maximize, Minimize, Smartphone, Search, X } from 'lucide-react';

const customCss = `
.tl-timenav { background-color: #082f49 !important; }
.tl-timeaxis { background-color: rgba(12, 74, 110, 0.8) !important; }
.tl-timeaxis-tick-text { color: #7dd3fc !important; }
.tl-timenav-item h2, .tl-timenav-item h3 { color: #bae6fd !important; }
.tl-timenav-line { background-color: #0ea5e9 !important; }
.tl-timenav-item.tl-active h2, .tl-timenav-item.tl-active h3 { color: #ffffff !important; }
.tl-timenav-item.tl-active .tl-timenav-item-marker { background-color: #38bdf8 !important; }
.metal-brushed {
  background-image: linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px);
  background-size: 4px 100%;
}
`;
const cssDataUri = `data:text/css;charset=utf-8,${encodeURIComponent(customCss)}`;
const BASE_TIMELINE_URL = `https://cdn.knightlab.com/libs/timeline3/latest/embed/index.html?source=v2%3A2PACX-1vSBFI7hOMRksTKM_VI393NMw66SVlvvkLiAkyfTgQ_l_k5VptvqcSsc08M9Adnqb7apGgnPOJIQXPgl&font=Default&lang=zh-cn&hash_bookmark=true&initial_zoom=2&theme=contrast&width=100%25&height=1020&css=${encodeURIComponent(cssDataUri)}`;

export default function App() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isMagnifierActive, setIsMagnifierActive] = useState(false);
  const [magnifierPos, setMagnifierPos] = useState({ x: 50, y: 50, show: false });
  const [isImageOverlayOpen, setIsImageOverlayOpen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
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
    <div className="min-h-screen text-gray-100 font-sans selection:bg-cyan-500/30 select-none">
      <ParticleBackground />
      
      <main className="w-[98%] mx-auto py-12 relative z-10 overflow-x-hidden">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-4 flex flex-col items-center px-4 md:px-8"
        >
          <img 
            src="/assets/images/title.png" 
            alt="極地科考隊" 
            referrerPolicy="no-referrer"
            draggable="false"
            onContextMenu={(e) => e.preventDefault()}
            className="w-full max-w-3xl h-auto mb-2 drop-shadow-[0_0_30px_rgba(255,255,255,0.15)] object-contain scale-x-110 pointer-events-none select-none"
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
          className={`mb-12 relative flex justify-center ${isFullscreen ? '' : 'px-[40px] md:px-[80px]'}`}
        >
          {/* Hardware Handles placed outside the content */}
          {!isFullscreen && (
            <>
                <div className="absolute top-1/2 -translate-y-1/2 left-2 md:left-4 w-[28px] md:w-[64px] h-[60%] md:h-[80%] bg-gradient-to-r from-gray-500 via-gray-200 to-gray-600 rounded-l-2xl md:rounded-l-3xl border-l-[3px] md:border-l-[5px] border-white/90 shadow-[-12px_0_35px_rgba(0,0,0,0.8),inset_5px_0_12px_rgba(255,255,255,1)] z-20 flex flex-col items-center justify-center gap-6 md:gap-10 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 metal-brushed opacity-30 pointer-events-none"></div>
                  <div className="relative w-2 md:w-4 h-[35%] bg-gray-600/50 rounded-full shadow-[inset_2px_2px_8px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,255,255,0.7)] border border-white/20"></div>
                  <div className="relative w-3 md:w-5 h-6 md:h-8 bg-cyan-500 rounded-full shadow-[0_0_20px_#06b6d4,inset_0_2px_6px_rgba(255,255,255,0.9)] border-2 border-cyan-300 animate-pulse"></div>
                  <div className="relative w-2 md:w-4 h-[35%] bg-gray-600/50 rounded-full shadow-[inset_2px_2px_8px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,255,255,0.7)] border border-white/20"></div>
                </div>
                
                <div className="absolute top-1/2 -translate-y-1/2 right-2 md:right-4 w-[28px] md:w-[64px] h-[60%] md:h-[80%] bg-gradient-to-l from-gray-500 via-gray-200 to-gray-600 rounded-r-2xl md:rounded-r-3xl border-r-[3px] md:border-r-[5px] border-white/90 shadow-[12px_0_35px_rgba(0,0,0,0.8),inset_-5px_0_12px_rgba(255,255,255,1)] z-20 flex flex-col items-center justify-center gap-6 md:gap-10 transition-all duration-300 overflow-hidden">
                  <div className="absolute inset-0 metal-brushed opacity-30 pointer-events-none"></div>
                  <div className="relative w-2 md:w-4 h-[35%] bg-gray-600/50 rounded-full shadow-[inset_-2px_2px_8px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,255,255,0.7)] border border-white/20"></div>
                  <div className="relative w-3 md:w-5 h-6 md:h-8 bg-cyan-500 rounded-full shadow-[0_0_20px_#06b6d4,inset_0_2px_6px_rgba(255,255,255,0.9)] border-2 border-cyan-300 animate-pulse"></div>
                  <div className="relative w-2 md:w-4 h-[35%] bg-gray-600/50 rounded-full shadow-[inset_-2px_2px_8px_rgba(0,0,0,0.8),0_1px_2px_rgba(255,255,255,0.7)] border border-white/20"></div>
                </div>
            </>
          )}

          {/* Decorative elements around timeline */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-2xl blur-lg opacity-50 pointer-events-none"></div>
          
          <div 
            ref={wrapperRef}
            className={`relative bg-[#051120]/90 backdrop-blur-xl w-full ${
              isFullscreen 
                ? 'h-full p-0 rounded-none border-none' 
                : 'p-1.5 rounded-2xl border border-cyan-800/80 h-[800px] lg:h-[1050px] shadow-[0_0_40px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
            }`}
          >
            {/* Holographic Projection overlay inside wrapperRef */}
            {!isFullscreen && (
              <>
                <div className="absolute inset-0 border-2 md:border-[3px] border-cyan-400/50 rounded-2xl pointer-events-none z-[6] shadow-[inset_0_0_30px_rgba(34,211,238,0.2)] mix-blend-screen"></div>
                
                {/* HUD Corners */}
                <div className="absolute top-0 left-0 w-8 md:w-16 h-8 md:h-16 border-t-2 md:border-t-4 border-l-2 md:border-l-4 border-cyan-300 pointer-events-none z-[6] rounded-tl-2xl shadow-[0_0_15px_rgba(34,211,238,0.6),inset_0_0_15px_rgba(34,211,238,0.4)]"></div>
                <div className="absolute top-0 right-0 w-8 md:w-16 h-8 md:h-16 border-t-2 md:border-t-4 border-r-2 md:border-r-4 border-cyan-300 pointer-events-none z-[6] rounded-tr-2xl shadow-[0_0_15px_rgba(34,211,238,0.6),inset_0_0_15px_rgba(34,211,238,0.4)]"></div>
                <div className="absolute bottom-0 left-0 w-8 md:w-16 h-8 md:h-16 border-b-2 md:border-b-4 border-l-2 md:border-l-4 border-cyan-300 pointer-events-none z-[6] rounded-bl-2xl shadow-[0_0_15px_rgba(34,211,238,0.6),inset_0_0_15px_rgba(34,211,238,0.4)]"></div>
                <div className="absolute bottom-0 right-0 w-8 md:w-16 h-8 md:h-16 border-b-2 md:border-b-4 border-r-2 md:border-r-4 border-cyan-300 pointer-events-none z-[6] rounded-br-2xl shadow-[0_0_15px_rgba(34,211,238,0.6),inset_0_0_15px_rgba(34,211,238,0.4)]"></div>
                
                {/* Holographic Datapoints */}
                <div className="absolute top-4 left-8 text-[10px] text-cyan-300/90 font-mono tracking-widest pointer-events-none z-[6] hidden md:block drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">CRITICAL ALERT // PROTOCOL.ENGAGED</div>
                <div className="absolute bottom-4 right-8 text-[10px] text-cyan-300/90 font-mono tracking-widest pointer-events-none z-[6] hidden md:block drop-shadow-[0_0_5px_rgba(34,211,238,0.8)]">SYSTEM // NOMINAL</div>
                <div className="absolute -left-[1px] top-1/4 w-[3px] h-32 bg-cyan-400/90 shadow-[0_0_12px_rgba(34,211,238,0.9)] z-[6] pointer-events-none"></div>
                <div className="absolute -right-[1px] bottom-1/4 w-[3px] h-32 bg-cyan-400/90 shadow-[0_0_12px_rgba(34,211,238,0.9)] z-[6] pointer-events-none"></div>
                
                {/* Overlay Scanning Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none z-[6] rounded-2xl"></div>
              </>
            )}
            <MusicPlayer isFullscreen={isFullscreen} />
            <QuickNav onNavigate={goToEvent} isFullscreen={isFullscreen} />
            <ZoomSlider zoomLevel={zoomLevel} setZoomLevel={setZoomLevel} isFullscreen={isFullscreen} />
            <button 
              onClick={() => setIsMagnifierActive(!isMagnifierActive)}
              className={`absolute top-4 right-28 z-10 p-2 rounded-lg backdrop-blur-md border transition-all shadow-lg ${isMagnifierActive ? 'bg-cyan-600/90 border-cyan-400 text-white shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-gray-800/80 hover:bg-cyan-500/80 text-gray-200 hover:text-white border-gray-600/50'}`}
              title="圖片放大鏡模式"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              className="absolute top-4 right-16 z-10 p-2 bg-gray-800/80 hover:bg-purple-500/80 text-gray-200 hover:text-white rounded-lg backdrop-blur-md border border-gray-600/50 transition-all shadow-lg"
              title="手機版視圖"
            >
              <Smartphone className="w-5 h-5" />
            </button>
            <button 
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 z-10 p-2 bg-gray-800/80 hover:bg-teal-500/80 text-gray-200 hover:text-white rounded-lg backdrop-blur-md border border-gray-600/50 transition-all shadow-lg"
              title={isFullscreen ? "退出全螢幕" : "全螢幕模式"}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
            <div className={`w-full h-full overflow-hidden relative ${isFullscreen ? 'rounded-none' : 'rounded-xl'}`}>
              <motion.div
                className="w-full h-full origin-top-left"
                animate={{
                  scale: isMagnifierActive && magnifierPos.show ? 2.5 : 1,
                  transformOrigin: `${magnifierPos.x}% ${magnifierPos.y}%`
                }}
                transition={{
                  scale: { duration: 0.3, ease: 'easeOut' },
                  transformOrigin: { duration: 0.05, ease: 'linear' }
                }}
              >
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
              </motion.div>
              
              {/* 防護圖層：僅覆蓋右側圖片區域，避開左右導覽箭頭與左側文字區 */}
              <div 
                className={`absolute top-0 z-[5] ${isMagnifierActive ? 'cursor-zoom-in' : 'cursor-default'}`}
                style={{ left: '50%', right: '8%', height: '75%' }}
                onContextMenu={(e) => e.preventDefault()}
                onMouseEnter={() => {
                  if (isMagnifierActive) setMagnifierPos(p => ({ ...p, show: true }));
                }}
                onMouseLeave={() => {
                  setMagnifierPos(p => ({ ...p, show: false }));
                }}
                onMouseMove={(e) => {
                  if (!isMagnifierActive) return;
                  const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                  if (rect) {
                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                    const y = ((e.clientY - rect.top) / rect.height) * 100;
                    setMagnifierPos({ x, y, show: true });
                  }
                }}
              ></div>
            </div>
          </div>
        </motion.div>

        <motion.div 
          className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 mt-20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <motion.a 
            href="https://discord.gg/C3bDvM9HUQ"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, filter: 'brightness(1.15)' }}
            whileTap={{ scale: 0.95 }}
            className="relative group cursor-pointer block"
          >
            <img 
              src="/Wuwa-chronicle/assets/images/JoinDc.png" 
              alt="Join Discord" 
              className="w-full max-w-[320px] md:max-w-[420px] h-auto drop-shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:drop-shadow-[0_0_25px_rgba(59,130,246,0.8)] transition-all duration-300 pointer-events-none"
              referrerPolicy="no-referrer"
              draggable="false"
            />
          </motion.a>

          <motion.a 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setIsImageOverlayOpen(true);
            }}
            whileHover={{ scale: 1.05, filter: 'brightness(1.15)' }}
            whileTap={{ scale: 0.95 }}
            className="relative group cursor-pointer block"
          >
            <img 
              src="/Wuwa-chronicle/assets/images/InfoButton.png" 
              alt="Info Button" 
              className="w-full max-w-[320px] md:max-w-[420px] h-auto drop-shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:drop-shadow-[0_0_25px_rgba(59,130,246,0.8)] transition-all duration-300 pointer-events-none"
              referrerPolicy="no-referrer"
              draggable="false"
            />
          </motion.a>

          <motion.a 
            href="https://wutheringwaves.kurogames-ads.com/download/?lang=zh-tw&page_id=EMC0E72eMV&&utm_source=pc_googleadwords_int&utm_campaign=search&campaignid=23372120541&adgroupid=191271495598&keyword=%E9%B3%B4%E6%BD%AE&device=c&ad_id=788847232761&channel=g&gad_source=1&gad_campaignid=23372120541&gbraid=0AAAAABbLAwh7U5Fzc7_mLYRhB1hLeTCte&gclid=Cj0KCQjwkrzPBhCqARIsAJN460k9J2QGqOWx8LrZplIOgCBpLqtnY1dHNR1m1o_pIRn--lw9d6LUsooaAqQfEALw_wcB"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05, filter: 'brightness(1.15)' }}
            whileTap={{ scale: 0.95 }}
            className="relative group cursor-pointer block"
          >
            <img 
              src="/Wuwa-chronicle/assets/images/DownloadButton.png" 
              alt="Download Button" 
              className="w-full max-w-[320px] md:max-w-[420px] h-auto drop-shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:drop-shadow-[0_0_25px_rgba(59,130,246,0.8)] transition-all duration-300 pointer-events-none"
              referrerPolicy="no-referrer"
              draggable="false"
            />
          </motion.a>
        </motion.div>
      </main>

      {/* Image Overlay Modal */}
      <AnimatePresence>
        {isImageOverlayOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center py-8 md:py-12"
            onClick={() => setIsImageOverlayOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-[1920px] px-[14px] md:px-[52px] h-[800px] lg:h-[1050px] flex justify-center mx-auto my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                onClick={() => setIsImageOverlayOpen(false)}
                className="absolute -top-4 right-6 md:-top-6 md:right-16 lg:right-20 p-2 text-white/70 hover:text-white bg-black/50 hover:bg-black/80 rounded-full transition-all border border-cyan-500/20 hover:border-cyan-500/50 z-50 shadow-lg"
              >
                <X className="w-8 h-8 md:w-10 md:h-10" />
              </button>
              <div className="w-full h-full relative cursor-auto">
                <img 
                  src="https://live.staticflickr.com/65535/55234482161_4c69a6032f_b.jpg"
                  alt="Enlarged Info"
                  className="w-full h-full object-contain bg-[#051120] rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30 p-1.5"
                  referrerPolicy="no-referrer"
                  draggable="false"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
