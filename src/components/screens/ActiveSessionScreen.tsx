import React, { useState, useEffect } from 'react';
import {
  CloudRain,
  VolumeX,
  Radio,
  Phone,
  MapPin,
  MessageSquare,
  Mail,
  Shield,
  Plus,
  AlertOctagon,
  Sparkles,
  Info
} from 'lucide-react';
import { SlideToConfirm } from '../controls/SlideToConfirm';
import { EmergencyPassExitModal } from '../modals/EmergencyPassExitModal';
import { MiniAppModal } from '../modals/MiniAppModal';
import { FocusSession, AmbientSound } from '../../types';
import { audioSynth } from '../../services/audioSynthesizer';
import { triggerHapticTick, triggerWarningHaptic } from '../../services/haptics';

interface Props {
  session: FocusSession;
  emergencyPasses: number;
  allowedAppIds: string[];
  onSessionComplete: () => void;
  onExitWithEmergencyPass: () => void;
  onExtend15Minutes: () => void;
}

export const ActiveSessionScreen: React.FC<Props> = ({
  session,
  emergencyPasses,
  allowedAppIds,
  onSessionComplete,
  onExitWithEmergencyPass,
  onExtend15Minutes
}) => {
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.max(0, Math.floor((session.endTime - Date.now()) / 1000))
  );
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('off');
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [activeMiniAppId, setActiveMiniAppId] = useState<string | null>(null);
  const [blockedAlertPackage, setBlockedAlertPackage] = useState<string | null>(null);

  // Timer countdown ticker
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, Math.floor((session.endTime - Date.now()) / 1000));
      setRemainingSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        audioSynth.stopAllAmbient();
        onSessionComplete();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [session.endTime, onSessionComplete]);

  // Ambient sound synthesizer lifecycle
  useEffect(() => {
    if (ambientSound === 'rain') {
      audioSynth.startRain();
    } else if (ambientSound === 'white-noise') {
      audioSynth.startWhiteNoise();
    } else {
      audioSynth.stopAllAmbient();
    }
    return () => {
      audioSynth.stopAllAmbient();
    };
  }, [ambientSound]);

  const cycleAmbient = () => {
    triggerHapticTick(1300);
    setAmbientSound((prev) => {
      if (prev === 'off') return 'rain';
      if (prev === 'rain') return 'white-noise';
      return 'off';
    });
  };

  const handleSimulateBlockedApp = (pkg: string) => {
    triggerWarningHaptic();
    setBlockedAlertPackage(pkg);
    setTimeout(() => {
      setBlockedAlertPackage(null);
    }, 3200);
  };

  const minutesPart = Math.floor(remainingSeconds / 60);
  const secondsPart = remainingSeconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  const endDate = new Date(session.endTime);
  const formattedEndTime = endDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

  return (
    <div className="relative w-full h-full bg-[#0F1B2D] text-white flex flex-col justify-between p-5 select-none overflow-hidden font-body">
      {/* Persistent Low-Priority Notification Indicator (Top banner) */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-[#16253B]/90 rounded-full border border-[#243B5A] text-[11px] text-slate-300">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#1FB5A8] animate-ping" />
          <span className="font-semibold text-slate-200">Focus session running</span>
        </div>
        <span className="font-mono text-slate-400">
          ends {formattedEndTime}
        </span>
      </div>

      {/* Blocked App Intercept Banner (Simulates Accessibility Service) */}
      {blockedAlertPackage && (
        <div className="absolute top-14 inset-x-5 z-40 bg-[#E5584F] text-white p-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
          <AlertOctagon className="w-5 h-5 shrink-0" />
          <div className="flex-1">
            <p className="text-xs font-bold leading-tight">
              App Intercepted by Stillhour Shield
            </p>
            <p className="text-[10px] opacity-90 font-mono">
              {blockedAlertPackage} blocked · Focus lock active
            </p>
          </div>
        </div>
      )}

      {/* Main Large Tabular Digital Clock (Matching Screenshot 4 & 7) */}
      <div className="flex flex-col items-center justify-center my-auto">
        <div className="w-full bg-[#16253B] rounded-[28px] p-6 border border-[#243B5A] flex flex-col items-center justify-center shadow-lg">
          <div className="font-heading font-bold text-7xl md:text-8xl tracking-tight text-white font-mono-tabular drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            {pad(minutesPart)}
          </div>
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold mt-1">
            Minutes Remaining
          </span>
        </div>

        {/* Bento Grid: Seconds Tile, Extension Tile, Ambient Tile */}
        <div className="grid grid-cols-2 gap-3 w-full mt-3">
          {/* Seconds Tile */}
          <div className="bg-[#16253B] rounded-[22px] p-4 border border-[#243B5A] flex flex-col items-center justify-center h-[100px]">
            <span className="font-heading font-bold text-4xl text-white font-mono-tabular">
              {pad(secondsPart)}
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-0.5">
              SEC
            </span>
          </div>

          {/* +15 Min Extension Tile */}
          <button
            onClick={() => {
              triggerHapticTick(1400);
              onExtend15Minutes();
            }}
            className="bg-[#16253B] hover:bg-[#1E324E] active:scale-95 transition-all rounded-[22px] p-4 border border-[#243B5A] flex flex-col items-center justify-center h-[100px] text-[#1FB5A8]"
          >
            <span className="font-heading font-bold text-3xl flex items-center">
              +15
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 mt-0.5">
              min extension
            </span>
          </button>
        </div>

        {/* Secondary Info Bento Row: Ends At & Ambient Sound */}
        <div className="grid grid-cols-2 gap-3 w-full mt-3">
          {/* Ends At Tile */}
          <div className="bg-[#16253B] rounded-[20px] p-3.5 border border-[#243B5A] flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
              ENDS AT
            </span>
            <span className="font-heading font-bold text-lg text-white">
              {formattedEndTime}
            </span>
          </div>

          {/* Ambient Sound Tile (Rain / White Noise / Off) */}
          <button
            onClick={cycleAmbient}
            className={`rounded-[20px] p-3.5 border transition-all flex items-center justify-between ${
              ambientSound !== 'off'
                ? 'bg-teal-500/10 border-[#1FB5A8] text-[#1FB5A8]'
                : 'bg-[#16253B] border-[#243B5A] text-slate-400'
            }`}
          >
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-wider font-bold">
                AMBIENT
              </span>
              <span className="font-heading font-bold text-xs uppercase text-white">
                {ambientSound === 'rain' ? 'Rain Sounds' : ambientSound === 'white-noise' ? 'White Noise' : 'Muted'}
              </span>
            </div>
            {ambientSound === 'rain' ? (
              <CloudRain className="w-5 h-5 text-[#1FB5A8] animate-pulse" />
            ) : ambientSound === 'white-noise' ? (
              <Radio className="w-5 h-5 text-[#1FB5A8] animate-pulse" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Bottom Controls Area */}
      <div className="space-y-3 pt-2">
        {/* Simulate Distracted App Launch (Test Accessibility Shield Intercept) */}
        <div className="flex items-center justify-between px-3 py-2 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs">
          <span className="text-slate-400 text-[11px]">
            Test Background Intercept:
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => handleSimulateBlockedApp('com.instagram.android')}
              className="px-2.5 py-1 rounded-lg bg-[#243B5A] hover:bg-[#1E324E] text-[10px] font-bold text-slate-200"
            >
              Open Instagram
            </button>
            <button
              onClick={() => handleSimulateBlockedApp('com.google.android.youtube')}
              className="px-2.5 py-1 rounded-lg bg-[#243B5A] hover:bg-[#1E324E] text-[10px] font-bold text-slate-200"
            >
              Open YouTube
            </button>
          </div>
        </div>

        {/* Slide to Exit with Emergency Pass */}
        <SlideToConfirm
          text="SLIDE TO EXIT"
          icon="shield"
          variant="coral"
          onConfirm={() => setIsExitModalOpen(true)}
        />

        {/* Essentials Allowed Apps Dock (Bottom bar with Maps, Phone, Messages) */}
        <div className="w-full bg-[#16253B] rounded-full py-2.5 px-6 border border-[#243B5A] flex items-center justify-around shadow-inner">
          {/* Emergency Dialer (Always allowed) */}
          <button
            onClick={() => {
              triggerHapticTick(1400);
              setActiveMiniAppId('phone');
            }}
            className="w-11 h-11 rounded-full bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 flex items-center justify-center transition-transform active:scale-90"
            title="Emergency Dialer"
          >
            <Phone className="w-5 h-5" />
          </button>

          {/* Maps (if allowed) */}
          {allowedAppIds.includes('maps') && (
            <button
              onClick={() => {
                triggerHapticTick(1400);
                setActiveMiniAppId('maps');
              }}
              className="w-11 h-11 rounded-full bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 flex items-center justify-center transition-transform active:scale-90"
              title="Google Maps"
            >
              <MapPin className="w-5 h-5" />
            </button>
          )}

          {/* Messages (if allowed) */}
          {allowedAppIds.includes('messages') && (
            <button
              onClick={() => {
                triggerHapticTick(1400);
                setActiveMiniAppId('messages');
              }}
              className="w-11 h-11 rounded-full bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 flex items-center justify-center transition-transform active:scale-90"
              title="Messages"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
          )}

          {/* Gmail / Mail (if allowed) */}
          {allowedAppIds.includes('mail') && (
            <button
              onClick={() => {
                triggerHapticTick(1400);
                setActiveMiniAppId('messages');
              }}
              className="w-11 h-11 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 flex items-center justify-center transition-transform active:scale-90"
              title="Gmail"
            >
              <Mail className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Emergency Pass Confirmation Exit Modal */}
      <EmergencyPassExitModal
        isOpen={isExitModalOpen}
        passBalance={emergencyPasses}
        onConfirm={() => {
          setIsExitModalOpen(false);
          audioSynth.stopAllAmbient();
          onExitWithEmergencyPass();
        }}
        onCancel={() => setIsExitModalOpen(false)}
      />

      {/* Mini App Overlay when user taps allowed app in dock */}
      <MiniAppModal
        appId={activeMiniAppId}
        onClose={() => setActiveMiniAppId(null)}
      />
    </div>
  );
};
