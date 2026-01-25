import { create } from 'zustand';
import { workoutsAPI } from '../services/api';

/**
 * Stats store for managing exercise analytics and statistics
 */
const useStatsStore = create((set, get) => ({
  exerciseAnalytics: {},
  isLoading: false,
  error: null,

  // Fetch analytics for a specific exercise
  fetchExerciseAnalytics: async (exerciseId, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workoutsAPI.getExerciseAnalytics(exerciseId, { limit });
      const data = response.data.data;

      set(state => ({
        exerciseAnalytics: {
          ...state.exerciseAnalytics,
          [exerciseId]: data
        },
        isLoading: false
      }));

      return { success: true, data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch analytics';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Get analytics for an exercise from cache
  getExerciseAnalytics: (exerciseId) => {
    return get().exerciseAnalytics[exerciseId] || null;
  },

  // Clear analytics cache
  clearAnalytics: () => {
    set({ exerciseAnalytics: {}, error: null });
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useStatsStore;
