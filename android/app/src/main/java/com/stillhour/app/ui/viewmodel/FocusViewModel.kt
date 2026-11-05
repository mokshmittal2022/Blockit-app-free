package com.stillhour.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.stillhour.app.data.repository.FocusRepository
import com.stillhour.app.data.repository.SettingsRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class FocusViewModel(
    private val focusRepository: FocusRepository,
    private val settingsRepository: SettingsRepository
) : ViewModel() {

    private val _selectedMinutes = MutableStateFlow(25)
    val selectedMinutes: StateFlow<Int> = _selectedMinutes.asStateFlow()

    val emergencyPasses: StateFlow<Int> = settingsRepository.emergencyPassesFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 1)

    val streakDays: StateFlow<Int> = focusRepository.streakDaysFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0)

    val allowedPackages: StateFlow<Set<String>> = settingsRepository.allowedPackagesFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptySet())

    fun selectPreset(minutes: Int) {
        _selectedMinutes.value = minutes
    }

    fun setCustomMinutes(minutes: Int) {
        _selectedMinutes.value = minutes.coerceIn(5, 480)
    }

    fun startSession(onStarted: (Long, Int) -> Unit) {
        viewModelScope.launch {
            val minutes = _selectedMinutes.value
            val sessionId = focusRepository.startSession(minutes)
            onStarted(sessionId, minutes)
        }
    }

    companion object {
        fun provideFactory(
            focusRepository: FocusRepository,
            settingsRepository: SettingsRepository
        ): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return FocusViewModel(focusRepository, settingsRepository) as T
            }
        }
    }
}
