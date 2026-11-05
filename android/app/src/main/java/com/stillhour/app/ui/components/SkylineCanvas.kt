package com.stillhour.app.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import com.stillhour.app.ui.theme.AccentAmber
import com.stillhour.app.ui.theme.AccentTeal

@Composable
fun SkylineCanvas(
    streakDays: Int,
    isStreakAtRisk: Boolean = false,
    modifier: Modifier = Modifier
) {
    val blockColor = if (isStreakAtRisk) MaterialTheme.colorScheme.error else AccentAmber
    val baseGridColor = MaterialTheme.colorScheme.surfaceVariant
    val groundColor = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.2f)

    Canvas(modifier = modifier.fillMaxSize()) {
        val width = size.width
        val height = size.height

        // Calculate grid floor dimensions
        val columns = 8
        val rows = 12
        val cellWidth = (width - 40f) / columns
        val cellHeight = (height - 60f) / rows

        // Draw ground perspective line
        drawLine(
            color = groundColor,
            start = Offset(20f, height - 20f),
            end = Offset(width - 20f, height - 20f),
            strokeWidth = 3f
        )

        // Draw grid of skyscraper building blocks
        val totalBlocks = streakDays.coerceIn(1, columns * rows)

        for (r in 0 until rows) {
            for (c in 0 until columns) {
                val blockIndex = (rows - 1 - r) * columns + c
                val x = 20f + c * cellWidth + 2f
                val y = height - 30f - (r + 1) * cellHeight

                if (blockIndex < totalBlocks) {
                    // Active completed streak floor
                    drawRoundRect(
                        color = if (blockIndex == totalBlocks - 1) AccentTeal else blockColor,
                        topLeft = Offset(x, y),
                        size = Size(cellWidth - 4f, cellHeight - 4f),
                        cornerRadius = androidx.compose.ui.geometry.CornerRadius(6f, 6f)
                    )
                } else {
                    // Inactive skeleton blueprint floor
                    drawRoundRect(
                        color = baseGridColor.copy(alpha = 0.4f),
                        topLeft = Offset(x, y),
                        size = Size(cellWidth - 4f, cellHeight - 4f),
                        cornerRadius = androidx.compose.ui.geometry.CornerRadius(6f, 6f)
                    )
                }
            }
        }
    }
}
