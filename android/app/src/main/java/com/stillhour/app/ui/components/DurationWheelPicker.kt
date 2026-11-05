package com.stillhour.app.ui.components

import android.view.HapticFeedbackConstants
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.draggable
import androidx.compose.foundation.gestures.rememberDraggableState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.unit.dp
import com.stillhour.app.ui.theme.AccentAmber
import com.stillhour.app.ui.theme.AccentTeal

@Composable
fun DurationWheelPicker(
    currentMinutes: Int,
    onMinutesChanged: (Int) -> Unit,
    modifier: Modifier = Modifier,
    minMinutes: Int = 5,
    maxMinutes: Int = 360,
    stepMinutes: Int = 5
) {
    val view = LocalView.current
    var dragAccumulator by remember { mutableFloatStateOf(0f) }

    Column(
        modifier = modifier
            .width(64.dp)
            .fillMaxHeight(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Up arrow button (+5 min)
        IconButton(
            onClick = {
                val next = (currentMinutes + stepMinutes).coerceAtMost(maxMinutes)
                if (next != currentMinutes) {
                    view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                    onMinutesChanged(next)
                }
            },
            modifier = Modifier.size(36.dp)
        ) {
            Icon(
                imageVector = Icons.Default.KeyboardArrowUp,
                contentDescription = "Increase 5 minutes",
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Rotary Wheel Ruler Box
        Box(
            modifier = Modifier
                .weight(1f)
                .width(44.dp)
                .clip(RoundedCornerShape(22.dp))
                .draggable(
                    orientation = Orientation.Vertical,
                    state = rememberDraggableState { delta ->
                        // Invert delta: drag up increases time
                        dragAccumulator += (-delta)
                        val stepDistance = 20f // pixels per 5-minute tick
                        if (kotlin.math.abs(dragAccumulator) >= stepDistance) {
                            val steps = (dragAccumulator / stepDistance).toInt()
                            val newMinutes = (currentMinutes + steps * stepMinutes).coerceIn(minMinutes, maxMinutes)
                            if (newMinutes != currentMinutes) {
                                view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                                onMinutesChanged(newMinutes)
                            }
                            dragAccumulator %= stepDistance
                        }
                    }
                ),
            contentAlignment = Alignment.Center
        ) {
            val tickColor = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.35f)
            val indicatorColor = AccentAmber

            Canvas(modifier = Modifier.fillMaxSize()) {
                val height = size.height
                val width = size.width
                val centerY = height / 2f

                // Draw background ruler ticks
                val tickSpacing = 10.dp.toPx()
                val totalTicks = (height / tickSpacing).toInt()
                for (i in -totalTicks / 2..totalTicks / 2) {
                    val y = centerY + i * tickSpacing
                    if (y in 0f..height) {
                        val isLong = i % 3 == 0
                        val tickLength = if (isLong) 18.dp.toPx() else 10.dp.toPx()
                        val startX = (width - tickLength) / 2f
                        drawLine(
                            color = tickColor,
                            start = Offset(startX, y),
                            end = Offset(startX + tickLength, y),
                            strokeWidth = 2.dp.toPx()
                        )
                    }
                }

                // Center tactile indicator line
                val indicatorLength = 26.dp.toPx()
                val indStartX = (width - indicatorLength) / 2f
                drawLine(
                    color = indicatorColor,
                    start = Offset(indStartX, centerY),
                    end = Offset(indStartX + indicatorLength, centerY),
                    strokeWidth = 4.dp.toPx()
                )
            }
        }

        // Down arrow button (-5 min)
        IconButton(
            onClick = {
                val prev = (currentMinutes - stepMinutes).coerceAtLeast(minMinutes)
                if (prev != currentMinutes) {
                    view.performHapticFeedback(HapticFeedbackConstants.KEYBOARD_TAP)
                    onMinutesChanged(prev)
                }
            },
            modifier = Modifier.size(36.dp)
        ) {
            Icon(
                imageVector = Icons.Default.KeyboardArrowDown,
                contentDescription = "Decrease 5 minutes",
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
