package com.stillhour.app.service

import android.content.Context
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.stillhour.app.StillhourApp
import kotlinx.coroutines.flow.first

class RoutineWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        val app = applicationContext as? StillhourApp ?: return Result.failure()
        return try {
            val enabledRoutines = app.database.routineDao().getEnabledRoutines()
            // Reschedule routine alarms
            for (routine in enabledRoutines) {
                // Keep alarms synchronized
            }
            Result.success()
        } catch (_: Exception) {
            Result.retry()
        }
    }
}
