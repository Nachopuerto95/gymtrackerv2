import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PullToRefresh from 'react-simple-pull-to-refresh';
import {
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Calendar,
  BarChart3,
  Award,
  Target
} from 'lucide-react';
import useExerciseStore from '../store/exerciseStore';
import useStatsStore from '../store/statsStore';
import useWorkoutStore from '../store/workoutStore';
import Card from '../components/common/Card';
import MenuButton from '../components/common/MenuButton';
import Spinner from '../components/common/Spinner';
import { theme } from '../styles/theme';
import toast from 'react-hot-toast';
import './StatsPage.css';

// Category colors - consistent with other pages
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

const CATEGORY_LABELS = {
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombros',
  arms: 'Brazos',
  legs: 'Piernas',
  core: 'Core',
  cardio: 'Cardio',
  other: 'Otro'
};

const StatsPage = () => {
  const { exercises, fetchExercises } = useExerciseStore();
  const { fetchExerciseAnalytics, getExerciseAnalytics, isLoading } = useStatsStore();
  const { workoutHistory, fetchWorkoutHistory } = useWorkoutStore();

  const [expandedExercise, setExpandedExercise] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchExercises();
    fetchWorkoutHistory();
  }, []);

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchExercises(),
        fetchWorkoutHistory()
      ]);
      toast.success('Actualizado', { duration: 1500 });
    } catch (error) {
      toast.error('Error al actualizar');
    }
  };

  const toggleExercise = async (exerciseId) => {
    if (expandedExercise === exerciseId) {
      setExpandedExercise(null);
    } else {
      setExpandedExercise(exerciseId);

      // Only fetch analytics if we don't have them yet
      const cachedAnalytics = getExerciseAnalytics(exerciseId);
      if (!cachedAnalytics) {
        const result = await fetchExerciseAnalytics(exerciseId, 10);
        if (!result.success) {
          toast.error('Error al cargar estadísticas');
        }
      }
    }
  };

  // Get exercises that have been done at least once
  const exercisesWithHistory = exercises.filter(exercise => {
    return workoutHistory.some(workout =>
      workout.exercises.some(ex => ex.exerciseId === exercise._id)
    );
  });

  // Filter exercises by search query and category
  const filteredExercises = exercisesWithHistory.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Calculate overall stats
  const totalWorkouts = workoutHistory.filter(w => w.isCompleted).length;
  const totalExercises = workoutHistory.reduce((sum, w) => sum + w.exercises.length, 0);
  const totalVolume = workoutHistory.reduce((sum, w) => sum + (w.totalVolume || 0), 0);

  const renderContent = () => (
    <div className="stats-container">
      <div className="stats-header">
        <h1 className="stats-title">Estadísticas</h1>
        <MenuButton />
      </div>


      {/* Category Filter */}
      <div className="stats-category-filter">
        <button
          className={`stats-category-btn ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('all')}
        >
          Todos
        </button>
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            className={`stats-category-btn ${selectedCategory === key ? 'active' : ''}`}
            onClick={() => setSelectedCategory(key)}
            style={{
              borderColor: selectedCategory === key ? CATEGORY_COLORS[key] : 'transparent',
              color: selectedCategory === key ? CATEGORY_COLORS[key] : theme.colors.text.secondary
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="stats-search-container">
        <input
          type="text"
          placeholder="Buscar ejercicio..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="stats-search-input"
        />
      </div>

      {/* Exercise List with Analytics */}
      <div className="stats-exercises-list">
        {filteredExercises.length === 0 && (
          <Card variant="secondary" className="stats-empty-state">
            <p className="stats-empty-text">
              {searchQuery || selectedCategory !== 'all'
                ? 'No se encontraron ejercicios'
                : 'No has completado ningún ejercicio todavía'}
            </p>
          </Card>
        )}

        {filteredExercises.map((exercise) => {
          const isExpanded = expandedExercise === exercise._id;
          const analytics = getExerciseAnalytics(exercise._id);
          const categoryColor = CATEGORY_COLORS[exercise.category] || CATEGORY_COLORS.other;

          // Calculate summary stats
          const workoutsWithExercise = workoutHistory.filter(w =>
            w.exercises.some(ex => ex.exerciseId === exercise._id)
          );

          const totalSets = workoutsWithExercise.reduce((sum, w) => {
            const ex = w.exercises.find(e => e.exerciseId === exercise._id);
            return sum + (ex?.sets.length || 0);
          }, 0);

          const maxWeightEver = workoutsWithExercise.reduce((max, w) => {
            const ex = w.exercises.find(e => e.exerciseId === exercise._id);
            if (!ex) return max;
            const exerciseMax = Math.max(...ex.sets.map(s => s.weight));
            return Math.max(max, exerciseMax);
          }, 0);

          return (
            <Card
              key={exercise._id}
              variant="secondary"
              className="stats-exercise-card"
            >
              <div
                className="stats-exercise-header"
                onClick={() => toggleExercise(exercise._id)}
                style={{ borderLeft: `4px solid ${categoryColor}` }}
              >
                <div className="stats-exercise-info">
                  <div className="stats-exercise-name">{exercise.name}</div>
                  <div className="stats-exercise-meta">
                    <span className="stats-exercise-category" style={{ color: categoryColor }}>
                      {CATEGORY_LABELS[exercise.category] || 'Otro'}
                    </span>
                    <span className="stats-exercise-count">
                      {workoutsWithExercise.length} entrenamientos • {totalSets} series
                    </span>
                  </div>
                </div>
                <div className="stats-exercise-actions">
                  {maxWeightEver > 0 && (
                    <div className="stats-exercise-max">
                      <Award size={16} style={{ color: theme.colors.warning.main }} />
                      <span>{maxWeightEver} kg</span>
                    </div>
                  )}
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={20} />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="stats-exercise-details"
                  >
                    {isLoading && !analytics && (
                      <div className="stats-loading">
                        <Spinner size="sm" />
                        <span>Cargando estadísticas...</span>
                      </div>
                    )}

                    {analytics && analytics.length > 0 && (
                      <>
                        <div className="stats-analytics-header">
                          <h4 className="stats-analytics-title">
                            Historial (últimos {analytics.length} entrenamientos)
                          </h4>
                        </div>

                        <div className="stats-analytics-list">
                          {analytics.map((data, index) => (
                            <div key={index} className="stats-analytics-item">
                              <div className="stats-analytics-date">
                                {new Date(data.date).toLocaleDateString('es-ES', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </div>
                              <div className="stats-analytics-metrics">
                                <div className="stats-analytics-metric">
                                  <Target size={14} />
                                  <span>Peso máx: <strong>{data.maxWeight} kg</strong></span>
                                </div>
                                <div className="stats-analytics-metric">
                                  <TrendingUp size={14} />
                                  <span>Volumen: <strong>{data.totalVolume} kg</strong></span>
                                </div>
                                <div className="stats-analytics-metric">
                                  <BarChart3 size={14} />
                                  <span>{data.sets} series • {data.totalReps} reps</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Progression indicator */}
                        {analytics.length >= 2 && (
                          <div className="stats-progression">
                            {analytics[0].maxWeight > analytics[analytics.length - 1].maxWeight && (
                              <div className="stats-progression-indicator positive">
                                <TrendingUp size={16} />
                                <span>
                                  +{(analytics[0].maxWeight - analytics[analytics.length - 1].maxWeight).toFixed(1)} kg
                                  desde el inicio
                                </span>
                              </div>
                            )}
                            {analytics[0].maxWeight < analytics[analytics.length - 1].maxWeight && (
                              <div className="stats-progression-indicator negative">
                                <TrendingUp size={16} style={{ transform: 'rotate(180deg)' }} />
                                <span>
                                  {(analytics[analytics.length - 1].maxWeight - analytics[0].maxWeight).toFixed(1)} kg
                                  desde el inicio
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}

                    {analytics && analytics.length === 0 && (
                      <div className="stats-no-analytics">
                        <p>No hay datos suficientes para mostrar estadísticas</p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          );
        })}
      </div>
    </div>
  );

  return (
    <PullToRefresh
      onRefresh={handleRefresh}
      pullingContent=""
      refreshingContent={<div className="stats-refreshing">Actualizando...</div>}
      pullDownThreshold={80}
      maxPullDownDistance={100}
      resistance={2}
    >
      {renderContent()}
    </PullToRefresh>
  );
};

export default StatsPage;
