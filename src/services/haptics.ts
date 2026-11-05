import { audioSynth } from './audioSynthesizer';

let hapticEnabled = true;

export const setHapticsEnabled = (enabled: boolean) => {
  hapticEnabled = enabled;
};

export const triggerHapticTick = (pitch = 1200) => {
  if (!hapticEnabled) return;
  audioSynth.playHapticTick(pitch);
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate(8);
    } catch {}
  }
};

export const triggerHeavyHaptic = () => {
  if (!hapticEnabled) return;
  audioSynth.playSlideLockSnap();
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([20, 40, 20]);
    } catch {}
  }
};

export const triggerWarningHaptic = () => {
  if (!hapticEnabled) return;
  audioSynth.playWarningChime();
  if ('vibrate' in navigator) {
    try {
      navigator.vibrate([40, 60, 40]);
    } catch {}
  }
};
