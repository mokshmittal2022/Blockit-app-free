import React, { useRef, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { triggerHapticTick } from '../../services/haptics';

interface Props {
  currentMinutes: number;
  onChange: (minutes: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

export const DurationWheelPicker: React.FC<Props> = ({
  currentMinutes,
  onChange,
  min = 5,
  max = 360,
  step = 5
}) => {
  const isDragging = useRef(false);
  const startY = useRef(0);
  const startVal = useRef(currentMinutes);
  const lastTickVal = useRef(currentMinutes);
  const [isHovered, setIsHovered] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    startY.current = e.clientY;
    startVal.current = currentMinutes;
    lastTickVal.current = currentMinutes;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const dy = startY.current - e.clientY; // drag up = increase
    const stepDelta = Math.round(dy / 14); // 14px per 5-min step
    const newVal = Math.min(max, Math.max(min, startVal.current + stepDelta * step));
    if (newVal !== lastTickVal.current) {
      triggerHapticTick(1000 + (newVal % 60) * 8);
      lastTickVal.current = newVal;
      onChange(newVal);
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const increment = () => {
    const next = Math.min(max, currentMinutes + step);
    if (next !== currentMinutes) {
      triggerHapticTick(1400);
      onChange(next);
    }
  };

  const decrement = () => {
    const prev = Math.max(min, currentMinutes - step);
    if (prev !== currentMinutes) {
      triggerHapticTick(900);
      onChange(prev);
    }
  };

  // Generate visual tick marks offset relative to current value
  const tickOffset = (currentMinutes % step) * 2;

  return (
    <div
      className="flex flex-col items-center justify-between w-14 h-full py-2 bg-slate-100 dark:bg-[#16253B] rounded-2xl border border-slate-200/80 dark:border-[#243B5A] select-none touch-none shadow-sm"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Up Button */}
      <button
        onClick={increment}
        className="w-10 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg active:scale-95 transition-all"
        title="Increase 5 minutes"
        aria-label="Increase duration"
      >
        <ChevronUp className="w-5 h-5" />
      </button>

      {/* Tactile Rotary Wheel Track */}
      <div
        className="relative flex-1 w-full flex items-center justify-center cursor-ns-resize overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Subtle graduation ruler lines */}
        <div className="absolute inset-x-2 flex flex-col items-center justify-center gap-[7px] opacity-40 dark:opacity-30 pointer-events-none">
          {[-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`rounded-full transition-transform ${
                i % 3 === 0
                  ? 'w-7 h-[2px] bg-slate-400 dark:bg-slate-300'
                  : 'w-4 h-[1.5px] bg-slate-300 dark:bg-slate-500'
              }`}
              style={{
                transform: `translateY(${tickOffset}px)`
              }}
            />
          ))}
        </div>

        {/* Center Active Indicator Line (Amber) */}
        <div className="relative z-10 w-8 h-[3.5px] bg-[#F2B84B] rounded-full shadow-[0_0_8px_rgba(242,184,75,0.7)] pointer-events-none" />

        {/* Gradient edge fades for 3D wheel cylinder depth */}
        <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-slate-100 dark:from-[#16253B] to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-slate-100 dark:from-[#16253B] to-transparent pointer-events-none" />
      </div>

      {/* Down Button */}
      <button
        onClick={decrement}
        className="w-10 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white rounded-lg active:scale-95 transition-all"
        title="Decrease 5 minutes"
        aria-label="Decrease duration"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
};
