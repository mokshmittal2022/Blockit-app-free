package com.stillhour.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.stillhour.app.data.local.dao.FocusSessionDao
import com.stillhour.app.data.local.dao.RoutineDao
import com.stillhour.app.data.local.entity.FocusSessionEntity
import com.stillhour.app.data.local.entity.RoutineEntity

@Database(
    entities = [FocusSessionEntity::class, RoutineEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {

    abstract fun focusSessionDao(): FocusSessionDao
    abstract fun routineDao(): RoutineDao

    companion object {
        @Volatile
        private var INSTANCE: AppDatabase? = null

        fun getDatabase(context: Context): AppDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "stillhour_database"
                ).fallbackToDestructiveMigration().build()
                INSTANCE = instance
                instance
            }
        }
    }
}
