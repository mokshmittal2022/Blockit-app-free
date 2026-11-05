import React from 'react';
import { Download, Smartphone, ShieldCheck, CheckCircle2, Terminal, ExternalLink, X, FileBox, AlertCircle } from 'lucide-react';
import { triggerHapticTick, triggerHeavyHaptic } from '../../services/haptics';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ApkDownloadModal: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleDownload = (filename: string) => {
    triggerHeavyHaptic();
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-body">
      <div className="w-full max-w-md bg-white dark:bg-[#16253B] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#243B5A] max-h-[90vh] flex flex-col justify-between text-slate-800 dark:text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#243B5A]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center shadow-sm">
              <Smartphone className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900 dark:text-white">
                Download Stillhour APK
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Android Package v1.0.0 (Min SDK 26)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#1E324E]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="space-y-3.5 my-4 overflow-y-auto pr-1">
          {/* APK Package Card: Release Build */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#0F1B2D] border border-slate-200/90 dark:border-[#243B5A] flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <FileBox className="w-5 h-5 text-[#1FB5A8]" />
                <div>
                  <span className="font-heading font-bold text-xs text-slate-900 dark:text-white block">
                    stillhour-v1.0.0.apk
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Signed Production Build · 1.2 MB
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase">
                Ready
              </span>
            </div>

            <button
              onClick={() => handleDownload('stillhour-v1.0.0.apk')}
              className="mt-2 w-full py-2.5 bg-[#1FB5A8] hover:bg-[#1aa195] text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-98 transition-all"
            >
              <Download className="w-4 h-4" />
              Download Release APK
            </button>
          </div>

          {/* Secondary: Debug APK */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0F1B2D] border border-slate-200/90 dark:border-[#243B5A] flex items-center justify-between">
            <div>
              <span className="font-heading font-bold text-xs text-slate-800 dark:text-slate-200 block">
                stillhour-debug.apk
              </span>
              <span className="text-[10px] text-slate-400">
                With Logcat & Compose Debugging
              </span>
            </div>
            <button
              onClick={() => handleDownload('stillhour-debug.apk')}
              className="px-3 py-1.5 bg-slate-200 dark:bg-[#1E324E] hover:bg-slate-300 dark:hover:bg-[#243B5A] text-slate-800 dark:text-white font-bold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download
            </button>
          </div>

          {/* 3-Step Sideloading Instructions */}
          <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-[#F2B84B]/10 border border-amber-500/20 text-xs space-y-2">
            <span className="font-heading font-bold text-amber-800 dark:text-[#F2B84B] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              How to Install on Your Android Device:
            </span>
            <ol className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 list-decimal list-inside leading-relaxed">
              <li>Tap <strong>Download Release APK</strong> above onto your phone or tablet.</li>
              <li>Open your phone's <strong>Downloads</strong> folder and tap the APK file.</li>
              <li>If prompted, enable <em>"Install unknown apps"</em> for your browser or Files app, then tap <strong>Install</strong>.</li>
            </ol>
          </div>

          {/* Android Studio Gradle Compilation */}
          <div className="p-3 bg-slate-100 dark:bg-[#0b1320] rounded-2xl border border-slate-200 dark:border-[#243B5A]/60">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1 mb-1.5">
              <Terminal className="w-3.5 h-3.5" />
              Build from Source via Gradle
            </span>
            <code className="text-[11px] font-mono text-[#1FB5A8] block bg-black/40 px-2.5 py-1.5 rounded-lg select-text">
              ./gradlew assembleRelease
            </code>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-100 dark:bg-[#1E324E] hover:bg-slate-200 dark:hover:bg-[#243B5A] text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl"
        >
          Close
        </button>
      </div>
    </div>
  );
};
