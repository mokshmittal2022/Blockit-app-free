import React, { useState } from 'react';
import { Plus, Bell, Trash2, Clock, Calendar, Check } from 'lucide-react';
import { DualCircularDial } from '../controls/DualCircularDial';
import { Routine } from '../../types';
import { triggerHapticTick, triggerHeavyHaptic } from '../../services/haptics';

interface Props {
  routines: Routine[];
  onToggleRoutine: (routineId: string) => void;
  onSaveRoutine: (routine: Routine) => void;
  onDeleteRoutine: (routineId: string) => void;
}

export const RoutinesScreen: React.FC<Props> = ({
  routines,
  onToggleRoutine,
  onSaveRoutine,
  onDeleteRoutine
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [name, setName] = useState('Deep Morning Work');
  const [startHour, setStartHour] = useState(0);
  const [startMinute, setStartMinute] = useState(15);
  const [endHour, setEndHour] = useState(7);
  const [endMinute, setEndMinute] = useState(45);
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const pad = (n: number) => n.toString().padStart(2, '0');
  const daysLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const toggleDay = (dayIndex: number) => {
    triggerHapticTick(1200);
    setSelectedDays((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handleSave = () => {
    if (!name.trim()) return;
    triggerHeavyHaptic();
    const newRoutine: Routine = {
      id: `routine-${Date.now()}`,
      name: name.trim(),
      startHour,
      startMinute,
      endHour,
      endMinute,
      daysOfWeek: selectedDays,
      isEnabled: true,
      headsUpMinutes: 1
    };
    onSaveRoutine(newRoutine);
    setIsCreating(false);
  };

  return (
    <div className="flex flex-col justify-between h-full px-5 py-4 select-none overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
            Put focus on repeat.
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Two knobs, start and end: your session begins on its own.
          </p>
        </div>

        <button
          onClick={() => {
            triggerHapticTick(1400);
            setIsCreating(true);
          }}
          className="w-10 h-10 rounded-2xl bg-[#1FB5A8] hover:bg-[#1aa195] text-white flex items-center justify-center shadow-md active:scale-95 transition-all"
          title="Create New Routine"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* Advance 1-Minute Heads-Up Notification Banner Info */}
      <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-teal-500/10 dark:bg-[#1FB5A8]/10 border border-teal-500/20 text-xs text-teal-800 dark:text-[#1FB5A8] mb-3">
        <Bell className="w-4 h-4 shrink-0 animate-bounce" />
        <span>Routines dispatch a 1-minute heads-up notification before lock begins.</span>
      </div>

      {/* Routines Cards List */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {routines.map((routine) => (
          <div
            key={routine.id}
            className="bg-white dark:bg-[#16253B] rounded-[24px] p-4.5 border border-slate-200/90 dark:border-[#243B5A] shadow-sm flex flex-col justify-between"
          >
            {/* Top row: Name & Switch */}
            <div className="flex items-center justify-between mb-2">
              <div>
                <h4 className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                  {routine.name}
                </h4>
                <div className="font-heading font-bold text-2xl text-[#F2B84B] font-mono-tabular mt-0.5">
                  <span>{pad(routine.startHour)}:{pad(routine.startMinute)}</span>
                  <span className="text-slate-400 mx-1.5 text-base font-normal">to</span>
                  <span>{pad(routine.endHour)}:{pad(routine.endMinute)}</span>
                </div>
              </div>

              {/* Physical Switch */}
              <button
                onClick={() => {
                  triggerHapticTick(1300);
                  onToggleRoutine(routine.id);
                }}
                className={`w-12 h-7 rounded-full p-1 transition-colors relative ${
                  routine.isEnabled
                    ? 'bg-[#1FB5A8]'
                    : 'bg-slate-300 dark:bg-[#243B5A]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                    routine.isEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Days Chips Row (M T W T F S S) */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#243B5A]/60">
              <div className="flex items-center gap-1.5">
                {daysLetters.map((letter, idx) => {
                  const dayNum = idx + 1;
                  const isActive = routine.daysOfWeek.includes(dayNum);
                  return (
                    <div
                      key={idx}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                        isActive
                          ? 'bg-[#F2B84B] text-slate-900'
                          : 'bg-slate-100 dark:bg-[#0F1B2D] text-slate-400 dark:text-slate-500'
                      }`}
                    >
                      {letter}
                    </div>
                  );
                })}
              </div>

              {/* Delete Button */}
              <button
                onClick={() => {
                  triggerHapticTick(900);
                  onDeleteRoutine(routine.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-[#E5584F] hover:bg-rose-500/10 transition-colors"
                title="Delete Routine"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Routine Modal with Dual Circular Time Dials */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#16253B] rounded-3xl p-5 shadow-2xl border border-slate-200 dark:border-[#243B5A] max-h-[90vh] flex flex-col justify-between">
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-2 text-center">
              New Focus Routine
            </h3>

            {/* Name Input */}
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Routine Name (e.g. Morning Focus)"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-[#0F1B2D] text-slate-900 dark:text-white text-xs border border-slate-200 dark:border-[#243B5A] mb-3 outline-none"
            />

            {/* Two Knobs: Dual Circular Dials for Start & End Time */}
            <div className="bg-slate-50 dark:bg-[#0F1B2D] rounded-2xl p-2 border border-slate-200/80 dark:border-[#243B5A]/80 mb-3">
              <DualCircularDial
                startHour={startHour}
                startMinute={startMinute}
                endHour={endHour}
                endMinute={endMinute}
                onStartTimeChange={(h, m) => {
                  setStartHour(h);
                  setStartMinute(m);
                }}
                onEndTimeChange={(h, m) => {
                  setEndHour(h);
                  setEndMinute(m);
                }}
              />
            </div>

            {/* Days of Week Selector */}
            <div className="mb-4">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
                Repeat on Days
              </span>
              <div className="flex justify-center gap-1.5">
                {daysLetters.map((letter, idx) => {
                  const dayNum = idx + 1;
                  const isSelected = selectedDays.includes(dayNum);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleDay(dayNum)}
                      className={`w-9 h-9 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-[#1FB5A8] text-white shadow-sm'
                          : 'bg-slate-100 dark:bg-[#0F1B2D] text-slate-400 border border-slate-200 dark:border-[#243B5A]'
                      }`}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsCreating(false)}
                className="flex-1 py-3 text-xs font-bold text-slate-500 rounded-xl hover:bg-slate-100 dark:hover:bg-[#1E324E]"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 text-xs font-bold bg-[#1FB5A8] text-white rounded-xl shadow-md hover:bg-[#1aa195]"
              >
                Save Routine
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
