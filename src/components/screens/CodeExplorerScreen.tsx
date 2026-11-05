import React, { useState } from 'react';
import {
  FolderTree,
  FileCode,
  Download,
  Copy,
  Check,
  Code2,
  Terminal,
  Shield,
  Layers,
  Database,
  Smartphone
} from 'lucide-react';
import { ANDROID_PROJECT_FILES, downloadAndroidProjectZip } from '../../services/androidProjectFiles';
import { triggerHapticTick } from '../../services/haptics';

export const CodeExplorerScreen: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedFile = ANDROID_PROJECT_FILES[selectedFileIndex] || ANDROID_PROJECT_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    triggerHapticTick(1400);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    triggerHapticTick(1600);
    try {
      await downloadAndroidProjectZip();
    } finally {
      setIsDownloading(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'manifest': return <Shield className="w-3.5 h-3.5 text-rose-400" />;
      case 'gradle': return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
      case 'compose': return <Smartphone className="w-3.5 h-3.5 text-[#1FB5A8]" />;
      case 'data': return <Database className="w-3.5 h-3.5 text-[#F2B84B]" />;
      case 'service': return <Layers className="w-3.5 h-3.5 text-blue-400" />;
      default: return <FileCode className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 text-slate-100 select-none overflow-hidden font-mono text-xs">
      {/* Top Banner with Download Action */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#1FB5A8]" />
          <span className="font-bold text-white text-xs">
            Stillhour Android Project (Compose + Room + Services)
          </span>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={isDownloading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1FB5A8] hover:bg-[#1aa195] text-slate-900 font-bold font-body active:scale-95 transition-all text-xs"
        >
          <Download className="w-3.5 h-3.5" />
          {isDownloading ? 'Zipping...' : 'Download Project .zip'}
        </button>
      </div>

      {/* Two Pane Explorer: File List (Left) & Code Viewer (Right) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: File Tree */}
        <div className="w-56 md:w-64 bg-slate-950/80 border-r border-slate-800 flex flex-col overflow-y-auto">
          <div className="p-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-800/80 flex items-center gap-1.5">
            <FolderTree className="w-3.5 h-3.5" />
            Project Structure
          </div>

          <div className="p-2 space-y-1 flex-1 overflow-y-auto">
            {ANDROID_PROJECT_FILES.map((file, idx) => {
              const isSelected = idx === selectedFileIndex;
              return (
                <button
                  key={file.path}
                  onClick={() => {
                    triggerHapticTick(1100);
                    setSelectedFileIndex(idx);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center gap-2 transition-all ${
                    isSelected
                      ? 'bg-[#1FB5A8]/15 text-[#1FB5A8] border border-[#1FB5A8]/30 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {getCategoryIcon(file.category)}
                  <div className="truncate">
                    <span className="block truncate text-[11px]">{file.name}</span>
                    <span className="text-[9px] text-slate-500 truncate block opacity-70">
                      {file.path}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Code Viewer */}
        <div className="flex-1 flex flex-col bg-[#0b1320] overflow-hidden">
          {/* File Tab Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
            <span className="text-slate-300 text-[11px] font-mono truncate">
              {selectedFile.path}
            </span>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-bold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code View with Line Numbers */}
          <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed select-text">
            <pre className="text-slate-200 whitespace-pre">
              <code>{selectedFile.content}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
