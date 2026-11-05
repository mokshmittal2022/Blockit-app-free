package com.stillhour.app.ui.screens

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Shield
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
import androidx.lifecycle.viewmodel.compose.viewModel
import com.stillhour.app.StillhourApp
import com.stillhour.app.service.FocusForegroundService
import com.stillhour.app.ui.components.DurationWheelPicker
import com.stillhour.app.ui.components.SlideToConfirm
import com.stillhour.app.ui.theme.AccentAmber
import com.stillhour.app.ui.theme.AccentTeal
import com.stillhour.app.ui.viewmodel.FocusViewModel

@Composable
fun FocusScreen(
    viewModel: FocusViewModel = viewModel(
        factory = FocusViewModel.provideFactory(
            StillhourApp.instance.focusRepository,
            StillhourApp.instance.settingsRepository
        )
    )
) {
    val context = LocalContext.current
    val selectedMinutes by viewModel.selectedMinutes.collectAsStateWithLifecycle()
    val emergencyPasses by viewModel.emergencyPasses.collectAsStateWithLifecycle()

    val hours = selectedMinutes / 60
    val minutes = selectedMinutes % 60
    val timeFormatted = String.format("%02d:%02d", hours, minutes)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Header Info
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "stillhour",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onBackground
            )

            // Emergency Pass Badge
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = MaterialTheme.colorScheme.surfaceVariant,
                modifier = Modifier.padding(4.dp)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Default.Shield,
                        contentDescription = "Passes",
                        tint = AccentAmber,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "$emergencyPasses",
                        style = MaterialTheme.typography.labelLarge,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        // Timer Card Display (Space Grotesk tabular digits)
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 12.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 28.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = timeFormatted,
                    style = MaterialTheme.typography.displayLarge,
                    color = AccentAmber,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 2.sp
                )
                Text(
                    text = if (hours > 0) "$hours hr $minutes min session" else "$minutes minutes session",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Duration Presets & Wheel Picker Grid
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(200.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Preset Buttons Grid (15m, 45m, 3h, Custom)
            Column(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight(),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    PresetCard(title = "15", subtitle = "Minutes", isSelected = selectedMinutes == 15, onClick = { viewModel.selectPreset(15) }, modifier = Modifier.weight(1f))
                    PresetCard(title = "45", subtitle = "Minutes", isSelected = selectedMinutes == 45, onClick = { viewModel.selectPreset(45) }, modifier = Modifier.weight(1f))
                }
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    PresetCard(title = "3", subtitle = "Hours", isSelected = selectedMinutes == 180, onClick = { viewModel.selectPreset(180) }, modifier = Modifier.weight(1f))
                    PresetCard(title = "12:00", subtitle = "Custom", isSelected = selectedMinutes != 15 && selectedMinutes != 45 && selectedMinutes != 180, onClick = { /* open custom */ }, modifier = Modifier.weight(1f))
                }
            }

            // Tactile Vertical Rotary Wheel Picker
            Surface(
                shape = RoundedCornerShape(20.dp),
                color = MaterialTheme.colorScheme.surface,
                modifier = Modifier.fillMaxHeight()
            ) {
                DurationWheelPicker(
                    currentMinutes = selectedMinutes,
                    onMinutesChanged = { viewModel.setCustomMinutes(it) }
                )
            }
        }

        // Essentials Card
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier
                .fillMaxWidth()
                .clickable { /* Open Essentials Picker */ }
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.Lock,
                        contentDescription = "Lock",
                        tint = AccentTeal,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text(
                            text = "Essentials Allowed",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Phone, Maps, Messages allowed",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                Icon(
                    imageVector = Icons.Default.ChevronRight,
                    contentDescription = "Edit Essentials",
                    tint = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        // Slide to Start Control
        SlideToConfirm(
            text = "SLIDE TO START",
            onConfirmed = {
                viewModel.startSession { sessionId, minutes ->
                    val endTime = System.currentTimeMillis() + (minutes * 60 * 1000L)
                    FocusForegroundService.start(context, endTime, minutes, sessionId)
                    val lockIntent = Intent(context, ActiveSessionActivity::class.java).apply {
                        flags = Intent.FLAG_ACTIVITY_NEW_TASK
                    }
                    context.startActivity(lockIntent)
                }
            }
        )
    }
}

@Composable
fun PresetCard(
    title: String,
    subtitle: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (isSelected) MaterialTheme.colorScheme.surfaceVariant else MaterialTheme.colorScheme.surface
        ),
        border = if (isSelected) androidx.compose.foundation.BorderStroke(2.dp, AccentAmber) else null,
        modifier = modifier
            .fillMaxHeight()
            .clickable(onClick = onClick)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(12.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = title,
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold,
                color = if (isSelected) AccentAmber else MaterialTheme.colorScheme.onSurface
            )
            Text(
                text = subtitle,
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
