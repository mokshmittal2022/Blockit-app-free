package com.stillhour.app.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.stillhour.app.data.local.entity.RoutineEntity
import com.stillhour.app.data.repository.FocusRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class RoutinesViewModel(
    private val focusRepository: FocusRepository
) : ViewModel() {

    val routines: StateFlow<List<RoutineEntity>> = focusRepository.getAllRoutines()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun toggleRoutine(routine: RoutineEntity) {
        viewModelScope.launch {
            focusRepository.updateRoutine(routine.copy(isEnabled = !routine.isEnabled))
        }
    }

    fun saveRoutine(
        name: String,
        startHour: Int,
        startMinute: Int,
        endHour: Int,
        endMinute: Int,
        daysMask: Int
    ) {
        viewModelScope.launch {
            val routine = RoutineEntity(
                name = name,
                startHour = startHour,
                startMinute = startMinute,
                endHour = endHour,
                endMinute = endMinute,
                daysOfWeekMask = daysMask,
                isEnabled = true
            )
            focusRepository.insertRoutine(routine)
        }
    }

    fun deleteRoutine(routine: RoutineEntity) {
        viewModelScope.launch {
            focusRepository.deleteRoutine(routine)
        }
    }

    companion object {
        fun provideFactory(focusRepository: FocusRepository): ViewModelProvider.Factory =
            object : ViewModelProvider.Factory {
                @Suppress("UNCHECKED_CAST")
                override fun <T : ViewModel> create(modelClass: Class<T>): T {
                    return RoutinesViewModel(focusRepository) as T
                }
            }
    }
}
