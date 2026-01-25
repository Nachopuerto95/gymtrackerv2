import { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import GlobalStyles from './styles/GlobalStyles';
import useAuthStore from './store/authStore';
import AppLayout from './components/layout/AppLayout';
import LoadingScreen from './components/common/LoadingScreen';

// Pages
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import WorkoutPage from './pages/WorkoutPage';
import ExercisesPage from './pages/ExercisesPage';
import CalendarPage from './pages/CalendarPage';
import RoutinesPage from './pages/RoutinesPage';
import RoutineBuilderPage from './pages/RoutineBuilderPage';

/**
 * Protected route wrapper
 * Only renders children if user is authenticated AND initialized
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isInitialized } = useAuthStore();

  // If not initialized yet, don't render anything (parent will show loading)
  if (!isInitialized) {
    return null;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

/**
 * Main App component
 * Handles authentication initialization on mount
 */
function App() {
  const { isInitialized, fetchUser, token } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    // Only fetch user if there's a token
    if (token) {
      fetchUser();
    } else {
      // No token, mark as initialized so we can show login page
      useAuthStore.setState({ isInitialized: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Listen for auth events (from API interceptor) to maintain PWA standalone mode
  useEffect(() => {
    const handleLogout = () => {
      useAuthStore.getState().logout();
    };

    // Handle token refresh - sync Zustand store and re-fetch user
    const handleTokenRefreshed = (event) => {
      const { token } = event.detail;
      useAuthStore.setState({ token });
      // Re-fetch user to ensure state is fully synchronized
      useAuthStore.getState().fetchUser();
    };

    window.addEventListener('auth:logout', handleLogout);
    window.addEventListener('auth:token-refreshed', handleTokenRefreshed);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
    };
  }, []);

  // Show loading screen while initializing authentication
  if (!isInitialized) {
    return (
      <>
        <GlobalStyles />
        <LoadingScreen />
      </>
    );
  }

  return (
    <Router>
      <GlobalStyles />
      <Toaster
        position="top-center"
        containerStyle={{
          top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
        }}
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1A1F27',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '0px'
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF'
            }
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF'
            }
          }
        }}
      />

      <AppLayout>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />

          {/* Workout page */}
          <Route
            path="/workout/:id"
            element={
              <ProtectedRoute>
                <WorkoutPage />
              </ProtectedRoute>
            }
          />

          {/* Exercises page */}
          <Route
            path="/exercises"
            element={
              <ProtectedRoute>
                <ExercisesPage />
              </ProtectedRoute>
            }
          />

          {/* Calendar/History page */}
          <Route
            path="/calendar"
            element={
              <ProtectedRoute>
                <CalendarPage />
              </ProtectedRoute>
            }
          />

          {/* Routines page */}
          <Route
            path="/routines"
            element={
              <ProtectedRoute>
                <RoutinesPage />
              </ProtectedRoute>
            }
          />

          {/* Routine Builder - new routine */}
          <Route
            path="/routines/new"
            element={
              <ProtectedRoute>
                <RoutineBuilderPage />
              </ProtectedRoute>
            }
          />

          {/* Routine Builder - edit existing */}
          <Route
            path="/routines/:id/edit"
            element={
              <ProtectedRoute>
                <RoutineBuilderPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
