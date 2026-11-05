package com.stillhour.app.data.repository

import com.stillhour.app.data.local.dao.FocusSessionDao
import com.stillhour.app.data.local.dao.RoutineDao
import com.stillhour.app.data.local.entity.FocusSessionEntity
import com.stillhour.app.data.local.entity.RoutineEntity
import com.stillhour.app.data.local.entity.SessionStatus
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.text.SimpleDateFormat
import java.util.*

class FocusRepository(
    private val sessionDao: FocusSessionDao,
    private val routineDao: RoutineDao,
    val settingsRepository: SettingsRepository
) {

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())

    fun getAllSessions(): Flow<List<FocusSessionEntity>> = sessionDao.getAllSessionsFlow()
    fun getAllRoutines(): Flow<List<RoutineEntity>> = routineDao.getAllRoutinesFlow()

    suspend fun startSession(targetDurationMinutes: Int): Long {
        val now = System.currentTimeMillis()
        val endTime = now + (targetDurationMinutes * 60 * 1000L)
        val todayStr = dateFormat.format(Date(now))

        val entity = FocusSessionEntity(
            startTime = now,
            endTime = endTime,
            targetDurationMinutes = targetDurationMinutes,
            actualDurationMinutes = 0,
            status = SessionStatus.COMPLETED, // provisional until updated
            dateString = todayStr,
            usedEmergencyPass = false
        )
        val id = sessionDao.insertSession(entity)
        settingsRepository.setActiveSession(endTime, targetDurationMinutes, id)
        return id
    }

    suspend fun completeSession(sessionId: Long, actualMinutes: Int) {
        val session = FocusSessionEntity(
            id = sessionId,
            startTime = System.currentTimeMillis() - (actualMinutes * 60 * 1000L),
            endTime = System.currentTimeMillis(),
            targetDurationMinutes = actualMinutes,
            actualDurationMinutes = actualMinutes,
            status = SessionStatus.COMPLETED,
            dateString = dateFormat.format(Date()),
            usedEmergencyPass = false
        )
        sessionDao.updateSession(session)
        settingsRepository.clearActiveSession()
    }

    suspend fun interruptSessionWithEmergencyPass(sessionId: Long, elapsedMinutes: Int): Boolean {
        val hasPass = settingsRepository.useEmergencyPass()
        if (hasPass) {
            val session = FocusSessionEntity(
                id = sessionId,
                startTime = System.currentTimeMillis() - (elapsedMinutes * 60 * 1000L),
                endTime = System.currentTimeMillis(),
                targetDurationMinutes = elapsedMinutes,
                actualDurationMinutes = elapsedMinutes,
                status = SessionStatus.INTERRUPTED_EMERGENCY,
                dateString = dateFormat.format(Date()),
                usedEmergencyPass = true
            )
            sessionDao.updateSession(session)
            settingsRepository.clearActiveSession()
            return true
        }
        return false
    }

    // Streak calculation: count continuous daily focus occurrences
    val streakDaysFlow: Flow<Int> = sessionDao.getDistinctFocusDaysFlow().map { daysList ->
        calculateStreak(daysList)
    }

    private fun calculateStreak(sortedDates: List<String>): Int {
        if (sortedDates.isEmpty()) return 0
        val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
        val dateSet = sortedDates.mapNotNull {
            try { sdf.parse(it) } catch (_: Exception) { null }
        }.toSet()

        val calendar = Calendar.getInstance()
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)

        var checkDate = calendar.time
        var streak = 0

        // If today is not in set, check if yesterday was in set (streak alive today but needs focus)
        if (!dateSet.contains(checkDate)) {
            calendar.add(Calendar.DAY_OF_YEAR, -1)
            checkDate = calendar.time
            if (!dateSet.contains(checkDate)) {
                return 0 // Streak broken
            }
        }

        while (dateSet.contains(checkDate)) {
            streak++
            calendar.add(Calendar.DAY_OF_YEAR, -1)
            checkDate = calendar.time
        }

        return streak
    }

    suspend fun insertRoutine(routine: RoutineEntity): Long = routineDao.insertRoutine(routine)
    suspend fun updateRoutine(routine: RoutineEntity) = routineDao.updateRoutine(routine)
    suspend fun deleteRoutine(routine: RoutineEntity) = routineDao.deleteRoutine(routine)

    suspend fun getTotalHoursAllTime(): Float {
        val mins = sessionDao.getTotalFocusMinutesAllTime() ?: 0L
        return mins / 60f
    }

    suspend fun getLongestSession(): Int {
        return sessionDao.getLongestSessionMinutes() ?: 0
    }
}
