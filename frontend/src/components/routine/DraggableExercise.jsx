import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2 } from 'lucide-react';
import { theme } from '../../styles/theme';

const DraggableExercise = ({
  exercise,
  onEdit,
  onDelete
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: exercise._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div style={{
        ...styles.container,
        border: isDragging ? `2px solid ${theme.colors.primary.main}` : `1px solid ${theme.colors.border.light}`
      }}>
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          style={styles.dragHandle}
        >
          <GripVertical size={18} />
        </div>

        {/* Exercise Info */}
        <div style={styles.info}>
          <span style={styles.name}>{exercise.exerciseName}</span>
          <div style={styles.details}>
            <span style={styles.detail}>
              {exercise.sets} series
            </span>
            <span style={styles.separator}>•</span>
            <span style={styles.detail}>
              {exercise.repsRange?.min}-{exercise.repsRange?.max} reps
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={styles.actions}>
          <button
            style={styles.actionButton}
            onClick={() => onEdit(exercise)}
            title="Editar"
          >
            <Edit2 size={16} />
          </button>
          <button
            style={{
              ...styles.actionButton,
              color: theme.colors.error.main
            }}
            onClick={() => onDelete(exercise)}
            title="Eliminar"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing.sm,
    background: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    gap: theme.spacing.xs
  },
  dragHandle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xs,
    color: theme.colors.text.tertiary,
    cursor: 'grab',
    touchAction: 'none',
    flexShrink: 0
  },
  info: {
    flex: 1,
    paddingLeft: theme.spacing.sm,
    minWidth: 0,
    overflow: 'hidden'
  },
  name: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    display: 'block',
    width: '100%'
  },
  details: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: 2
  },
  detail: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary
  },
  separator: {
    color: theme.colors.text.tertiary
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flexShrink: 0,
    marginLeft: 'auto'
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xs,
    background: 'transparent',
    border: 'none',
    color: theme.colors.text.secondary,
    cursor: 'pointer',
    flexShrink: 0
  }
};

export default DraggableExercise;
