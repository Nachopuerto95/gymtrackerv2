import { useState } from 'react';
import { Edit2, Trash2, ChevronDown, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './ExerciseCard.css';

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

const EQUIPMENT_LABELS = {
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  cable: 'Cable',
  machine: 'Máquina',
  bodyweight: 'Peso corporal',
  other: 'Otro'
};

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

const ExerciseCard = ({
  exercise,
  onEdit,
  onDelete,
  onShowStats,
  index = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const categoryColor = CATEGORY_COLORS[exercise.category] || CATEGORY_COLORS.other;

  const hasExpandableContent =
    exercise.description ||
    exercise.muscleGroup?.primary?.length > 0 ||
    exercise.muscleGroup?.secondary?.length > 0 ||
    exercise.lastBestSet;

  const handleCardClick = (e) => {
    // No expandir si se hace clic en los botones de acción
    if (e.target.closest('.exercise-card-actions')) return;
    if (hasExpandableContent) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={`exercise-card ${hasExpandableContent ? 'exercise-card-expandable' : ''} ${isExpanded ? 'exercise-card-expanded' : ''}`}
          style={{ borderLeft: `4px solid ${categoryColor}` }}
          onClick={handleCardClick}
      >
          <div className="exercise-card-header">
              <div className="exercise-card-title-section">
                  <div className="exercise-card-info">
                      <h3 className="exercise-card-name">{exercise.name}</h3>
                      <div className="exercise-card-badges">
                          <span
                              className="exercise-card-badge exercise-card-badge-category"
                              style={{
                                  backgroundColor: `${categoryColor}15`,
                                  color: categoryColor,
                                  borderColor: `${categoryColor}30`,
                              }}
                          >
                              {CATEGORY_LABELS[exercise.category] ||
                                  exercise.category}
                          </span>
                          {exercise.equipment && (
                              <span className="exercise-card-badge exercise-card-badge-equipment">
                                  {EQUIPMENT_LABELS[exercise.equipment] ||
                                      exercise.equipment}
                              </span>
                          )}
                      </div>
                  </div>
              </div>

              <div className="exercise-card-actions">
                  {hasExpandableContent && (
                      <motion.div
                          className="exercise-card-expand-indicator"
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                      >
                          <ChevronDown size={18} />
                      </motion.div>
                  )}
                  {onShowStats && (
                      <button
                          className="exercise-card-action-btn exercise-card-action-stats"
                          onClick={(e) => {
                              e.stopPropagation();
                              onShowStats(exercise);
                          }}
                          title="Ver estadísticas"
                      >
                          <TrendingUp size={16} />
                      </button>
                  )}
                  {onEdit && (
                      <button
                          className="exercise-card-action-btn exercise-card-action-edit"
                          onClick={(e) => {
                              e.stopPropagation();
                              onEdit(exercise);
                          }}
                          title="Editar"
                      >
                          <Edit2 size={16} />
                      </button>
                  )}
                  {onDelete && (
                      <button
                          className="exercise-card-action-btn exercise-card-action-delete"
                          onClick={(e) => {
                              e.stopPropagation();
                              onDelete(exercise);
                          }}
                          title="Eliminar"
                      >
                          <Trash2 size={16} />
                      </button>
                  )}
              </div>
          </div>

          {/* Expandable content */}
          <AnimatePresence>
              {isExpanded && (
                  <motion.div
                      className="exercise-card-expandable-content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                  >
                      {/* Best Set Info */}
                      {exercise.lastBestSet && (
                          <div className="exercise-card-best-set">
                              <span className="exercise-card-best-set-label">
                                  Mejor serie:
                              </span>
                              <span className="exercise-card-best-set-value">
                                  {exercise.lastBestSet.isBodyweight
                                      ? `${exercise.lastBestSet.reps} reps`
                                      : `${exercise.lastBestSet.weight}kg × ${exercise.lastBestSet.reps} reps`
                                  }
                              </span>
                              <span className="exercise-card-best-set-date">
                                  ({new Date(exercise.lastBestSet.date).toLocaleDateString('es-ES', {
                                      day: '2-digit',
                                      month: '2-digit',
                                      year: 'numeric'
                                  })})
                              </span>
                              {exercise.lastBestSet.isBodyweight && exercise.lastBestSet.totalReps && (
                                  <>
                                      <span className="exercise-card-best-set-separator">|</span>
                                      <span className="exercise-card-best-set-label">
                                          Total:
                                      </span>
                                      <span className="exercise-card-best-set-value">
                                          {exercise.lastBestSet.totalSets} × {Math.round(exercise.lastBestSet.totalReps / exercise.lastBestSet.totalSets)} = {exercise.lastBestSet.totalReps} reps
                                      </span>
                                  </>
                              )}
                          </div>
                      )}

                      {/* Muscle groups */}
                      {(exercise.muscleGroup?.primary?.length > 0 ||
                          exercise.muscleGroup?.secondary?.length > 0) && (
                          <div className="exercise-card-muscles">
                              {exercise.muscleGroup?.primary?.length > 0 && (
                                  <div className="exercise-card-muscle-group">
                                      <span className="exercise-card-muscle-label">
                                          Principal:
                                      </span>
                                      <span className="exercise-card-muscle-value">
                                          {exercise.muscleGroup.primary.join(
                                              ', ',
                                          )}
                                      </span>
                                  </div>
                              )}
                              {exercise.muscleGroup?.secondary?.length > 0 && (
                                  <div className="exercise-card-muscle-group">
                                      <span className="exercise-card-muscle-label">
                                          Secundario:
                                      </span>
                                      <span className="exercise-card-muscle-value">
                                          {exercise.muscleGroup.secondary.join(
                                              ', ',
                                          )}
                                      </span>
                                  </div>
                              )}
                          </div>
                      )}

                      {/* Description */}
                      {exercise.description && (
                          <p className="exercise-card-description">
                              {exercise.description}
                          </p>
                      )}
                  </motion.div>
              )}
          </AnimatePresence>
      </motion.div>
  );
};

export default ExerciseCard;
