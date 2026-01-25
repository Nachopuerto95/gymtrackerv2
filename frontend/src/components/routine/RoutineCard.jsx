import { useState } from 'react';
import { Edit2, Trash2, Copy, Play, Pause, Lock, Globe, Calendar, Dumbbell, ChevronDown, Flame, Trophy, Target, Zap, Heart, Star, Mountain, Timer, Smile, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import Toggle from '../common/Toggle';
import MuscleRadarChart from '../analytics/MuscleRadarChart';
import { theme } from '../../styles/theme';
import '../../pages/RoutinesPage.css';

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

// Mapa de iconos de rutinas
const ROUTINE_ICON_MAP = {
  dumbbell: Dumbbell,
  flame: Flame,
  trophy: Trophy,
  target: Target,
  zap: Zap,
  heart: Heart,
  star: Star,
  mountain: Mountain,
  timer: Timer,
  bicep: Smile
};

const RoutineCard = ({
  routine,
  isOwner,
  currentUserId,
  onEdit,
  onCopy,
  onDelete,
  onActivate,
  onDeactivate,
  onTogglePrivacy,
  exerciseDataMap = {},
  index = 0
}) => {
  const [showDays, setShowDays] = useState(false);
  const [expandedDays, setExpandedDays] = useState({});
  const [showMuscleRadar, setShowMuscleRadar] = useState(false);

  // Flatten all exercises from all workout days for the radar chart
  const getAllExercises = () => {
    if (!routine.workoutDays) return [];
    return routine.workoutDays.reduce((allExercises, day) => {
      if (day.isRestDay || !day.exercises) return allExercises;
      return [...allExercises, ...day.exercises];
    }, []);
  };

  const totalExercises = routine.workoutDays?.reduce(
    (total, day) => total + (day.isRestDay ? 0 : day.exercises?.length || 0),
    0
  ) || 0;

  const workoutDaysCount = routine.workoutDays?.filter(day => !day.isRestDay).length || 0;

  const creatorName = routine.createdBy?.name || routine.createdBy?.username || 'Usuario';
  const isOwnerCheck = routine.userId?.toString() === currentUserId || routine.createdBy?._id === currentUserId;

  const toggleDay = (dayId) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayId]: !prev[dayId]
    }));
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
      >
          <Card className="routine-card">
              {/* Header */}
              <div className="routine-card-header">
                  <div className="routine-card-title-section">
                      <h3 className="routine-card-name">
                          {(() => {
                              const IconComponent =
                                  ROUTINE_ICON_MAP[routine.icon] || Dumbbell;
                              return (
                                  <IconComponent
                                      size={18}
                                      className="routine-card-icon"
                                  />
                              );
                          })()}
                          {routine.name}
                      </h3>
                      <div className="routine-card-badges">
                          {routine.isActive && (
                              <Badge variant="success">Activa</Badge>
                          )}
                          {routine.isPrivate ? (
                              <Badge
                                  variant="default"
                                  className="routine-card-privacy-badge"
                              >
                                  <Lock size={12} />
                                  Privada
                              </Badge>
                          ) : (
                              <Badge
                                  variant="default"
                                  className="routine-card-public-badge"
                              >
                                  <Globe size={12} />
                                  Pública
                              </Badge>
                          )}
                          {/* Copy button - show for public routines if not owner */}
                          {!isOwnerCheck && !routine.isPrivate && onCopy && (
                              <button
                                  onClick={() => onCopy(routine._id)}
                                  className="routine-card-copy-badge"
                                  title="Copiar rutina"
                              >
                                  <Copy size={12} />
                                  Copiar
                              </button>
                          )}
                      </div>
                  </div>
              </div>

              {/* Stats - clickeable para mostrar/ocultar días */}
              {routine.workoutDays && routine.workoutDays.length > 0 ? (
                  <div className="routine-card-stats-row">
                      <div
                          className="routine-card-stats-clickable"
                          onClick={() => setShowDays(!showDays)}
                      >
                          <div className="routine-card-stats-left">
                              <div className="routine-card-stat">
                                  <Calendar
                                      size={16}
                                      color={theme.colors.text.tertiary}
                                  />
                                  <span>{workoutDaysCount} días</span>
                              </div>
                              <div className="routine-card-stat">
                                  <Dumbbell
                                      size={16}
                                      color={theme.colors.text.tertiary}
                                  />
                                  <span>{totalExercises} ejercicios</span>
                              </div>
                          </div>
                          <motion.div
                              animate={{ rotate: showDays ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="routine-card-chevron"
                          >
                              <ChevronDown size={18} />
                          </motion.div>
                      </div>
                      {totalExercises > 0 && (
                          <button
                              className="routine-card-muscle-radar-btn"
                              onClick={(e) => {
                                  e.stopPropagation();
                                  setShowMuscleRadar(true);
                              }}
                              title="Ver activación muscular"
                          >
                              <Activity size={16} />
                          </button>
                      )}
                  </div>
              ) : (
                  <div className="routine-card-stats">
                      <div className="routine-card-stat">
                          <Calendar
                              size={16}
                              color={theme.colors.text.tertiary}
                          />
                          <span>{workoutDaysCount} días</span>
                      </div>
                      <div className="routine-card-stat">
                          <Dumbbell
                              size={16}
                              color={theme.colors.text.tertiary}
                          />
                          <span>{totalExercises} ejercicios</span>
                      </div>
                  </div>
              )}

              {/* Workout Days List */}
              <AnimatePresence>
                  {showDays &&
                      routine.workoutDays &&
                      routine.workoutDays.length > 0 && (
                          <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: 'easeInOut' }}
                              style={{ overflow: 'hidden' }}
                          >
                              {/* Description */}
                              {routine.description && (
                                  <p className="routine-card-description">
                                      {routine.description}
                                  </p>
                              )}
                              <div className="routine-card-workout-days">
                                  {routine.workoutDays.map((day, dayIndex) => (
                                      <div
                                          key={day._id || dayIndex}
                                          className="routine-card-day"
                                      >
                                          <div
                                              className="routine-card-day-header"
                                              onClick={() =>
                                                  !day.isRestDay &&
                                                  day.exercises?.length > 0 &&
                                                  toggleDay(day._id)
                                              }
                                          >
                                              <div className="routine-card-day-info">
                                                  <span className="routine-card-day-name">
                                                      {day.name}
                                                  </span>
                                                  <span className="routine-card-day-meta">
                                                      {day.isRestDay
                                                          ? 'Día de descanso'
                                                          : `${day.exercises?.length || 0} ejercicios`}
                                                  </span>
                                              </div>
                                              {!day.isRestDay &&
                                                  day.exercises?.length > 0 && (
                                                      <motion.div
                                                          animate={{
                                                              rotate: expandedDays[
                                                                  day._id
                                                              ]
                                                                  ? 180
                                                                  : 0,
                                                          }}
                                                          transition={{
                                                              duration: 0.2,
                                                          }}
                                                          className="routine-card-chevron"
                                                      >
                                                          <ChevronDown
                                                              size={18}
                                                          />
                                                      </motion.div>
                                                  )}
                                          </div>

                                          {/* Exercises List */}
                                          <AnimatePresence>
                                              {expandedDays[day._id] &&
                                                  !day.isRestDay &&
                                                  day.exercises?.length > 0 && (
                                                      <motion.div
                                                          initial={{
                                                              height: 0,
                                                              opacity: 0,
                                                          }}
                                                          animate={{
                                                              height: 'auto',
                                                              opacity: 1,
                                                          }}
                                                          exit={{
                                                              height: 0,
                                                              opacity: 0,
                                                          }}
                                                          transition={{
                                                              duration: 0.2,
                                                          }}
                                                          style={{
                                                              overflow:
                                                                  'hidden',
                                                          }}
                                                      >
                                                          <div className="routine-card-exercises-list">
                                                              {day.exercises.map(
                                                                  (
                                                                      exercise,
                                                                      exIndex,
                                                                  ) => {
                                                                      const categoryColor =
                                                                          CATEGORY_COLORS[
                                                                              exercise
                                                                                  .category
                                                                          ] ||
                                                                          CATEGORY_COLORS.other;
                                                                      return (
                                                                          <motion.div
                                                                              key={
                                                                                  exercise._id ||
                                                                                  exIndex
                                                                              }
                                                                              initial={{
                                                                                  opacity: 0,
                                                                                  x: -10,
                                                                              }}
                                                                              animate={{
                                                                                  opacity: 1,
                                                                                  x: 0,
                                                                              }}
                                                                              transition={{
                                                                                  delay:
                                                                                      exIndex *
                                                                                      0.03,
                                                                              }}
                                                                              className="routine-card-exercise-item"
                                                                              style={{
                                                                                  borderLeft: `3px solid ${categoryColor}`,
                                                                              }}
                                                                          >
                                                                              <div className="routine-card-exercise-info">
                                                                                  <span className="routine-card-exercise-name">
                                                                                      {
                                                                                          exercise.exerciseName
                                                                                      }
                                                                                  </span>
                                                                                  <span className="routine-card-exercise-meta">
                                                                                      {
                                                                                          exercise.sets
                                                                                      }{' '}
                                                                                      series
                                                                                      ×{' '}
                                                                                      {
                                                                                          exercise
                                                                                              .repsRange
                                                                                              ?.min
                                                                                      }

                                                                                      -
                                                                                      {
                                                                                          exercise
                                                                                              .repsRange
                                                                                              ?.max
                                                                                      }{' '}
                                                                                      reps
                                                                                  </span>
                                                                              </div>
                                                                          </motion.div>
                                                                      );
                                                                  },
                                                              )}
                                                          </div>
                                                      </motion.div>
                                                  )}
                                          </AnimatePresence>
                                      </div>
                                  ))}
                              </div>
                          </motion.div>
                      )}
              </AnimatePresence>

              {/* Creator info (if not owner) */}
              {!isOwnerCheck && (
                  <div className="routine-card-creator">
                      <span className="routine-card-creator-label">
                          Creada por:
                      </span>
                      <span className="routine-card-creator-name">
                          {creatorName}
                      </span>
                  </div>
              )}

              
              {/* Actions */}
              <div className="routine-card-actions">
                  {/* Activate button - show for owned routines or public routines (if not active) */}
                  {!routine.isActive &&
                      onActivate &&
                      (isOwnerCheck || !routine.isPrivate) && (
                          <Button
                              variant="primary"
                              size="sm"
                              leftIcon={<Play size={16} />}
                              onClick={() => onActivate(routine._id)}
                          >
                              Activar
                          </Button>
                      )}

                  {/* Deactivate button - show for active routine owned by user */}
                  {routine.isActive && onDeactivate && isOwnerCheck && (
                      <Button
                          variant="ghost"
                          size="sm"
                          leftIcon={<Pause size={16} />}
                          onClick={() => onDeactivate()}
                      >
                          Desactivar
                      </Button>
                  )}

                  {/* Edit button (only for owner) */}
                  {isOwnerCheck && onEdit && (
                      <button
                          className="exercise-card-action-btn exercise-card-action-edit"
                          onClick={() => onEdit(routine)}
                      >
                          <Edit2 size={16} />
                      </button>
                  )}

                  {/* Delete button (only for owner) */}
                  {isOwnerCheck && onDelete && (
                      <button
                          onClick={() => onDelete(routine)}
                          className="exercise-card-action-btn exercise-card-action-delete"
                      >
                          <Trash2 size={16} />
                      </button>
                  )}
              </div>

              {/* Muscle Radar Modal */}
              <AnimatePresence>
                  {showMuscleRadar && (
                      <MuscleRadarChart
                          key="muscle-radar-modal"
                          exercises={getAllExercises()}
                          exerciseDataMap={exerciseDataMap}
                          hasWeight={false}
                          title="Distribución Muscular"
                          subtitle={routine.name}
                          onClose={() => setShowMuscleRadar(false)}
                          color="#8B5CF6"
                      />
                  )}
              </AnimatePresence>
          </Card>
      </motion.div>
  );
};

export default RoutineCard;
