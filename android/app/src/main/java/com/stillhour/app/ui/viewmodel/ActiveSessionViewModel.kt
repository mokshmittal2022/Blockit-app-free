package com.stillhour.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.stillhour.app.data.repository.FocusRepository
import com.stillhour.app.data.repository.SettingsRepository
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import java.text.SimpleDateFormat
import java.util.*

enum class AmbientSoundMode {
    OFF,
    RAIN,
    WHITE_NOISE
}

data class ActiveSessionUiState(
    val remainingSeconds: Long = 0L,
    val targetMinutes: Int = 25,
    val elapsedMinutes: Int = 0,
    val formattedMinutesPart: String = "25",
    val formattedSecondsPart: String = "00",
    val formattedEndTime: String = "--:--",
    val ambientSound: AmbientSoundMode = AmbientSoundMode.OFF,
    val emergencyPasses: Int = 1,
    val allowedPackages: Set<String> = emptySet(),
    val isFinished: Boolean = false,
    val showExitConfirmDialog: Boolean = false
)

class ActiveSessionViewModel(
    private val focusRepository: FocusRepository,
    private val settingsRepository: SettingsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(ActiveSessionUiState())
    val uiState: StateFlow<ActiveSessionUiState> = _uiState.asStateFlow()

    private var countdownJob: Job? = null
    private var sessionId: Long = 0L
    private var sessionEndTime: Long = 0L
    private var totalTargetMinutes: Int = 25

    init {
        viewModelScope.launch {
            combine(
                settingsRepository.activeSessionEndTimeFlow,
                settingsRepository.activeSessionTargetMinutesFlow,
                settingsRepository.emergencyPassesFlow,
                settingsRepository.allowedPackagesFlow
            ) { endTime, targetMin, passes, allowed ->
                Quadruple(endTime, targetMin, passes, allowed)
            }.collectLatest { (endTime, targetMin, passes, allowed) ->
                if (endTime != null && endTime > System.currentTimeMillis()) {
                    sessionEndTime = endTime
                    totalTargetMinutes = targetMin
                    _uiState.update { it.copy(emergencyPasses = passes, allowedPackages = allowed) }
                    startCountdown()
                }
            }
        }
    }

    private fun startCountdown() {
        countdownJob?.cancel()
        countdownJob = viewModelScope.launch {
            val sdf = SimpleDateFormat("h:mm a", Locale.getDefault())
            while (isActive) {
                val remainingMillis = sessionEndTime - System.currentTimeMillis()
                if (remainingMillis <= 0) {
                    _uiState.update { it.copy(remainingSeconds = 0, isFinished = true) }
                    focusRepository.completeSession(sessionId, totalTargetMinutes)
                    break
                }

                val totalSec = remainingMillis / 1000
                val min = totalSec / 60
                val sec = totalSec % 60
                val elapsed = totalTargetMinutes - (min.toInt())

                _uiState.update {
                    it.copy(
                        remainingSeconds = totalSec,
                        targetMinutes = totalTargetMinutes,
                        elapsedMinutes = elapsed.coerceAtLeast(0),
                        formattedMinutesPart = String.format(Locale.getDefault(), "%02d", min),
                        formattedSecondsPart = String.format(Locale.getDefault(), "%02d", sec),
                        formattedEndTime = sdf.format(Date(sessionEndTime))
                    )
                }
                delay(1000L)
            }
        }
    }

    fun extend15Minutes() {
        sessionEndTime += 15 * 60 * 1000L
        totalTargetMinutes += 15
        viewModelScope.launch {
            settingsRepository.setActiveSession(sessionEndTime, totalTargetMinutes, sessionId)
        }
    }

    fun cycleAmbientSound() {
        val next = when (_uiState.value.ambientSound) {
            AmbientSoundMode.OFF -> AmbientSoundMode.RAIN
            AmbientSoundMode.RAIN -> AmbientSoundMode.WHITE_NOISE
            AmbientSoundMode.WHITE_NOISE -> AmbientSoundMode.OFF
        }
        _uiState.update { it.copy(ambientSound = next) }
    }

    fun showExitDialog() {
        _uiState.update { it.copy(showExitConfirmDialog = true) }
    }

    fun dismissExitDialog() {
        _uiState.update { it.copy(showExitConfirmDialog = false) }
    }

    fun confirmExitWithPass(onExitComplete: () -> Unit) {
        viewModelScope.launch {
            val elapsed = _uiState.value.elapsedMinutes
            val success = focusRepository.interruptSessionWithEmergencyPass(sessionId, elapsed)
            if (success) {
                countdownJob?.cancel()
                _uiState.update { it.copy(showExitConfirmDialog = false, isFinished = true) }
                onExitComplete()
            }
        }
    }

    companion object {
        fun provideFactory(
            focusRepository: FocusRepository,
            settingsRepository: SettingsRepository
        ): ViewModelProvider.Factory = object : ViewModelProvider.Factory {
            @Suppress("UNCHECKED_CAST")
            override fun <T : ViewModel> create(modelClass: Class<T>): T {
                return ActiveSessionViewModel(focusRepository, settingsRepository) as T
            }
        }
    }
}

private data class Quadruple<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
