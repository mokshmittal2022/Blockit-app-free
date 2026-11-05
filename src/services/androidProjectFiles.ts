import JSZip from 'jszip';
import { AndroidFileRecord } from '../types';

const STORAGE_CUSTOM_FILES_KEY = 'stillhour_custom_android_files';

export const BASE_ANDROID_PROJECT_FILES: AndroidFileRecord[] = [
  {
    path: 'gradle/libs.versions.toml',
    name: 'libs.versions.toml',
    language: 'toml',
    category: 'gradle',
    content: `[versions]
agp = "8.7.2"
kotlin = "2.0.21"
coreKtx = "1.15.0"
lifecycleRuntimeKtx = "2.8.7"
activityCompose = "1.9.3"
composeBom = "2024.10.00"
room = "2.6.1"
datastore = "1.1.1"
work = "2.9.1"
coroutines = "1.8.1"
navigationCompose = "2.8.3"

[libraries]
androidx-core-ktx = { group = "androidx.core", name = "core-ktx", version.ref = "coreKtx" }
androidx-lifecycle-runtime-ktx = { group = "androidx.lifecycle", name = "lifecycle-runtime-ktx", version.ref = "lifecycleRuntimeKtx" }
androidx-activity-compose = { group = "androidx.activity", name = "activity-compose", version.ref = "activityCompose" }
androidx-compose-bom = { group = "androidx.compose", name = "compose-bom", version.ref = "composeBom" }
androidx-ui = { group = "androidx.compose.ui", name = "ui" }
androidx-ui-graphics = { group = "androidx.compose.ui", name = "ui-graphics" }
androidx-ui-tooling = { group = "androidx.compose.ui", name = "ui-tooling" }
androidx-ui-tooling-preview = { group = "androidx.compose.ui", name = "ui-tooling-preview" }
androidx-material3 = { group = "androidx.compose.material3", name = "material3" }
androidx-material-icons-extended = { group = "androidx.compose.material", name = "material-icons-extended" }
androidx-navigation-compose = { group = "androidx.navigation", name = "navigation-compose", version.ref = "navigationCompose" }
androidx-lifecycle-viewmodel-compose = { group = "androidx.lifecycle", name = "lifecycle-viewmodel-compose", version.ref = "lifecycleRuntimeKtx" }
androidx-room-runtime = { group = "androidx.room", name = "room-runtime", version.ref = "room" }
androidx-room-ktx = { group = "androidx.room", name = "room-ktx", version.ref = "room" }
androidx-room-compiler = { group = "androidx.room", name = "room-compiler", version.ref = "room" }
androidx-datastore-preferences = { group = "androidx.datastore", name = "datastore-preferences", version.ref = "datastore" }
androidx-work-runtime-ktx = { group = "androidx.work", name = "work-runtime-ktx", version.ref = "work" }
kotlinx-coroutines-android = { group = "org.jetbrains.kotlinx", name = "kotlinx-coroutines-android", version.ref = "coroutines" }

[plugins]
android-application = { id = "com.android.application", version.ref = "agp" }
kotlin-android = { id = "org.jetbrains.kotlin.android", version.ref = "kotlin" }
kotlin-kapt = { id = "org.jetbrains.kotlin.kapt", version.ref = "kotlin" }
compose-compiler = { id = "org.jetbrains.kotlin.plugin.compose", version.ref = "kotlin" }`
  },
  {
    path: 'gradle.properties',
    name: 'gradle.properties',
    language: 'properties',
    category: 'gradle',
    content: `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official`
  },
  {
    path: 'gradle/wrapper/gradle-wrapper.properties',
    name: 'gradle-wrapper.properties',
    language: 'properties',
    category: 'gradle',
    content: `distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\\://services.gradle.org/distributions/gradle-8.9-bin.zip
networkTimeout=10000
validateDistributionUrl=true
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists`
  },
  {
    path: 'app/proguard-rules.pro',
    name: 'proguard-rules.pro',
    language: 'pro',
    category: 'gradle',
    content: `-keepattributes *Annotation*
-keepclassmembers class * {
    @androidx.room.Dao *;
    @androidx.room.Database *;
    @androidx.room.Entity *;
}
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}`
  },
  {
    path: 'app/src/main/AndroidManifest.xml',
    name: 'AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools">

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

    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")
    implementation("androidx.datastore:datastore-preferences:1.1.1")
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
    path: 'app/src/main/java/com/stillhour/app/service/FocusForegroundService.kt',
    name: 'FocusForegroundService.kt',
    language: 'kotlin',
    category: 'service',
    content: `package com.stillhour.app.service

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.stillhour.app.StillhourApp

class FocusForegroundService : Service() {
    companion object {
        const val NOTIFICATION_ID = 1001
        fun start(context: Context, endTime: Long, targetMin: Int, sessionId: Long) {
            val intent = Intent(context, FocusForegroundService::class.java).apply {
                putExtra("END_TIME", endTime)
                putExtra("TARGET_MIN", targetMin)
                putExtra("SESSION_ID", sessionId)
            }
            context.startForegroundService(intent)
        }
    }
    override fun onBind(intent: Intent?): IBinder? = null
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
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
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

    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Card(shape = RoundedCornerShape(24.dp)) {
            Text(
                text = String.format("%02d:%02d", selectedMinutes / 60, selectedMinutes % 60),
                style = MaterialTheme.typography.displayLarge,
                color = AccentAmber
            )
        }

        DurationWheelPicker(
            currentMinutes = selectedMinutes,
            onMinutesChanged = { viewModel.setCustomMinutes(it) }
        )

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
    path: 'app/src/main/java/com/stillhour/app/ui/components/SkylineCanvas.kt',
    name: 'SkylineCanvas.kt',
    language: 'kotlin',
    category: 'compose',
    content: `package com.stillhour.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import com.stillhour.app.ui.theme.AccentAmber
import com.stillhour.app.ui.theme.AccentTeal

@Composable
fun SkylineCanvas(streakDays: Int, modifier: Modifier = Modifier) {
    Canvas(modifier = modifier.fillMaxSize()) {
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

export function getCustomFiles(): AndroidFileRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_FILES_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveCustomFile(file: AndroidFileRecord) {
  try {
    const custom = getCustomFiles();
    const idx = custom.findIndex((f) => f.path === file.path);
    if (idx >= 0) {
      custom[idx] = file;
    } else {
      custom.push(file);
    }
    localStorage.setItem(STORAGE_CUSTOM_FILES_KEY, JSON.stringify(custom));
  } catch {}
}

export function deleteCustomFile(path: string) {
  try {
    const custom = getCustomFiles().filter((f) => f.path !== path);
    localStorage.setItem(STORAGE_CUSTOM_FILES_KEY, JSON.stringify(custom));
  } catch {}
}

export function getAllProjectFiles(): AndroidFileRecord[] {
  const custom = getCustomFiles();
  const baseMap = new Map<string, AndroidFileRecord>();
  for (const f of BASE_ANDROID_PROJECT_FILES) {
    baseMap.set(f.path, f);
  }
  for (const c of custom) {
    baseMap.set(c.path, c);
  }
  return Array.from(baseMap.values());
}

export async function downloadAndroidProjectZip(filesToZip?: AndroidFileRecord[]) {
  const zip = new JSZip();

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

  const files = filesToZip || getAllProjectFiles();
  for (const file of files) {
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
