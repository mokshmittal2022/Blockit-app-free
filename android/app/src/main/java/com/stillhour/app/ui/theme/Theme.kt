package com.stillhour.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.unit.dp
import com.stillhour.app.data.repository.AppThemeMode

private val DarkColorScheme = darkColorScheme(
    primary = AccentTeal,
    onPrimary = NavyDark,
    secondary = AccentAmber,
    onSecondary = NavyDark,
    error = DangerCoral,
    onError = TextDarkPrimary,
    background = NavyDark,
    onBackground = TextDarkPrimary,
    surface = NavySurface,
    onSurface = TextDarkPrimary,
    surfaceVariant = NavySurfaceVariant,
    onSurfaceVariant = TextDarkSecondary
)

private val LightColorScheme = lightColorScheme(
    primary = AccentTeal,
    onPrimary = OffWhiteSurface,
    secondary = AccentAmber,
    onSecondary = TextLightPrimary,
    error = DangerCoral,
    onError = OffWhiteSurface,
    background = OffWhite,
    onBackground = TextLightPrimary,
    surface = OffWhiteSurface,
    onSurface = TextLightPrimary,
    surfaceVariant = OffWhiteSurfaceVariant,
    onSurfaceVariant = TextLightSecondary
)

val StillhourShapes = Shapes(
    small = RoundedCornerShape(12.dp),
    medium = RoundedCornerShape(18.dp),
    large = RoundedCornerShape(24.dp),
    extraLarge = RoundedCornerShape(32.dp)
)

@Composable
fun StillhourTheme(
    themeMode: AppThemeMode = AppThemeMode.SYSTEM,
    content: @Composable () -> Unit
) {
    val darkTheme = when (themeMode) {
        AppThemeMode.DARK -> true
        AppThemeMode.LIGHT -> false
        AppThemeMode.SYSTEM -> isSystemInDarkTheme()
    }

    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = StillhourTypography,
        shapes = StillhourShapes,
        content = content
    )
}
