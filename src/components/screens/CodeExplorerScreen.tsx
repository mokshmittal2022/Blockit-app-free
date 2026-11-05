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
  Smartphone,
  Plus,
  Trash2,
  Edit3,
  X
} from 'lucide-react';
import {
  getAllProjectFiles,
  saveCustomFile,
  deleteCustomFile,
  downloadAndroidProjectZip
} from '../../services/androidProjectFiles';
import { AndroidFileRecord } from '../../types';
import { triggerHapticTick, triggerHeavyHaptic } from '../../services/haptics';

export const CodeExplorerScreen: React.FC = () => {
  const [files, setFiles] = useState<AndroidFileRecord[]>(getAllProjectFiles());
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Manual File Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalFilePath, setModalFilePath] = useState('app/src/main/java/com/stillhour/app/util/Extensions.kt');
  const [modalCategory, setModalCategory] = useState<'compose' | 'viewmodel' | 'data' | 'service' | 'gradle' | 'res' | 'manifest'>('compose');
  const [modalLanguage, setModalLanguage] = useState('kotlin');
  const [modalContent, setModalContent] = useState(`package com.stillhour.app.util

import android.content.Context
import android.widget.Toast

fun Context.showToast(message: String) {
    Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
}
`);

  const refreshFiles = () => {
    const updated = getAllProjectFiles();
    setFiles(updated);
  };

  const selectedFile = files[selectedFileIndex] || files[0];

  const handleCopy = () => {
    if (!selectedFile) return;
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    triggerHapticTick(1400);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsDownloading(true);
    triggerHapticTick(1600);
    try {
      await downloadAndroidProjectZip(files);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleSaveManualFile = () => {
    if (!modalFilePath.trim() || !modalContent.trim()) return;
    triggerHeavyHaptic();

    const fileName = modalFilePath.split('/').pop() || 'File.kt';
    const newRecord: AndroidFileRecord = {
      path: modalFilePath.trim(),
      name: fileName,
      language: modalLanguage,
      category: modalCategory,
      content: modalContent
    };

    saveCustomFile(newRecord);
    refreshFiles();
    setIsModalOpen(false);

    // Select the newly added file
    const all = getAllProjectFiles();
    const newIdx = all.findIndex((f) => f.path === newRecord.path);
    if (newIdx >= 0) setSelectedFileIndex(newIdx);
  };

  const handleDeleteCurrentFile = () => {
    if (!selectedFile) return;
    triggerHapticTick(900);
    deleteCustomFile(selectedFile.path);
    refreshFiles();
    setSelectedFileIndex(0);
  };

  const handleOpenEdit = () => {
    if (!selectedFile) return;
    setModalFilePath(selectedFile.path);
    setModalCategory(selectedFile.category);
    setModalLanguage(selectedFile.language);
    setModalContent(selectedFile.content);
    setIsModalOpen(true);
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
      {/* Top Banner with Download & Add Manual File Actions */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-[#1FB5A8]" />
          <span className="font-bold text-white text-xs hidden sm:inline">
            Stillhour Android Project ({files.length} Files)
          </span>
          <span className="font-bold text-white text-xs sm:hidden">
            Stillhour Android
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Add File Manually Button */}
          <button
            onClick={() => {
              triggerHapticTick(1400);
              setModalFilePath('app/src/main/java/com/stillhour/app/util/NewUtil.kt');
              setModalCategory('compose');
              setModalLanguage('kotlin');
              setModalContent(`package com.stillhour.app.util\n\n// Add your custom logic here\n`);
              setIsModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#1FB5A8] border border-[#1FB5A8]/30 font-bold font-body active:scale-95 transition-all text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add File Manually</span>
          </button>

          {/* Download APK Button */}
          <a
            href="/stillhour-v1.0.0.apk"
            download="stillhour-v1.0.0.apk"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold font-body active:scale-95 transition-all text-xs shadow-sm"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Download APK</span>
          </a>

          {/* Download Project ZIP */}
          <button
            onClick={handleDownloadZip}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1FB5A8] hover:bg-[#1aa195] text-slate-900 font-bold font-body active:scale-95 transition-all text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            {isDownloading ? 'Zipping...' : 'Download .zip'}
          </button>
        </div>
      </div>

      {/* Two Pane Explorer: File List (Left) & Code Viewer (Right) */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: File Tree */}
        <div className="w-56 md:w-64 bg-slate-950/80 border-r border-slate-800 flex flex-col overflow-y-auto shrink-0">
          <div className="p-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase border-b border-slate-800/80 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <FolderTree className="w-3.5 h-3.5" />
              Project Files
            </span>
            <span className="text-[10px] text-[#1FB5A8]">{files.length}</span>
          </div>

          <div className="p-2 space-y-1 flex-1 overflow-y-auto">
            {files.map((file, idx) => {
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
                  <div className="truncate flex-1">
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
          {selectedFile && (
            <div className="flex items-center justify-between px-4 py-2 bg-slate-950 border-b border-slate-800">
              <div className="flex items-center gap-2 truncate">
                {getCategoryIcon(selectedFile.category)}
                <span className="text-slate-300 text-[11px] font-mono truncate">
                  {selectedFile.path}
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleOpenEdit}
                  className="flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  title="Edit File Manually"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit</span>
                </button>

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
                      <span className="hidden sm:inline">Copy Code</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleDeleteCurrentFile}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete File"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Code View with Line Numbers */}
          <div className="flex-1 overflow-auto p-4 font-mono text-[11px] leading-relaxed select-text">
            {selectedFile ? (
              <pre className="text-slate-200 whitespace-pre">
                <code>{selectedFile.content}</code>
              </pre>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Select or add a file
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit File Manually Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-body">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#1FB5A8]" />
                Add File Manually to Android Project
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              {/* File Path */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  File Path
                </label>
                <input
                  type="text"
                  value={modalFilePath}
                  onChange={(e) => setModalFilePath(e.target.value)}
                  placeholder="e.g. app/src/main/java/com/stillhour/app/util/MyHelper.kt"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono outline-none focus:border-[#1FB5A8]"
                />
              </div>

              {/* Category & Language Row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={modalCategory}
                    onChange={(e) => setModalCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none"
                  >
                    <option value="compose">Jetpack Compose UI</option>
                    <option value="viewmodel">ViewModel</option>
                    <option value="data">Room DB / Entity</option>
                    <option value="service">Background Service</option>
                    <option value="gradle">Gradle & Config</option>
                    <option value="res">XML Resource</option>
                    <option value="manifest">Manifest</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Language / Syntax
                  </label>
                  <select
                    value={modalLanguage}
                    onChange={(e) => setModalLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none"
                  >
                    <option value="kotlin">Kotlin (.kt)</option>
                    <option value="xml">XML (.xml)</option>
                    <option value="gradle">Gradle (.kts)</option>
                    <option value="properties">Properties (.properties)</option>
                    <option value="toml">TOML (.toml)</option>
                  </select>
                </div>
              </div>

              {/* Quick Template Buttons */}
              <div className="flex gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setModalFilePath('app/src/main/java/com/stillhour/app/ui/components/CustomBadge.kt');
                    setModalCategory('compose');
                    setModalLanguage('kotlin');
                    setModalContent(`package com.stillhour.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.stillhour.app.ui.theme.AccentTeal

@Composable
fun CustomBadge(text: String) {
    Box(
        modifier = Modifier
            .background(AccentTeal, RoundedCornerShape(12.dp))
            .padding(horizontal = 8.dp, vertical = 4.dp)
    ) {
        Text(text = text, color = Color.White)
    }
}
`);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-[10px] text-[#1FB5A8] hover:bg-slate-700"
                >
                  + Composable Template
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setModalFilePath('app/src/main/java/com/stillhour/app/data/local/entity/TagEntity.kt');
                    setModalCategory('data');
                    setModalLanguage('kotlin');
                    setModalContent(`package com.stillhour.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "tags")
data class TagEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val colorHex: String
)
`);
                  }}
                  className="px-2 py-1 rounded-lg bg-slate-800 text-[10px] text-[#F2B84B] hover:bg-slate-700"
                >
                  + Room Entity Template
                </button>
              </div>

              {/* Code Content Editor */}
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Code Content
                </label>
                <textarea
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  rows={10}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-mono outline-none focus:border-[#1FB5A8] leading-relaxed"
                  placeholder="Paste or write code here..."
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-800 mt-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveManualFile}
                className="flex-1 py-2.5 text-xs font-bold bg-[#1FB5A8] hover:bg-[#1aa195] text-slate-900 rounded-xl shadow-md"
              >
                Save File to Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
