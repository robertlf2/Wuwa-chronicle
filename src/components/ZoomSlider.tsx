import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { motion } from 'motion/react';

interface ZoomSliderProps {
  zoomLevel: number;
  setZoomLevel: (level: number) => void;
  isFullscreen?: boolean;
}

const ZoomSlider: React.FC<ZoomSliderProps> = ({ zoomLevel, setZoomLevel, isFullscreen = false }) => {
  return (
    <div className={`absolute z-50 flex items-center justify-center transition-all duration-300 ${isFullscreen ? 'bottom-6 left-1/2 -translate-x-1/2' : '-bottom-14 left-1/2 -translate-x-1/2'}`}>
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-2.5 bg-gray-900/90 backdrop-blur-xl border border-gray-700/50 rounded-full shadow-[0_0_15px_rgba(34,211,238,0.15)]"
      >
        <button 
          onClick={() => setZoomLevel(Math.max(50, zoomLevel - 10))} 
          className="text-gray-400 hover:text-cyan-400 transition-colors p-1"
          title="縮小"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        
        <input 
          type="range" 
          min="50" 
          max="200" 
          step="5"
          value={zoomLevel} 
          onChange={(e) => setZoomLevel(Number(e.target.value))}
          className="w-32 md:w-48 h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          title="調整縮放比例"
        />
        
        <button 
          onClick={() => setZoomLevel(Math.min(200, zoomLevel + 10))} 
          className="text-gray-400 hover:text-cyan-400 transition-colors p-1"
          title="放大"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        
        <div className="w-12 text-right text-xs font-medium text-cyan-400 tracking-wider">
          {zoomLevel}%
        </div>
      </motion.div>
    </div>
  );
};

export default ZoomSlider;
