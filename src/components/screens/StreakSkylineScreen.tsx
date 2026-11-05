import React, { useState } from 'react';
import { ArrowLeft, AlertTriangle, Flame, Calendar, Sparkles } from 'lucide-react';
import { SkylineCanvas } from '../controls/SkylineCanvas';
import { triggerHapticTick } from '../../services/haptics';

interface Props {
  streakDays: number;
  onBack: () => void;
}

export const StreakSkylineScreen: React.FC<Props> = ({ streakDays, onBack }) => {
  const [isAtRisk, setIsAtRisk] = useState(false);

  // Heat grid of past 35 days (5 weeks x 7 days)
  const heatGridDays = Array.from({ length: 35 }, (_, i) => {
    const isCompleted = i >= 35 - Math.min(streakDays, 35);
    return {
      day: i + 1,
      isCompleted,
      minutes: isCompleted ? (i % 2 === 0 ? 45 : 90) : 0
    };
  });

  return (
    <div className="flex flex-col justify-between h-full px-5 py-4 select-none overflow-y-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
          Streak Skyline
        </span>
        <button
          onClick={() => {
            triggerHapticTick(1000);
            setIsAtRisk((prev) => !prev);
          }}
          className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-all ${
            isAtRisk
              ? 'bg-[#E5584F]/20 text-[#E5584F] border-[#E5584F]/40'
              : 'bg-slate-100 dark:bg-[#1E324E] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[#243B5A]'
          }`}
          title="Toggle preview of streak warning"
        >
          {isAtRisk ? 'Risk Active' : 'Test At-Risk'}
        </button>
      </div>

      {/* Prominent Streak Display (Matching Image 5) */}
      <div className="flex flex-col items-center justify-center text-center my-3">
        <div className="font-heading font-bold text-7xl md:text-8xl tracking-tight text-[#F2B84B] font-mono-tabular leading-none">
          {streakDays}
        </div>
        <span className="text-xs font-bold tracking-[0.25em] uppercase text-slate-400 dark:text-slate-400 mt-2">
          DAYS IN A ROW
        </span>
      </div>

      {/* Streak At Risk Banner if active */}
      {isAtRisk && (
        <div className="flex items-center gap-3 p-3.5 bg-rose-500/10 dark:bg-[#E5584F]/15 border border-[#E5584F]/30 rounded-2xl text-xs text-[#E5584F] mb-2 animate-pulse">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">Streak at risk today!</p>
            <p className="text-[11px] opacity-90">
              Focus for at least 1 minute before midnight to preserve your tower.
            </p>
          </div>
        </div>
      )}

      {/* Canvas Tower Skyline Illustration */}
      <div className="bg-white dark:bg-[#16253B] rounded-[26px] p-4 border border-slate-200/90 dark:border-[#243B5A] shadow-sm flex flex-col items-center justify-center my-1 flex-1 min-h-[220px]">
        <SkylineCanvas streakDays={streakDays} isAtRisk={isAtRisk} />
      </div>

      {/* Calendar Heat-Grid of Past Days */}
      <div className="bg-white dark:bg-[#16253B] rounded-[22px] p-3.5 border border-slate-200/90 dark:border-[#243B5A] shadow-sm my-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Consistency Heat-Grid
          </span>
          <span className="text-[10px] text-[#1FB5A8] font-bold">
            100% active
          </span>
        </div>

        {/* 5x7 grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {heatGridDays.map((d, idx) => (
            <div
              key={idx}
              title={`Day ${d.day}: ${d.minutes} mins`}
              className={`h-4 rounded-[4px] transition-all ${
                d.isCompleted
                  ? 'bg-[#F2B84B]'
                  : 'bg-slate-100 dark:bg-[#0F1B2D] border border-slate-200/60 dark:border-[#243B5A]/60'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Philosophy Slogan Footer */}
      <div className="text-center px-4 pt-1">
        <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
          Every day, one floor higher.
        </h4>
        <p className="text-xs text-slate-400 dark:text-slate-400 mt-0.5">
          Your consistency becomes a tower. Don't let it fall.
        </p>
      </div>
    </div>
  );
};
