import { useState, useEffect } from 'react';
import Button from '../common/Button';
import './ExerciseForm.css';

const CATEGORIES = [
  { value: 'chest', label: 'Pecho' },
  { value: 'back', label: 'Espalda' },
  { value: 'shoulders', label: 'Hombros' },
  { value: 'arms', label: 'Brazos' },
  { value: 'legs', label: 'Piernas' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' },
  { value: 'other', label: 'Otro' }
];

const EQUIPMENT = [
  { value: 'barbell', label: 'Barra' },
  { value: 'dumbbell', label: 'Mancuernas' },
  { value: 'cable', label: 'Cable' },
  { value: 'machine', label: 'Máquina' },
  { value: 'bodyweight', label: 'Peso corporal' },
  { value: 'other', label: 'Otro' }
];

const EXERCISE_TYPES = [
  { value: 'compound', label: 'Compuesto' },
  { value: 'isolation', label: 'Aislamiento' }
];

// Muscles that correspond to muscleContribution keys
const MUSCLE_GROUPS = [
  { key: 'chest', label: 'Pecho' },
  { key: 'back', label: 'Espalda alta' },
  { key: 'lats', label: 'Dorsales' },
  { key: 'front_delts', label: 'Deltoides frontal' },
  { key: 'side_delts', label: 'Deltoides lateral' },
  { key: 'rear_delts', label: 'Deltoides posterior' },
  { key: 'biceps', label: 'Bíceps' },
  { key: 'triceps', label: 'Tríceps' },
  { key: 'quads', label: 'Cuádriceps' },
  { key: 'hamstrings', label: 'Femorales' },
  { key: 'glutes', label: 'Glúteos' },
  { key: 'calves', label: 'Gemelos' },
  { key: 'core', label: 'Core' }
];

// Contribution values for each level
const CONTRIBUTION_VALUES = {
  primary: 1.0,
  secondaryStrong: 0.6,
  secondaryMedium: 0.4,
  secondaryLight: 0.2
};

const ExerciseForm = ({
  exercise,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'other',
    equipment: 'other',
    type: 'compound',
    muscleGroup: {
      primary: [],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    description: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (exercise) {
      setFormData({
        name: exercise.name || '',
        category: exercise.category || 'other',
        equipment: exercise.equipment || 'other',
        type: exercise.type || 'compound',
        muscleGroup: {
          primary: exercise.muscleGroup?.primary || [],
          secondaryStrong: exercise.muscleGroup?.secondaryStrong || [],
          secondaryMedium: exercise.muscleGroup?.secondaryMedium || [],
          secondaryLight: exercise.muscleGroup?.secondaryLight || []
        },
        description: exercise.description || ''
      });
    }
  }, [exercise]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Get all selected muscles across all levels
  const getAllSelectedMuscles = () => {
    const { primary, secondaryStrong, secondaryMedium, secondaryLight } = formData.muscleGroup;
    return [...primary, ...secondaryStrong, ...secondaryMedium, ...secondaryLight];
  };

  // Check if a muscle is selected in any level other than the specified one
  const isMuscleSelectedElsewhere = (muscle, currentLevel) => {
    const levels = ['primary', 'secondaryStrong', 'secondaryMedium', 'secondaryLight'];
    return levels.some(level =>
      level !== currentLevel && formData.muscleGroup[level].includes(muscle)
    );
  };

  const handleMuscleToggle = (level, muscleKey) => {
    // Don't allow selecting a muscle that's already in another level
    if (isMuscleSelectedElsewhere(muscleKey, level)) {
      return;
    }

    setFormData(prev => {
      const muscles = prev.muscleGroup[level];
      const newMuscles = muscles.includes(muscleKey)
        ? muscles.filter(m => m !== muscleKey)
        : [...muscles, muscleKey];

      return {
        ...prev,
        muscleGroup: {
          ...prev.muscleGroup,
          [level]: newMuscles
        }
      };
    });
  };

  // Generate muscleContribution from muscleGroup
  const generateMuscleContribution = () => {
    const contribution = {};

    formData.muscleGroup.primary.forEach(muscle => {
      contribution[muscle] = CONTRIBUTION_VALUES.primary;
    });
    formData.muscleGroup.secondaryStrong.forEach(muscle => {
      contribution[muscle] = CONTRIBUTION_VALUES.secondaryStrong;
    });
    formData.muscleGroup.secondaryMedium.forEach(muscle => {
      contribution[muscle] = CONTRIBUTION_VALUES.secondaryMedium;
    });
    formData.muscleGroup.secondaryLight.forEach(muscle => {
      contribution[muscle] = CONTRIBUTION_VALUES.secondaryLight;
    });

    return contribution;
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }
    if (formData.muscleGroup.primary.length === 0) {
      newErrors.muscles = 'Debes seleccionar al menos un músculo primario';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      const muscleContribution = generateMuscleContribution();
      onSubmit({
        ...formData,
        muscleContribution
      });
    }
  };

  const renderMuscleSection = (level, label, description) => {
    const allSelected = getAllSelectedMuscles();
    const levelClass = {
      primary: 'primary',
      secondaryStrong: 'strong',
      secondaryMedium: 'medium',
      secondaryLight: 'light'
    }[level];

    return (
      <div className="exercise-form-field">
        <div className="exercise-form-muscle-header">
          <label className="exercise-form-label">{label}</label>
          <span className="exercise-form-muscle-description">{description}</span>
        </div>
        <div className="exercise-form-muscle-grid">
          {MUSCLE_GROUPS.map(muscle => {
            const isSelected = formData.muscleGroup[level].includes(muscle.key);
            const isDisabled = !isSelected && allSelected.includes(muscle.key);

            return (
              <button
                key={muscle.key}
                type="button"
                onClick={() => handleMuscleToggle(level, muscle.key)}
                disabled={isDisabled}
                className={`exercise-form-muscle-chip ${
                  isSelected ? `exercise-form-muscle-chip-${levelClass}-active` : ''
                } ${isDisabled ? 'exercise-form-muscle-chip-disabled' : ''}`}
              >
                {muscle.label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="exercise-form">
      {/* Name */}
      <div className="exercise-form-field">
        <label className="exercise-form-label">Nombre *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ej: Press de banca"
          className={`exercise-form-input ${errors.name ? 'exercise-form-input-error' : ''}`}
        />
        {errors.name && <span className="exercise-form-error">{errors.name}</span>}
      </div>

      {/* Type */}
      <div className="exercise-form-field">
        <label className="exercise-form-label">Tipo de ejercicio</label>
        <select
          value={formData.type}
          onChange={(e) => handleChange('type', e.target.value)}
          className="exercise-form-select"
        >
          {EXERCISE_TYPES.map(type => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="exercise-form-field">
        <label className="exercise-form-label">Categoría</label>
        <select
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          className="exercise-form-select"
        >
          {CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Equipment */}
      <div className="exercise-form-field">
        <label className="exercise-form-label">Equipamiento</label>
        <select
          value={formData.equipment}
          onChange={(e) => handleChange('equipment', e.target.value)}
          className="exercise-form-select"
        >
          {EQUIPMENT.map(eq => (
            <option key={eq.value} value={eq.value}>
              {eq.label}
            </option>
          ))}
        </select>
      </div>

      {/* Muscle Activation Sections */}
      <div className="exercise-form-muscle-sections">
        <h3 className="exercise-form-section-title">Activación muscular</h3>
        {errors.muscles && <span className="exercise-form-error">{errors.muscles}</span>}

        {renderMuscleSection('primary', 'Primarios (100%)', 'Músculos principales del movimiento')}
        {renderMuscleSection('secondaryStrong', 'Secundarios fuertes (60%)', 'Alta activación pero no es el foco')}
        {renderMuscleSection('secondaryMedium', 'Secundarios medios (40%)', 'Activación moderada')}
        {renderMuscleSection('secondaryLight', 'Secundarios leves (20%)', 'Activación menor, estabilizadores')}
      </div>

      {/* Description */}
      <div className="exercise-form-field">
        <label className="exercise-form-label">Descripción (opcional)</label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Descripción del ejercicio..."
          rows={3}
          className="exercise-form-textarea"
        />
      </div>

      {/* Actions */}
      <div className="exercise-form-actions">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
        >
          {exercise ? 'Guardar cambios' : 'Crear ejercicio'}
        </Button>
      </div>
    </form>
  );
};

export default ExerciseForm;
