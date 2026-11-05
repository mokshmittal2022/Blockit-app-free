package com.stillhour.app.data.local.dao

import androidx.room.*
import com.stillhour.app.data.local.entity.FocusSessionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface FocusSessionDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSession(session: FocusSessionEntity): Long

    @Update
    suspend fun updateSession(session: FocusSessionEntity)

    @Query("SELECT * FROM focus_sessions ORDER BY startTime DESC")
    fun getAllSessionsFlow(): Flow<List<FocusSessionEntity>>

    @Query("SELECT * FROM focus_sessions WHERE dateString = :dateString")
    suspend fun getSessionsByDate(dateString: String): List<FocusSessionEntity>

    @Query("SELECT SUM(actualDurationMinutes) FROM focus_sessions WHERE dateString = :dateString")
    suspend fun getTotalMinutesOnDate(dateString: String): Int?

    @Query("SELECT SUM(actualDurationMinutes) FROM focus_sessions")
    suspend fun getTotalFocusMinutesAllTime(): Long?

    @Query("SELECT MAX(actualDurationMinutes) FROM focus_sessions")
    suspend fun getLongestSessionMinutes(): Int?

    @Query("SELECT DISTINCT dateString FROM focus_sessions WHERE actualDurationMinutes >= 1 ORDER BY dateString ASC")
    fun getDistinctFocusDaysFlow(): Flow<List<String>>

    @Query("SELECT * FROM focus_sessions WHERE startTime >= :fromTimestamp ORDER BY startTime ASC")
    suspend fun getSessionsSince(fromTimestamp: Long): List<FocusSessionEntity>
}
