import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and we haven't retried yet
    if (error.response?.status === 401 && error.response?.data?.expired && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken
          });

          const { token } = response.data.data;
          localStorage.setItem('token', token);

          // Dispatch event to notify that token was refreshed
          // This allows the auth store to sync without circular dependency
          window.dispatchEvent(new CustomEvent('auth:token-refreshed', { detail: { token } }));

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        // Dispatch custom event instead of window.location to maintain PWA standalone mode
        window.dispatchEvent(new CustomEvent('auth:logout'));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updatePreferences: (data) => api.put('/auth/preferences', data),
  updateBodyWeight: (bodyWeight) => api.put('/auth/body-weight', { bodyWeight })
};

// Routines API
export const routinesAPI = {
  getAll: (params) => api.get('/routines', { params }),
  getOne: (id) => api.get(`/routines/${id}`),
  create: (data) => api.post('/routines', data),
  update: (id, data) => api.put(`/routines/${id}`, data),
  delete: (id) => api.delete(`/routines/${id}`),
  activate: (id) => api.put(`/routines/${id}/activate`),
  deactivate: () => api.put('/routines/deactivate'),
  getActive: () => api.get('/routines/active'),
  copy: (id) => api.post(`/routines/${id}/copy`),
  reorderExercises: (routineId, dayId, exercises) =>
    api.put(`/routines/${routineId}/days/${dayId}/reorder`, { exercises }),
  reorderDays: (routineId, days) =>
    api.put(`/routines/${routineId}/reorder-days`, { days })
};

// Exercises API
export const exercisesAPI = {
  getAll: (params) => api.get('/exercises', { params }),
  getOne: (id) => api.get(`/exercises/${id}`),
  create: (data) => api.post('/exercises', data),
  update: (id, data) => api.put(`/exercises/${id}`, data),
  delete: (id) => api.delete(`/exercises/${id}`),
  search: (query) => api.get('/exercises/search', { params: { q: query } })
};

// Workouts API
export const workoutsAPI = {
  getAll: (params) => api.get('/workouts', { params }),
  getOne: (id) => api.get(`/workouts/${id}`),
  getToday: () => api.get('/workouts/today'),
  start: (data) => api.post('/workouts/start', data),
  update: (id, data) => api.put(`/workouts/${id}`, data),
  complete: (id) => api.put(`/workouts/${id}/complete`),
  reopen: (id) => api.put(`/workouts/${id}/reopen`),
  changeDay: (id, data) => api.put(`/workouts/${id}/change-day`, data),
  delete: (id) => api.delete(`/workouts/${id}`),
  getExerciseAnalytics: (exerciseId, params) =>
    api.get(`/workouts/analytics/${exerciseId}`, { params }),
  getExerciseHistory: (exerciseId) =>
    api.get(`/workouts/exercise-history/${exerciseId}`),
  cleanupDuplicates: () => api.post('/workouts/cleanup-duplicates')
};

export default api;
