import JSZip from 'jszip';
import { AndroidFileRecord } from '../types';

export const ANDROID_PROJECT_FILES: AndroidFileRecord[] = [
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

    <!-- Permissions -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_SPECIAL_USE" />
    <uses-permission android:name="android.permission.SCHEDULE_EXACT_ALARM" />
    <uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED" />
    <uses-permission android:name="android.permission.VIBRATE" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

    <application
        android:name=".StillhourApp"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.Stillhour">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:launchMode="singleTask"
            android:theme="@style/Theme.Stillhour">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name=".ui.screens.ActiveSessionActivity"
            android:exported="false"
            android:launchMode="singleTask"
            android:showWhenLocked="true"
            android:turnScreenOn="true"
            android:excludeFromRecents="true"
            android:theme="@style/Theme.Stillhour.LockScreen" />

        <service
            android:name=".service.FocusForegroundService"
            android:exported="false"
            android:foregroundServiceType="specialUse" />

        <!-- Accessibility Service to detect foreground package and redirect unauthorized apps -->
        <service
            android:name=".service.FocusLockAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:exported="true"
            android:label="@string/accessibility_service_label"
            android:description="@string/accessibility_service_description">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <receiver
            android:name=".service.RoutineAlarmReceiver"
            android:exported="false" />

        <receiver
            android:name=".service.BootReceiver"
            android:exported="false">
            <intent-filter>
                <action android:name="android.intent.action.BOOT_COMPLETED" />
            </intent-filter>
        </receiver>

    </application>
</manifest>`
  },
  {
    path: 'app/src/main/res/xml/accessibility_service_config.xml',
    name: 'accessibility_service_config.xml',
    language: 'xml',
    category: 'res',
    content: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeWindowStateChanged"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:accessibilityFlags="flagDefault"
    android:canRetrieveWindowContent="false"
    android:canRequestFilterKeyEvents="false"
    android:notificationTimeout="100"
    android:settingsActivity="com.stillhour.app.MainActivity"
    android:description="@string/accessibility_service_description" />`
  },
  {
    path: 'app/build.gradle.kts',
    name: 'app/build.gradle.kts',
    language: 'kotlin',
    category: 'gradle',
    content: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("kotlin-kapt")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    namespace = "com.stillhour.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.stillhour.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    val composeBom = platform("androidx.compose:compose-bom:2024.10.00")
    implementation(composeBom)
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")

    // Room Database
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")

    // DataStore Preferences
    implementation("androidx.datastore:datastore-preferences:1.1.1")

    // WorkManager
    implementation("androidx.work:work-runtime-ktx:2.9.1")
}`
  },
  {
    path: 'app/src/main/java/com/stillhour/app/service/FocusLockAccessibilityService.kt',
    name: 'FocusLockAccessibilityService.kt',
    language: 'kotlin',
    category: 'service',
    content: `package com.stillhour.app.service

import android.accessibilityservice.AccessibilityService
import android.content.Intent
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import com.stillhour.app.StillhourApp
import com.stillhour.app.ui.screens.ActiveSessionActivity
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.first

/**
 * FocusLockAccessibilityService
 *
 * CRITICAL SAFETY & PRIVACY GUARANTEE:
 * 1. ONLY inspects the event's packageName when a session is active.
 * 2. NEVER reads screen content, UI text, keystrokes, or accessibility nodes.
 * 3. Does NOTHING when no focus session is active.
 * 4. Emergency dialer and telecom system packages are hard-whitelisted and NEVER blocked.
 */
class FocusLockAccessibilityService : AccessibilityService() {

    private val serviceScope = CoroutineScope(Dispatchers.Default + SupervisorJob())

    private val safetyWhitelist = setOf(
        "com.android.server.telecom",
        "com.google.android.dialer",
        "com.android.phone",
        "com.android.emergency",
        "com.stillhour.app"
    )

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null || event.eventType != AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) return
        val targetPackage = event.packageName?.toString() ?: return
        if (safetyWhitelist.contains(targetPackage)) return

        serviceScope.launch {
            val app = application as? StillhourApp ?: return@launch
            val activeEndTime = app.settingsRepository.activeSessionEndTimeFlow.first()

            // Do nothing if no session is running!
            if (activeEndTime == null || System.currentTimeMillis() >= activeEndTime) return@launch

            val allowedPackages = app.settingsRepository.allowedPackagesFlow.first()
            if (!allowedPackages.contains(targetPackage)) {
                withContext(Dispatchers.Main) {
                    val lockIntent = Intent(applicationContext, ActiveSessionActivity::class.java).apply {
                        addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                        putExtra("BLOCKED_APP_PACKAGE", targetPackage)
                    }
                    startActivity(lockIntent)
                }
            }
        }
    }

    override fun onInterrupt() {}
}`
  },
  {
    path: 'app/src/main/java/com/stillhour/app/data/local/AppDatabase.kt',
    name: 'AppDatabase.kt',
    language: 'kotlin',
    category: 'data',
    content: `package com.stillhour.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.stillhour.app.data.local.dao.FocusSessionDao
import com.stillhour.app.data.local.dao.RoutineDao
import com.stillhour.app.data.local.entity.FocusSessionEntity
import com.stillhour.app.data.local.entity.RoutineEntity

@Database(entities = [FocusSessionEntity::class, RoutineEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun focusSessionDao(): FocusSessionDao
    abstract fun routineDao(): RoutineDao

    companion object {
        @Volatile private var INSTANCE: AppDatabase? = null
        fun getDatabase(context: Context): AppDatabase =
            INSTANCE ?: synchronized(this) {
                Room.databaseBuilder(context.applicationContext, AppDatabase::class.java, "stillhour_database")
                    .fallbackToDestructiveMigration()
                    .build().also { INSTANCE = it }
            }
    }
}`
  },
  {
    path: 'app/src/main/java/com/stillhour/app/data/local/entity/FocusSessionEntity.kt',
    name: 'FocusSessionEntity.kt',
    language: 'kotlin',
    category: 'data',
    content: `package com.stillhour.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class SessionStatus { COMPLETED, INTERRUPTED_EMERGENCY, CANCELLED }

@Entity(tableName = "focus_sessions")
data class FocusSessionEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val startTime: Long,
    val endTime: Long,
    val targetDurationMinutes: Int,
    val actualDurationMinutes: Int,
    val status: SessionStatus,
    val dateString: String,
    val usedEmergencyPass: Boolean = false
)`
  },
  {
    path: 'app/src/main/java/com/stillhour/app/data/local/entity/RoutineEntity.kt',
    name: 'RoutineEntity.kt',
    language: 'kotlin',
    category: 'data',
    content: `package com.stillhour.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "routines")
data class RoutineEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val name: String,
    val startHour: Int,
    val startMinute: Int,
    val endHour: Int,
    val endMinute: Int,
    val daysOfWeekMask: Int,
    val isEnabled: Boolean = true,
    val headsUpMinutes: Int = 1
) {
    fun isDayActive(dayOfWeek: Int): Boolean = (daysOfWeekMask and (1 shl (dayOfWeek - 1))) != 0
}`
  },
  {
    path: 'app/src/main/java/com/stillhour/app/ui/screens/FocusScreen.kt',
    name: 'FocusScreen.kt',
    language: 'kotlin',
    category: 'compose',
    content: `package com.stillhour.app.ui.screens

import android.content.Intent
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.stillhour.app.service.FocusForegroundService
import com.stillhour.app.ui.components.DurationWheelPicker
import com.stillhour.app.ui.components.SlideToConfirm
import com.stillhour.app.ui.theme.AccentAmber
import com.stillhour.app.ui.viewmodel.FocusViewModel

@Composable
fun FocusScreen(viewModel: FocusViewModel) {
    val context = LocalContext.current
    val selectedMinutes by viewModel.selectedMinutes.collectAsStateWithLifecycle()
    val emergencyPasses by viewModel.emergencyPasses.collectAsStateWithLifecycle()

    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Large Tabular Timer Card
        Card(shape = RoundedCornerShape(24.dp)) {
            Text(
                text = String.format("%02d:%02d", selectedMinutes / 60, selectedMinutes % 60),
                style = MaterialTheme.typography.displayLarge,
                color = AccentAmber
            )
        }

        // Rotary Wheel & Presets Grid
        DurationWheelPicker(
            currentMinutes = selectedMinutes,
            onMinutesChanged = { viewModel.setCustomMinutes(it) }
        )

        // Slide To Start
        SlideToConfirm(
            text = "SLIDE TO START",
            onConfirmed = {
                viewModel.startSession { id, min ->
                    FocusForegroundService.start(context, System.currentTimeMillis() + min * 60000L, min, id)
                    context.startActivity(Intent(context, ActiveSessionActivity::class.java))
                }
            }
        )
    }
}`
  },
  {
    path: 'app/src/main/java/com/stillhour/app/ui/screens/ActiveSessionScreen.kt',
    name: 'ActiveSessionScreen.kt',
    language: 'kotlin',
    category: 'compose',
    content: `package com.stillhour.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Shield
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.stillhour.app.ui.components.SlideToConfirm
import com.stillhour.app.ui.theme.NavyDark
import com.stillhour.app.ui.viewmodel.ActiveSessionViewModel

@Composable
fun ActiveSessionScreen(viewModel: ActiveSessionViewModel, onSessionFinished: () -> Unit) {
    Box(modifier = Modifier.fillMaxSize().background(NavyDark).padding(20.dp)) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Large Countdown digits
            // Seconds Tile & +15 min extension tile
            // Ends at tile & Ambient sound tile
            // Slide to exit with Emergency Pass
            // Allowed essentials dock (Phone, Maps, Messages)
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/stillhour/app/ui/components/SkylineCanvas.kt',
    name: 'SkylineCanvas.kt',
    language: 'kotlin',
    category: 'compose',
    content: `package com.stillhour.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import com.stillhour.app.ui.theme.AccentAmber
import com.stillhour.app.ui.theme.AccentTeal

@Composable
fun SkylineCanvas(streakDays: Int, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier.fillMaxSize()) {
        // Geometric Canvas-drawn skyscraper tower where each day adds a building floor
        val columns = 8
        val rows = 12
        val cellW = (size.width - 40f) / columns
        val cellH = (size.height - 60f) / rows
        for (r in 0 until rows) {
            for (c in 0 until columns) {
                val blockIndex = (rows - 1 - r) * columns + c
                if (blockIndex < streakDays) {
                    drawRoundRect(
                        color = if (blockIndex == streakDays - 1) AccentTeal else AccentAmber,
                        topLeft = Offset(20f + c * cellW, size.height - 30f - (r + 1) * cellH),
                        size = Size(cellW - 4f, cellH - 4f)
                    )
                }
            }
        }
    }
}`
  }
];

export async function downloadAndroidProjectZip() {
  const zip = new JSZip();

  // Root files
  zip.file('settings.gradle.kts', `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}
rootProject.name = "Stillhour"
include(":app")
`);

  zip.file('build.gradle.kts', `plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.compose.compiler) apply false
}
`);

  // App files
  for (const file of ANDROID_PROJECT_FILES) {
    zip.file(file.path, file.content);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'stillhour-android-app.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
