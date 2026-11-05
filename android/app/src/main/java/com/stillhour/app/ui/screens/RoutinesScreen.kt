package com.stillhour.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Repeat
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
import androidx.lifecycle.viewmodel.compose.viewModel
import com.stillhour.app.StillhourApp
import com.stillhour.app.data.local.entity.RoutineEntity
import com.stillhour.app.ui.components.CircularDialTimePicker
import com.stillhour.app.ui.theme.AccentAmber
import com.stillhour.app.ui.theme.AccentTeal
import com.stillhour.app.ui.viewmodel.RoutinesViewModel

@Composable
fun RoutinesScreen(
    viewModel: RoutinesViewModel = viewModel(
        factory = RoutinesViewModel.provideFactory(StillhourApp.instance.focusRepository)
    )
) {
    val routines by viewModel.routines.collectAsStateWithLifecycle()
    var showCreateDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 20.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "Put focus on repeat.",
                    style = MaterialTheme.typography.headlineMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "Your session begins on its own, every day.",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            FloatingActionButton(
                onClick = { showCreateDialog = true },
                containerColor = AccentTeal,
                contentColor = Color.White,
                shape = CircleShape,
                modifier = Modifier.size(48.dp)
            ) {
                Icon(Icons.Default.Add, contentDescription = "New Routine")
            }
        }

        // Routines List
        if (routines.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "No recurring routines yet.\nTap + to create your first routine.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(routines, key = { it.id }) { routine ->
                    RoutineCard(
                        routine = routine,
                        onToggle = { viewModel.toggleRoutine(routine) },
                        onDelete = { viewModel.deleteRoutine(routine) }
                    )
                }
            }
        }
    }

    if (showCreateDialog) {
        CreateRoutineModal(
            onDismiss = { showCreateDialog = false },
            onSave = { name, sh, sm, eh, em, mask ->
                viewModel.saveRoutine(name, sh, sm, eh, em, mask)
                showCreateDialog = false
            }
        )
    }
}

@Composable
fun RoutineCard(
    routine: RoutineEntity,
    onToggle: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(18.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = routine.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = String.format("%02d:%02d — %02d:%02d", routine.startHour, routine.startMinute, routine.endHour, routine.endMinute),
                        style = MaterialTheme.typography.headlineMedium,
                        fontWeight = FontWeight.Bold,
                        color = AccentAmber
                    )
                }

                Switch(
                    checked = routine.isEnabled,
                    onCheckedChange = { onToggle() },
                    colors = SwitchDefaults.colors(checkedThumbColor = AccentTeal)
                )
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Day Chips (M T W T F S S)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                val days = listOf("M", "T", "W", "T", "F", "S", "S")
                days.forEachIndexed { index, dayLetter ->
                    val isActive = routine.isDayActive(index + 1)
                    Box(
                        modifier = Modifier
                            .size(32.dp)
                            .clip(CircleShape)
                            .background(if (isActive) AccentAmber else MaterialTheme.colorScheme.surfaceVariant),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = dayLetter,
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = if (isActive) Color.White else MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                Spacer(modifier = Modifier.weight(1f))

                IconButton(onClick = onDelete, modifier = Modifier.size(32.dp)) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = "Delete",
                        tint = MaterialTheme.colorScheme.error.copy(alpha = 0.7f),
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}

@Composable
fun CreateRoutineModal(
    onDismiss: () -> Unit,
    onSave: (String, Int, Int, Int, Int, Int) -> Unit
) {
    var name by remember { mutableStateOf("Morning Deep Work") }
    var startHour by remember { mutableIntStateOf(9) }
    var startMinute by remember { mutableIntStateOf(0) }
    var endHour by remember { mutableIntStateOf(11) }
    var endMinute by remember { mutableIntStateOf(30) }
    var daysMask by remember { mutableIntStateOf(31) } // Weekdays active (Mon-Fri)

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("New Focus Routine", fontWeight = FontWeight.Bold) },
        text = {
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Routine Name") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(12.dp)
                )

                // Two Knobs: Start and End Circular Dials
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceEvenly
                ) {
                    CircularDialTimePicker(
                        hour = startHour,
                        minute = startMinute,
                        onTimeChange = { h, m -> startHour = h; startMinute = m },
                        dialLabel = "Start",
                        dialColor = AccentTeal,
                        modifier = Modifier.weight(1f)
                    )
                    CircularDialTimePicker(
                        hour = endHour,
                        minute = endMinute,
                        onTimeChange = { h, m -> endHour = h; endMinute = m },
                        dialLabel = "End",
                        dialColor = AccentAmber,
                        modifier = Modifier.weight(1f)
                    )
                }

                // Days of week selector
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    val days = listOf("M", "T", "W", "T", "F", "S", "S")
                    days.forEachIndexed { idx, d ->
                        val bit = 1 shl idx
                        val selected = (daysMask and bit) != 0
                        FilterChip(
                            selected = selected,
                            onClick = {
                                daysMask = if (selected) daysMask and bit.inv() else daysMask or bit
                            },
                            label = { Text(d) }
                        )
                    }
                }
            }
        },
        confirmButton = {
            Button(
                onClick = { onSave(name, startHour, startMinute, endHour, endMinute, daysMask) },
                colors = ButtonDefaults.buttonColors(containerColor = AccentTeal)
            ) {
                Text("Save Routine", color = Color.White)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel") }
        }
    )
}
