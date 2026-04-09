import React, { useState } from 'react';
import { Compass, X, Crosshair, Rewind } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuickNavProps {
  onNavigate: (hash: string) => void;
  isFullscreen?: boolean;
}

const navItems = [
  { id: '', title: '起點' },
  { id: '1.0主線', title: '1.0主線' },
  { id: '1.1主線', title: '1.1主線' },
  { id: '1.2主線', title: '1.2主線' },
  { id: '1.3主線', title: '1.3主線' },
  { id: '1.4主線', title: '1.4主線' },
  { id: '2.0主線', title: '2.0主線' },
  { id: '2.1主線', title: '2.1主線' },
  { id: '2.2主線', title: '2.2主線' },
  { id: '2.3主線', title: '2.3主線' },
  { id: '2.4主線', title: '2.4主線' },
  { id: '2.5主線', title: '2.5主線' },
  { id: '2.6主線', title: '2.6主線' },
  { id: '2.7主線', title: '2.7主線' },
  { id: '3.0主線', title: '3.0主線' },
  { id: '3.1主線', title: '3.1主線' },
];

const QuickNav: React.FC<QuickNavProps> = ({ onNavigate, isFullscreen = false }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`absolute z-50 flex flex-col items-start transition-all duration-300 ${isFullscreen ? 'bottom-6 left-6' : '-bottom-14 left-0'}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9, transformOrigin: 'bottom left' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="mb-4 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden flex flex-col"
            style={{ width: '340px' }}
          >
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800/90 border-b border-gray-700/50">
              <div className="flex items-center gap-2 text-gray-200">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium tracking-wider">快速導覽索引</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-gray-400 hover:text-red-400 transition-colors p-1"
                title="關閉"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-3 grid grid-cols-4 gap-2 max-h-[60vh] overflow-y-auto">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    onNavigate(item.id);
                  }}
                  className="flex flex-col items-center justify-center py-2 px-1 bg-gray-800/60 hover:bg-cyan-600/30 border border-gray-700/50 hover:border-cyan-500/50 rounded-lg transition-all group"
                  title={item.title}
                >
                  {index === 0 ? (
                    <Rewind className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 mb-1" />
                  ) : (
                    <Crosshair className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 mb-1" />
                  )}
                  <span className="text-[11px] font-medium text-gray-300 group-hover:text-white text-center whitespace-nowrap">
                    {item.title}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isOpen && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="p-3 bg-gray-800/90 hover:bg-cyan-600/90 text-cyan-400 hover:text-white rounded-full backdrop-blur-md border border-gray-600/50 shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all flex items-center justify-center group"
          title="開啟快速導覽"
        >
          <Compass className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
        </motion.button>
      )}
    </div>
  );
};

export default QuickNav;
