package com.stillhour.app.service

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.stillhour.app.R
import com.stillhour.app.StillhourApp
import com.stillhour.app.ui.screens.ActiveSessionActivity
import kotlinx.coroutines.*
import java.util.Locale

class FocusForegroundService : Service() {

    private val serviceJob = SupervisorJob()
    private val serviceScope = CoroutineScope(Dispatchers.Main + serviceJob)
    private var timerJob: Job? = null

    companion object {
        const val NOTIFICATION_ID = 1001
        const val ACTION_START = "ACTION_START_FOCUS"
        const val ACTION_STOP = "ACTION_STOP_FOCUS"
        const val ACTION_EXTEND_15 = "ACTION_EXTEND_15"
        const val EXTRA_END_TIME = "EXTRA_END_TIME"
        const val EXTRA_TARGET_MIN = "EXTRA_TARGET_MIN"
        const val EXTRA_SESSION_ID = "EXTRA_SESSION_ID"

        fun start(context: Context, endTime: Long, targetMin: Int, sessionId: Long) {
            val intent = Intent(context, FocusForegroundService::class.java).apply {
                action = ACTION_START
                putExtra(EXTRA_END_TIME, endTime)
                putExtra(EXTRA_TARGET_MIN, targetMin)
                putExtra(EXTRA_SESSION_ID, sessionId)
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }

        fun stop(context: Context) {
            val intent = Intent(context, FocusForegroundService::class.java).apply {
                action = ACTION_STOP
            }
            context.startService(intent)
        }
    }

    private var sessionEndTime: Long = 0L
    private var targetMinutes: Int = 25
    private var currentSessionId: Long = 0L

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                sessionEndTime = intent.getLongExtra(EXTRA_END_TIME, System.currentTimeMillis() + 25 * 60 * 1000L)
                targetMinutes = intent.getIntExtra(EXTRA_TARGET_MIN, 25)
                currentSessionId = intent.getLongExtra(EXTRA_SESSION_ID, 0L)
                startForeground(NOTIFICATION_ID, buildNotification("Focus session running", "Session locked"))
                startTimerTicker()
            }
            ACTION_EXTEND_15 -> {
                sessionEndTime += 15 * 60 * 1000L
                updateNotification()
            }
            ACTION_STOP -> {
                stopTimerTicker()
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
            }
        }
        return START_STICKY
    }

    private fun startTimerTicker() {
        timerJob?.cancel()
        timerJob = serviceScope.launch {
            while (isActive) {
                val remainingMillis = sessionEndTime - System.currentTimeMillis()
                if (remainingMillis <= 0) {
                    onSessionCompleted()
                    break
                }
                updateNotification()
                delay(1000L)
            }
        }
    }

    private fun stopTimerTicker() {
        timerJob?.cancel()
        timerJob = null
    }

    private fun updateNotification() {
        val remainingMillis = (sessionEndTime - System.currentTimeMillis()).coerceAtLeast(0)
        val minutes = remainingMillis / 1000 / 60
        val seconds = (remainingMillis / 1000) % 60
        val timeString = String.format(Locale.getDefault(), "%02d:%02d remaining", minutes, seconds)
        val notification = buildNotification("Focus session running", timeString)
        val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        manager.notify(NOTIFICATION_ID, notification)
    }

    private fun buildNotification(title: String, text: String): Notification {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, ActiveSessionActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, StillhourApp.FOCUS_CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(text)
            .setSmallIcon(R.drawable.ic_launcher_foreground)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setContentIntent(pendingIntent)
            .build()
    }

    private fun onSessionCompleted() {
        serviceScope.launch {
            val app = application as? StillhourApp
            app?.focusRepository?.completeSession(currentSessionId, targetMinutes)
            stopForeground(STOP_FOREGROUND_REMOVE)
            stopSelf()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
    }
}
