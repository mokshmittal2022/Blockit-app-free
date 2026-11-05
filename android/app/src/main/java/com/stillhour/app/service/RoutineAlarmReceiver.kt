package com.stillhour.app.service

import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.stillhour.app.MainActivity
import com.stillhour.app.R
import com.stillhour.app.StillhourApp
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.util.Calendar

class RoutineAlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val routineId = intent.getLongExtra("ROUTINE_ID", -1L)
        val routineName = intent.getStringExtra("ROUTINE_NAME") ?: "Focus Routine"
        val isHeadsUp = intent.getBooleanExtra("IS_HEADS_UP", false)

        val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (isHeadsUp) {
            // 1-minute advance notification
            val openIntent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val pendingIntent = PendingIntent.getActivity(
                context,
                routineId.toInt(),
                openIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val notification = NotificationCompat.Builder(context, StillhourApp.ROUTINE_CHANNEL_ID)
                .setContentTitle("Focus Session Starting in 1 Minute")
                .setContentText("$routineName is scheduled to lock in 60 seconds.")
                .setSmallIcon(R.drawable.ic_launcher_foreground)
                .setAutoCancel(true)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent)
                .build()

            notificationManager.notify((routineId + 2000).toInt(), notification)
        } else {
            // Auto-start routine session if today matches day of week
            val calendar = Calendar.getInstance()
            val dayOfWeek = calendar.get(Calendar.DAY_OF_WEEK) // 1=Sun, 2=Mon...
            // Convert to 1=Mon .. 7=Sun
            val convertedDay = if (dayOfWeek == Calendar.SUNDAY) 7 else dayOfWeek - 1

            val app = context.applicationContext as? StillhourApp ?: return
            CoroutineScope(Dispatchers.IO).launch {
                val routine = app.database.routineDao().getRoutineById(routineId)
                if (routine != null && routine.isEnabled && routine.isDayActive(convertedDay)) {
                    val durationMin = calculateDuration(routine.startHour, routine.startMinute, routine.endHour, routine.endMinute)
                    val sessionId = app.focusRepository.startSession(durationMin)
                    val endTime = System.currentTimeMillis() + (durationMin * 60 * 1000L)
                    FocusForegroundService.start(context, endTime, durationMin, sessionId)
                }
            }
        }
    }

    private fun calculateDuration(sh: Int, sm: Int, eh: Int, em: Int): Int {
        val startTotal = sh * 60 + sm
        val endTotal = eh * 60 + em
        val diff = if (endTotal >= startTotal) endTotal - startTotal else (24 * 60 - startTotal + endTotal)
        return if (diff > 0) diff else 25
    }
}
