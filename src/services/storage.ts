import { FocusSession, Routine, UserSettings, EssentialApp } from '../types';

const STORAGE_KEYS = {
  SETTINGS: 'stillhour_settings',
  ACTIVE_SESSION: 'stillhour_active_session',
  SESSIONS_HISTORY: 'stillhour_sessions_history',
  ROUTINES: 'stillhour_routines',
  STREAK_OVERRIDE: 'stillhour_streak_override'
};

export const DEFAULT_ESSENTIAL_APPS: EssentialApp[] = [
  { id: 'phone', name: 'Phone Dialer', packageName: 'com.google.android.dialer', icon: 'Phone', isEmergencyDialer: true, isAllowed: true },
  { id: 'maps', name: 'Google Maps', packageName: 'com.google.android.apps.maps', icon: 'MapPin', isAllowed: true },
  { id: 'messages', name: 'Messages', packageName: 'com.google.android.apps.messaging', icon: 'MessageSquare', isAllowed: true },
  { id: 'mail', name: 'Gmail', packageName: 'com.google.android.gm', icon: 'Mail', isAllowed: true },
  { id: 'music', name: 'Music / Audio', packageName: 'com.spotify.music', icon: 'Music', isAllowed: false },
  { id: 'calc', name: 'Calculator', packageName: 'com.google.android.calculator', icon: 'Calculator', isAllowed: false },
  { id: 'notes', name: 'Keep Notes', packageName: 'com.google.android.keep', icon: 'FileText', isAllowed: false }
];

export const DEFAULT_SETTINGS: UserSettings = {
  themeMode: 'dark',
  hapticFeedback: true,
  streakReminders: true,
  emergencyPasses: 3,
  allowedAppIds: ['phone', 'maps', 'messages', 'mail'],
  accessibilityConsent: true
};

export const DEFAULT_ROUTINES: Routine[] = [
  {
    id: 'routine-1',
    name: 'Night Silence',
    startHour: 0,
    startMinute: 15,
    endHour: 7,
    endMinute: 45,
    daysOfWeek: [1, 2, 3, 4, 5],
    isEnabled: true,
    headsUpMinutes: 1
  },
  {
    id: 'routine-2',
    name: 'Deep Morning Work',
    startHour: 9,
    startMinute: 15,
    endHour: 12,
    endMinute: 0,
    daysOfWeek: [1, 2, 3, 4, 5],
    isEnabled: true,
    headsUpMinutes: 1
  },
  {
    id: 'routine-3',
    name: 'Afternoon Flow',
    startHour: 15,
    startMinute: 30,
    endHour: 17,
    endMinute: 30,
    daysOfWeek: [1, 2, 3, 4],
    isEnabled: false,
    headsUpMinutes: 1
  }
];

export const getStoredSettings = (): UserSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (raw) return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {}
  return DEFAULT_SETTINGS;
};

export const saveSettings = (settings: UserSettings) => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch {}
};

export const getStoredActiveSession = (): FocusSession | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION);
    if (raw) {
      const parsed: FocusSession = JSON.parse(raw);
      if (parsed.endTime > Date.now()) {
        return parsed;
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
      }
    }
  } catch {}
  return null;
};

export const saveActiveSession = (session: FocusSession | null) => {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    }
  } catch {}
};

export const getStoredRoutines = (): Routine[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROUTINES);
    if (raw) return JSON.parse(raw);
  } catch {}
  return DEFAULT_ROUTINES;
};

export const saveRoutines = (routines: Routine[]) => {
  try {
    localStorage.setItem(STORAGE_KEYS.ROUTINES, JSON.stringify(routines));
  } catch {}
};

export const getStoredSessionsHistory = (): FocusSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS_HISTORY);
    if (raw) return JSON.parse(raw);
  } catch {}
  // Generate realistic past sessions for charts
  return generateInitialHistory();
};

export const addCompletedSession = (session: FocusSession) => {
  try {
    const history = getStoredSessionsHistory();
    history.unshift(session);
    localStorage.setItem(STORAGE_KEYS.SESSIONS_HISTORY, JSON.stringify(history));
  } catch {}
};

function generateInitialHistory(): FocusSession[] {
  const history: FocusSession[] = [];
  const now = Date.now();
  for (let i = 0; i < 30; i++) {
    const time = now - i * 86400000;
    const date = new Date(time);
    const dateStr = date.toISOString().split('T')[0];
    const duration = [25, 45, 60, 90, 120, 180][i % 6];
    history.push({
      id: `seed-session-${i}`,
      startTime: time - duration * 60000,
      endTime: time,
      targetDurationMinutes: duration,
      actualDurationMinutes: duration,
      status: 'completed',
      dateString: dateStr,
      usedEmergencyPass: false
    });
  }
  return history;
}
