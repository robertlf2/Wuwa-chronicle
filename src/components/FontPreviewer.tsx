import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Type, Cpu, Zap, Activity } from 'lucide-react';

export default function FontPreviewer() {
  const [text, setText] = useState('Explore the Unknown');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fontName = 'Solaris3';

  // Detect typing state
  useEffect(() => {
    setIsTyping(true);
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [text]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-6xl mx-auto mt-24 mb-20 p-8 pt-10 bg-[#051120]/80 backdrop-blur-2xl rounded-3xl border border-cyan-800/30 shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden group"
    >
      {/* Heavy Metal Side Panels (Left) */}
      <div className="absolute top-0 left-0 w-4 h-full bg-linear-to-r from-gray-800 via-gray-700 to-gray-900 border-r border-cyan-900/50 z-20 shadow-[4px_0_15px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center gap-12 py-10 h-full opacity-40">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-black border border-gray-600 shadow-inner" />
          ))}
        </div>
      </div>

      {/* Heavy Metal Side Panels (Right) */}
      <div className="absolute top-0 right-0 w-4 h-full bg-linear-to-l from-gray-800 via-gray-700 to-gray-900 border-l border-cyan-900/50 z-20 shadow-[-4px_0_15px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center gap-12 py-10 h-full opacity-40">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-black border border-gray-600 shadow-inner" />
          ))}
        </div>
      </div>

      {/* High-Tech Instrument Animation (Top Right) */}
      <div className="absolute top-6 right-8 pointer-events-none z-30">
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Outer rotating ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border border-dashed border-cyan-500/30 rounded-full"
          />
          {/* Middle spinning ring */}
          <motion.div 
            animate={{ rotate: -360 }}
            transition={{ 
              duration: isTyping ? 1.5 : 4, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="absolute inset-2 border-2 border-cyan-400/20 border-t-cyan-400 rounded-full"
          />
          {/* Inner pulse */}
          <motion.div 
            animate={{ 
              scale: isTyping ? [1, 1.2, 1] : [1, 1.05, 1],
              opacity: isTyping ? [0.5, 1, 0.5] : [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center"
          >
            <Activity className={`w-4 h-4 transition-colors duration-300 ${isTyping ? 'text-cyan-400' : 'text-cyan-900'}`} />
          </motion.div>
          
          {/* Animated labels */}
          <AnimatePresence>
            {isTyping && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="absolute top-0 right-full mr-4 flex flex-col items-end"
              >
                <span className="text-sm font-mono text-cyan-400 uppercase tracking-widest whitespace-nowrap" style={{ fontFamily: fontName }}>Processing_Data</span>
                <span className="text-sm font-mono text-cyan-600 animate-pulse" style={{ fontFamily: fontName }}>BIT_STREAM_74%__</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 blur-[120px] pointer-events-none"></div>

      <div className="flex flex-col gap-8 relative z-10 px-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-cyan-800/20 pb-8 gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-[0.2em] drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] italic">
                鳴潮字體轉譯器
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-1.5 h-1.5 rounded-full ${isTyping ? 'bg-cyan-400 shadow-[0_0_8px_cyan]' : 'bg-cyan-900'} transition-all`} />
                <p className="text-sm text-cyan-600 font-mono tracking-widest uppercase" style={{ fontFamily: fontName }}>SYSTEM_LINK_ACTIVE // V.03_SOLARIS</p>
                <span className="text-[10px] text-cyan-800 font-mono ml-4" style={{ fontFamily: fontName }}>ALPHA_RENDERER_v1.1</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 min-h-[400px]">
          {/* Left Panel: Input area */}
          <div className="flex flex-col gap-4 relative group/input">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Cpu className={`w-3 h-3 ${isTyping ? 'text-amber-400' : 'text-cyan-800'} transition-colors`} />
                <span className="text-base font-mono text-cyan-500 uppercase tracking-[0.25em] font-bold">輸入文字 (需英文)</span>
              </div>
              <span className="text-xs font-mono text-cyan-900 uppercase tracking-[0.1em] bg-cyan-950/30 px-2 py-0.5 rounded-md border border-cyan-900/20" style={{ fontFamily: fontName }}>{text.length} BUFFER_SIZE</span>
            </div>
            <div className="relative flex-1">
              <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full h-full bg-[#030812]/90 border border-cyan-900/40 rounded-2xl p-8 text-gray-100 focus:outline-none focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all resize-none text-[1.2rem] leading-relaxed font-sans placeholder:text-gray-800 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5)] border-t-cyan-500/20"
                placeholder="EN_INPUT_HERE..."
              />
              <div className="absolute top-4 right-4 pointer-events-none opacity-20">
                <motion.div animate={{ opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 2, repeat: Infinity }}>
                  <Zap className="w-5 h-5 text-cyan-500" />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Right Panel: Preview area */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span className="text-base font-mono text-cyan-500 uppercase tracking-[0.25em] font-bold">轉譯鳴潮文字</span>
              </div>
              <span className="text-xs font-mono text-gray-600 uppercase tracking-[0.1em]" style={{ fontFamily: fontName }}>RENDER_MODE: SOLARIS_NATIVE</span>
            </div>
            <div className="flex-1 w-full bg-radial-gradient from-[#0a1b2d] to-[#030812] border-2 border-cyan-900/30 rounded-2xl p-8 flex items-center justify-center overflow-hidden relative group/preview shadow-[0_10px_30px_rgba(0,0,0,0.4)]">
              {/* Scanline effect */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(34,211,238,0.015)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>
              
              <div 
                className={`w-full text-center break-words transition-all duration-300 ${isTyping ? 'blur-[0.5px] scale-[1.01]' : ''}`}
                style={{ 
                  fontFamily: `'${fontName}'`,
                  fontSize: 'clamp(1rem, 4vw, 2.5rem)',
                  lineHeight: 1,
                  color: '#ffffff',
                  textShadow: isTyping 
                    ? '0 0 20px rgba(34,211,238,0.6), 0 0 40px rgba(34,211,238,0.2)' 
                    : '0 0 40px rgba(34,211,238,0.3)',
                  letterSpacing: '0.05em'
                }}
              >
                {text || <span className="opacity-10 italic" style={{ fontFamily: fontName }}>AWAITING_INPUT</span>}
              </div>
              
              {/* Corners decorations */}
              <div className="absolute top-4 left-4 w-4 h-4 border-l-2 border-t-2 border-cyan-500/30"></div>
              <div className="absolute top-4 right-4 w-4 h-4 border-r-2 border-t-2 border-cyan-500/30"></div>
              <div className="absolute bottom-4 left-4 w-4 h-4 border-l-2 border-b-2 border-cyan-500/30"></div>
              <div className="absolute bottom-4 right-4 w-4 h-4 border-r-2 border-b-2 border-cyan-500/30"></div>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-cyan-900 font-mono uppercase tracking-[0.3em] pt-8 border-t border-cyan-900/10">
          <div className="flex items-center gap-8">
            <span className="bg-cyan-950/20 px-2 py-1 rounded" style={{ fontFamily: fontName }}>CORE_V1.1_REACT</span>
            <span className={`transition-all duration-500 ${isTyping ? 'text-cyan-400 font-bold' : 'text-cyan-900'}`} style={{ fontFamily: fontName }}>
              {isTyping ? '>> SCANNING_ACTIVE [CAUTION]' : '>> STABLE_CONNECTION'}
            </span>
          </div>
          <div className="flex items-center gap-6">
            <span style={{ fontFamily: fontName }}>MEM: SOLARIS_LOADED</span>
            <div className="flex gap-0.5">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`w-1 h-3 ${i < 8 ? (isTyping ? 'bg-cyan-400' : 'bg-cyan-900') : 'bg-gray-900'} transition-all`} />
              ))}
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

