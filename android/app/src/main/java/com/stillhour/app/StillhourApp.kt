package com.stillhour.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import com.stillhour.app.data.local.AppDatabase
import com.stillhour.app.data.repository.FocusRepository
import com.stillhour.app.data.repository.SettingsRepository

class StillhourApp : Application() {

    lateinit var database: AppDatabase
        private set
    lateinit var focusRepository: FocusRepository
        private set
    lateinit var settingsRepository: SettingsRepository
        private set

    companion object {
        const val FOCUS_CHANNEL_ID = "stillhour_focus_channel"
        const val ROUTINE_CHANNEL_ID = "stillhour_routine_channel"

        lateinit var instance: StillhourApp
            private set
    }

    override fun onCreate() {
        super.onCreate()
        instance = this

        database = AppDatabase.getDatabase(this)
        settingsRepository = SettingsRepository(this)
        focusRepository = FocusRepository(
            sessionDao = database.focusSessionDao(),
            routineDao = database.routineDao(),
            settingsRepository = settingsRepository
        )

        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            // Active session low-priority channel
            val focusChannel = NotificationChannel(
                FOCUS_CHANNEL_ID,
                getString(R.string.notification_channel_name),
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = getString(R.string.notification_channel_desc)
                setShowBadge(false)
            }

            // Routine alert channel
            val routineChannel = NotificationChannel(
                ROUTINE_CHANNEL_ID,
                getString(R.string.notification_routine_channel),
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = getString(R.string.notification_routine_desc)
                enableVibration(true)
            }

            notificationManager.createNotificationChannel(focusChannel)
            notificationManager.createNotificationChannel(routineChannel)
        }
    }
}
