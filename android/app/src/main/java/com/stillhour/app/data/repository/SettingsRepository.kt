package com.stillhour.app.data.repository

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.*
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "stillhour_settings")

enum class AppThemeMode {
    LIGHT,
    DARK,
    SYSTEM
}

class SettingsRepository(private val context: Context) {

    private object PreferencesKeys {
        val THEME_MODE = stringPreferencesKey("theme_mode")
        val HAPTIC_FEEDBACK = booleanPreferencesKey("haptic_feedback")
        val STREAK_REMINDERS = booleanPreferencesKey("streak_reminders")
        val EMERGENCY_PASSES = intPreferencesKey("emergency_passes")
        val ALLOWED_PACKAGES = stringSetPreferencesKey("allowed_packages")
        val ACCESSIBILITY_CONSENT = booleanPreferencesKey("accessibility_consent")
        val ACTIVE_SESSION_END_TIME = longPreferencesKey("active_session_end_time")
        val ACTIVE_SESSION_TARGET_MIN = intPreferencesKey("active_session_target_min")
        val ACTIVE_SESSION_ID = longPreferencesKey("active_session_id")
    }

    // Default essential package names (Dialer, Maps, SMS, Clock)
    private val defaultAllowedPackages = setOf(
        "com.google.android.dialer",
        "com.android.phone",
        "com.google.android.apps.maps",
        "com.google.android.apps.messaging",
        "com.google.android.gm"
    )

    val themeModeFlow: Flow<AppThemeMode> = context.dataStore.data.map { prefs ->
        val raw = prefs[PreferencesKeys.THEME_MODE] ?: AppThemeMode.DARK.name
        try {
            AppThemeMode.valueOf(raw)
        } catch (_: Exception) {
            AppThemeMode.DARK
        }
    }

    val hapticFeedbackFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[PreferencesKeys.HAPTIC_FEEDBACK] ?: true
    }

    val streakRemindersFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[PreferencesKeys.STREAK_REMINDERS] ?: true
    }

    val emergencyPassesFlow: Flow<Int> = context.dataStore.data.map { prefs ->
        prefs[PreferencesKeys.EMERGENCY_PASSES] ?: 1 // User starts with 1 pass
    }

    val allowedPackagesFlow: Flow<Set<String>> = context.dataStore.data.map { prefs ->
        prefs[PreferencesKeys.ALLOWED_PACKAGES] ?: defaultAllowedPackages
    }

    val accessibilityConsentFlow: Flow<Boolean> = context.dataStore.data.map { prefs ->
        prefs[PreferencesKeys.ACCESSIBILITY_CONSENT] ?: false
    }

    val activeSessionEndTimeFlow: Flow<Long?> = context.dataStore.data.map { prefs ->
        val time = prefs[PreferencesKeys.ACTIVE_SESSION_END_TIME] ?: 0L
        if (time > System.currentTimeMillis()) time else null
    }

    val activeSessionTargetMinutesFlow: Flow<Int> = context.dataStore.data.map { prefs ->
        prefs[PreferencesKeys.ACTIVE_SESSION_TARGET_MIN] ?: 25
    }

    suspend fun setThemeMode(mode: AppThemeMode) {
        context.dataStore.edit { it[PreferencesKeys.THEME_MODE] = mode.name }
    }

    suspend fun setHapticFeedback(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.HAPTIC_FEEDBACK] = enabled }
    }

    suspend fun setStreakReminders(enabled: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.STREAK_REMINDERS] = enabled }
    }

    suspend fun setEmergencyPasses(passes: Int) {
        context.dataStore.edit { it[PreferencesKeys.EMERGENCY_PASSES] = passes.coerceAtLeast(0) }
    }

    suspend fun useEmergencyPass(): Boolean {
        var used = false
        context.dataStore.edit { prefs ->
            val current = prefs[PreferencesKeys.EMERGENCY_PASSES] ?: 1
            if (current > 0) {
                prefs[PreferencesKeys.EMERGENCY_PASSES] = current - 1
                used = true
            }
        }
        return used
    }

    suspend fun addEmergencyPass(count: Int = 1) {
        context.dataStore.edit { prefs ->
            val current = prefs[PreferencesKeys.EMERGENCY_PASSES] ?: 1
            prefs[PreferencesKeys.EMERGENCY_PASSES] = current + count
        }
    }

    suspend fun setAllowedPackages(packages: Set<String>) {
        context.dataStore.edit { it[PreferencesKeys.ALLOWED_PACKAGES] = packages }
    }

    suspend fun setAccessibilityConsent(consented: Boolean) {
        context.dataStore.edit { it[PreferencesKeys.ACCESSIBILITY_CONSENT] = consented }
    }

    suspend fun setActiveSession(endTimeMillis: Long, targetMinutes: Int, sessionId: Long) {
        context.dataStore.edit {
            it[PreferencesKeys.ACTIVE_SESSION_END_TIME] = endTimeMillis
            it[PreferencesKeys.ACTIVE_SESSION_TARGET_MIN] = targetMinutes
            it[PreferencesKeys.ACTIVE_SESSION_ID] = sessionId
        }
    }

    suspend fun clearActiveSession() {
        context.dataStore.edit {
            it.remove(PreferencesKeys.ACTIVE_SESSION_END_TIME)
            it.remove(PreferencesKeys.ACTIVE_SESSION_TARGET_MIN)
            it.remove(PreferencesKeys.ACTIVE_SESSION_ID)
        }
    }
}
