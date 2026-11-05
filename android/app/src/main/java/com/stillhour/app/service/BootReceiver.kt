package com.stillhour.app.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.stillhour.app.StillhourApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class BootReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED || intent.action == "android.intent.action.MY_PACKAGE_REPLACED") {
            val app = context.applicationContext as? StillhourApp ?: return
            CoroutineScope(Dispatchers.IO).launch {
                val settingsRepo = app.settingsRepository
                val endTime = settingsRepo.activeSessionEndTimeFlow.first()
                val targetMin = settingsRepo.activeSessionTargetMinutesFlow.first()

                // If a session was running when the device rebooted or updated, restore foreground service
                if (endTime != null && endTime > System.currentTimeMillis()) {
                    FocusForegroundService.start(context, endTime, targetMin, 0L)
                }
            }
        }
    }
}
