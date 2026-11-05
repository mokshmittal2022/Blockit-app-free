package com.stillhour.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "routines")
data class RoutineEntity(
    @PrimaryKey(autoGenerate = true)
    val id: Long = 0,
    val name: String,
    val startHour: Int,
    val startMinute: Int,
    val endHour: Int,
    val endMinute: Int,
    val daysOfWeekMask: Int, // Bitmask: bit 0 = Monday, bit 6 = Sunday (or 1..7)
    val isEnabled: Boolean = true,
    val headsUpMinutes: Int = 1
) {
    fun isDayActive(dayOfWeek: Int): Boolean { // 1 = Monday ... 7 = Sunday
        val bit = 1 shl (dayOfWeek - 1)
        return (daysOfWeekMask and bit) != 0
    }
}
