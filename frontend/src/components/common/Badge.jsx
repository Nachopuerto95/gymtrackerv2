import { theme } from '../../styles/theme';

/**
 * Badge component for displaying categories, tags, and status
 *
 * @param {Object} props
 * @param {string} props.variant - primary | secondary | success | warning | error | exercise-[category]
 * @param {string} props.size - sm | md | lg
 * @param {React.ReactNode} props.children - Badge content
 * @param {Object} props.style - Additional inline styles
 */
const Badge = ({
  variant = 'primary',
  size = 'md',
  children,
  style = {},
  ...props
}) => {
  const getVariantStyles = () => {
    const variants = {
      primary: {
        background: theme.colors.primary.glow,
        border: `1px solid ${theme.colors.primary.main}`,
        color: theme.colors.primary.light
      },
      secondary: {
        background: 'rgba(139, 92, 246, 0.1)',
        border: `1px solid ${theme.colors.secondary.main}`,
        color: theme.colors.secondary.light
      },
      success: {
        background: theme.colors.success.background,
        border: `1px solid ${theme.colors.success.main}`,
        color: theme.colors.success.light
      },
      warning: {
        background: theme.colors.warning.background,
        border: `1px solid ${theme.colors.warning.main}`,
        color: theme.colors.warning.light
      },
      error: {
        background: theme.colors.error.background,
        border: `1px solid ${theme.colors.error.main}`,
        color: theme.colors.error.light
      },
      // Exercise categories
      'exercise-chest': {
        background: 'rgba(255, 107, 157, 0.1)',
        border: `1px solid ${theme.colors.exercise.chest}`,
        color: theme.colors.exercise.chest
      },
      'exercise-back': {
        background: 'rgba(74, 222, 128, 0.1)',
        border: `1px solid ${theme.colors.exercise.back}`,
        color: theme.colors.exercise.back
      },
      'exercise-shoulders': {
        background: 'rgba(251, 191, 36, 0.1)',
        border: `1px solid ${theme.colors.exercise.shoulders}`,
        color: theme.colors.exercise.shoulders
      },
      'exercise-arms': {
        background: 'rgba(167, 139, 250, 0.1)',
        border: `1px solid ${theme.colors.exercise.arms}`,
        color: theme.colors.exercise.arms
      },
      'exercise-legs': {
        background: 'rgba(249, 115, 22, 0.1)',
        border: `1px solid ${theme.colors.exercise.legs}`,
        color: theme.colors.exercise.legs
      },
      'exercise-core': {
        background: 'rgba(6, 182, 212, 0.1)',
        border: `1px solid ${theme.colors.exercise.core}`,
        color: theme.colors.exercise.core
      },
      'exercise-cardio': {
        background: 'rgba(239, 68, 68, 0.1)',
        border: `1px solid ${theme.colors.exercise.cardio}`,
        color: theme.colors.exercise.cardio
      }
    };

    return variants[variant] || variants.primary;
  };

  const getSizeStyles = () => {
    const sizes = {
      sm: {
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        fontSize: theme.typography.fontSize.xs,
        borderRadius: theme.borderRadius.sm
      },
      md: {
        padding: `${theme.spacing.xs} ${theme.spacing.md}`,
        fontSize: theme.typography.fontSize.sm,
        borderRadius: theme.borderRadius.md
      },
      lg: {
        padding: `${theme.spacing.sm} ${theme.spacing.lg}`,
        fontSize: theme.typography.fontSize.base,
        borderRadius: theme.borderRadius.lg
      }
    };

    return sizes[size] || sizes.md;
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    fontWeight: theme.typography.fontWeight.semibold,
    whiteSpace: 'nowrap',
    transition: `all ${theme.animation.fast} ${theme.easing.default}`,
    ...variantStyles,
    ...sizeStyles,
    ...style
  };

  return (
    <span style={badgeStyle} {...props}>
      {children}
    </span>
  );
};

export default Badge;
