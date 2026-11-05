/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { PhoneFrame } from './components/PhoneFrame';
import { BottomNav } from './components/BottomNav';
import { FocusScreen } from './components/screens/FocusScreen';
import { ActiveSessionScreen } from './components/screens/ActiveSessionScreen';
import { StatsScreen } from './components/screens/StatsScreen';
import { StreakSkylineScreen } from './components/screens/StreakSkylineScreen';
import { RoutinesScreen } from './components/screens/RoutinesScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { CodeExplorerScreen } from './components/screens/CodeExplorerScreen';
import { AccessibilityDisclosureModal } from './components/modals/AccessibilityDisclosureModal';
import {
  AppTab,
  FocusSession,
  Routine,
  UserSettings,
  EssentialApp
} from './types';
import {
  getStoredSettings,
  saveSettings,
  getStoredActiveSession,
  saveActiveSession,
  getStoredRoutines,
  saveRoutines,
  getStoredSessionsHistory,
  addCompletedSession,
  DEFAULT_ESSENTIAL_APPS
} from './services/storage';
import { setHapticsEnabled, triggerHeavyHaptic, triggerHapticTick } from './services/haptics';

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(getStoredSettings());
  const [activeSession, setActiveSession] = useState<FocusSession | null>(getStoredActiveSession());
  const [currentTab, setCurrentTab] = useState<AppTab>('focus');
  const [routines, setRoutines] = useState<Routine[]>(getStoredRoutines());
  const [sessionsHistory, setSessionsHistory] = useState<FocusSession[]>(getStoredSessionsHistory());
  const [allowedApps, setAllowedApps] = useState<EssentialApp[]>(DEFAULT_ESSENTIAL_APPS);
  const [isAccessibilityModalOpen, setIsAccessibilityModalOpen] = useState(false);

  // Synchronize haptics
  useEffect(() => {
    setHapticsEnabled(settings.hapticFeedback);
    saveSettings(settings);
  }, [settings]);

  // Synchronize active session to storage
  useEffect(() => {
    saveActiveSession(activeSession);
  }, [activeSession]);

  // Synchronize routines to storage
  useEffect(() => {
    saveRoutines(routines);
  }, [routines]);

  // Calculate live streak (default 254 matching the screenshot)
  const streakDays = 254 + sessionsHistory.filter((s) => s.status === 'completed').length;

  const handleStartSession = (durationMinutes: number) => {
    triggerHeavyHaptic();
    const now = Date.now();
    const endTime = now + durationMinutes * 60 * 1000;
    const todayStr = new Date().toISOString().split('T')[0];

    const newSession: FocusSession = {
      id: `session-${now}`,
      startTime: now,
      endTime,
      targetDurationMinutes: durationMinutes,
      actualDurationMinutes: durationMinutes,
      status: 'completed',
      dateString: todayStr,
      usedEmergencyPass: false
    };

    setActiveSession(newSession);
  };

  const handleSessionComplete = () => {
    if (!activeSession) return;
    triggerHeavyHaptic();
    addCompletedSession(activeSession);
    setSessionsHistory(getStoredSessionsHistory());
    setActiveSession(null);
  };

  const handleExitWithEmergencyPass = () => {
    if (!activeSession || settings.emergencyPasses <= 0) return;
    triggerHeavyHaptic();
    const elapsedMinutes = Math.max(
      1,
      Math.floor((Date.now() - activeSession.startTime) / 60000)
    );

    const interruptedSession: FocusSession = {
      ...activeSession,
      endTime: Date.now(),
      actualDurationMinutes: elapsedMinutes,
      status: 'interrupted_emergency',
      usedEmergencyPass: true
    };

    addCompletedSession(interruptedSession);
    setSessionsHistory(getStoredSessionsHistory());

    // Deduct 1 Emergency Pass
    setSettings((prev) => ({
      ...prev,
      emergencyPasses: Math.max(0, prev.emergencyPasses - 1)
    }));

    setActiveSession(null);
  };

  const handleExtend15Minutes = () => {
    if (!activeSession) return;
    setActiveSession((prev) =>
      prev
        ? {
            ...prev,
            endTime: prev.endTime + 15 * 60 * 1000,
            targetDurationMinutes: prev.targetDurationMinutes + 15
          }
        : null
    );
  };

  const handleToggleAllowedApp = (appId: string) => {
    setSettings((prev) => {
      const exists = prev.allowedAppIds.includes(appId);
      const newAllowed = exists
        ? prev.allowedAppIds.filter((id) => id !== appId)
        : [...prev.allowedAppIds, appId];
      return { ...prev, allowedAppIds: newAllowed };
    });
  };

  const handleToggleRoutine = (id: string) => {
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isEnabled: !r.isEnabled } : r))
    );
  };

  const handleSaveRoutine = (newRoutine: Routine) => {
    setRoutines((prev) => [newRoutine, ...prev]);
  };

  const handleDeleteRoutine = (id: string) => {
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <PhoneFrame
      themeMode={settings.themeMode}
      isLockActive={activeSession !== null}
      isCodeViewActive={currentTab === 'code'}
      onToggleCodeView={() => {
        triggerHapticTick(1400);
        setCurrentTab((prev) => (prev === 'code' ? 'focus' : 'code'));
      }}
    >
      {/* If Active Session is running, render Fullscreen Lock Screen */}
      {activeSession ? (
        <ActiveSessionScreen
          session={activeSession}
          emergencyPasses={settings.emergencyPasses}
          allowedAppIds={settings.allowedAppIds}
          onSessionComplete={handleSessionComplete}
          onExitWithEmergencyPass={handleExitWithEmergencyPass}
          onExtend15Minutes={handleExtend15Minutes}
        />
      ) : (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Main Screens Content */}
          <div className="flex-1 overflow-hidden">
            {currentTab === 'focus' && (
              <FocusScreen
                emergencyPasses={settings.emergencyPasses}
                streakDays={streakDays}
                allowedApps={allowedApps}
                allowedAppIds={settings.allowedAppIds}
                onToggleAllowedApp={handleToggleAllowedApp}
                onStartSession={handleStartSession}
                onOpenSkyline={() => setCurrentTab('skyline')}
              />
            )}

            {currentTab === 'stats' && (
              <StatsScreen
                sessionsHistory={sessionsHistory}
                onOpenSkyline={() => setCurrentTab('skyline')}
              />
            )}

            {currentTab === 'skyline' && (
              <StreakSkylineScreen
                streakDays={streakDays}
                onBack={() => setCurrentTab('stats')}
              />
            )}

            {currentTab === 'routines' && (
              <RoutinesScreen
                routines={routines}
                onToggleRoutine={handleToggleRoutine}
                onSaveRoutine={handleSaveRoutine}
                onDeleteRoutine={handleDeleteRoutine}
              />
            )}

            {currentTab === 'settings' && (
              <SettingsScreen
                settings={settings}
                onUpdateSettings={(newVals) =>
                  setSettings((prev) => ({ ...prev, ...newVals }))
                }
                onRequestAccessibilityDisclosure={() =>
                  setIsAccessibilityModalOpen(true)
                }
              />
            )}

            {currentTab === 'code' && <CodeExplorerScreen />}
          </div>

          {/* Bottom Pill Navigation Bar (Only visible when unlocked) */}
          {currentTab !== 'code' && (
            <BottomNav
              currentTab={currentTab}
              onTabChange={(tab) => setCurrentTab(tab)}
            />
          )}
        </div>
      )}

      {/* Prominent Disclosure Modal for Accessibility Service */}
      <AccessibilityDisclosureModal
        isOpen={isAccessibilityModalOpen}
        onConfirm={() => {
          setSettings((prev) => ({ ...prev, accessibilityConsent: true }));
          setIsAccessibilityModalOpen(false);
        }}
        onDismiss={() => setIsAccessibilityModalOpen(false)}
      />
    </PhoneFrame>
  );
}
