package com.stillhour.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.animation.*
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.stillhour.app.ui.components.SlideToConfirm
import com.stillhour.app.ui.theme.*
import com.stillhour.app.ui.viewmodel.ActiveSessionViewModel
import com.stillhour.app.ui.viewmodel.AmbientSoundMode

@Composable
fun ActiveSessionScreen(
    viewModel: ActiveSessionViewModel,
    onSessionFinished: () -> Unit
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current

    LaunchedEffect(uiState.isFinished) {
        if (uiState.isFinished) {
            onSessionFinished()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(NavyDark)
            .padding(horizontal = 20.dp, vertical = 24.dp)
    ) {
        Column(
            modifier = Modifier.fillMaxSize(),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // App Header
            Text(
                text = "stillhour",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = TextDarkSecondary
            )

            // Large Digital Countdown Card
            Surface(
                shape = RoundedCornerShape(28.dp),
                color = NavySurface,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 32.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "${uiState.formattedMinutesPart}:${uiState.formattedSecondsPart}",
                        style = MaterialTheme.typography.displayLarge.copy(fontSize = 72.sp),
                        fontWeight = FontWeight.Bold,
                        color = Color.White,
                        letterSpacing = 4.sp
                    )
                }
            }

            // Bento Grid of Metric Tiles
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(130.dp),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Seconds Tile
                Surface(
                    shape = RoundedCornerShape(22.dp),
                    color = NavySurface,
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = uiState.formattedSecondsPart,
                            style = MaterialTheme.typography.displayMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "SEC",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextDarkSecondary,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                }

                // Extension Tile (+15 min)
                Surface(
                    shape = RoundedCornerShape(22.dp),
                    color = NavySurface,
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxHeight()
                        .clickable { viewModel.extend15Minutes() }
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.Center,
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = "+15",
                            style = MaterialTheme.typography.headlineLarge,
                            fontWeight = FontWeight.Bold,
                            color = AccentTeal
                        )
                        Text(
                            text = "min",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextDarkSecondary
                        )
                    }
                }
            }

            // Info & Ambient Sounds Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                // Ends at Tile
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = NavySurface,
                    modifier = Modifier.weight(1f)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(
                            text = "ENDS",
                            style = MaterialTheme.typography.labelSmall,
                            color = TextDarkSecondary
                        )
                        Text(
                            text = uiState.formattedEndTime,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }

                // Ambient Sound Tile (Rain / White Noise / Off)
                Surface(
                    shape = RoundedCornerShape(20.dp),
                    color = NavySurface,
                    modifier = Modifier
                        .weight(1f)
                        .clickable { viewModel.cycleAmbientSound() }
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = when (uiState.ambientSound) {
                                AmbientSoundMode.RAIN -> Icons.Default.WaterDrop
                                AmbientSoundMode.WHITE_NOISE -> Icons.Default.GraphicEq
                                AmbientSoundMode.OFF -> Icons.Default.VolumeMute
                            },
                            contentDescription = "Sound",
                            tint = if (uiState.ambientSound != AmbientSoundMode.OFF) AccentTeal else TextDarkSecondary
                        )
                        Text(
                            text = when (uiState.ambientSound) {
                                AmbientSoundMode.RAIN -> "RAIN"
                                AmbientSoundMode.WHITE_NOISE -> "NOISE"
                                AmbientSoundMode.OFF -> "MUTED"
                            },
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }

            // Slide to Exit with Emergency Pass
            SlideToConfirm(
                text = "SLIDE TO EXIT",
                thumbIcon = Icons.Default.Shield,
                thumbColor = DangerCoral,
                sliderColor = NavySurface,
                onConfirmed = {
                    viewModel.showExitDialog()
                }
            )

            // Essentials Allowed Apps Dock
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(24.dp))
                    .background(NavySurface)
                    .padding(vertical = 12.dp, horizontal = 20.dp),
                horizontalArrangement = Arrangement.SpaceEvenly,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Emergency Phone Dialer (Always Allowed)
                IconButton(
                    onClick = {
                        val dialIntent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:"))
                        context.startActivity(dialIntent)
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.Phone,
                        contentDescription = "Emergency Dialer",
                        tint = AccentTeal,
                        modifier = Modifier.size(28.dp)
                    )
                }

                // Maps
                IconButton(
                    onClick = {
                        val mapIntent = Intent(Intent.ACTION_VIEW, Uri.parse("geo:0,0?q="))
                        try { context.startActivity(mapIntent) } catch (_: Exception) {}
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.Map,
                        contentDescription = "Maps",
                        tint = Color.White,
                        modifier = Modifier.size(28.dp)
                    )
                }

                // Messages
                IconButton(
                    onClick = {
                        val smsIntent = Intent(Intent.ACTION_MAIN).apply {
                            addCategory(Intent.CATEGORY_APP_MESSAGING)
                        }
                        try { context.startActivity(smsIntent) } catch (_: Exception) {}
                    }
                ) {
                    Icon(
                        imageVector = Icons.Default.ChatBubble,
                        contentDescription = "Messages",
                        tint = Color.White,
                        modifier = Modifier.size(28.dp)
                    )
                }
            }
        }

        // Emergency Pass Confirmation Dialog
        if (uiState.showExitConfirmDialog) {
            AlertDialog(
                onDismissRequest = { viewModel.dismissExitDialog() },
                title = { Text("Use Emergency Pass?", fontWeight = FontWeight.Bold) },
                text = {
                    Text(
                        "Leaving now costs 1 Emergency Pass. Your current pass balance: ${uiState.emergencyPasses}.\n\nYour streak will be preserved, but this session will be marked as interrupted."
                    )
                },
                confirmButton = {
                    Button(
                        onClick = { viewModel.confirmExitWithPass(onSessionFinished) },
                        colors = ButtonDefaults.buttonColors(containerColor = DangerCoral)
                    ) {
                        Text("Use Pass & Exit", color = Color.White)
                    }
                },
                dismissButton = {
                    TextButton(onClick = { viewModel.dismissExitDialog() }) {
                        Text("Keep Focusing")
                    }
                }
            )
        }
    }
}
