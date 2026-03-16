import { create } from 'zustand';
import { workoutsAPI } from '../services/api';

// Helper to check if workout is from today
const isToday = (date) => {
  const workoutDate = new Date(date);
  const today = new Date();
  return workoutDate.getDate() === today.getDate() &&
    workoutDate.getMonth() === today.getMonth() &&
    workoutDate.getFullYear() === today.getFullYear();
};

// Load workout from localStorage
const loadWorkoutFromStorage = () => {
  try {
    const stored = localStorage.getItem('activeWorkout');
    if (stored) {
      const workout = JSON.parse(stored);
      // Only restore if it's from today and not completed
      if (workout && !workout.isCompleted && isToday(workout.startTime)) {
        return workout;
      } else {
        // Clear old workout
        localStorage.removeItem('activeWorkout');
      }
    }
  } catch (error) {
    console.error('Error loading workout from storage:', error);
    localStorage.removeItem('activeWorkout');
  }
  return null;
};

// Save workout to localStorage
const saveWorkoutToStorage = (workout) => {
  try {
    if (workout) {
      localStorage.setItem('activeWorkout', JSON.stringify(workout));
    } else {
      localStorage.removeItem('activeWorkout');
    }
  } catch (error) {
    console.error('Error saving workout to storage:', error);
  }
};

/**
 * Workout store for managing active workout sessions
 */
const useWorkoutStore = create((set, get) => ({
  activeWorkout: loadWorkoutFromStorage(),
  workoutHistory: [],
  isLoading: false,
  error: null,

  // Start a new workout
  startWorkout: async (routineId, workoutDayId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workoutsAPI.start({ routineId, workoutDayId });
      const workout = response.data.data;

      set({
        activeWorkout: workout,
        isLoading: false
      });

      // Save to localStorage
      saveWorkoutToStorage(workout);

      return { success: true, workout };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to start workout';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Update workout (add sets, notes, etc.)
  updateWorkout: async (workoutId, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workoutsAPI.update(workoutId, data);
      const workout = response.data.data;

      set({
        activeWorkout: workout,
        isLoading: false
      });

      // Save to localStorage
      saveWorkoutToStorage(workout);

      return { success: true, workout };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update workout';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Complete workout
  completeWorkout: async (workoutId) => {
    set({ isLoading: true, error: null });
    try {
      // Save current frontend state to backend before completing
      // This ensures any pending fire-and-forget updates from updateSet
      // are persisted before the complete endpoint filters exercises
      const currentWorkout = get().activeWorkout;
      if (currentWorkout) {
        await workoutsAPI.update(workoutId, currentWorkout);
      }

      const response = await workoutsAPI.complete(workoutId);
      const workout = response.data.data;

      set({
        activeWorkout: null,
        isLoading: false
      });

      // Clear from localStorage
      saveWorkoutToStorage(null);

      // Add to history
      const history = get().workoutHistory;
      set({
        workoutHistory: [workout, ...history]
      });

      return { success: true, workout };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to complete workout';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Add a set to an exercise
  addSet: (exerciseId, setData) => {
    const workout = get().activeWorkout;
    if (!workout) return;

    const updatedExercises = workout.exercises.map(ex => {
      if (ex._id === exerciseId) {
        return {
          ...ex,
          sets: [...ex.sets, {
            setNumber: ex.sets.length + 1,
            reps: setData.reps,
            weight: setData.weight,
            rpe: setData.rpe || null,
            isCompleted: true,
            completedAt: new Date()
          }]
        };
      }
      return ex;
    });

    const updatedWorkout = {
      ...workout,
      exercises: updatedExercises
    };

    set({ activeWorkout: updatedWorkout });

    // Persist to backend
    get().updateWorkout(workout._id, updatedWorkout);
  },

  // Update a set (local only, no backend save)
  updateSet: (exerciseId, setIndex, setData) => {
    const workout = get().activeWorkout;
    if (!workout) return;

    const updatedExercises = workout.exercises.map(ex => {
      if (ex._id === exerciseId) {
        const updatedSets = [...ex.sets];
        updatedSets[setIndex] = {
          ...updatedSets[setIndex],
          ...setData
        };
        return {
          ...ex,
          sets: updatedSets
        };
      }
      return ex;
    });

    const updatedWorkout = {
      ...workout,
      exercises: updatedExercises
    };

    set({ activeWorkout: updatedWorkout });

    // Save to localStorage
    saveWorkoutToStorage(updatedWorkout);

    // Save to backend only when completing a set - but do it asynchronously without updating state
    // This prevents re-renders and scroll jumps
    if (setData.isCompleted !== undefined) {
      // Call API directly without updating state from response
      workoutsAPI.update(workout._id, updatedWorkout).catch(error => {
        console.error('Error updating workout:', error);
        // Could add error handling here if needed
      });
    }
  },

  // Manual save to backend
  saveWorkout: () => {
    const workout = get().activeWorkout;
    if (!workout) return;
    get().updateWorkout(workout._id, workout);
  },

  // Mark exercise as complete/incomplete (toggle)
  completeExercise: (exerciseId) => {
    const workout = get().activeWorkout;
    if (!workout) return;

    const updatedExercises = workout.exercises.map(ex => {
      if (ex._id === exerciseId) {
        const newIsCompleted = !ex.isCompleted;

        // Si se desmarca el ejercicio, desmarcar todas las series
        if (!newIsCompleted) {
          const updatedSets = ex.sets.map(set => ({
            ...set,
            isCompleted: false,
            completedAt: null
          }));
          // Preservar explícitamente todas las propiedades importantes incluyendo category y equipment
          return {
            ...ex,
            isCompleted: false,
            sets: updatedSets,
            category: ex.category || 'other',
            equipment: ex.equipment
          };
        }

        // También preservar al marcar como completado
        return {
          ...ex,
          isCompleted: true,
          category: ex.category || 'other',
          equipment: ex.equipment
        };
      }
      return ex;
    });

    const updatedWorkout = {
      ...workout,
      exercises: updatedExercises
    };

    set({ activeWorkout: updatedWorkout });
    saveWorkoutToStorage(updatedWorkout);

    // Persist to backend asynchronously without updating state to prevent scroll jumps
    workoutsAPI.update(workout._id, updatedWorkout).catch(error => {
      console.error('Error updating workout:', error);
    });
  },

  // Change workout day (switch to different day's workout)
  changeWorkoutDay: async (workoutId, routineId, newWorkoutDayId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workoutsAPI.changeDay(workoutId, {
        routineId,
        workoutDayId: newWorkoutDayId
      });
      const workout = response.data.data;

      set({
        activeWorkout: workout,
        isLoading: false
      });

      // Save to localStorage
      saveWorkoutToStorage(workout);

      return { success: true, workout };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change workout day';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Fetch workout history
  fetchWorkoutHistory: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workoutsAPI.getAll(params);
      const workouts = response.data.data;

      set({
        workoutHistory: workouts,
        isLoading: false
      });

      return { success: true, workouts };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch history';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Clear active workout
  clearActiveWorkout: () => {
    set({ activeWorkout: null });
    saveWorkoutToStorage(null);
  },

  // Fetch a specific workout by ID (for restoring active sessions)
  fetchWorkout: async (workoutId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workoutsAPI.getOne(workoutId);
      const workout = response.data.data;

      // Only set as active if it's not completed
      if (workout && !workout.isCompleted) {
        set({
          activeWorkout: workout,
          isLoading: false
        });
        saveWorkoutToStorage(workout);
        return { success: true, workout };
      }

      set({ isLoading: false });
      return { success: false, error: 'Workout is already completed' };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch workout';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Cancel and delete workout
  cancelWorkout: async (workoutId) => {
    set({ isLoading: true, error: null });
    try {
      await workoutsAPI.delete(workoutId);

      set({
        activeWorkout: null,
        isLoading: false
      });

      // Clear from localStorage
      saveWorkoutToStorage(null);

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to cancel workout';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Remove exercise from active workout
  removeExercise: async (exerciseId) => {
    const workout = get().activeWorkout;
    if (!workout) return { success: false, error: 'No active workout' };

    const updatedExercises = workout.exercises.filter(ex => ex._id !== exerciseId);

    const updatedWorkout = {
      ...workout,
      exercises: updatedExercises
    };

    set({ activeWorkout: updatedWorkout });
    saveWorkoutToStorage(updatedWorkout);

    // Persist to backend without updating state to prevent scroll jumps
    try {
      await workoutsAPI.update(workout._id, updatedWorkout);
      return { success: true };
    } catch (error) {
      console.error('Error updating workout:', error);
      return { success: false, error: error.message };
    }
  },

  // Add exercise to active workout
  addExercise: async (exerciseData) => {
    const workout = get().activeWorkout;
    if (!workout) return { success: false, error: 'No active workout' };

    // Fetch last workout data from backend for this exercise
    let lastWeight = 0;
    let lastReps = 0;

    try {
      const response = await workoutsAPI.getExerciseHistory(exerciseData.exerciseId);
      if (response.data?.success && response.data?.data) {
        lastWeight = response.data.data.lastWeight || 0;
        lastReps = response.data.data.lastReps || 0;
      }
    } catch (error) {
      console.error('Error fetching exercise history:', error);
      // Continue with 0 values if fetch fails
    }

    // Create sets for the new exercise
    const sets = Array.from({ length: exerciseData.sets || 3 }, (_, i) => ({
      _id: `set_${Date.now()}_${i}_${Math.random().toString(36).substr(2, 9)}`,
      setNumber: i + 1,
      reps: 0,
      weight: 0,
      rpe: null,
      isCompleted: false,
      completedAt: null,
      lastWeight,
      lastReps
    }));

    const newExercise = {
      _id: `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      exerciseId: exerciseData.exerciseId,
      exerciseName: exerciseData.exerciseName,
      category: exerciseData.category || 'other',
      equipment: exerciseData.equipment || 'other',
      sets,
      notes: '',
      isCompleted: false,
      order: workout.exercises.length
    };

    const updatedExercises = [...workout.exercises, newExercise];

    const updatedWorkout = {
      ...workout,
      exercises: updatedExercises
    };

    set({ activeWorkout: updatedWorkout });
    saveWorkoutToStorage(updatedWorkout);

    // Persist to backend without updating state to prevent scroll jumps
    try {
      await workoutsAPI.update(workout._id, updatedWorkout);
      return { success: true };
    } catch (error) {
      console.error('Error updating workout:', error);
      return { success: false, error: error.message };
    }
  },

  // Add set to exercise
  addSetToExercise: (exerciseId) => {
    const workout = get().activeWorkout;
    if (!workout) return;

    const updatedExercises = workout.exercises.map(ex => {
      if (ex._id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1] || {};
        const newSet = {
          _id: `set_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          setNumber: ex.sets.length + 1,
          reps: 0,
          weight: 0,
          rpe: null,
          isCompleted: false,
          completedAt: null,
          lastWeight: lastSet.lastWeight || 0,
          lastReps: lastSet.lastReps || 0
        };

        return {
          ...ex,
          sets: [...ex.sets, newSet]
        };
      }
      return ex;
    });

    const updatedWorkout = {
      ...workout,
      exercises: updatedExercises
    };

    set({ activeWorkout: updatedWorkout });
    saveWorkoutToStorage(updatedWorkout);

    // Persist to backend asynchronously without updating state to prevent scroll jumps
    workoutsAPI.update(workout._id, updatedWorkout).catch(error => {
      console.error('Error updating workout:', error);
    });
  },

  // Remove set from exercise
  removeSetFromExercise: (exerciseId, setIndex) => {
    const workout = get().activeWorkout;
    if (!workout) return;

    const updatedExercises = workout.exercises.map(ex => {
      if (ex._id === exerciseId) {
        // Don't allow removing if only one set remains
        if (ex.sets.length <= 1) return ex;

        const updatedSets = ex.sets.filter((_, index) => index !== setIndex);

        // Renumber sets
        const renumberedSets = updatedSets.map((set, index) => ({
          ...set,
          setNumber: index + 1
        }));

        return {
          ...ex,
          sets: renumberedSets
        };
      }
      return ex;
    });

    const updatedWorkout = {
      ...workout,
      exercises: updatedExercises
    };

    set({ activeWorkout: updatedWorkout });
    saveWorkoutToStorage(updatedWorkout);

    // Persist to backend asynchronously without updating state to prevent scroll jumps
    workoutsAPI.update(workout._id, updatedWorkout).catch(error => {
      console.error('Error updating workout:', error);
    });
  },

  // Edit a completed workout in history (fix mistakes)
  editHistoryWorkout: async (workoutId, exercises) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workoutsAPI.editHistory(workoutId, { exercises });
      const updatedWorkout = response.data.data;

      // Update in history
      const history = get().workoutHistory.map(w =>
        w._id === workoutId ? updatedWorkout : w
      );
      set({ workoutHistory: history, isLoading: false });

      return { success: true, workout: updatedWorkout };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to edit workout';
      set({ isLoading: false, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Get today's workout sessions (both active and completed)
  getTodayWorkout: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await workoutsAPI.getToday();
      const { data, activeSession, completedSession } = response.data;

      set({ isLoading: false });

      return {
        success: true,
        workout: data,
        activeSession,
        completedSession
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to get today\'s workout';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Reopen completed workout to continue editing
  reopenWorkout: async (workoutId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workoutsAPI.reopen(workoutId);
      const workout = response.data.data;

      set({
        activeWorkout: workout,
        isLoading: false
      });

      // Save to localStorage
      saveWorkoutToStorage(workout);

      return { success: true, workout };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reopen workout';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  }
}));

export { useWorkoutStore };
export default useWorkoutStore;
