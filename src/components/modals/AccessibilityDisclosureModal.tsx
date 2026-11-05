import React from 'react';
import { Shield, CheckCircle2, Lock, EyeOff, Radio, PhoneCall } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onConfirm: () => void;
  onDismiss: () => void;
}

export const AccessibilityDisclosureModal: React.FC<Props> = ({
  isOpen,
  onConfirm,
  onDismiss
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white dark:bg-[#16253B] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#243B5A]">
        {/* Shield Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-[#1FB5A8]/20 flex items-center justify-center text-[#1FB5A8]">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
              Accessibility Permission
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Google Play Prominent Disclosure
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          Stillhour requires the <span className="font-semibold text-slate-900 dark:text-white">Accessibility Service</span> exclusively to detect when a distracting application is brought to the foreground during a locked focus session.
        </p>

        {/* Guarantees Box */}
        <div className="bg-slate-100 dark:bg-[#0F1B2D] rounded-2xl p-3.5 space-y-2.5 mb-5 border border-slate-200/60 dark:border-[#243B5A]/60">
          <div className="flex items-start gap-2.5">
            <Radio className="w-4 h-4 text-[#1FB5A8] shrink-0 mt-0.5" />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              <strong>Active only during focus sessions:</strong> strictly idle when no timer is running.
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <EyeOff className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              <strong>Zero screen reading:</strong> does not inspect text, keystrokes, personal chats, or UI elements.
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-[#F2B84B] shrink-0 mt-0.5" />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              <strong>No data collection:</strong> 100% on-device. No telemetry, logs, or network transmissions.
            </span>
          </div>

          <div className="flex items-start gap-2.5">
            <PhoneCall className="w-4 h-4 text-[#E5584F] shrink-0 mt-0.5" />
            <span className="text-xs text-slate-700 dark:text-slate-300">
              <strong>Emergency calls guaranteed:</strong> Phone dialer and 911/112 are unconditionally whitelisted.
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onDismiss}
            className="flex-1 py-3 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#1E324E] rounded-xl transition-colors"
          >
            Not Now
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 text-xs font-bold text-white bg-[#1FB5A8] hover:bg-[#1aa195] rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            Enable Shield
          </button>
        </div>
      </div>
    </div>
  );
};
