import { useState, useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { theme } from '../../styles/theme';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import useExerciseStore from '../../store/exerciseStore';

const CATEGORY_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'chest', label: 'Pecho' },
  { value: 'back', label: 'Espalda' },
  { value: 'shoulders', label: 'Hombros' },
  { value: 'arms', label: 'Brazos' },
  { value: 'legs', label: 'Piernas' },
  { value: 'core', label: 'Core' },
  { value: 'cardio', label: 'Cardio' }
];

const ExercisePicker = ({
  isOpen,
  onClose,
  onSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const { exercises, isLoading, fetchExercises } = useExerciseStore();

  // Fetch exercises when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchExercises();
    }
  }, [isOpen]);

  // Filter exercises
  const filteredExercises = exercises.filter(ex => {
    const matchesSearch = !searchQuery ||
      ex.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || ex.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelect = (exercise) => {
    onSelect(exercise);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Seleccionar ejercicio"
      size="lg"
    >
      <div style={styles.container}>
        {/* Search */}
        <div style={styles.searchContainer}>
          <Search size={18} color={theme.colors.text.tertiary} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Buscar ejercicio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={styles.searchInput}
          />
        </div>

        {/* Category Filters */}
        <div style={styles.filters}>
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              style={{
                ...styles.filterChip,
                background: selectedCategory === cat.value
                  ? theme.colors.primary.main
                  : theme.colors.background.tertiary,
                color: selectedCategory === cat.value
                  ? theme.colors.text.inverse
                  : theme.colors.text.secondary
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Exercise List */}
        <div style={styles.exerciseList}>
          {isLoading ? (
            <div style={styles.centered}>
              <Spinner />
            </div>
          ) : filteredExercises.length === 0 ? (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>
                {searchQuery || selectedCategory
                  ? 'No se encontraron ejercicios'
                  : 'No hay ejercicios disponibles'}
              </p>
            </div>
          ) : (
            filteredExercises.map(exercise => (
              <div
                key={exercise._id}
                style={styles.exerciseItem}
                onClick={() => handleSelect(exercise)}
              >
                <div style={styles.exerciseInfo}>
                  <span style={styles.exerciseName}>{exercise.name}</span>
                  <span style={styles.exerciseCategory}>
                    {CATEGORY_FILTERS.find(c => c.value === exercise.category)?.label || exercise.category}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Plus size={16} />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelect(exercise);
                  }}
                >
                  Agregar
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
    maxHeight: '60vh'
  },
  searchContainer: {
    position: 'relative'
  },
  searchIcon: {
    position: 'absolute',
    left: theme.spacing.md,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none'
  },
  searchInput: {
    width: '100%',
    padding: `${theme.spacing.sm} ${theme.spacing.sm} ${theme.spacing.sm} 40px`,
    background: theme.colors.background.tertiary,
    border: `1px solid ${theme.colors.border.main}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.sm,
    outline: 'none',
    boxSizing: 'border-box'
  },
  filters: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing.xs
  },
  filterChip: {
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
    borderRadius: theme.borderRadius.full,
    border: 'none',
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.medium,
    cursor: 'pointer'
  },
  exerciseList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs
  },
  exerciseItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    background: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    transition: `background ${theme.animation.fast}`
  },
  exerciseInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  exerciseName: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary
  },
  exerciseCategory: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary
  },
  centered: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl
  },
  emptyState: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl
  },
  emptyText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary
  }
};

export default ExercisePicker;
