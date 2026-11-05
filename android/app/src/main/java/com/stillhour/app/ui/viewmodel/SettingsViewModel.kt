package com.stillhour.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.stillhour.app.data.repository.AppThemeMode
import com.stillhour.app.data.repository.SettingsRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class SettingsViewModel(
    private val settingsRepository: SettingsRepository
) : ViewModel() {

    val themeMode: StateFlow<AppThemeMode> = settingsRepository.themeModeFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), AppThemeMode.DARK)

    val hapticFeedback: StateFlow<Boolean> = settingsRepository.hapticFeedbackFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    val streakReminders: StateFlow<Boolean> = settingsRepository.streakRemindersFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    val emergencyPasses: StateFlow<Int> = settingsRepository.emergencyPassesFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 1)

    val accessibilityConsent: StateFlow<Boolean> = settingsRepository.accessibilityConsentFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), false)

    fun setThemeMode(mode: AppThemeMode) {
        viewModelScope.launch {
            settingsRepository.setThemeMode(mode)
        }
    }

    fun setHapticFeedback(enabled: Boolean) {
        viewModelScope.launch {
            settingsRepository.setHapticFeedback(enabled)
        }
    }

    fun setStreakReminders(enabled: Boolean) {
        viewModelScope.launch {
            settingsRepository.setStreakReminders(enabled)
        }
    }

    fun setAccessibilityConsent(consented: Boolean) {
        viewModelScope.launch {
            settingsRepository.setAccessibilityConsent(consented)
        }
    }

    fun purchaseEmergencyPasses(amount: Int) {
        viewModelScope.launch {
            settingsRepository.addEmergencyPass(amount)
        }
    }

    companion object {
        fun provideFactory(settingsRepository: SettingsRepository): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return SettingsViewModel(settingsRepository) as T
                }
            }
    }
}
