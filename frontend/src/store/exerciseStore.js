import { create } from 'zustand';
import { exercisesAPI } from '../services/api';

/**
 * Exercise store for managing exercise library
 * Includes caching to avoid redundant API calls
 */
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in ms

const useExerciseStore = create((set, get) => ({
  exercises: [],
  selectedExercise: null,
  isLoading: false,
  error: null,
  lastFetchTime: null,

  // Check if cache is still valid
  hasValidCache: () => {
    const { lastFetchTime, exercises } = get();
    if (!lastFetchTime || exercises.length === 0) return false;
    return Date.now() - lastFetchTime < CACHE_TTL;
  },

  // Fetch all exercises (respects cache)
  fetchExercises: async (filters = {}, forceRefresh = false) => {
    // Use cache if valid and no filters applied
    const hasFilters = filters && Object.keys(filters).length > 0;
    if (!forceRefresh && !hasFilters && get().hasValidCache()) {
      return { success: true, exercises: get().exercises, fromCache: true };
    }

    set({ isLoading: true, error: null });
    try {
      const response = await exercisesAPI.getAll(filters);
      set({
        exercises: response.data.data,
        isLoading: false,
        lastFetchTime: hasFilters ? get().lastFetchTime : Date.now()
      });
      return { success: true, exercises: response.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al cargar ejercicios';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Search exercises
  searchExercises: async (query) => {
    set({ isLoading: true, error: null });
    try {
      const response = await exercisesAPI.search(query);
      set({
        exercises: response.data.data,
        isLoading: false
      });
      return { success: true, exercises: response.data.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al buscar ejercicios';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Create exercise
  createExercise: async (exerciseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await exercisesAPI.create(exerciseData);
      const newExercise = response.data.data;

      set((state) => ({
        exercises: [newExercise, ...state.exercises],
        isLoading: false
      }));

      return { success: true, exercise: newExercise };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al crear ejercicio';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Update exercise
  updateExercise: async (id, exerciseData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await exercisesAPI.update(id, exerciseData);
      const updatedExercise = response.data.data;

      set((state) => ({
        exercises: state.exercises.map((ex) =>
          ex._id === id ? updatedExercise : ex
        ),
        selectedExercise: state.selectedExercise?._id === id
          ? updatedExercise
          : state.selectedExercise,
        isLoading: false
      }));

      return { success: true, exercise: updatedExercise };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al actualizar ejercicio';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Delete exercise
  deleteExercise: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await exercisesAPI.delete(id);

      set((state) => ({
        exercises: state.exercises.filter((ex) => ex._id !== id),
        selectedExercise: state.selectedExercise?._id === id
          ? null
          : state.selectedExercise,
        isLoading: false
      }));

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Error al eliminar ejercicio';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Set selected exercise
  setSelectedExercise: (exercise) => {
    set({ selectedExercise: exercise });
  },

  // Clear error
  clearError: () => {
    set({ error: null });
  },

  // Get exercise data map for muscle stimulus calculation and metadata
  // Returns { exerciseId: { muscleContribution, equipment, category, type, muscleGroup } }
  getExerciseDataMap: () => {
    const exercises = get().exercises;
    const map = {};

    exercises.forEach(ex => {
      map[ex._id] = {
        muscleContribution: ex.muscleContribution || {},
        equipment: ex.equipment || 'other',
        category: ex.category || 'other',
        type: ex.type || 'compound',
        muscleGroup: ex.muscleGroup || { primary: [], secondaryStrong: [], secondaryMedium: [], secondaryLight: [] }
      };
    });

    return map;
  },

  // Get exercise by ID
  getExerciseById: (id) => {
    return get().exercises.find(ex => ex._id === id || ex._id === id?.toString());
  }
}));

export default useExerciseStore;
