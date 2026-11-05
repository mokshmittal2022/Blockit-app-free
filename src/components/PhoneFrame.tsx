import React, { useState, useEffect } from 'react';
import { Wifi, Signal, Battery, Smartphone, Tablet, Maximize2, Code2 } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  themeMode: 'light' | 'dark' | 'system';
  isLockActive: boolean;
  onToggleCodeView?: () => void;
  isCodeViewActive?: boolean;
  onOpenApkModal?: () => void;
}

export const PhoneFrame: React.FC<Props> = ({
  children,
  themeMode,
  isLockActive,
  onToggleCodeView,
  isCodeViewActive = false,
  onOpenApkModal
}) => {
  const [deviceMode, setDeviceMode] = useState<'phone' | 'tablet' | 'fullscreen'>('phone');
  const [currentTime, setCurrentTime] = useState('08:53');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const isDark = themeMode === 'dark' || (themeMode === 'system' && true) || isLockActive;

  return (
    <div className={`min-h-screen w-full flex flex-col items-center justify-center p-2 sm:p-4 transition-colors ${
      isDark ? 'dark bg-[#080E17]' : 'bg-slate-200 text-slate-900'
    }`}>
      {/* Top Device Bar & Quick Switchers */}
      <header className="w-full max-w-4xl flex items-center justify-between px-3 py-2 text-xs mb-2">
        <div className="flex items-center gap-2">
          <span className="font-heading font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1FB5A8]" />
            Stillhour Android Dev Studio
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-300 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
            API 35 · Compose M3
          </span>
        </div>

        {/* Device Switcher & Code Explorer Toggle */}
        <div className="flex items-center gap-1.5 bg-white/80 dark:bg-[#16253B]/90 p-1 rounded-2xl border border-slate-300 dark:border-[#243B5A] shadow-sm">
          <button
            onClick={() => setDeviceMode('phone')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              deviceMode === 'phone'
                ? 'bg-[#1FB5A8] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="Pixel 8 Phone Mode"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Phone</span>
          </button>

          <button
            onClick={() => setDeviceMode('tablet')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              deviceMode === 'tablet'
                ? 'bg-[#1FB5A8] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="Tablet / Landscape Split-Pane"
          >
            <Tablet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tablet</span>
          </button>

          <button
            onClick={() => setDeviceMode('fullscreen')}
            className={`px-2.5 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all ${
              deviceMode === 'fullscreen'
                ? 'bg-[#1FB5A8] text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
            title="Fullscreen Web Preview"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>

          <div className="w-[1px] h-4 bg-slate-300 dark:bg-slate-700 mx-0.5" />

          {onOpenApkModal && (
            <button
              onClick={onOpenApkModal}
              className="px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm active:scale-95"
              title="Download Android APK (v1.0.0)"
            >
              <Smartphone className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Download APK</span>
            </button>
          )}

          {onToggleCodeView && (
            <button
              onClick={onToggleCodeView}
              className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                isCodeViewActive
                  ? 'bg-[#F2B84B] text-slate-950 font-bold shadow-sm'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Android Code</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Chassis / Device Frame */}
      <main
        className={`relative transition-all duration-300 flex flex-col overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.4)] ${
          deviceMode === 'phone'
            ? 'w-[390px] h-[780px] max-h-[92vh] rounded-[48px] border-[10px] border-slate-800 dark:border-[#22334A]'
            : deviceMode === 'tablet'
            ? 'w-[920px] max-w-[95vw] h-[640px] max-h-[90vh] rounded-[36px] border-[10px] border-slate-800 dark:border-[#22334A]'
            : 'w-full max-w-5xl h-[85vh] rounded-2xl border border-slate-300 dark:border-slate-800'
        } ${
          isDark
            ? 'bg-[#0F1B2D] text-slate-100'
            : 'bg-[#F4F6F8] text-slate-900'
        }`}
      >
        {/* Device Status Bar (Android Material 3 Status Bar) */}
        {!isCodeViewActive && (
          <div className="relative z-30 flex items-center justify-between px-7 pt-3 pb-1 select-none text-[12px] font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            {/* Time (Status bar Left) */}
            <span className="font-heading tracking-tight">{currentTime}</span>

            {/* Camera Punch-Hole (Center) */}
            {deviceMode === 'phone' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-3 w-4 h-4 rounded-full bg-black border border-slate-700/80 shadow-inner" />
            )}

            {/* System Status Icons (Right: WiFi, Cellular, Battery) */}
            <div className="flex items-center gap-1.5 opacity-90">
              <span className="text-[10px] font-mono mr-0.5">5G</span>
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-mono">48%</span>
                <Battery className="w-4 h-4" />
              </div>
            </div>
          </div>
        )}

        {/* Screen Viewport */}
        <div className="relative flex-1 w-full overflow-hidden flex flex-col">
          {children}
        </div>

        {/* Android Gesture Navigation Bar Pill */}
        {!isCodeViewActive && (
          <div className="w-full h-4 flex items-center justify-center shrink-0 pb-1 pointer-events-none">
            <div className="w-32 h-1 rounded-full bg-slate-400/40 dark:bg-slate-600/50" />
          </div>
        )}
      </main>
    </div>
  );
};
