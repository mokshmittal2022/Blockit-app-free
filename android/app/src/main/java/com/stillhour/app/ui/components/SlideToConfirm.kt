package com.stillhour.app.ui.components

import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.spring
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.Orientation
import androidx.compose.foundation.gestures.draggable
import androidx.compose.foundation.gestures.rememberDraggableState
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.stillhour.app.ui.theme.AccentTeal
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

@Composable
fun SlideToConfirm(
    text: String = "SLIDE TO START",
    thumbIcon: ImageVector = Icons.Default.ChevronRight,
    sliderColor: Color = MaterialTheme.colorScheme.surfaceVariant,
    thumbColor: Color = AccentTeal,
    onConfirmed: () -> Unit,
    modifier: Modifier = Modifier
) {
    var widthPx by remember { mutableFloatStateOf(0f) }
    val density = LocalDensity.current
    val thumbSizeDp = 52.dp
    val thumbSizePx = with(density) { thumbSizeDp.toPx() }
    val maxDragPx = (widthPx - thumbSizePx).coerceAtLeast(0f)

    val offsetX = remember { Animatable(0f) }
    val coroutineScope = rememberCoroutineScope()

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(64.dp)
            .clip(RoundedCornerShape(32.dp))
            .background(sliderColor)
            .padding(6.dp)
            .onSizeChanged { widthPx = it.width.toFloat() - with(density) { 12.dp.toPx() } },
        contentAlignment = Alignment.CenterStart
    ) {
        // Center label
        Box(
            modifier = Modifier.fillMaxSize(),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = text,
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold,
                letterSpacing = 2.sp,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
            )
        }

        // Draggable Thumb
        Box(
            modifier = Modifier
                .offset { IntOffset(offsetX.value.roundToInt(), 0) }
                .size(thumbSizeDp)
                .clip(CircleShape)
                .background(thumbColor)
                .draggable(
                    orientation = Orientation.Horizontal,
                    state = rememberDraggableState { delta ->
                        coroutineScope.launch {
                            val newTarget = (offsetX.value + delta).coerceIn(0f, maxDragPx)
                            offsetX.snapTo(newTarget)
                        }
                    },
                    onDragStopped = {
                        if (offsetX.value >= maxDragPx * 0.85f && maxDragPx > 0f) {
                            coroutineScope.launch {
                                offsetX.animateTo(maxDragPx, spring())
                                onConfirmed()
                                offsetX.snapTo(0f)
                            }
                        } else {
                            coroutineScope.launch {
                                offsetX.animateTo(0f, spring())
                            }
                        }
                    }
                ),
            contentAlignment = Alignment.Center
        ) {
            Icon(
                imageVector = thumbIcon,
                contentDescription = "Swipe Thumb",
                tint = Color.White,
                modifier = Modifier.size(24.dp)
            )
        }
    }
}
