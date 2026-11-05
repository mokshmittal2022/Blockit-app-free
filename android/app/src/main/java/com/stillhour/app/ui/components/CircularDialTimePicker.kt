package com.stillhour.app.ui.components

import android.view.HapticFeedbackConstants
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.*
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stillhour.app.ui.theme.AccentAmber
import com.stillhour.app.ui.theme.AccentTeal
import kotlin.math.*

@Composable
fun CircularDialTimePicker(
    hour: Int,
    minute: Int,
    onTimeChange: (Int, Int) -> Unit,
    dialLabel: String,
    dialColor: Color = AccentAmber,
    modifier: Modifier = Modifier
) {
    val view = LocalView.current
    var center by remember { mutableStateOf(Offset.Zero) }

    // Angle calculation: total minutes in 12h = 720
    val totalMinutes = (hour % 12) * 60 + minute
    val currentAngleRad = (totalMinutes / 720f) * 2 * PI - (PI / 2)

    Column(
        modifier = modifier.padding(8.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = dialLabel.uppercase(),
            style = MaterialTheme.typography.labelSmall,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )

        Spacer(modifier = Modifier.height(8.dp))

        Box(
            modifier = Modifier
                .size(140.dp)
                .pointerInput(Unit) {
                    detectDragGestures { change, _ ->
                        val touchPoint = change.position
                        val dx = touchPoint.x - center.x
                        val dy = touchPoint.y - center.y

                        var angle = atan2(dy, dx) + (PI / 2)
                        if (angle < 0) angle += 2 * PI

                        val fraction = angle / (2 * PI)
                        val totalMins = (fraction * 720).toInt()
                        val newHour = (totalMins / 60).coerceIn(0, 11)
                        // Round to nearest 5 minutes
                        val rawMin = totalMins % 60
                        val newMin = ((rawMin + 2) / 5) * 5 % 60

                        val finalHour = if (hour >= 12) newHour + 12 else newHour
                        if (finalHour != hour || newMin != minute) {
                            view.performHapticFeedback(HapticFeedbackConstants.CLOCK_TICK)
                            onTimeChange(finalHour, newMin)
                        }
                    }
                },
            contentAlignment = Alignment.Center
        ) {
            val trackColor = MaterialTheme.colorScheme.surfaceVariant

            Canvas(modifier = Modifier.fillMaxSize()) {
                center = Offset(size.width / 2f, size.height / 2f)
                val radius = size.minDimension / 2f - 16.dp.toPx()

                // Draw background track ring
                drawCircle(
                    color = trackColor,
                    radius = radius,
                    style = Stroke(width = 8.dp.toPx(), cap = StrokeCap.Round)
                )

                // Draw tick dashes (12 hour marks)
                for (h in 0 until 12) {
                    val tickAngle = (h / 12f) * 2 * PI - (PI / 2)
                    val tickInner = Offset(
                        center.x + (radius - 12.dp.toPx()) * cos(tickAngle).toFloat(),
                        center.y + (radius - 12.dp.toPx()) * sin(tickAngle).toFloat()
                    )
                    val tickOuter = Offset(
                        center.x + (radius - 4.dp.toPx()) * cos(tickAngle).toFloat(),
                        center.y + (radius - 4.dp.toPx()) * sin(tickAngle).toFloat()
                    )
                    drawLine(
                        color = trackColor.copy(alpha = 0.8f),
                        start = tickInner,
                        end = tickOuter,
                        strokeWidth = 2.dp.toPx()
                    )
                }

                // Draw active indicator knob
                val knobX = center.x + radius * cos(currentAngleRad).toFloat()
                val knobY = center.y + radius * sin(currentAngleRad).toFloat()

                drawCircle(
                    color = dialColor,
                    radius = 12.dp.toPx(),
                    center = Offset(knobX, knobY)
                )
                drawCircle(
                    color = Color.White,
                    radius = 4.dp.toPx(),
                    center = Offset(knobX, knobY)
                )
            }

            // Display time in center
            Text(
                text = String.format("%02d:%02d", hour, minute),
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.onSurface
            )
        }
    }
}
