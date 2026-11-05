package com.stillhour.app

import android.content.Intent
import android.os.Bundle
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.viewModels
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.navigation.compose.*
import com.stillhour.app.data.repository.AppThemeMode
import com.stillhour.app.ui.components.AccessibilityDisclosureDialog
import com.stillhour.app.ui.screens.*
import com.stillhour.app.ui.theme.StillhourTheme
import com.stillhour.app.ui.viewmodel.*

class MainActivity : ComponentActivity() {

    private val settingsViewModel: SettingsViewModel by viewModels {
        SettingsViewModel.provideFactory((application as StillhourApp).settingsRepository)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        enableEdgeToEdge()
        super.onCreate(savedInstanceState)

        setContent {
            val themeMode by settingsViewModel.themeMode.collectAsStateWithLifecycle(initialValue = AppThemeMode.SYSTEM)
            var showAccessibilityDisclosure by remember { mutableStateOf(false) }

            StillhourTheme(themeMode = themeMode) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    MainNavigationScaffold(
                        onRequestAccessibility = {
                            showAccessibilityDisclosure = true
                        }
                    )

                    if (showAccessibilityDisclosure) {
                        AccessibilityDisclosureDialog(
                            onConfirm = {
                                showAccessibilityDisclosure = false
                                settingsViewModel.setAccessibilityConsent(true)
                                // Navigate to system accessibility settings
                                val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
                                startActivity(intent)
                            },
                            onDismiss = {
                                showAccessibilityDisclosure = false
                            }
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun MainNavigationScaffold(
    onRequestAccessibility: () -> Unit
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route ?: "focus"

    Scaffold(
        bottomBar = {
            StillhourBottomBar(
                currentRoute = currentRoute,
                onNavigate = { route ->
                    if (route != currentRoute) {
                        navController.navigate(route) {
                            popUpTo("focus") { saveState = true }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                }
            )
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = "focus",
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            composable("focus") {
                FocusScreen()
            }
            composable("stats") {
                StatsScreen(
                    onOpenSkyline = {
                        navController.navigate("skyline")
                    }
                )
            }
            composable("skyline") {
                StreakSkylineScreen(
                    onBack = { navController.popBackStack() }
                )
            }
            composable("routines") {
                RoutinesScreen()
            }
            composable("settings") {
                SettingsScreen(
                    onRequestAccessibility = onRequestAccessibility
                )
            }
        }
    }
}
