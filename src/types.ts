export type AppTab = 'focus' | 'stats' | 'routines' | 'settings' | 'skyline' | 'code';

export type ThemeMode = 'light' | 'dark' | 'system';

export type AmbientSound = 'off' | 'rain' | 'white-noise';

export type StatsPeriod = 'day' | 'month' | 'year';

export interface FocusSession {
  id: string;
  startTime: number;
  endTime: number;
  targetDurationMinutes: number;
  actualDurationMinutes: number;
  status: 'completed' | 'interrupted_emergency' | 'cancelled';
  dateString: string; // YYYY-MM-DD
  usedEmergencyPass: boolean;
}

export interface Routine {
  id: string;
  name: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  daysOfWeek: number[]; // 1 = Monday ... 7 = Sunday
  isEnabled: boolean;
  headsUpMinutes: number;
}

export interface EssentialApp {
  id: string;
  name: string;
  packageName: string;
  icon: string;
  isEmergencyDialer?: boolean;
  isAllowed: boolean;
}

export interface UserSettings {
  themeMode: ThemeMode;
  hapticFeedback: boolean;
  streakReminders: boolean;
  emergencyPasses: number;
  allowedAppIds: string[];
  accessibilityConsent: boolean;
}

export interface AndroidFileRecord {
  path: string;
  name: string;
  language: string;
  category: 'manifest' | 'gradle' | 'service' | 'data' | 'viewmodel' | 'compose' | 'res';
  content: string;
}
