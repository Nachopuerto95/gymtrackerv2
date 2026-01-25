import { create } from 'zustand';
import { routinesAPI } from '../services/api';

/**
 * Routine store for managing workout routines
 */
const useRoutineStore = create((set, get) => ({
  routines: [],
  activeRoutine: null,
  isLoading: false,
  error: null,

  // Fetch all routines (own + public)
  fetchRoutines: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const response = await routinesAPI.getAll(params);
      const routines = response.data.data;

      set({
        routines,
        isLoading: false
      });

      return { success: true, routines };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch routines';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Fetch active routine
  fetchActiveRoutine: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await routinesAPI.getActive();
      const routine = response.data.data;

      set({
        activeRoutine: routine,
        isLoading: false
      });

      return { success: true, routine };
    } catch (error) {
      // No active routine is not an error
      if (error.response?.status === 404) {
        set({
          activeRoutine: null,
          isLoading: false
        });
        return { success: true, routine: null };
      }

      const errorMessage = error.response?.data?.message || 'Failed to fetch active routine';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Create new routine
  createRoutine: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await routinesAPI.create(data);
      const routine = response.data.data;

      const routines = get().routines;
      set({
        routines: [...routines, routine],
        isLoading: false
      });

      return { success: true, routine };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create routine';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Update routine
  updateRoutine: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const response = await routinesAPI.update(id, data);
      const updatedRoutine = response.data.data;

      const routines = get().routines.map(r =>
        r._id === id ? updatedRoutine : r
      );

      set({
        routines,
        isLoading: false
      });

      // Update active routine if it's the one being updated
      if (get().activeRoutine?._id === id) {
        set({ activeRoutine: updatedRoutine });
      }

      return { success: true, routine: updatedRoutine };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update routine';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Delete routine
  deleteRoutine: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await routinesAPI.delete(id);

      const routines = get().routines.filter(r => r._id !== id);
      set({
        routines,
        isLoading: false
      });

      // Clear active routine if it was deleted
      if (get().activeRoutine?._id === id) {
        set({ activeRoutine: null });
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete routine';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Activate routine
  activateRoutine: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await routinesAPI.activate(id);
      const routine = response.data.data;

      // Update routines list
      const routines = get().routines.map(r => ({
        ...r,
        isActive: r._id === id
      }));

      set({
        routines,
        activeRoutine: routine,
        isLoading: false
      });

      return { success: true, routine };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to activate routine';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Deactivate current active routine
  deactivateRoutine: async () => {
    set({ isLoading: true, error: null });
    try {
      await routinesAPI.deactivate();

      // Update routines list - mark all as inactive
      const routines = get().routines.map(r => ({
        ...r,
        isActive: false
      }));

      set({
        routines,
        activeRoutine: null,
        isLoading: false
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to deactivate routine';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Copy routine
  copyRoutine: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await routinesAPI.copy(id);
      const copiedRoutine = response.data.data;

      set((state) => ({
        routines: [copiedRoutine, ...state.routines],
        isLoading: false
      }));

      return { success: true, routine: copiedRoutine };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al copiar rutina';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Toggle routine privacy
  togglePrivacy: async (id, isPrivate) => {
    set({ isLoading: true, error: null });
    try {
      const response = await routinesAPI.update(id, { isPrivate });
      const updatedRoutine = response.data.data;

      set((state) => ({
        routines: state.routines.map(r =>
          r._id === id ? updatedRoutine : r
        ),
        activeRoutine: state.activeRoutine?._id === id
          ? updatedRoutine
          : state.activeRoutine,
        isLoading: false
      }));

      return { success: true, routine: updatedRoutine };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al cambiar privacidad';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Reorder exercises within a workout day
  reorderExercises: async (routineId, dayId, exerciseIds) => {
    set({ isLoading: true, error: null });
    try {
      const response = await routinesAPI.reorderExercises(routineId, dayId, exerciseIds);
      const updatedRoutine = response.data.data;

      set((state) => ({
        routines: state.routines.map(r =>
          r._id === routineId ? updatedRoutine : r
        ),
        activeRoutine: state.activeRoutine?._id === routineId
          ? updatedRoutine
          : state.activeRoutine,
        isLoading: false
      }));

      return { success: true, routine: updatedRoutine };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al reordenar ejercicios';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Reorder workout days
  reorderDays: async (routineId, days) => {
    set({ isLoading: true, error: null });
    try {
      const response = await routinesAPI.reorderDays(routineId, days);
      const updatedRoutine = response.data.data;

      set((state) => ({
        routines: state.routines.map(r =>
          r._id === routineId ? updatedRoutine : r
        ),
        activeRoutine: state.activeRoutine?._id === routineId
          ? updatedRoutine
          : state.activeRoutine,
        isLoading: false
      }));

      return { success: true, routine: updatedRoutine };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al reordenar días';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Get today's workout from active routine
  getTodaysWorkout: () => {
    const routine = get().activeRoutine;
    if (!routine) return null;

    const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    // Convert to Monday = 0
    const adjustedDay = today === 0 ? 6 : today - 1;

    return routine.workoutDays.find(day => day.dayOfWeek === adjustedDay);
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useRoutineStore;
