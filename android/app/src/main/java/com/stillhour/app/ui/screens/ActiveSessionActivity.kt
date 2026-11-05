package com.stillhour.app.ui.screens

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import com.stillhour.app.StillhourApp
import com.stillhour.app.ui.theme.StillhourTheme
import com.stillhour.app.ui.viewmodel.ActiveSessionViewModel

class ActiveSessionActivity : ComponentActivity() {

    private val viewModel: ActiveSessionViewModel by viewModels {
        ActiveSessionViewModel.provideFactory(
            (application as StillhourApp).focusRepository,
            (application as StillhourApp).settingsRepository
        )
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Lockscreen configuration: show over lockscreen and keep screen awake when needed
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
        }
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        // Intercept back button to prevent accidental bypass
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                Toast.makeText(this@ActiveSessionActivity, "Focus session active. Use 'Slide to Exit' with an Emergency Pass.", Toast.LENGTH_SHORT).show()
            }
        })

        val blockedApp = intent.getStringExtra("BLOCKED_APP_PACKAGE")
        if (blockedApp != null) {
            Toast.makeText(this, "App blocked by Stillhour during focus session", Toast.LENGTH_SHORT).show()
        }

        setContent {
            StillhourTheme {
                ActiveSessionScreen(
                    viewModel = viewModel,
                    onSessionFinished = {
                        finish()
                    }
                )
            }
        }
    }
}
