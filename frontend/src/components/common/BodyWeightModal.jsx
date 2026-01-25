import { useState } from 'react';
import Modal from './Modal';
import { theme } from '../../styles/theme';
import useAuthStore from '../../store/authStore';

const BodyWeightModal = ({ isOpen, onClose }) => {
  const [weight, setWeight] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const updateBodyWeight = useAuthStore((state) => state.updateBodyWeight);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const weightNum = parseFloat(weight);
    if (isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
      setError('Introduce un peso válido (1-500 kg)');
      return;
    }

    setIsLoading(true);
    const result = await updateBodyWeight(weightNum);
    setIsLoading(false);

    if (result.success) {
      setWeight('');
      onClose();
    } else {
      setError(result.error || 'Error al guardar el peso');
    }
  };

  const handleClose = () => {
    setWeight('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Tu peso corporal" size="sm">
      <form onSubmit={handleSubmit}>
        <p style={styles.description}>
          Para los ejercicios de peso corporal necesitamos saber tu peso.
          Esto nos permite calcular correctamente la carga de trabajo.
        </p>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Peso (kg)</label>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Ej: 75"
            style={styles.input}
            autoFocus
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.buttons}>
          <button
            type="button"
            onClick={handleClose}
            style={styles.cancelButton}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button
            type="submit"
            style={styles.submitButton}
            disabled={isLoading || !weight}
          >
            {isLoading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

const styles = {
  description: {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.lg,
    lineHeight: 1.5
  },
  inputGroup: {
    marginBottom: theme.spacing.lg
  },
  label: {
    display: 'block',
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.xs
  },
  input: {
    width: '100%',
    padding: theme.spacing.md,
    background: theme.colors.background.tertiary,
    border: `1px solid ${theme.colors.border.main}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.lg,
    outline: 'none',
    boxSizing: 'border-box'
  },
  error: {
    color: theme.colors.error.main,
    fontSize: theme.typography.fontSize.sm,
    marginBottom: theme.spacing.md
  },
  buttons: {
    display: 'flex',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg
  },
  cancelButton: {
    flex: 1,
    padding: theme.spacing.md,
    background: 'transparent',
    border: `1px solid ${theme.colors.border.main}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.md,
    cursor: 'pointer'
  },
  submitButton: {
    flex: 1,
    padding: theme.spacing.md,
    background: theme.colors.primary.main,
    border: 'none',
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer'
  }
};

export default BodyWeightModal;
