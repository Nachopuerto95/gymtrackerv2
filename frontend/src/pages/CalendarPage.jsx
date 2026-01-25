import { useState, useEffect } from 'react';
import PullToRefresh from 'react-simple-pull-to-refresh';
import { AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Dumbbell, Clock, TrendingUp, Calendar as CalendarIcon, Flame, Award, ChevronDown, Zap, Activity } from 'lucide-react';
import useWorkoutStore from '../store/workoutStore';
import useRoutineStore from '../store/routineStore';
import Card from '../components/common/Card';
import MenuButton from '../components/common/MenuButton';
import MuscleRadarChart from '../components/analytics/MuscleRadarChart';
import useExerciseStore from '../store/exerciseStore';
import { theme } from '../styles/theme';
import toast from 'react-hot-toast';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../constants/categories';
import './CalendarPage.css';

const CalendarPage = () => {
  const { workoutHistory, fetchWorkoutHistory } = useWorkoutStore();
  const { activeRoutine, fetchActiveRoutine } = useRoutineStore();
  const { exercises, fetchExercises, getExerciseDataMap } = useExerciseStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [expandedExercises, setExpandedExercises] = useState({});
  const [showMuscleRadar, setShowMuscleRadar] = useState(false);

  useEffect(() => {
    fetchWorkoutHistory();
    fetchActiveRoutine();
    fetchExercises();
  }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  // Group workouts by date
  const workoutsByDate = workoutHistory.reduce((acc, workout) => {
    const date = new Date(workout.date).toLocaleDateString('en-CA'); // YYYY-MM-DD
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(workout);
    return acc;
  }, {});

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedWorkout(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedWorkout(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedWorkout(null);
  };

  const toggleExercise = (exerciseIndex) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseIndex]: !prev[exerciseIndex]
    }));
  };

  const selectWorkout = (workout) => {
    setSelectedWorkout(workout);
    // Reset expanded state - all exercises collapsed by default
    setExpandedExercises({});
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  // Calculate stats for the month
  const currentMonthWorkouts = workoutHistory.filter(w => {
    const workoutDate = new Date(w.date);
    return workoutDate.getMonth() === month && workoutDate.getFullYear() === year;
  });

  const totalWorkoutsThisMonth = currentMonthWorkouts.length;
  const totalWorkoutsAllTime = workoutHistory.filter(w => w.isCompleted).length;

  // Calculate weekly streak
  const calculateStreak = () => {
    if (!activeRoutine || workoutHistory.length === 0) return 0;

    // Get number of workout days per week (excluding rest days)
    const workoutDaysPerWeek = activeRoutine.workoutDays.filter(day => !day.isRestDay).length;

    let streak = 0;
    const today = new Date();

    // Start from the beginning of current week (Monday)
    const currentWeekStart = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 0 = Sunday, need to go back 6 days
    currentWeekStart.setDate(today.getDate() - daysToMonday);
    currentWeekStart.setHours(0, 0, 0, 0);

    // Check weeks backwards
    for (let weekOffset = 0; weekOffset < 52; weekOffset++) {
      const weekStart = new Date(currentWeekStart);
      weekStart.setDate(weekStart.getDate() - (weekOffset * 7));

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      // Count workouts in this week
      const workoutsInWeek = workoutHistory.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate >= weekStart && workoutDate < weekEnd && w.isCompleted;
      }).length;

      // If this week has all required workouts, increment streak
      if (workoutsInWeek >= workoutDaysPerWeek) {
        streak++;
      } else {
        // Streak is broken, stop counting
        break;
      }
    }

    return streak;
  };

  const weeklyStreak = calculateStreak();

  const handleRefresh = async () => {
    try {
      const [historyResult, routineResult] = await Promise.all([
        fetchWorkoutHistory(),
        fetchActiveRoutine()
      ]);
      if (historyResult.success || routineResult.success) {
        toast.success('Actualizado', { duration: 1500 });
      }
      return { success: true };
    } catch (error) {
      toast.error('Error al actualizar');
      throw error;
    }
  };

  const renderContent = () => (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1 className="calendar-title">Historial</h1>
        <MenuButton />
      </div>

      {/* Monthly Stats */}
      <div className="calendar-stats-container">
        <div>
          <Card className="calendar-stat-card calendar-stat-card-primary">
            <div className="calendar-stat-icon-wrapper calendar-stat-icon-primary">
              <CalendarIcon size={20} />
            </div>
            <div className="calendar-stat-value">
              {totalWorkoutsThisMonth}
            </div>
            <div className="calendar-stat-label">Este mes</div>
          </Card>
        </div>
        <div>
          <Card className="calendar-stat-card calendar-stat-card-warning">
            <div className="calendar-stat-icon-wrapper calendar-stat-icon-warning">
              <Flame size={20} />
            </div>
            <div className="calendar-stat-value">
              {weeklyStreak}
            </div>
            <div className="calendar-stat-label">Racha</div>
          </Card>
        </div>
        <div>
          <Card className="calendar-stat-card calendar-stat-card-success">
            <div className="calendar-stat-icon-wrapper calendar-stat-icon-success">
              <Award size={20} />
            </div>
            <div className="calendar-stat-value">
              {totalWorkoutsAllTime}
            </div>
            <div className="calendar-stat-label">Total</div>
          </Card>
        </div>
      </div>

      {/* Calendar Navigation */}
      <Card className="calendar-calendar-card">
        <div className="calendar-calendar-header">
          <button onClick={goToPreviousMonth} className="calendar-nav-button">
            <ChevronLeft size={24} />
          </button>
          <div className="calendar-month-year-container">
            <h2 className="calendar-month-year">{monthNames[month]} {year}</h2>
            <button onClick={goToToday} className="calendar-today-button">
              Hoy
            </button>
          </div>
          <button onClick={goToNextMonth} className="calendar-nav-button">
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Day Names */}
        <div className="calendar-day-names-row">
          {dayNames.map(day => (
            <div key={day} className="calendar-day-name">{day}</div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="calendar-calendar-grid">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: startingDayOfWeek }).map((_, index) => (
            <div key={`empty-${index}`} className="calendar-empty-day" />
          ))}

          {/* Days of the month */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const day = index + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const workoutsForDay = workoutsByDate[dateStr] || [];
            const hasWorkout = workoutsForDay.length > 0;
            const isToday = new Date().toLocaleDateString('en-CA') === dateStr;

            return (
              <div
                key={day}
                className={`calendar-day-cell ${hasWorkout ? 'calendar-day-cell-with-workout' : ''} ${isToday ? 'calendar-today-cell' : ''}`}
                onClick={() => {
                  if (hasWorkout) {
                    selectWorkout(workoutsForDay[0]);
                  }
                }}
              >
                <div className="calendar-day-number">{day}</div>
                {hasWorkout && (
                  <div className="calendar-workout-indicator">
                    <Dumbbell size={12} color={theme.colors.primary.main} />
                    {workoutsForDay.length > 1 && (
                      <span className="calendar-workout-count">+{workoutsForDay.length - 1}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Selected Workout Details */}
      {selectedWorkout && (
        <div>
          <Card variant="highlighted" className="calendar-workout-details-card">
            <div className="calendar-workout-details-header">
              <div>
                <h3 className="calendar-workout-name">{selectedWorkout.workoutDayName}</h3>
                <p className="calendar-workout-date">
                  {new Date(selectedWorkout.date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelectedWorkout(null)}
                className="calendar-close-button"
              >
                ✕
              </button>
            </div>

            <div className="calendar-workout-metrics">
              <div className="calendar-metric">
                <Clock size={16} color={theme.colors.text.secondary} />
                <span>{formatDuration(selectedWorkout.duration)}</span>
              </div>
              <div className="calendar-metric">
                <TrendingUp size={16} color={theme.colors.text.secondary} />
                <span>{selectedWorkout.totalVolume} kg</span>
              </div>
              <div className="calendar-metric">
                <span className="calendar-metric-label">{selectedWorkout.totalSets} series</span>
              </div>
              <button
                className="calendar-muscle-radar-btn"
                onClick={() => setShowMuscleRadar(true)}
                title="Ver activación muscular"
              >
                <Activity size={16} />
              </button>
            </div>

            <div className="calendar-exercises-list">
              {selectedWorkout.exercises.map((exercise, index) => {
                const isExpanded = expandedExercises[index];
                const categoryColor = CATEGORY_COLORS[exercise.category] || CATEGORY_COLORS.other;
                const categoryLabel = CATEGORY_LABELS[exercise.category] || exercise.category;

                // Calculate total volume for this exercise
                const exerciseVolume = exercise.sets.reduce((total, set) => {
                  return total + (set.weight * set.reps);
                }, 0);

                return (
                  <div
                    key={exercise._id || `ex-${index}`}
                    className="calendar-exercise-item"
                    style={{ borderLeft: `4px solid ${categoryColor}` }}
                  >
                    <div
                      className="calendar-exercise-header"
                      onClick={() => toggleExercise(index)}
                    >
                      <div className="calendar-exercise-header-left">
                        <div className="calendar-exercise-title-row">
                          <span className="calendar-exercise-name">{exercise.exerciseName}</span>
                          {categoryLabel && (
                            <span
                              className="calendar-exercise-category-badge"
                              style={{
                                backgroundColor: `${categoryColor}15`,
                                color: categoryColor,
                                borderColor: `${categoryColor}40`
                              }}
                            >
                              {categoryLabel}
                            </span>
                          )}
                        </div>
                        <div className="calendar-exercise-meta">
                          <span className="calendar-exercise-sets">
                            <Zap size={12} style={{ color: categoryColor }} />
                            {exercise.sets.length} series
                          </span>
                          <span className="calendar-exercise-volume">
                            {exerciseVolume.toLocaleString()} kg vol.
                          </span>
                        </div>
                      </div>
                      <div
                        className="calendar-chevron-icon"
                        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >
                        <ChevronDown size={20} />
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="calendar-sets-list">
                        {exercise.sets.map((set, setIndex) => (
                          <div
                            key={set._id || `set-${setIndex}`}
                            className="calendar-set-item"
                          >
                            <span className="calendar-set-number">Serie {setIndex + 1}</span>
                            <span className="calendar-set-value">
                              <strong>{set.weight}</strong> kg × <strong>{set.reps}</strong> reps
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  return (
    <>
      <PullToRefresh
        onRefresh={handleRefresh}
        pullingContent=""
        refreshingContent={<div className="calendar-refreshing">Actualizando...</div>}
        pullDownThreshold={80}
        maxPullDownDistance={100}
        resistance={2}
      >
        {renderContent()}
      </PullToRefresh>

      {/* Muscle Radar Modal */}
      <AnimatePresence>
        {showMuscleRadar && selectedWorkout && (
          <MuscleRadarChart
            key="muscle-radar-modal"
            exercises={selectedWorkout.exercises}
            exerciseDataMap={getExerciseDataMap()}
            hasWeight={true}
            title="Activación Muscular"
            subtitle={selectedWorkout.workoutDayName}
            onClose={() => setShowMuscleRadar(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CalendarPage;
