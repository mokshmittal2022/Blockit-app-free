import React from 'react';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  passBalance: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const EmergencyPassExitModal: React.FC<Props> = ({
  isOpen,
  passBalance,
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-sm bg-[#16253B] rounded-3xl p-6 shadow-2xl border border-[#243B5A] text-white">
        <div className="w-14 h-14 rounded-2xl bg-rose-500/10 flex items-center justify-center text-[#E5584F] mb-4 mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h3 className="font-heading font-bold text-center text-xl text-white mb-2">
          Use Emergency Pass?
        </h3>

        <p className="text-xs text-center text-slate-300 leading-relaxed mb-4">
          A real emergency costs a parachute. Exiting early will spend <span className="font-bold text-[#E5584F]">1 Emergency Pass</span>.
        </p>

        <div className="bg-[#0F1B2D] rounded-2xl p-3.5 mb-5 border border-[#243B5A]/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">Current Balance:</span>
          <span className="font-heading font-bold text-sm text-[#F2B84B] flex items-center gap-1">
            {passBalance} Pass{passBalance === 1 ? '' : 'es'}
          </span>
        </div>

        <div className="flex items-center gap-2 p-3 bg-rose-500/10 rounded-xl mb-5 text-[11px] text-rose-300 border border-rose-500/20">
          <AlertTriangle className="w-4 h-4 shrink-0 text-[#E5584F]" />
          <span>Your streak will be preserved, but this session will be flagged as interrupted.</span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-xs font-bold text-slate-400 hover:text-white hover:bg-[#1E324E] rounded-xl transition-colors"
          >
            Keep Focusing
          </button>
          <button
            onClick={onConfirm}
            disabled={passBalance <= 0}
            className={`flex-1 py-3 text-xs font-bold rounded-xl shadow-md transition-all ${
              passBalance > 0
                ? 'bg-[#E5584F] hover:bg-rose-600 text-white active:scale-95'
                : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {passBalance > 0 ? 'Use Pass & Exit' : 'No Passes Left'}
          </button>
        </div>
      </div>
    </div>
  );
};
