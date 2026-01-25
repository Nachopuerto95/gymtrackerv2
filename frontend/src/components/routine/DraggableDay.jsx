import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { theme } from '../../styles/theme';
import Card from '../common/Card';
import Button from '../common/Button';

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

const DraggableDay = ({
  day,
  isExpanded,
  onToggleExpand,
  onDelete,
  onAddExercise,
  children
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: day._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  const exerciseCount = day.exercises?.length || 0;

  return (
    <div ref={setNodeRef} style={style}>
      <Card style={{
        ...styles.card,
        border: isDragging ? `2px solid ${theme.colors.primary.main}` : undefined
      }}>
        {/* Day Header */}
        <div style={styles.header}>
          {/* Drag Handle */}
          <div
            {...attributes}
            {...listeners}
            style={styles.dragHandle}
          >
            <GripVertical size={20} />
          </div>

          {/* Day Info */}
          <div
            style={styles.dayInfo}
            onClick={onToggleExpand}
          >
            <div style={styles.dayTitle}>
              <span style={styles.dayName}>{day.name || `Día ${day.dayOfWeek + 1}`}</span>
              <span style={styles.dayOfWeek}>{DAY_NAMES[day.dayOfWeek]}</span>
            </div>
            <div style={styles.dayStats}>
              <span style={styles.exerciseCount}>
                {exerciseCount} {exerciseCount === 1 ? 'ejercicio' : 'ejercicios'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              style={styles.expandButton}
              onClick={onToggleExpand}
            >
              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            </button>
            <button
              style={styles.deleteButton}
              onClick={() => onDelete(day)}
              title="Eliminar día"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div style={styles.content}>
            {/* Exercises */}
            {children}

            {/* Add Exercise Button */}
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Plus size={16} />}
              onClick={() => onAddExercise(day)}
              style={styles.addButton}
            >
              Agregar ejercicio
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};

const styles = {
  card: {
    padding: 0,
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing.md,
    background: theme.colors.background.tertiary
  },
  dragHandle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    color: theme.colors.text.tertiary,
    cursor: 'grab',
    touchAction: 'none'
  },
  dayInfo: {
    flex: 1,
    cursor: 'pointer',
    padding: `${theme.spacing.xs} ${theme.spacing.sm}`
  },
  dayTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm
  },
  dayName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '150px'
  },
  dayOfWeek: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary
  },
  dayStats: {
    marginTop: theme.spacing.xs
  },
  exerciseCount: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs
  },
  expandButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    background: 'transparent',
    border: 'none',
    color: theme.colors.text.secondary,
    cursor: 'pointer'
  },
  deleteButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.sm,
    background: 'transparent',
    border: 'none',
    color: theme.colors.error.main,
    cursor: 'pointer'
  },
  content: {
    padding: theme.spacing.md,
    borderTop: `1px solid ${theme.colors.border.light}`
  },
  addButton: {
    width: '100%',
    marginTop: theme.spacing.md
  }
};

export default DraggableDay;
