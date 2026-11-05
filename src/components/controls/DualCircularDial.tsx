import React, { useRef } from 'react';
import { triggerHapticTick } from '../../services/haptics';

interface Props {
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  onStartTimeChange: (h: number, m: number) => void;
  onEndTimeChange: (h: number, m: number) => void;
}

export const DualCircularDial: React.FC<Props> = ({
  startHour,
  startMinute,
  endHour,
  endMinute,
  onStartTimeChange,
  onEndTimeChange
}) => {
  return (
    <div className="flex items-center justify-around w-full gap-4 py-2">
      <SingleTimeDial
        label="Start Time"
        hour={startHour}
        minute={startMinute}
        color="#1FB5A8"
        onChange={onStartTimeChange}
      />
      <div className="h-16 w-[1px] bg-slate-200 dark:bg-[#243B5A]" />
      <SingleTimeDial
        label="End Time"
        hour={endHour}
        minute={endMinute}
        color="#F2B84B"
        onChange={onEndTimeChange}
      />
    </div>
  );
};

interface SingleDialProps {
  label: string;
  hour: number;
  minute: number;
  color: string;
  onChange: (h: number, m: number) => void;
}

const SingleTimeDial: React.FC<SingleDialProps> = ({
  label,
  hour,
  minute,
  color,
  onChange
}) => {
  const dialRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);

  // Total 12h minutes: 720 mins. Fraction: 0..1
  const totalMins = (hour % 12) * 60 + minute;
  const angleDeg = (totalMins / 720) * 360;

  const handlePointer = (e: React.PointerEvent) => {
    if (!dialRef.current) return;
    const rect = dialRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;

    // Angle clockwise from 12 o'clock
    let theta = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    if (theta < 0) theta += 360;

    const fraction = theta / 360;
    const rawTotalMins = Math.round(fraction * 720);
    const newH = Math.floor(rawTotalMins / 60);
    // 5-minute rounding
    const rawM = rawTotalMins % 60;
    const newM = Math.round(rawM / 5) * 5 % 60;

    const isPM = hour >= 12;
    const finalH = isPM ? (newH % 12) + 12 : newH % 12;

    if (finalH !== hour || newM !== minute) {
      triggerHapticTick(1100 + newM * 10);
      onChange(finalH, newM);
    }
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  // Knob coordinate on 110px radius circle
  const radius = 40;
  const center = 55;
  const knobRad = (angleDeg - 90) * (Math.PI / 180);
  const knobX = center + radius * Math.cos(knobRad);
  const knobY = center + radius * Math.sin(knobRad);

  return (
    <div className="flex flex-col items-center select-none touch-none">
      <span className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-400 mb-1">
        {label}
      </span>

      <div className="relative w-[110px] h-[110px] flex items-center justify-center">
        <svg
          ref={dialRef}
          className="w-full h-full cursor-pointer"
          viewBox="0 0 110 110"
          onPointerDown={(e) => {
            isDragging.current = true;
            (e.target as Element).setPointerCapture(e.pointerId);
            handlePointer(e);
          }}
          onPointerMove={(e) => {
            if (isDragging.current) handlePointer(e);
          }}
          onPointerUp={(e) => {
            isDragging.current = false;
            try {
              (e.target as Element).releasePointerCapture(e.pointerId);
            } catch {}
          }}
        >
          {/* Background circle track */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-slate-200 dark:text-[#1E324E]"
            strokeWidth="8"
          />

          {/* 12 Hour tick dots */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => {
            const rad = (h * 30 - 90) * (Math.PI / 180);
            const tx = center + (radius - 10) * Math.cos(rad);
            const ty = center + (radius - 10) * Math.sin(rad);
            return (
              <circle
                key={h}
                cx={tx}
                cy={ty}
                r="1.5"
                fill="currentColor"
                className="text-slate-400 dark:text-slate-500 opacity-60"
              />
            );
          })}

          {/* Interactive Knob Indicator */}
          <circle
            cx={knobX}
            cy={knobY}
            r="8"
            fill={color}
            className="shadow-md transition-transform"
          />
          <circle cx={knobX} cy={knobY} r="3" fill="#FFFFFF" />
        </svg>

        {/* Center Digital Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="font-heading font-bold text-sm tracking-tight text-slate-800 dark:text-white">
            {pad(hour)}:{pad(minute)}
          </span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase">
            {hour >= 12 ? 'PM' : 'AM'}
          </span>
        </div>
      </div>
    </div>
  );
};
