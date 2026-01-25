import { create } from 'zustand';
import { authAPI } from '../services/api';
import useWorkoutStore from './workoutStore';

/**
 * Authentication store using Zustand
 * Manages user authentication state and persistence
 */
const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem('token') || null,
  refreshToken: localStorage.getItem('refreshToken') || null,
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,
  isInitialized: false, // Track if we've attempted to fetch user data
  error: null,

  // Login action
  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.login({ username, password });
      const { user, token, refreshToken } = response.data.data;

      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
        error: null
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Register action
  register: async (username, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authAPI.register({ username, password, name });
      const { user, token, refreshToken } = response.data.data;

      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false,
        error: null
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      set({
        isLoading: false,
        error: errorMessage
      });
      return { success: false, error: errorMessage };
    }
  },

  // Logout action
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('activeWorkout'); // Clear active workout

    // Clear workout store
    useWorkoutStore.getState().clearActiveWorkout();

    set({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isInitialized: true, // Keep initialized state
      error: null
    });
  },

  // Fetch current user
  fetchUser: async () => {
    const token = get().token;

    // If no token, mark as initialized and return
    if (!token) {
      set({ isInitialized: true, isLoading: false });
      return { success: false, error: 'No token' };
    }

    set({ isLoading: true });
    try {
      const response = await authAPI.getMe();
      set({
        user: response.data.data,
        isAuthenticated: true,
        isInitialized: true,
        isLoading: false
      });
      return { success: true };
    } catch (error) {
      console.error('Failed to fetch user:', error);
      set({
        isLoading: false,
        isInitialized: true,
        error: error.response?.data?.message || 'Failed to fetch user'
      });
      // If fetch fails, logout (token is invalid)
      get().logout();
      return { success: false, error: error.response?.data?.message };
    }
  },

  // Update preferences
  updatePreferences: async (preferences) => {
    try {
      const response = await authAPI.updatePreferences(preferences);
      set({
        user: response.data.data
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update preferences'
      };
    }
  },

  // Update body weight
  updateBodyWeight: async (bodyWeight) => {
    try {
      const response = await authAPI.updateBodyWeight(bodyWeight);
      set({
        user: response.data.data
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update body weight'
      };
    }
  },

  // Clear error
  clearError: () => set({ error: null })
}));

export default useAuthStore;
