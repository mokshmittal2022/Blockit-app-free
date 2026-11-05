import React from 'react';
import { Timer, BarChart3, CalendarClock, Settings } from 'lucide-react';
import { AppTab } from '../types';
import { triggerHapticTick } from '../services/haptics';

interface Props {
  currentTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

export const BottomNav: React.FC<Props> = ({ currentTab, onTabChange }) => {
  const tabs: { id: AppTab; label: string; icon: React.ReactNode }[] = [
    { id: 'focus', label: 'Focus', icon: <Timer className="w-5 h-5" /> },
    { id: 'stats', label: 'Stats', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'routines', label: 'Routines', icon: <CalendarClock className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  return (
    <div className="w-full flex items-center justify-center pb-3 pt-1 select-none pointer-events-none">
      {/* Floating Bottom Pill Container (Matching Screenshot 1 & 2) */}
      <div className="pointer-events-auto bg-white/95 dark:bg-[#16253B]/95 backdrop-blur-md rounded-full px-3 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] border border-slate-200/80 dark:border-[#243B5A] flex items-center gap-2">
        {tabs.map((tab) => {
          const isSelected = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                triggerHapticTick(1200);
                onTabChange(tab.id);
              }}
              className={`relative w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 active:scale-90 ${
                isSelected
                  ? 'bg-[#1FB5A8] text-white shadow-[0_2px_10px_rgba(31,181,168,0.4)]'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E324E]'
              }`}
              title={tab.label}
              aria-label={tab.label}
            >
              {tab.icon}
            </button>
          );
        })}
      </div>
    </div>
  );
};
