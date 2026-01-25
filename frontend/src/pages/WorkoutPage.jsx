import { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  Clock,
  Check,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Plus,
  Trash2,
  X,
  Activity
} from 'lucide-react';
import { theme } from '../styles/theme';
import { useWorkoutStore } from '../store/workoutStore';
import useRoutineStore from '../store/routineStore';
import useExerciseStore from '../store/exerciseStore';
import useAuthStore from '../store/authStore';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Checkbox from '../components/common/Checkbox';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import Input from '../components/common/Input';
import BodyWeightModal from '../components/common/BodyWeightModal';
import ExerciseProgressionChart from '../components/analytics/ExerciseProgressionChart';
import MuscleRadarChart from '../components/analytics/MuscleRadarChart';
import toast from 'react-hot-toast';
import { CATEGORY_COLORS, CATEGORY_LABELS, EQUIPMENT_LABELS } from '../constants/categories';
import './WorkoutPage.css';

const WorkoutPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const {
    activeWorkout,
    isLoading,
    updateSet,
    completeExercise,
    completeWorkout,
    cancelWorkout,
    changeWorkoutDay,
    removeExercise,
    addExercise,
    addSetToExercise,
    removeSetFromExercise,
    fetchWorkout
  } = useWorkoutStore();
  const { activeRoutine, fetchActiveRoutine } = useRoutineStore();
  const { exercises: allExercises, fetchExercises, getExerciseDataMap } = useExerciseStore();
  const { user } = useAuthStore();

  const [elapsedTime, setElapsedTime] = useState(0);
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [expandedExercises, setExpandedExercises] = useState({});
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [selectedExerciseForStats, setSelectedExerciseForStats] = useState(null);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showDeleteExerciseConfirm, setShowDeleteExerciseConfirm] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSets, setSelectedSets] = useState(3);
  const [showMuscleRadar, setShowMuscleRadar] = useState(false);
  const [showBodyWeightModal, setShowBodyWeightModal] = useState(false);

  // Memoize exerciseDataMap to prevent infinite re-renders in MuscleRadarChart
  const exerciseDataMap = useMemo(() => {
    return getExerciseDataMap();
  }, [allExercises]);

  // Fetch active routine and exercises on mount
  useEffect(() => {
    fetchActiveRoutine();
    fetchExercises();
  }, []);

  // If we have an ID in the URL but no activeWorkout, fetch it from backend
  useEffect(() => {
    if (id && !activeWorkout && !isLoading) {
      fetchWorkout(id);
    }
  }, [id, activeWorkout, isLoading]);

  // Initialize all exercises as collapsed
  useEffect(() => {
    if (activeWorkout) {
      const initialExpanded = {};
      activeWorkout.exercises.forEach(ex => {
        initialExpanded[ex._id] = false;
      });
      setExpandedExercises(initialExpanded);
    }
  }, [activeWorkout?._id]);

  // Check for bodyweight exercises and show modal if user has no body weight saved
  useEffect(() => {
    if (!activeWorkout || !exerciseDataMap || Object.keys(exerciseDataMap).length === 0) return;
    // Don't show if user already has body weight
    if (user?.bodyWeight) return;

    // Check if any exercise in the workout is bodyweight
    const hasBodyweightExercise = activeWorkout.exercises.some(ex => {
      // Check from exerciseDataMap (original exercise data)
      const exerciseData = exerciseDataMap[ex.exerciseId];
      // Also check directly on the exercise (for exercises added during workout)
      return exerciseData?.equipment === 'bodyweight' || ex.equipment === 'bodyweight';
    });

    // Show modal if there's a bodyweight exercise and user has no body weight
    if (hasBodyweightExercise) {
      setShowBodyWeightModal(true);
    }
  }, [activeWorkout?.exercises?.length, exerciseDataMap, user?.bodyWeight]);

  // Timer for workout duration
  useEffect(() => {
    if (!activeWorkout) return;

    const startTime = new Date(activeWorkout.startTime).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeWorkout]);

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  const handleSetToggle = useCallback((exerciseId, setIndex, set) => {
    updateSet(exerciseId, setIndex, {
      ...set,
      isCompleted: !set.isCompleted,
      completedAt: !set.isCompleted ? new Date() : null
    });

    if (!set.isCompleted) {
      toast.success('Serie completada!', { duration: 1000 });

      // Check if this is the last set to be completed
      const exercise = activeWorkout?.exercises.find(ex => ex._id === exerciseId);
      if (exercise) {
        // Count sets that will be completed after this update
        const completedAfterUpdate = exercise.sets.filter((s, idx) =>
          idx === setIndex ? true : s.isCompleted
        ).length;

        // If all sets are completed, auto-collapse the exercise
        if (completedAfterUpdate === exercise.sets.length) {
          // Get reference to exercise card before collapsing to maintain scroll
          const exerciseElement = document.querySelector(`[data-exercise-id="${exerciseId}"]`);
          const scrollPosition = exerciseElement?.getBoundingClientRect().top + window.scrollY;

          // Small delay to allow the completion animation to finish
          setTimeout(() => {
            setExpandedExercises(prev => ({
              ...prev,
              [exerciseId]: false
            }));

            // Restore scroll position after collapse
            if (exerciseElement && scrollPosition) {
              requestAnimationFrame(() => {
                window.scrollTo({ top: scrollPosition - 100, behavior: 'smooth' });
              });
            }
          }, 300);
        }
      }
    }
  }, [updateSet, activeWorkout]);

  const handleSetUpdate = useCallback((exerciseId, setIndex, field, value) => {
    updateSet(exerciseId, setIndex, {
      [field]: value
    });
  }, [updateSet]);

  const handleCompleteExercise = useCallback((exerciseId, exerciseName) => {
    completeExercise(exerciseId);
    toast.success(`${exerciseName} completado!`);
  }, [completeExercise]);

  const handleUncompleteExercise = useCallback((exerciseId, exerciseName) => {
    completeExercise(exerciseId); // Toggle the completion
    toast.success(`${exerciseName} desmarcado`);
  }, [completeExercise]);

  const toggleExercise = useCallback((exerciseId) => {
    setExpandedExercises(prev => ({
      ...prev,
      [exerciseId]: !prev[exerciseId]
    }));
  }, []);

  const handleShowStats = useCallback((exercise, e) => {
    e.stopPropagation();
    setSelectedExerciseForStats(exercise);
    setShowStatsModal(true);
  }, []);

  const handleCloseStats = useCallback(() => {
    setShowStatsModal(false);
    setSelectedExerciseForStats(null);
  }, []);

  const handleChangeDay = async (workoutDayId) => {
    if (!activeRoutine) return;

    const result = await changeWorkoutDay(activeWorkout._id, activeRoutine._id, workoutDayId);

    if (result.success) {
      toast.success('Día de entrenamiento cambiado!');
      setShowDaySelector(false);
    } else {
      toast.error(result.error || 'Error al cambiar el día');
    }
  };

  const handleCompleteWorkout = async () => {
    try {
      await completeWorkout(activeWorkout._id);
      toast.success('Entrenamiento completado!');
      navigate('/');
    } catch (error) {
      toast.error('Error al completar el entrenamiento');
    }
  };

  const handleCancelWorkout = async () => {
    try {
      const result = await cancelWorkout(activeWorkout._id);
      if (result.success) {
        toast.success('Entrenamiento cancelado');
        navigate('/');
      } else {
        toast.error(result.error || 'Error al cancelar');
      }
    } catch (error) {
      toast.error('Error al cancelar el entrenamiento');
    }
    setShowCancelConfirm(false);
  };

  const openDeleteExerciseConfirm = useCallback((exerciseId, exerciseName) => {
    setExerciseToDelete({ id: exerciseId, name: exerciseName });
    setShowDeleteExerciseConfirm(true);
  }, []);

  const handleRemoveExercise = useCallback(async () => {
    if (!exerciseToDelete) return;

    const result = await removeExercise(exerciseToDelete.id);
    if (result.success) {
      toast.success(`${exerciseToDelete.name} eliminado`);
      setShowDeleteExerciseConfirm(false);
      setExerciseToDelete(null);
    } else {
      toast.error('Error al eliminar ejercicio');
    }
  }, [removeExercise, exerciseToDelete]);

  const handleAddSet = useCallback((exerciseId) => {
    addSetToExercise(exerciseId);
  }, [addSetToExercise]);

  const handleRemoveSet = useCallback((exerciseId, setIndex) => {
    removeSetFromExercise(exerciseId, setIndex);
  }, [removeSetFromExercise]);

  const handleAddExercise = async (exercise) => {
    const result = await addExercise({
      exerciseId: exercise._id,
      exerciseName: exercise.name,
      category: exercise.category,
      equipment: exercise.equipment,
      sets: selectedSets
    });

    if (result.success) {
      toast.success(`${exercise.name} añadido!`);
      setShowAddExerciseModal(false);
      setSearchQuery('');
      setSelectedSets(3);
    } else {
      toast.error('Error al añadir ejercicio');
    }
  };

  const openAddExerciseModal = () => {
    fetchExercises();
    setShowAddExerciseModal(true);
  };

  const filteredExercises = allExercises.filter(ex =>
    ex.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return <Spinner fullScreen />;
  }

  if (!activeWorkout) {
    return (
      <div className="workout-empty-state">
        <p className="workout-empty-text">No hay entrenamiento activo</p>
        <Button onClick={() => navigate('/')}>Volver al inicio</Button>
      </div>
    );
  }

  const completedExercises = activeWorkout.exercises.filter(ex => ex.isCompleted).length;
  const totalExercises = activeWorkout.exercises.length;
  const progress = (completedExercises / totalExercises) * 100;

  const getDayName = (dayOfWeek) => {
    const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return days[dayOfWeek];
  };

  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  return (
    <div className="workout-container">
      {/* Date Bar */}
      <div className="workout-date-bar">
        <span className="workout-date-text">{formattedDate}</span>
      </div>

      {/* Header */}
      <div className="workout-header">
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="workout-back-button"
        >
          <ChevronLeft size={24} color={theme.colors.text.primary} />
        </Button>

        <div
          className="workout-header-info"
          onClick={() => setShowDaySelector(!showDaySelector)}
        >
          <h1 className="workout-title">
            {activeWorkout.workoutDayName}
            {showDaySelector ? <ChevronUp size={20} className="workout-chevron" /> : <ChevronDown size={20} className="workout-chevron" />}
          </h1>
          <div className="workout-meta">
            <Clock size={16} />
            <span>{formatTime(elapsedTime)}</span>
          </div>
        </div>
      </div>

      {/* Day Selector Dropdown */}
      <AnimatePresence>
        {showDaySelector && activeRoutine && (
          <motion.div
            className="workout-day-selector-container"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {activeRoutine.workoutDays
              .filter(day => !day.isRestDay && day._id !== activeWorkout.workoutDayId)
              .map(day => (
                <div
                  key={day._id}
                  className="workout-day-option"
                  onClick={() => handleChangeDay(day._id)}
                >
                  <span className="workout-day-option-name">{day.name}</span>
                </div>
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress */}
      <div className="workout-progress-section">
        <div className="workout-progress-header">
          <div className="workout-progress-info">
            <div className="workout-progress-bar">
              <motion.div
                className="workout-progress-fill"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <p className="workout-progress-text">
              {completedExercises} / {totalExercises} ejercicios completados
            </p>
          </div>
          <button
            className="workout-muscle-radar-btn"
            onClick={() => setShowMuscleRadar(true)}
            title="Ver activación muscular"
          >
            <Activity size={18} />
          </button>
        </div>
      </div>

      {/* Exercises */}
      <div className="workout-exercise-list">
        {activeWorkout.exercises.map((exercise, exerciseIndex) => (
          <ExerciseCard
            key={exercise._id}
            exercise={exercise}
            exerciseData={exerciseDataMap[exercise.exerciseId]}
            userBodyWeight={user?.bodyWeight}
            onSetToggle={handleSetToggle}
            onSetUpdate={handleSetUpdate}
            onCompleteExercise={handleCompleteExercise}
            onUncompleteExercise={handleUncompleteExercise}
            onRemoveExercise={openDeleteExerciseConfirm}
            onAddSet={handleAddSet}
            onRemoveSet={handleRemoveSet}
            onToggleExpand={toggleExercise}
            onShowStats={handleShowStats}
            isExpanded={expandedExercises[exercise._id]}
            index={exerciseIndex}
          />
        ))}

        {/* Add Exercise Button */}
        <motion.button
          className="workout-add-exercise-button"
          onClick={openAddExerciseModal}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={20} />
          <span>Añadir ejercicio</span>
        </motion.button>
      </div>

      {/* Complete Workout Button */}
      <div className="workout-footer-section">
        <motion.button
          className="workout-complete-button"
          onClick={handleCompleteWorkout}
          whileTap={{ scale: 0.98 }}
        >
          <div className="workout-complete-button-content">
            <Check size={24} strokeWidth={3} />
            <span className="workout-complete-button-text">Completar Entrenamiento</span>
          </div>
        </motion.button>
        <motion.button
          className="workout-cancel-button"
          onClick={() => setShowCancelConfirm(true)}
          whileTap={{ scale: 0.98 }}
        >
          <X size={20} />
          <span>Cancelar entrenamiento</span>
        </motion.button>
      </div>

      {/* Add Exercise Modal */}
      <Modal
        isOpen={showAddExerciseModal}
        onClose={() => {
          setShowAddExerciseModal(false);
          setSearchQuery('');
        }}
        title="Añadir ejercicio"
      >
        <div className="workout-add-exercise-modal">
          <Input
            placeholder="Buscar ejercicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="workout-exercise-search"
          />

          <div className="workout-sets-selector">
            <label className="workout-sets-label">Número de series:</label>
            <div className="workout-sets-buttons">
              {[1, 2, 3, 4, 5].map(num => (
                <button
                  key={num}
                  className={`workout-sets-button ${selectedSets === num ? 'active' : ''}`}
                  onClick={() => setSelectedSets(num)}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          <div className="workout-exercise-list-modal">
            {filteredExercises.length === 0 ? (
              <p className="workout-no-exercises">No hay ejercicios disponibles</p>
            ) : (
              filteredExercises.map(exercise => {
                // Format muscle groups for display
                const muscleGroupText = exercise.muscleGroup?.primary?.length > 0
                  ? exercise.muscleGroup.primary.join(', ')
                  : 'N/A';

                return (
                  <div
                    key={exercise._id}
                    className="workout-exercise-option"
                    onClick={() => handleAddExercise(exercise)}
                  >
                    <div>
                      <div className="workout-exercise-option-name">{exercise.name}</div>
                      <div className="workout-exercise-option-meta">
                        {muscleGroupText} • {exercise.equipment || 'N/A'}
                      </div>
                    </div>
                    <Plus size={20} color={theme.colors.primary.main} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </Modal>

      {/* Cancel Workout Confirmation Modal */}
      <Modal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        title="Cancelar entrenamiento"
        size="sm"
      >
        <div className="workout-cancel-confirm">
          <p className="workout-cancel-text">
            ¿Estás seguro de que quieres cancelar este entrenamiento?
          </p>
          <p className="workout-cancel-warning">
            Se eliminarán todos los datos registrados en esta sesión.
          </p>
          <div className="workout-cancel-actions">
            <Button variant="ghost" onClick={() => setShowCancelConfirm(false)}>
              Volver
            </Button>
            <Button variant="danger" onClick={handleCancelWorkout}>
              Cancelar entrenamiento
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Exercise Confirmation Modal */}
      <Modal
        isOpen={showDeleteExerciseConfirm}
        onClose={() => {
          setShowDeleteExerciseConfirm(false);
          setExerciseToDelete(null);
        }}
        title="Eliminar ejercicio"
        size="sm"
      >
        <div className="workout-cancel-confirm">
          <p className="workout-cancel-text">
            ¿Estás seguro de que quieres eliminar el ejercicio?
          </p>
          {exerciseToDelete && (
            <p className="workout-cancel-warning">
              <strong>{exerciseToDelete.name}</strong> se eliminará de este entrenamiento.
            </p>
          )}
          <div className="workout-cancel-actions">
            <Button
              variant="ghost"
              onClick={() => {
                setShowDeleteExerciseConfirm(false);
                setExerciseToDelete(null);
              }}
            >
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleRemoveExercise}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Stats Modal */}
      <AnimatePresence>
        {showStatsModal && selectedExerciseForStats && (
          <ExerciseProgressionChart
            key="stats-modal"
            exerciseId={selectedExerciseForStats.exerciseId}
            exerciseName={selectedExerciseForStats.exerciseName}
            onClose={handleCloseStats}
          />
        )}
      </AnimatePresence>

      {/* Muscle Radar Modal */}
      <AnimatePresence>
        {showMuscleRadar && (
          <MuscleRadarChart
            key="muscle-radar-modal"
            exercises={activeWorkout.exercises}
            exerciseDataMap={exerciseDataMap}
            hasWeight={true}
            title="Activación Muscular"
            subtitle={activeWorkout.workoutDayName}
            onClose={() => setShowMuscleRadar(false)}
          />
        )}
      </AnimatePresence>

      {/* Body Weight Modal */}
      <BodyWeightModal
        isOpen={showBodyWeightModal}
        onClose={() => setShowBodyWeightModal(false)}
      />
    </div>
  );
};

// Función de comparación para ExerciseCard - solo re-renderiza si cambian datos relevantes
const areExercisePropsEqual = (prevProps, nextProps) => {
  // Comparar propiedades primitivas
  if (prevProps.isExpanded !== nextProps.isExpanded) return false;
  if (prevProps.index !== nextProps.index) return false;
  if (prevProps.userBodyWeight !== nextProps.userBodyWeight) return false;
  if (prevProps.exerciseData?.equipment !== nextProps.exerciseData?.equipment) return false;

  // Comparar exercise
  const prevEx = prevProps.exercise;
  const nextEx = nextProps.exercise;
  if (prevEx._id !== nextEx._id) return false;
  if (prevEx.isCompleted !== nextEx.isCompleted) return false;
  if (prevEx.sets.length !== nextEx.sets.length) return false;

  // Comparar cada set
  for (let i = 0; i < prevEx.sets.length; i++) {
    const prevSet = prevEx.sets[i];
    const nextSet = nextEx.sets[i];
    if (prevSet._id !== nextSet._id) return false;
    if (prevSet.isCompleted !== nextSet.isCompleted) return false;
    if (prevSet.weight !== nextSet.weight) return false;
    if (prevSet.reps !== nextSet.reps) return false;
  }

  return true;
};

// Exercise Card Component - Memoizado para evitar re-renders innecesarios
const ExerciseCard = memo(({
  exercise,
  exerciseData,
  userBodyWeight,
  onSetToggle,
  onSetUpdate,
  onCompleteExercise,
  onUncompleteExercise,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onToggleExpand,
  onShowStats,
  isExpanded,
  index
}) => {
  const completedSets = exercise.sets.filter(set => set.isCompleted).length;
  const totalSets = exercise.sets.length;

  // Use exercise data from exerciseDataMap or fallback to exercise itself
  const equipment = exercise.equipment || exerciseData?.equipment || 'other';
  const category = exercise.category || exerciseData?.category || 'other';
  const isBodyweight = equipment === 'bodyweight';

  // Get category color
  const categoryColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="workout-exercise-card-wrapper"
          data-exercise-id={exercise._id}
      >
          <Card
              variant={exercise.isCompleted ? 'success' : 'default'}
              className="workout-exercise-card"
              style={{ borderLeft: `4px solid ${categoryColor}` }}
          >
              <div
                  className="workout-exercise-header"
                  onClick={() => onToggleExpand(exercise._id)}
              >
                  <div style={{ flex: 1 }}>
                      <h3 className="workout-exercise-name">
                          {exercise.exerciseName}
                      </h3>
                      <div className="workout-exercise-meta-container">
                          {isExpanded ? (
                              <p className="workout-exercise-meta">
                                  {completedSets} / {totalSets} series completadas
                              </p>
                          ) : (
                              <div className="workout-exercise-badges">
                                  <span
                                      className="workout-exercise-badge workout-exercise-badge-series"
                                  >
                                      {completedSets}/{totalSets} series
                                  </span>
                                  <span
                                      className="workout-exercise-badge workout-exercise-badge-category"
                                      style={{
                                          backgroundColor: `${categoryColor}15`,
                                          color: categoryColor,
                                          borderColor: `${categoryColor}30`,
                                      }}
                                  >
                                      {CATEGORY_LABELS[category] || category}
                                  </span>
                                  {equipment && equipment !== 'other' && (
                                      <span className="workout-exercise-badge workout-exercise-badge-equipment">
                                          {EQUIPMENT_LABELS[equipment] || equipment}
                                      </span>
                                  )}
                              </div>
                          )}
                      </div>
                  </div>
                  <div className="workout-exercise-header-right">
                      {!isExpanded && (
                          <>
                              <button
                                  className="workout-exercise-delete-btn"
                                  onClick={(e) => {
                                      e.stopPropagation();
                                      onRemoveExercise(exercise._id, exercise.exerciseName);
                                  }}
                                  title="Eliminar ejercicio"
                              >
                                  <Trash2 size={16} />
                              </button>
                              <button
                                  className="workout-stats-icon"
                                  onClick={(e) => onShowStats(exercise, e)}
                              >
                                  <TrendingUp size={16} color={theme.colors.primary.main} />
                              </button>
                          </>
                      )}
                      {exercise.isCompleted && (
                          <Badge variant="success" size="sm">
                              <Check size={14} />
                          </Badge>
                      )}
                      {isExpanded ? (
                          <ChevronUp size={20} />
                      ) : (
                          <ChevronDown size={20} />
                      )}
                  </div>
              </div>

                  <AnimatePresence>
                      {isExpanded && (
                          <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                          >
                              <div className="workout-sets-container">
                                  {exercise.sets.map((set, setIndex) => (
                                      <SetRow
                                          key={set._id || `set-${setIndex}`}
                                          set={set}
                                          setIndex={setIndex}
                                          exerciseId={exercise._id}
                                          totalSets={exercise.sets.length}
                                          isExerciseCompleted={
                                              exercise.isCompleted
                                          }
                                          isBodyweight={isBodyweight}
                                          userBodyWeight={userBodyWeight}
                                          onToggle={onSetToggle}
                                          onUpdate={onSetUpdate}
                                          onRemove={onRemoveSet}
                                      />
                                  ))}
                              </div>

                              {!exercise.isCompleted && (
                                  <button
                                      className="workout-add-set-button"
                                      onClick={(e) => {
                                          e.stopPropagation();
                                          onAddSet(exercise._id);
                                      }}
                                  >
                                      <Plus size={16} />
                                      <span>Añadir serie</span>
                                  </button>
                              )}

                              <div className="workout-exercise-actions">
                                  {!exercise.isCompleted ? (
                                      <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                              onCompleteExercise(
                                                  exercise._id,
                                                  exercise.exerciseName,
                                              )
                                          }
                                          leftIcon={
                                              <Check
                                                  size={16}
                                                  style={{
                                                      marginRight: '10px',
                                                      display: 'flex',
                                                  }}
                                              />
                                          }
                                      >
                                          Marcar completo
                                      </Button>
                                  ) : (
                                      <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() =>
                                              onUncompleteExercise(
                                                  exercise._id,
                                                  exercise.exerciseName,
                                              )
                                          }
                                          leftIcon={
                                              <X
                                                  size={16}
                                                  style={{
                                                      marginRight: '10px',
                                                      display: 'flex',
                                                  }}
                                              />
                                          }
                                      >
                                          Desmarcar
                                      </Button>
                                  )}
                              </div>
                          </motion.div>
                      )}
                  </AnimatePresence>
              </Card>
      </motion.div>
  );
}, areExercisePropsEqual);

ExerciseCard.displayName = 'ExerciseCard';

// Función de comparación para SetRow
const areSetPropsEqual = (prevProps, nextProps) => {
  if (prevProps.setIndex !== nextProps.setIndex) return false;
  if (prevProps.exerciseId !== nextProps.exerciseId) return false;
  if (prevProps.totalSets !== nextProps.totalSets) return false;
  if (prevProps.isExerciseCompleted !== nextProps.isExerciseCompleted) return false;
  if (prevProps.isBodyweight !== nextProps.isBodyweight) return false;
  if (prevProps.userBodyWeight !== nextProps.userBodyWeight) return false;

  const prevSet = prevProps.set;
  const nextSet = nextProps.set;
  if (prevSet._id !== nextSet._id) return false;
  if (prevSet.isCompleted !== nextSet.isCompleted) return false;
  // NO comparamos weight/reps aquí porque usamos estado local

  return true;
};

// Set Row Component - Memoizado para evitar re-renders innecesarios
const SetRow = memo(({ set, setIndex, exerciseId, totalSets, isExerciseCompleted, isBodyweight, userBodyWeight, onToggle, onUpdate, onRemove }) => {
  // For bodyweight exercises, use user's body weight as initial value if no weight is set
  const initialWeight = set.weight || (isBodyweight && userBodyWeight ? userBodyWeight : '');
  const [localWeight, setLocalWeight] = useState(initialWeight);
  const [localReps, setLocalReps] = useState(set.reps || '');
  const [dragX, setDragX] = useState(0);

  // Update local state when set data changes from parent (e.g., when loading)
  // Only update if the values are different and we're not just toggling completion
  useEffect(() => {
    if (set.weight > 0) {
      setLocalWeight(set.weight);
    } else if (isBodyweight && userBodyWeight && !localWeight) {
      // Auto-fill body weight for bodyweight exercises
      setLocalWeight(userBodyWeight);
    }
    if (set.reps > 0) setLocalReps(set.reps);
  }, [set._id, isBodyweight, userBodyWeight]);

  // For bodyweight exercises, use user's body weight as placeholder
  const weightPlaceholder = isBodyweight && userBodyWeight
    ? `${userBodyWeight} kg`
    : (set.lastWeight > 0 ? `${set.lastWeight} kg` : '0');
  const repsPlaceholder = set.lastReps > 0 ? `${set.lastReps}` : '0';

  const handleWeightChange = (e) => {
    setLocalWeight(e.target.value);
  };

  const handleRepsChange = (e) => {
    setLocalReps(e.target.value);
  };

  const handleWeightBlur = () => {
    const value = parseFloat(localWeight) || 0;
    onUpdate(exerciseId, setIndex, 'weight', value);
  };

  const handleRepsBlur = () => {
    const value = parseInt(localReps) || 0;
    onUpdate(exerciseId, setIndex, 'reps', value);
  };

  // Prevent form submission on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur(); // Blur to save the value
    }
  };

  const canRemove = !set.isCompleted && !isExerciseCompleted && totalSets > 1;
  const deleteThreshold = -80; // Pixels to swipe left to trigger delete

  const handleDragEnd = (event, info) => {
    if (canRemove && info.offset.x < deleteThreshold) {
      // Trigger delete if swiped past threshold
      onRemove(exerciseId, setIndex);
      toast.success('Serie eliminada');
    }
  };

  return (
    <div className="workout-set-row-wrapper" data-dragging={dragX < 0 ? "true" : "false"}>
      {/* Delete background - shows when swiping */}
      {canRemove && (
        <div className="workout-set-delete-bg">
          <Trash2 size={20} />
        </div>
      )}

      {/* Draggable content */}
      <motion.div
        className={`workout-set-row ${isBodyweight ? 'workout-set-row-bodyweight' : ''}`}
        drag={canRemove ? "x" : false}
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDrag={(event, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        style={{
          x: dragX < deleteThreshold ? deleteThreshold : undefined
        }}
      >
        <div className="workout-set-number-container">
          <span className="workout-set-number">{setIndex + 1}</span>
        </div>

        {!isBodyweight && (
          <div className="workout-input-group" onPointerDown={e => e.stopPropagation()}>
            <label className="workout-input-label">Peso (kg)</label>
            <input
              type="number"
              inputMode="decimal"
              value={localWeight}
              onChange={handleWeightChange}
              onBlur={handleWeightBlur}
              onKeyDown={handleKeyDown}
              className="workout-input"
              placeholder={weightPlaceholder}
              disabled={set.isCompleted}
            />
          </div>
        )}

        <div className="workout-input-group workout-input-group-reps" onPointerDown={e => e.stopPropagation()}>
          <label className="workout-input-label">Reps</label>
          <input
            type="number"
            inputMode="numeric"
            value={localReps}
            onChange={handleRepsChange}
            onBlur={handleRepsBlur}
            onKeyDown={handleKeyDown}
            className="workout-input"
            placeholder={repsPlaceholder}
            disabled={set.isCompleted}
          />
        </div>

        <Checkbox
          checked={set.isCompleted}
          onChange={() => {
            // Save local values before toggling
            // For bodyweight exercises, use user's body weight automatically
            const weight = isBodyweight
              ? (userBodyWeight || 0)
              : (parseFloat(localWeight) || 0);
            const reps = parseInt(localReps) || 0;
            onToggle(exerciseId, setIndex, { ...set, weight, reps });
          }}
          size="lg"
        />
      </motion.div>
    </div>
  );
}, areSetPropsEqual);

SetRow.displayName = 'SetRow';

export default WorkoutPage;
