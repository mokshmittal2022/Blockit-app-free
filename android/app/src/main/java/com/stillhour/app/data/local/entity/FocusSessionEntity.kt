package com.stillhour.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class SessionStatus {
    COMPLETED,
    INTERRUPTED_EMERGENCY,
    CANCELLED
}

@Entity(tableName = "focus_sessions")
data class FocusSessionEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val startTime: Long,
    val endTime: Long,
    val targetDurationMinutes: Int,
    val actualDurationMinutes: Int,
    val status: SessionStatus,
    val dateString: String, // e.g. "2026-11-05"
    val usedEmergencyPass: Boolean = false,
    val notes: String? = null
)
