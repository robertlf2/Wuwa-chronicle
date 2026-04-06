import React, { useState } from 'react';
import { Music, X, Minimize2, Maximize2, ListMusic } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MusicPlayerProps {
  isFullscreen?: boolean;
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ isFullscreen = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Extract the playlist ID from the provided URL
  const playlistId = "PLPFear2mwSnw2l2lKZXf6xsJygw1WgCHH";
  const embedUrl = `https://www.youtube.com/embed/videoseries?list=${playlistId}&theme=dark&rel=0`;

  return (
    <div className={`absolute z-50 flex flex-col items-end transition-all duration-300 ${isFullscreen ? 'bottom-6 right-6' : '-bottom-14 right-0'}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300"
            style={{ width: isMinimized ? '260px' : '360px', height: isMinimized ? '120px' : '260px' }}
          >
            <div className="flex items-center justify-between px-3 py-2 bg-gray-800/90 border-b border-gray-700/50">
              <div className="flex items-center gap-2 text-gray-200">
                <Music className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-xs font-medium tracking-wider">背景音樂</span>
                {!isMinimized && (
                  <span className="text-[10px] text-gray-400 ml-1 flex items-center gap-1 bg-gray-800 px-1.5 py-0.5 rounded">
                    <ListMusic className="w-3 h-3" /> 點擊影片右上角「1/X」圖示換曲
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)} 
                  className="text-gray-400 hover:text-teal-400 transition-colors p-1"
                  title={isMinimized ? "展開" : "收起"}
                >
                  {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="text-gray-400 hover:text-red-400 transition-colors p-1"
                  title="關閉"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 w-full bg-black relative">
              <iframe
                width="100%"
                height="100%"
                src={embedUrl}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0"
              ></iframe>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="p-3 bg-gray-800/90 hover:bg-teal-600/90 text-teal-400 hover:text-white rounded-full backdrop-blur-md border border-gray-600/50 shadow-[0_0_15px_rgba(45,212,191,0.3)] transition-all flex items-center justify-center group"
          title="開啟音樂播放器"
        >
          <Music className="w-5 h-5 group-hover:animate-pulse" />
        </motion.button>
      )}
    </div>
  );
};

export default MusicPlayer;
