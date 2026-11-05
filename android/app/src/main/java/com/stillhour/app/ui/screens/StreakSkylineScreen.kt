package com.stillhour.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.stillhour.app.StillhourApp
import com.stillhour.app.ui.components.SkylineCanvas
import com.stillhour.app.ui.theme.AccentAmber
import com.stillhour.app.ui.theme.DangerCoral

@Composable
fun StreakSkylineScreen(
    onBack: () -> Unit
) {
    val streakDays by StillhourApp.instance.focusRepository.streakDaysFlow
        .collectAsStateWithLifecycle(initialValue = 254) // default demo fallback

    val isStreakAtRisk = false // whether no session completed today

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Back Button & Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back")
            }
            Spacer(modifier = Modifier.width(8.dp))
            Text(
                text = "Streak Skyline",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.Bold
            )
        }

        // Prominent Streak Display
        Column(
            modifier = Modifier.fillMaxWidth(),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "$streakDays",
                style = MaterialTheme.typography.displayLarge.copy(fontSize = 72.sp),
                fontWeight = FontWeight.Bold,
                color = AccentAmber,
                letterSpacing = (-2).sp
            )
            Text(
                text = "DAYS IN A ROW",
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Gentle Streak At Risk State
        if (isStreakAtRisk) {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = DangerCoral.copy(alpha = 0.15f),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.Warning, contentDescription = "Warning", tint = DangerCoral)
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = "Streak at risk! Complete at least 1 focus minute before midnight to keep your skyline intact.",
                        style = MaterialTheme.typography.bodySmall,
                        color = DangerCoral
                    )
                }
            }
        }

        // Canvas Tower Skyline
        Card(
            shape = RoundedCornerShape(24.dp),
            colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
        ) {
            SkylineCanvas(
                streakDays = streakDays,
                isStreakAtRisk = isStreakAtRisk,
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            )
        }

        // Subtitle slogan
        Text(
            text = "Every day, one floor higher. Your consistency becomes a tower. Don't let it fall.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(horizontal = 8.dp)
        )
    }
}
