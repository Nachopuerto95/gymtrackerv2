import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PullToRefresh from 'react-simple-pull-to-refresh';
import {
  Calendar,
  TrendingUp,
  ListChecks,
  Play,
  ChevronDown,
  ChevronUp,
  Clock,
  Dumbbell,
  Check,
  BarChart3
} from 'lucide-react';
import useRoutineStore from '../store/routineStore';
import useWorkoutStore from '../store/workoutStore';
import useAuthStore from '../store/authStore';
import Card from '../components/common/Card';
import MenuButton from '../components/common/MenuButton';
import toast from 'react-hot-toast';
import './HomePage.css';

// Category colors - consistent with ExerciseCard and CalendarPage
const CATEGORY_COLORS = {
  chest: '#FF6B9D',
  back: '#4ADE80',
  shoulders: '#FBBF24',
  arms: '#A78BFA',
  legs: '#F97316',
  core: '#06B6D4',
  cardio: '#EF4444',
  other: '#9CA3AF'
};

const HomePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { activeRoutine, fetchActiveRoutine, getTodaysWorkout } = useRoutineStore();
  const { startWorkout, activeWorkout, getTodayWorkout, reopenWorkout } = useWorkoutStore();

  const [showDaySelector, setShowDaySelector] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [todayCompletedWorkout, setTodayCompletedWorkout] = useState(null);
  const [todayActiveSession, setTodayActiveSession] = useState(null);

  useEffect(() => {
    fetchActiveRoutine();
    checkTodayWorkout();
  }, []);

  const checkTodayWorkout = async () => {
    const result = await getTodayWorkout();
    if (result.success) {
      // Set active session if exists (takes priority)
      if (result.activeSession) {
        setTodayActiveSession(result.activeSession);
      }
      // Set completed session only if it's actually completed
      if (result.completedSession && result.completedSession.isCompleted) {
        setTodayCompletedWorkout(result.completedSession);
      }
    }
  };

  const todaysWorkout = getTodaysWorkout();

  // Set today's workout as default selected day
  useEffect(() => {
    if (todaysWorkout && !selectedDay) {
      setSelectedDay(todaysWorkout);
    }
  }, [todaysWorkout, selectedDay]);

  const handleStartWorkout = async () => {
    // If there's already an active workout in store, just navigate to it
    if (activeWorkout) {
      navigate(`/workout/${activeWorkout._id}`);
      return;
    }

    // If there's an active session from backend (but not in localStorage), navigate to it
    if (todayActiveSession) {
      navigate(`/workout/${todayActiveSession._id}`);
      return;
    }

    if (!activeRoutine || !selectedDay) {
      toast.error('No se pudo iniciar el entrenamiento');
      return;
    }

    if (selectedDay.isRestDay) {
      toast.error('No puedes entrenar en un día de descanso');
      return;
    }

    toast.loading('Iniciando entrenamiento...', { id: 'start-workout' });

    const result = await startWorkout(activeRoutine._id, selectedDay._id);

    if (result.success) {
      toast.success('Entrenamiento iniciado!', { id: 'start-workout' });
      navigate(`/workout/${result.workout._id}`);
    } else {
      toast.error(result.error || 'Error al iniciar', { id: 'start-workout' });
    }
  };

  const handleChangeDay = (day) => {
    setSelectedDay(day);
    setShowDaySelector(false);
  };

  const handleRefresh = async () => {
    await fetchActiveRoutine();
    await checkTodayWorkout();
    toast.success('Actualizado', { duration: 1500 });
  };

  const handleReopenWorkout = async () => {
    if (!todayCompletedWorkout) return;

    toast.loading('Reabriendo entrenamiento...', { id: 'reopen-workout' });

    const result = await reopenWorkout(todayCompletedWorkout._id);

    if (result.success) {
      toast.success('Entrenamiento reabierto!', { id: 'reopen-workout' });
      navigate(`/workout/${todayCompletedWorkout._id}`);
    } else {
      toast.error(result.error || 'Error al reabrir', { id: 'reopen-workout' });
    }
  };

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const renderContent = () => {
    if (!activeRoutine) {
      return (
        <>
          {/* Header - consistent across all states */}
          <div className="home-header">
            <h1 className="home-title">Inicio</h1>
            <MenuButton />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="home-center-content"
          >
            <h2 className="home-subtitle-heading">No tienes una rutina activa</h2>
            <p className="home-subtitle">
              Crea o activa una rutina para empezar
            </p>
            <button
              onClick={() => navigate('/routines')}
              className="home-primary-button"
            >
              Ver rutinas
            </button>
          </motion.div>
        </>
      );
    }

    if (todaysWorkout?.isRestDay && !selectedDay) {
      return (
        <>
          {/* Header - consistent across all states */}
          <div className="home-header">
            <h1 className="home-title">Inicio</h1>
            <MenuButton />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="home-greeting-section">
              <h2 className="home-greeting">Día de descanso</h2>
              <p className="home-date-text">{formattedDate}</p>
            </div>

            <Card variant="highlighted" className="home-rest-card">
              <div className="home-rest-content">
                <div className="home-rest-emoji">🛌</div>
                <h2 className="home-rest-title">{todaysWorkout.name}</h2>
                <p className="home-subtitle">
                  Recupérate y prepárate para el próximo entrenamiento
                </p>
              </div>
            </Card>

            {/* Day Selector - Allow changing day even on rest day */}
            {activeRoutine && (
              <Card variant="secondary" className="home-workout-card">
                <div
                  className="home-day-selector"
                  onClick={() => setShowDaySelector(!showDaySelector)}
                >
                  <h3 className="home-workout-title">¿Quieres entrenar otro día?</h3>
                  {showDaySelector ?
                    <ChevronUp size={20} className="home-chevron" /> :
                    <ChevronDown size={20} className="home-chevron" />
                  }
                </div>

                {/* Day Selector Dropdown */}
                <AnimatePresence>
                  {showDaySelector && (
                    <motion.div
                      className="home-day-selector-container"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      {activeRoutine.workoutDays
                        .filter(day => !day.isRestDay)
                        .map(day => (
                          <div
                            key={day._id}
                            className="home-day-option"
                            onClick={() => handleChangeDay(day)}
                          >
                            <span className="home-day-option-name">
                              {day.name}
                            </span>
                          </div>
                        ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            )}
          </motion.div>
        </>
      );
    }

    // If there's a completed workout today, show summary instead
    if (todayCompletedWorkout && todayCompletedWorkout.isCompleted) {
      return (
        <>
          {/* Header - consistent across all states */}
          <div className="home-header">
            <h1 className="home-title">Inicio</h1>
            <MenuButton />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="home-greeting-section">
              <h2 className="home-greeting">
                {getGreeting()}, {user?.name || 'Atleta'}
              </h2>
              <p className="home-date-text">{formattedDate}</p>
            </div>

            <Card variant="success" className="home-workout-card">
              <div className="home-completed-workout-header">
                <div className="home-completed-badge">
                  <Check size={20} />
                  <span>Entrenamiento completado</span>
                </div>
                <h2 className="home-workout-title">{todayCompletedWorkout.workoutDayName}</h2>
              </div>

              <div className="home-workout-stats">
                <div className="home-stat-item">
                  <Clock size={18} />
                  <div>
                    <p className="home-stat-label">Duración</p>
                    <p className="home-stat-value">{formatDuration(todayCompletedWorkout.duration)}</p>
                  </div>
                </div>
                <div className="home-stat-item">
                  <Dumbbell size={18} />
                  <div>
                    <p className="home-stat-label">Ejercicios</p>
                    <p className="home-stat-value">{todayCompletedWorkout.exercises.length}</p>
                  </div>
                </div>
                <div className="home-stat-item">
                  <BarChart3 size={18} />
                  <div>
                    <p className="home-stat-label">Series totales</p>
                    <p className="home-stat-value">{todayCompletedWorkout.totalSets}</p>
                  </div>
                </div>
              </div>

              <div className="home-exercises-summary">
                <p className="home-exercises-summary-title">Ejercicios realizados:</p>
                {todayCompletedWorkout.exercises.map((exercise, index) => {
                  const categoryColor = CATEGORY_COLORS[exercise.category] || CATEGORY_COLORS.other;
                  return (
                    <motion.div
                      key={exercise._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="home-exercise-summary-item"
                      style={{ borderLeft: `3px solid ${categoryColor}` }}
                    >
                      <Check size={16} className="home-exercise-check" />
                      <div>
                        <div className="home-exercise-name">{exercise.exerciseName}</div>
                        <div className="home-exercise-info">
                          {exercise.sets.length} series completadas
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <motion.button
                onClick={handleReopenWorkout}
                whileTap={{ scale: 0.98 }}
                className="home-reopen-button"
              >
                <Play size={20} strokeWidth={2.5} />
                <span>Continuar entrenamiento</span>
              </motion.button>
            </Card>
          </motion.div>
        </>
      );
    }

    return (
      <>
        {/* Header - consistent across all states */}
        <div className="home-header">
          <h1 className="home-title">Inicio</h1>
          <MenuButton />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="home-greeting-section">
            <h2 className="home-greeting">
              {getGreeting()}, {user?.name || 'Atleta'}
            </h2>
            <p className="home-date-text">{formattedDate}</p>
          </div>

          {selectedDay && (
            <Card variant="highlighted" className="home-workout-card">
              <div
                className="home-day-selector"
                onClick={() => setShowDaySelector(!showDaySelector)}
              >
                <h2 className="home-workout-title">{selectedDay.name}</h2>
                {showDaySelector ?
                  <ChevronUp size={20} className="home-chevron" /> :
                  <ChevronDown size={20} className="home-chevron" />
                }
              </div>

              {/* Day Selector Dropdown */}
              <AnimatePresence>
                {showDaySelector && activeRoutine && (
                  <motion.div
                    className="home-day-selector-container"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {activeRoutine.workoutDays
                      .filter(day => day._id !== selectedDay._id)
                      .map(day => (
                        <div
                          key={day._id}
                          className="home-day-option"
                          onClick={() => handleChangeDay(day)}
                        >
                          <span className="home-day-option-name">
                            {day.name}
                            {day.isRestDay && ' (Descanso)'}
                          </span>
                        </div>
                      ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {!selectedDay.isRestDay && (
                <>
                  <div className="home-exercises-list">
                    {selectedDay.exercises.map((exercise, index) => {
                      const categoryColor = exercise.category
                        ? (CATEGORY_COLORS[exercise.category] || CATEGORY_COLORS.other)
                        : CATEGORY_COLORS.other;
                      return (
                        <motion.div
                          key={exercise._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="home-exercise-item"
                          style={{ borderLeft: `3px solid ${categoryColor}` }}
                        >
                          <div>
                            <div className="home-exercise-name">{exercise.exerciseName}</div>
                            <div className="home-exercise-info">
                              {exercise.sets} series × {exercise.repsRange.min}-{exercise.repsRange.max} reps
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.button
                    onClick={handleStartWorkout}
                    whileTap={{ scale: 0.98 }}
                    className="home-start-button"
                  >
                    <Play size={24} strokeWidth={3} fill="currentColor" />
                    <span>{(activeWorkout || todayActiveSession) ? 'Continuar' : 'Comenzar'}</span>
                  </motion.button>
                </>
              )}

              {selectedDay.isRestDay && (
                <div className="home-rest-content">
                  <div className="home-rest-emoji">🛌</div>
                  <p className="home-subtitle">
                    Este es un día de descanso. Selecciona otro día si quieres entrenar.
                  </p>
                </div>
              )}
            </Card>
          )}
        </motion.div>
      </>
    );
  };

  return (
    <div className="home-container">
      <PullToRefresh
        onRefresh={handleRefresh}
        pullingContent=""
        refreshingContent={<div className="home-refreshing">Actualizando...</div>}
        pullDownThreshold={80}
        maxPullDownDistance={100}
        resistance={2}
      >
        {renderContent()}
      </PullToRefresh>
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ icon, title, onClick }) => (
  <motion.div
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
  >
    <Card className="home-quick-action-card">
      <div className="home-quick-action-icon">{icon}</div>
      <span className="home-quick-action-title">{title}</span>
    </Card>
  </motion.div>
);

export default HomePage;
