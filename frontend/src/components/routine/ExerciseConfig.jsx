import { useState, useEffect } from 'react';
import { theme } from '../../styles/theme';
import Modal from '../common/Modal';
import Button from '../common/Button';

const ExerciseConfig = ({
  isOpen,
  onClose,
  onSave,
  exercise,
  exerciseName
}) => {
  const [config, setConfig] = useState({
    sets: 3,
    repsMin: 8,
    repsMax: 12,
    restTime: 90,
    notes: ''
  });

  useEffect(() => {
    if (exercise) {
      setConfig({
        sets: exercise.sets || 3,
        repsMin: exercise.repsRange?.min || 8,
        repsMax: exercise.repsRange?.max || 12,
        restTime: exercise.restTime || 90,
        notes: exercise.notes || ''
      });
    } else {
      setConfig({
        sets: 3,
        repsMin: 8,
        repsMax: 12,
        restTime: 90,
        notes: ''
      });
    }
  }, [exercise]);

  const handleChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    onSave({
      sets: parseInt(config.sets) || 3,
      repsRange: {
        min: parseInt(config.repsMin) || 8,
        max: parseInt(config.repsMax) || 12
      },
      restTime: parseInt(config.restTime) || 90,
      notes: config.notes
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={exercise ? 'Configurar ejercicio' : 'Agregar ejercicio'}
      size="md"
    >
      <div style={styles.container}>
        {/* Exercise Name */}
        <div style={styles.exerciseName}>
          {exerciseName || exercise?.exerciseName}
        </div>

        {/* Sets */}
        <div style={styles.field}>
          <label style={styles.label}>Series</label>
          <input
            type="number"
            min="1"
            max="20"
            value={config.sets}
            onChange={(e) => handleChange('sets', e.target.value)}
            style={styles.input}
          />
        </div>

        {/* Reps Range */}
        <div style={styles.row}>
          <div style={styles.field}>
            <label style={styles.label}>Reps mínimas</label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.repsMin}
              onChange={(e) => handleChange('repsMin', e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Reps máximas</label>
            <input
              type="number"
              min="1"
              max="100"
              value={config.repsMax}
              onChange={(e) => handleChange('repsMax', e.target.value)}
              style={styles.input}
            />
          </div>
        </div>

        {/* Rest Time */}
        <div style={styles.field}>
          <label style={styles.label}>Descanso (segundos)</label>
          <input
            type="number"
            min="0"
            max="600"
            value={config.restTime}
            onChange={(e) => handleChange('restTime', e.target.value)}
            style={styles.input}
          />
        </div>

        {/* Notes */}
        <div style={styles.field}>
          <label style={styles.label}>Notas (opcional)</label>
          <textarea
            value={config.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Ej: Última serie al fallo"
            rows={2}
            style={styles.textarea}
            maxLength={200}
          />
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            {exercise ? 'Guardar cambios' : 'Agregar'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.lg
  },
  exerciseName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.primary.main,
    padding: theme.spacing.md,
    background: `${theme.colors.primary.main}10`,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center'
  },
  row: {
    display: 'flex',
    gap: theme.spacing.md
  },
  field: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm
  },
  label: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary
  },
  input: {
    width: '100%',
    padding: theme.spacing.md,
    background: theme.colors.background.tertiary,
    border: `2px solid ${theme.colors.border.main}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
    outline: 'none',
    boxSizing: 'border-box'
  },
  textarea: {
    width: '100%',
    padding: theme.spacing.md,
    background: theme.colors.background.tertiary,
    border: `2px solid ${theme.colors.border.main}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box'
  },
  actions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md
  }
};

export default ExerciseConfig;
