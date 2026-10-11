import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Smartphone, Share2, Download, CheckCircle2, Sparkles, Monitor } from 'lucide-react';

interface PwaGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  isInstallable: boolean;
  onInstall: () => void;
  isStandalone: boolean;
}

export function PwaGuideModal({
  isOpen,
  onClose,
  deferredPrompt,
  isInstallable,
  onInstall,
  isStandalone,
}: PwaGuideModalProps) {
  const isIOS = typeof navigator !== 'undefined' && /iPhone|iPad|iPod/.test(navigator.userAgent);
  const [activeTab, setActiveTab] = useState<'ios' | 'android'>(isIOS ? 'ios' : 'android');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-[#0c1017] border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden text-gray-200"
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-black/40 to-cyan-950/40">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                <Smartphone className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm sm:text-base tracking-wide flex items-center gap-2">
                  手機無網址列 App 模式指南
                  {isStandalone && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      已處於獨立 App 模式
                    </span>
                  )}
                </h3>
                <p className="text-[11px] text-cyan-400/80 font-mono">
                  IMMERSIVE FULLSCREEN APPLICATION
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="關閉"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                <div className="text-cyan-400 font-bold mb-0.5">0 網址列</div>
                <div className="text-[11px] text-gray-400">最大化顯示比例</div>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                <div className="text-cyan-400 font-bold mb-0.5">免應用商店</div>
                <div className="text-[11px] text-gray-400">一鍵加入桌面</div>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20">
                <div className="text-cyan-400 font-bold mb-0.5">極速載入</div>
                <div className="text-[11px] text-gray-400">靜態離線快取</div>
              </div>
            </div>

            {/* Quick Install Button for Chrome/Android if available */}
            {isInstallable && deferredPrompt && (
              <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-400/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Sparkles className="size-3.5 text-amber-400" />
                    偵測到您的瀏覽器支援直接安裝
                  </div>
                  <div className="text-[11px] text-gray-300">
                    點擊按鈕即可立即將「鳴潮編年史」安裝至手機桌面
                  </div>
                </div>
                <button
                  onClick={() => {
                    onInstall();
                    onClose();
                  }}
                  className="px-3.5 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-semibold text-xs transition-colors flex items-center gap-1.5 shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                >
                  <Download className="size-4" />
                  立即安裝
                </button>
              </div>
            )}

            {/* Tab Switcher */}
            <div className="flex border-b border-white/10">
              <button
                onClick={() => setActiveTab('android')}
                className={`flex-1 py-2 text-xs font-semibold tracking-wider transition-colors border-b-2 ${
                  activeTab === 'android'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                Android / Chrome
              </button>
              <button
                onClick={() => setActiveTab('ios')}
                className={`flex-1 py-2 text-xs font-semibold tracking-wider transition-colors border-b-2 ${
                  activeTab === 'ios'
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-500/5'
                    : 'border-transparent text-gray-400 hover:text-gray-200'
                }`}
              >
                iPhone / iPad (Safari)
              </button>
            </div>

            {/* Instructions */}
            {activeTab === 'android' ? (
              <div className="space-y-3 text-xs">
                <div className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">點擊右上角「全螢幕」按鈕</div>
                    <div className="text-gray-400 text-[11px]">
                      在大部分 Android 瀏覽器中，全螢幕模式會自動收起並隱藏網址列與導航列。
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">或點選 Chrome 右上角選單（⋮）</div>
                    <div className="text-gray-400 text-[11px]">
                      在選單中點擊「<span className="text-cyan-300 font-medium">安裝應用程式</span>」或「<span className="text-cyan-300 font-medium">加到主畫面</span>」。
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">由手機桌面點開</div>
                    <div className="text-gray-400 text-[11px]">
                      往後即可直接點選手機桌面圖示，享受如同原生手遊 App 般完全無網址列的沈浸體驗！
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-[11px] leading-relaxed">
                  ⚠️ <strong>iOS Safari 特殊規範</strong>：Apple 瀏覽器不允許一般網頁直接以程式隱藏頂部網址列。唯一達到 100% 無網址列 App 效果的方法是透過「加入主畫面」。
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0">
                    1
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white flex items-center gap-1.5">
                      點擊 Safari 下方或頂部的「分享」按鈕
                      <Share2 className="size-3.5 text-cyan-400 inline" />
                    </div>
                    <div className="text-gray-400 text-[11px]">
                      在 Safari 瀏覽器工具列點擊向上箭頭的方塊圖示。
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0">
                    2
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">向下滑動選擇「加入主畫面」</div>
                    <div className="text-gray-400 text-[11px]">
                      在分享清單中找到並點選「<span className="text-cyan-300 font-medium">加入主畫面</span> (Add to Home Screen)」。
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold shrink-0">
                    3
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-semibold text-white">點擊右上角「新增」</div>
                    <div className="text-gray-400 text-[11px]">
                      完成後手機桌面將出現專屬圖示。從桌面打開即是 100% 獨立全螢幕模式，所有網址列與 Safari 按鈕均會完全隱藏！
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Bar */}
          <div className="px-4 sm:px-6 py-3 border-t border-cyan-500/20 bg-black/40 flex items-center justify-end">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs transition-colors"
            >
              我知道了
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
