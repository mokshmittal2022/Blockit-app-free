import React, { useRef, useState } from 'react';
import { ChevronRight, Shield, Sparkles } from 'lucide-react';
import { triggerHapticTick, triggerHeavyHaptic } from '../../services/haptics';

interface Props {
  text?: string;
  icon?: 'chevron' | 'shield' | 'sparkles';
  variant?: 'teal' | 'coral' | 'amber';
  onConfirm: () => void;
  disabled?: boolean;
}

export const SlideToConfirm: React.FC<Props> = ({
  text = 'SLIDE TO START',
  icon = 'chevron',
  variant = 'teal',
  onConfirm,
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  const thumbSize = 52;
  const padding = 6;

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled || isConfirmed) return;
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const maxOffset = rect.width - thumbSize - padding * 2;
    const currentX = e.clientX - rect.left - padding - thumbSize / 2;
    const clamped = Math.max(0, Math.min(maxOffset, currentX));

    // Tick feedback every 24px
    if (Math.abs(clamped - dragOffset) > 20) {
      triggerHapticTick(1100 + clamped * 2);
    }

    setDragOffset(clamped);

    // If reached 90%, trigger confirm
    if (clamped >= maxOffset * 0.9) {
      setIsDragging(false);
      setDragOffset(maxOffset);
      setIsConfirmed(true);
      triggerHeavyHaptic();
      setTimeout(() => {
        onConfirm();
        // Reset after short delay
        setTimeout(() => {
          setDragOffset(0);
          setIsConfirmed(false);
        }, 500);
      }, 150);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    // Animate back if not confirmed
    if (!isConfirmed) {
      setDragOffset(0);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'coral':
        return {
          thumb: 'bg-[#E5584F] text-white shadow-[0_4px_16px_rgba(229,88,79,0.4)]',
          track: 'bg-[#16253B] border border-[#243B5A]/80 text-rose-300'
        };
      case 'amber':
        return {
          thumb: 'bg-[#F2B84B] text-slate-900 shadow-[0_4px_16px_rgba(242,184,75,0.4)]',
          track: 'bg-slate-100 dark:bg-[#16253B] border border-slate-200 dark:border-[#243B5A] text-amber-500'
        };
      case 'teal':
      default:
        return {
          thumb: 'bg-[#1FB5A8] text-white shadow-[0_4px_16px_rgba(31,181,168,0.4)]',
          track: 'bg-slate-100 dark:bg-[#16253B] border border-slate-200 dark:border-[#243B5A] text-teal-600 dark:text-[#1FB5A8]'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[64px] rounded-full p-[6px] flex items-center select-none touch-none transition-colors ${styles.track} ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
    >
      {/* Background track fill as user drags */}
      <div
        className="absolute left-[6px] top-[6px] bottom-[6px] rounded-full opacity-20 pointer-events-none"
        style={{
          width: `${dragOffset + thumbSize}px`,
          backgroundColor: variant === 'coral' ? '#E5584F' : variant === 'amber' ? '#F2B84B' : '#1FB5A8'
        }}
      />

      {/* Center Label */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span
          className="text-xs font-bold tracking-[0.2em] uppercase transition-opacity text-slate-500 dark:text-slate-400"
          style={{ opacity: Math.max(0.15, 1 - (dragOffset / 150)) }}
        >
          {text}
        </span>
      </div>

      {/* Draggable Thumb */}
      <div
        className={`relative z-10 w-[52px] h-[52px] rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing transition-transform ${
          isDragging ? 'scale-105' : 'transition-all duration-200'
        } ${styles.thumb}`}
        style={{
          transform: `translateX(${dragOffset}px)`
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {icon === 'shield' ? (
          <Shield className="w-5 h-5 fill-current" />
        ) : icon === 'sparkles' ? (
          <Sparkles className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-6 h-6 stroke-[2.5]" />
        )}
      </div>
    </div>
  );
};
