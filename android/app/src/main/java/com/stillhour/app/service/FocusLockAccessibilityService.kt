package com.stillhour.app.service

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.stillhour.app.StillhourApp
import com.stillhour.app.ui.screens.ActiveSessionActivity
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first

/**
 * FocusLockAccessibilityService
 *
 * CRITICAL SAFETY & PRIVACY GUARANTEE:
 * 1. ONLY inspects the event's packageName when a session is active.
 * 2. NEVER reads screen content, UI text, keystrokes, or accessibility nodes.
 * 3. Does NOTHING when no focus session is active.
 * 4. Emergency dialer and telecom system packages are hard-whitelisted and NEVER blocked.
 */
class FocusLockAccessibilityService : AccessibilityService() {

    private val serviceScope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    // Hard-coded system safety package names that must NEVER be blocked
    private val safetyWhitelist = setOf(
        "com.android.server.telecom",
        "com.google.android.dialer",
        "com.android.phone",
        "com.android.emergency",
        "com.stillhour.app"
    )

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            return
        }

        val targetPackage = event.packageName?.toString() ?: return

        // Always allow our own app and emergency dialer
        if (safetyWhitelist.contains(targetPackage)) {
            return
        }

        // Check if an active session is currently running
        serviceScope.launch {
            try {
                val app = application as? StillhourApp ?: return@launch
                val settingsRepo = app.settingsRepository

                val activeEndTime = settingsRepo.activeSessionEndTimeFlow.first()
                if (activeEndTime == null || System.currentTimeMillis() >= activeEndTime) {
                    // No active session: do strictly nothing!
                    return@launch
                }

                // Session is active! Check if target package is in user-allowed essentials
                val allowedPackages = settingsRepo.allowedPackagesFlow.first()
                if (!allowedPackages.contains(targetPackage)) {
                    // Distracting app opened! Redirect user immediately back to ActiveSessionActivity
                    Log.d("FocusLock", "Blocking unauthorized app: $targetPackage - redirecting to Stillhour Lock")
                    withContext(Dispatchers.Main) {
                        val lockIntent = Intent(applicationContext, ActiveSessionActivity::class.java).apply {
                            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT or Intent.FLAG_ACTIVITY_SINGLE_TOP)
                            putExtra("BLOCKED_APP_PACKAGE", targetPackage)
                        }
                        startActivity(lockIntent)
                    }
                }
            } catch (e: Exception) {
                Log.e("FocusLock", "Error in accessibility event processing", e)
            }
        }
    }

    override fun onInterrupt() {
        // Accessibility service interrupted by system
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }
}
