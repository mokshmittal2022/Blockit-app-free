import React, { useState } from 'react';
import { Shield, Lock, ChevronRight, Clock, Flame } from 'lucide-react';
import { DurationWheelPicker } from '../controls/DurationWheelPicker';
import { SlideToConfirm } from '../controls/SlideToConfirm';
import { AllowedAppsModal } from '../modals/AllowedAppsModal';
import { EssentialApp } from '../../types';
import { triggerHapticTick } from '../../services/haptics';

interface Props {
  emergencyPasses: number;
  streakDays: number;
  allowedApps: EssentialApp[];
  allowedAppIds: string[];
  onToggleAllowedApp: (appId: string) => void;
  onStartSession: (minutes: number) => void;
  onOpenSkyline: () => void;
}

export const FocusScreen: React.FC<Props> = ({
  emergencyPasses,
  streakDays,
  allowedApps,
  allowedAppIds,
  onToggleAllowedApp,
  onStartSession,
  onOpenSkyline
}) => {
  const [selectedMinutes, setSelectedMinutes] = useState(25);
  const [isAllowedModalOpen, setIsAllowedModalOpen] = useState(false);
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const hours = Math.floor(selectedMinutes / 60);
  const minutes = selectedMinutes % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  const presets = [
    { label: '15', sub: 'Minutes', minutes: 15 },
    { label: '45', sub: 'Minutes', minutes: 45 },
    { label: '3', sub: 'Hours', minutes: 180 },
    { label: '12:00', sub: 'Custom', isCustom: true }
  ];

  return (
    <div className="flex flex-col justify-between h-full px-5 py-4 select-none">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        {/* Brand Wordmark & Icon */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#0F1B2D] dark:bg-[#16253B] border border-teal-500/30 flex items-center justify-center text-[#1FB5A8] shadow-sm">
            {/* Abstract Hourglass */}
            <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
              <path d="M6 3h12a1 1 0 0 1 1 1v2a6 6 0 0 1-3.5 5.5A6 6 0 0 1 19 17v3a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-3a6 6 0 0 1 3.5-5.5A6 6 0 0 1 5 6V4a1 1 0 0 1 1-1z" opacity="0.25"/>
              <path d="M7 5h10v1.5a4.5 4.5 0 0 1-2.5 4L12 12l-2.5-1.5A4.5 4.5 0 0 1 7 6.5V5z" fill="#1FB5A8"/>
              <path d="M7 19v-1.5a4.5 4.5 0 0 1 2.5-4L12 12l2.5 1.5a4.5 4.5 0 0 1 2.5 4V19H7z" fill="#F2B84B"/>
            </svg>
          </div>
          <span className="font-heading font-bold text-xl tracking-tight text-slate-900 dark:text-white">
            stillhour
          </span>
        </div>

        {/* Right Status Badges: Streak & Emergency Passes */}
        <div className="flex items-center gap-2">
          {/* Streak Skyline Badge */}
          <button
            onClick={onOpenSkyline}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 dark:bg-[#F2B84B]/15 border border-amber-500/25 text-[#F2B84B] hover:scale-105 active:scale-95 transition-all text-xs font-bold"
            title="View Streak Skyline"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{streakDays}</span>
          </button>

          {/* Emergency Pass Parachute Badge */}
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-[#16253B] border border-slate-200 dark:border-[#243B5A] text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm"
            title="Emergency Passes"
          >
            <Shield className="w-3.5 h-3.5 text-[#F2B84B]" />
            <span>{emergencyPasses}</span>
          </div>
        </div>
      </div>

      {/* Main Tabular Big Timer Card (Matching Image 6 & 9) */}
      <div className="bg-white dark:bg-[#16253B] rounded-[26px] p-6 shadow-sm border border-slate-200/90 dark:border-[#243B5A] flex flex-col items-center justify-center my-2">
        <div className="flex items-center justify-center font-heading font-bold text-6xl md:text-7xl tracking-tight text-[#F2B84B] font-mono-tabular drop-shadow-sm">
          <span>{pad(hours)}</span>
          <span className="mx-1 text-slate-400 dark:text-slate-600 animate-pulse">:</span>
          <span>{pad(minutes)}</span>
        </div>
        <p className="text-xs font-medium text-slate-400 dark:text-slate-400 mt-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {hours > 0 ? `${hours} hr ${minutes} min focus session` : `${minutes} minutes deep focus`}
        </p>
      </div>

      {/* Rotary Wheel & Preset Chips Grid (Matching Screenshot Layout) */}
      <div className="flex gap-3 h-[180px]">
        {/* Preset Cards Grid (2x2) */}
        <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2.5">
          {presets.map((p, idx) => {
            const isSelected = p.isCustom
              ? selectedMinutes !== 15 && selectedMinutes !== 45 && selectedMinutes !== 180
              : selectedMinutes === p.minutes;

            return (
              <button
                key={idx}
                onClick={() => {
                  triggerHapticTick(1200);
                  if (p.isCustom) {
                    setIsCustomOpen(true);
                  } else if (p.minutes) {
                    setSelectedMinutes(p.minutes);
                  }
                }}
                className={`relative flex flex-col items-center justify-center rounded-[20px] p-2 transition-all border active:scale-95 ${
                  isSelected
                    ? 'bg-slate-200/90 dark:bg-[#1E324E] border-[#F2B84B] shadow-sm'
                    : 'bg-white dark:bg-[#16253B] border-slate-200/80 dark:border-[#243B5A] text-slate-700 dark:text-slate-300'
                }`}
              >
                <span
                  className={`font-heading font-bold text-lg md:text-xl tracking-tight ${
                    isSelected ? 'text-[#F2B84B]' : 'text-slate-800 dark:text-white'
                  }`}
                >
                  {p.isCustom
                    ? selectedMinutes !== 15 && selectedMinutes !== 45 && selectedMinutes !== 180
                      ? `${pad(hours)}:${pad(minutes)}`
                      : '12:00'
                    : p.label}
                </span>
                <span className="text-[11px] font-medium text-slate-400 dark:text-slate-400 mt-0.5">
                  {p.sub}
                </span>

                {isSelected && (
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#F2B84B]" />
                )}
              </button>
            );
          })}
        </div>

        {/* Tactile Vertical Rotary Wheel Column */}
        <DurationWheelPicker
          currentMinutes={selectedMinutes}
          onChange={(newMin) => setSelectedMinutes(newMin)}
        />
      </div>

      {/* Essentials Allowed Card */}
      <div
        onClick={() => {
          triggerHapticTick(1100);
          setIsAllowedModalOpen(true);
        }}
        className="bg-white dark:bg-[#16253B] rounded-[22px] p-4 border border-slate-200/90 dark:border-[#243B5A] shadow-sm flex items-center justify-between cursor-pointer hover:border-teal-500/40 transition-all active:scale-98"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-[#1FB5A8]/15 flex items-center justify-center text-[#1FB5A8]">
            <Lock className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
              Essentials Allowed
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-[#0F1B2D] text-slate-500 dark:text-slate-400 font-mono">
                {allowedAppIds.length} apps
              </span>
            </h4>
            <p className="text-[11px] text-slate-400 dark:text-slate-400">
              Phone dialer, Maps, Messages allowed during lock
            </p>
          </div>
        </div>

        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1E324E] flex items-center justify-center text-slate-400">
          <ChevronRight className="w-4 h-4" />
        </div>
      </div>

      {/* Slide to Start Swipe Control */}
      <div className="pt-1">
        <SlideToConfirm
          text="SLIDE TO START"
          variant="teal"
          onConfirm={() => onStartSession(selectedMinutes)}
        />
      </div>

      {/* Allowed Apps Selection Modal */}
      <AllowedAppsModal
        isOpen={isAllowedModalOpen}
        apps={allowedApps}
        allowedAppIds={allowedAppIds}
        onToggleApp={onToggleAllowedApp}
        onClose={() => setIsAllowedModalOpen(false)}
      />

      {/* Custom Time Input Prompt */}
      {isCustomOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#16253B] rounded-3xl p-6 w-full max-w-xs border border-slate-200 dark:border-[#243B5A] text-center">
            <h4 className="font-heading font-bold text-base text-slate-900 dark:text-white mb-2">
              Custom Duration
            </h4>
            <p className="text-xs text-slate-400 mb-4">Set target focus minutes (5 to 480):</p>
            <input
              type="number"
              min="5"
              max="480"
              step="5"
              defaultValue={selectedMinutes}
              id="custom-min-input"
              className="w-full text-center font-heading font-bold text-3xl py-3 rounded-2xl bg-slate-100 dark:bg-[#0F1B2D] text-[#F2B84B] border border-slate-300 dark:border-[#243B5A] mb-4 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setIsCustomOpen(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-500 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const val = Number((document.getElementById('custom-min-input') as HTMLInputElement)?.value || 25);
                  setSelectedMinutes(Math.max(5, Math.min(480, val)));
                  setIsCustomOpen(false);
                }}
                className="flex-1 py-2.5 text-xs font-bold bg-[#1FB5A8] text-white rounded-xl"
              >
                Set Time
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
