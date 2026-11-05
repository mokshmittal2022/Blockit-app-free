import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Monitor,
  Vibrate,
  BellRing,
  ShieldCheck,
  ShieldAlert,
  ChevronRight,
  Ticket,
  Cloud,
  Lock,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { ThemeMode, UserSettings } from '../../types';
import { triggerHapticTick, triggerHeavyHaptic } from '../../services/haptics';

interface Props {
  settings: UserSettings;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onRequestAccessibilityDisclosure: () => void;
}

export const SettingsScreen: React.FC<Props> = ({
  settings,
  onUpdateSettings,
  onRequestAccessibilityDisclosure
}) => {
  const [showPassModal, setShowPassModal] = useState(false);
  const [cloudSynced, setCloudSynced] = useState(false);

  const handleThemeChange = (mode: ThemeMode) => {
    triggerHapticTick(1400);
    onUpdateSettings({ themeMode: mode });
  };

  const toggleHaptics = () => {
    const next = !settings.hapticFeedback;
    triggerHapticTick(1200);
    onUpdateSettings({ hapticFeedback: next });
  };

  const toggleStreakReminders = () => {
    triggerHapticTick(1200);
    onUpdateSettings({ streakReminders: !settings.streakReminders });
  };

  return (
    <div className="flex flex-col justify-between h-full px-5 py-4 select-none overflow-y-auto font-body">
      {/* Header */}
      <div className="mb-3">
        <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white tracking-tight">
          Settings
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Full dark theme, physical switches, zero distractions.
        </p>
      </div>

      <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
        {/* Retro Pixel Art Theme Switcher Card (Matching Image 1) */}
        <div className="bg-white dark:bg-[#16253B] rounded-[24px] p-4.5 border border-slate-200/90 dark:border-[#243B5A] shadow-sm">
          {/* Pixel-art glyphs row */}
          <div className="flex justify-center items-center gap-8 py-2 text-[#F2B84B]">
            <Sun className="w-6 h-6 stroke-[2]" />
            <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
              <div className="w-2.5 h-4 bg-current rounded-l-full mr-auto" />
            </div>
            <BellRing className="w-6 h-6 stroke-[2]" />
          </div>

          <div className="mt-3 flex bg-slate-100 dark:bg-[#0F1B2D] p-1 rounded-2xl border border-slate-200 dark:border-[#243B5A]">
            <button
              onClick={() => handleThemeChange('light')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                settings.themeMode === 'light'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
              Light
            </button>
            <button
              onClick={() => handleThemeChange('system')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                settings.themeMode === 'system'
                  ? 'bg-white dark:bg-[#16253B] text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              System
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                settings.themeMode === 'dark'
                  ? 'bg-[#16253B] text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-white'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
              Dark
            </button>
          </div>
        </div>

        {/* Tactile Physical Switches Card (Matching Image 1) */}
        <div className="bg-white dark:bg-[#16253B] rounded-[24px] p-4.5 border border-slate-200/90 dark:border-[#243B5A] shadow-sm space-y-4">
          {/* Haptic Feedback Switch */}
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-white">
                Haptic Feedback
              </h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5 leading-relaxed">
                Enable a slight vibration during interactions with the interface
              </p>
            </div>
            <button
              onClick={toggleHaptics}
              className={`w-12 h-7 rounded-full p-1 transition-colors relative shrink-0 ${
                settings.hapticFeedback
                  ? 'bg-[#1FB5A8]'
                  : 'bg-slate-300 dark:bg-[#243B5A]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  settings.hapticFeedback ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="h-[1px] bg-slate-100 dark:bg-[#243B5A]/60" />

          {/* Streak Reminders Switch */}
          <div className="flex items-center justify-between">
            <div className="pr-4">
              <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-white">
                Streak reminders
              </h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5 leading-relaxed">
                An evening nudge if you haven't done at least one minute of session today
              </p>
            </div>
            <button
              onClick={toggleStreakReminders}
              className={`w-12 h-7 rounded-full p-1 transition-colors relative shrink-0 ${
                settings.streakReminders
                  ? 'bg-[#1FB5A8]'
                  : 'bg-slate-300 dark:bg-[#243B5A]'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                  settings.streakReminders ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Accessibility Service Setup Guide Card */}
        <div
          onClick={onRequestAccessibilityDisclosure}
          className="bg-white dark:bg-[#16253B] rounded-[24px] p-4.5 border border-slate-200/90 dark:border-[#243B5A] shadow-sm flex items-center justify-between cursor-pointer hover:border-teal-500/40 transition-all active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                settings.accessibilityConsent
                  ? 'bg-teal-500/10 text-[#1FB5A8]'
                  : 'bg-amber-500/10 text-[#F2B84B]'
              }`}
            >
              {settings.accessibilityConsent ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                Stillhour Focus Shield
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    settings.accessibilityConsent
                      ? 'bg-teal-500/20 text-[#1FB5A8]'
                      : 'bg-amber-500/20 text-[#F2B84B]'
                  }`}
                >
                  {settings.accessibilityConsent ? 'ACTIVE' : 'ACTION REQUIRED'}
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                Inspect Google Play disclosure & system permissions
              </p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </div>

        {/* Emergency Pass Store Card */}
        <div
          onClick={() => {
            triggerHapticTick(1200);
            setShowPassModal(true);
          }}
          className="bg-white dark:bg-[#16253B] rounded-[24px] p-4.5 border border-slate-200/90 dark:border-[#243B5A] shadow-sm flex items-center justify-between cursor-pointer hover:border-amber-500/40 transition-all active:scale-98"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-[#F2B84B] flex items-center justify-center">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                Emergency Passes
                <span className="text-[10px] text-[#F2B84B] font-bold font-mono">
                  {settings.emergencyPasses} Available
                </span>
              </h4>
              <p className="text-[11px] text-slate-400 dark:text-slate-400 mt-0.5">
                Earn via 7-day streak or claim backup refills
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#1FB5A8]">Refill</span>
        </div>

        {/* Cloud Backup & Privacy */}
        <div className="bg-white dark:bg-[#16253B] rounded-[24px] p-4.5 border border-slate-200/90 dark:border-[#243B5A] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cloud className="w-4 h-4 text-slate-400" />
              <div>
                <h4 className="font-heading font-bold text-xs text-slate-900 dark:text-white">
                  On-Device Storage
                </h4>
                <p className="text-[10px] text-slate-400">
                  {cloudSynced ? 'Synced to Google Drive' : '100% private on this device'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                triggerHapticTick(1400);
                setCloudSynced((prev) => !prev);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#0F1B2D] border border-slate-200 dark:border-[#243B5A] text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              {cloudSynced ? 'Connected' : 'Sign in'}
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-[#243B5A]/60 flex justify-between text-[11px] text-slate-400">
            <span>Stillhour Android Native</span>
            <span className="font-mono text-[#1FB5A8]">v1.0.0 (Compose)</span>
          </div>
        </div>
      </div>

      {/* Emergency Pass Refill Modal */}
      {showPassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-white dark:bg-[#16253B] rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#243B5A] text-center">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-[#F2B84B] flex items-center justify-center mx-auto mb-3">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white mb-1">
              Emergency Passes
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Passes allow exiting an active lock in genuine emergencies without breaking your daily streak. You earn 1 free pass every 7-day streak!
            </p>

            <div className="bg-slate-100 dark:bg-[#0F1B2D] p-3 rounded-2xl mb-4 font-mono text-sm text-[#F2B84B] font-bold">
              Current Balance: {settings.emergencyPasses} Pass(es)
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPassModal(false)}
                className="flex-1 py-3 text-xs font-bold text-slate-500 rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  triggerHeavyHaptic();
                  onUpdateSettings({ emergencyPasses: settings.emergencyPasses + 3 });
                  setShowPassModal(false);
                }}
                className="flex-1 py-3 text-xs font-bold bg-[#F2B84B] text-slate-900 rounded-xl shadow-md active:scale-95 transition-all"
              >
                Claim +3 Passes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
