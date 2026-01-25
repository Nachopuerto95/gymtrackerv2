import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

const Toggle = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md'
}) => {
  const sizes = {
    sm: { width: 36, height: 20, circle: 16 },
    md: { width: 44, height: 24, circle: 20 },
    lg: { width: 52, height: 28, circle: 24 }
  };

  const currentSize = sizes[size];

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer'
      }}
      onClick={handleToggle}
    >
      {label && <span style={styles.label}>{label}</span>}

      <div
        style={{
          ...styles.track,
          width: currentSize.width,
          height: currentSize.height,
          background: checked
            ? theme.colors.primary.main
            : theme.colors.background.tertiary,
          borderColor: checked
            ? theme.colors.primary.main
            : theme.colors.border.main
        }}
      >
        <motion.div
          style={{
            ...styles.thumb,
            width: currentSize.circle,
            height: currentSize.circle
          }}
          animate={{
            x: checked
              ? currentSize.width - currentSize.circle - 2
              : 2
          }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    userSelect: 'none'
  },
  label: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.primary,
    fontWeight: theme.typography.fontWeight.medium
  },
  track: {
    position: 'relative',
    borderRadius: theme.borderRadius.full,
    border: '2px solid',
    transition: `all ${theme.animation.fast}`,
    flexShrink: 0
  },
  thumb: {
    position: 'absolute',
    top: 2,
    background: theme.colors.text.primary,
    borderRadius: theme.borderRadius.full,
    boxShadow: theme.shadows.sm
  }
};

export default Toggle;
