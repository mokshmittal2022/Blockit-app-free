import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Building2, Clock, Award, TrendingUp } from 'lucide-react';
import { StatsPeriod, FocusSession } from '../../types';
import { triggerHapticTick } from '../../services/haptics';

interface Props {
  sessionsHistory: FocusSession[];
  onOpenSkyline: () => void;
}

export const StatsScreen: React.FC<Props> = ({ sessionsHistory, onOpenSkyline }) => {
  const [period, setPeriod] = useState<StatsPeriod>('month');
  const [selectedBarIndex, setSelectedBarIndex] = useState<number>(20);

  // Generate period bars
  const generateBars = () => {
    if (period === 'day') {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      return days.map((d, i) => ({
        label: d,
        date: `Nov ${10 + i}, 2026`,
        minutes: [45, 90, 60, 120, 75, 30, 95][i]
      }));
    } else if (period === 'month') {
      // 30 days
      return Array.from({ length: 30 }, (_, i) => ({
        label: (i + 1).toString(),
        date: `June ${i + 1}, 2026`,
        minutes: [0, 45, 60, 90, 25, 120, 180, 45, 75, 90, 110, 45, 60, 90, 150, 45, 90, 120, 60, 45, 90, 180, 120, 90, 60, 120, 90, 45, 150, 180][i]
      }));
    } else {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.map((m, i) => ({
        label: m,
        date: `${m} 2026`,
        minutes: [1200, 1400, 1650, 1900, 2100, 2400, 1800, 2200, 1950, 2300, 2500, 2700][i]
      }));
    }
  };

  const bars = generateBars();
  const activeBar = bars[Math.min(selectedBarIndex, bars.length - 1)] || bars[0];
  const maxMinutes = Math.max(...bars.map((b) => b.minutes), 60);

  // Calculate summaries
  const totalMinutes = bars.reduce((acc, b) => acc + b.minutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const longestSession = Math.max(...bars.map((b) => b.minutes));
  const dailyAverage = Math.round(totalMinutes / bars.length);

  return (
    <div className="flex flex-col justify-between h-full px-5 py-4 select-none">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
            The time you took back.
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Days, months, years: scroll through your focused hours.
          </p>
        </div>

        {/* Skyline Quick Access Button */}
        <button
          onClick={onOpenSkyline}
          className="p-2.5 rounded-2xl bg-amber-500/10 dark:bg-[#F2B84B]/15 border border-amber-500/30 text-[#F2B84B] hover:scale-105 active:scale-95 transition-all"
          title="Open Streak Skyline"
        >
          <Building2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white dark:bg-[#16253B] rounded-[26px] p-5 shadow-sm border border-slate-200/90 dark:border-[#243B5A] flex flex-col justify-between my-2 flex-1 max-h-[340px]">
        {/* Selected Bar Info Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#243B5A]/60">
          <button
            onClick={() => {
              triggerHapticTick(1000);
              setSelectedBarIndex((prev) => Math.max(0, prev - 1));
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {activeBar.date}
            </span>
            <span className="font-heading font-bold text-lg text-[#F2B84B]">
              {period === 'year' ? `${(activeBar.minutes / 60).toFixed(0)} Hours` : `${activeBar.minutes} Minutes`}
            </span>
          </div>

          <button
            onClick={() => {
              triggerHapticTick(1200);
              setSelectedBarIndex((prev) => Math.min(bars.length - 1, prev + 1));
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Dynamic Bars Grid */}
        <div className="flex items-end justify-between gap-1 h-[150px] pt-4 px-1">
          {bars.map((b, idx) => {
            const isSelected = idx === selectedBarIndex;
            const heightPercent = Math.max(8, Math.round((b.minutes / maxMinutes) * 100));

            return (
              <div
                key={idx}
                onClick={() => {
                  triggerHapticTick(1100 + idx * 10);
                  setSelectedBarIndex(idx);
                }}
                className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer group"
              >
                <div
                  className={`w-full rounded-t-md transition-all duration-300 ${
                    isSelected
                      ? 'bg-[#F2B84B] shadow-[0_0_8px_rgba(242,184,75,0.6)]'
                      : 'bg-slate-200 dark:bg-[#1E324E] group-hover:bg-slate-300 dark:group-hover:bg-[#243B5A]'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />
                <span
                  className={`text-[9px] font-mono mt-1 ${
                    isSelected ? 'font-bold text-[#F2B84B]' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {period === 'month' && idx % 5 !== 0 ? '' : b.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Period Switcher (Day / Month / Year) */}
        <div className="flex bg-slate-100 dark:bg-[#0F1B2D] p-1 rounded-2xl border border-slate-200/80 dark:border-[#243B5A] mt-2">
          {(['day', 'month', 'year'] as StatsPeriod[]).map((p) => (
            <button
              key={p}
              onClick={() => {
                triggerHapticTick(1200);
                setPeriod(p);
                setSelectedBarIndex(p === 'month' ? 15 : p === 'day' ? 3 : 5);
              }}
              className={`flex-1 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                period === p
                  ? 'bg-white dark:bg-[#16253B] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Bento Cards (Total Hours, Longest Session, Daily Avg) */}
      <div className="grid grid-cols-3 gap-2.5">
        <div className="bg-white dark:bg-[#16253B] rounded-2xl p-3 border border-slate-200/90 dark:border-[#243B5A] flex flex-col items-center text-center shadow-sm">
          <Clock className="w-4 h-4 text-[#1FB5A8] mb-1" />
          <span className="font-heading font-bold text-lg text-slate-900 dark:text-white">
            {totalHours}h
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Total Hours
          </span>
        </div>

        <div className="bg-white dark:bg-[#16253B] rounded-2xl p-3 border border-slate-200/90 dark:border-[#243B5A] flex flex-col items-center text-center shadow-sm">
          <Award className="w-4 h-4 text-[#F2B84B] mb-1" />
          <span className="font-heading font-bold text-lg text-slate-900 dark:text-white">
            {longestSession}m
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Longest
          </span>
        </div>

        <div className="bg-white dark:bg-[#16253B] rounded-2xl p-3 border border-slate-200/90 dark:border-[#243B5A] flex flex-col items-center text-center shadow-sm">
          <TrendingUp className="w-4 h-4 text-[#1FB5A8] mb-1" />
          <span className="font-heading font-bold text-lg text-slate-900 dark:text-white">
            {dailyAverage}m
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Daily Avg
          </span>
        </div>
      </div>
    </div>
  );
};
