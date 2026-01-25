import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

/**
 * Animated Checkbox component with touch-friendly tap target
 *
 * @param {Object} props
 * @param {boolean} props.checked - Whether checkbox is checked
 * @param {Function} props.onChange - Change handler (receives new checked value)
 * @param {boolean} props.disabled - Whether checkbox is disabled
 * @param {string} props.label - Optional label text
 * @param {string} props.size - sm | md | lg
 */
const Checkbox = ({
  checked = false,
  onChange,
  disabled = false,
  label,
  size = 'md',
  ...props
}) => {
  const getSizeStyles = () => {
    const sizes = {
      sm: {
        box: 16,
        icon: 10,
        fontSize: theme.typography.fontSize.sm
      },
      md: {
        box: 20,
        icon: 12,
        fontSize: theme.typography.fontSize.base
      },
      lg: {
        box: 24,
        icon: 14,
        fontSize: theme.typography.fontSize.lg
      }
    };

    return sizes[size] || sizes.md;
  };

  const sizeStyles = getSizeStyles();

  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    userSelect: 'none',
    minHeight: theme.touchTarget.min,
    minWidth: theme.touchTarget.min
  };

  const checkboxStyle = {
    width: sizeStyles.box,
    height: sizeStyles.box,
    borderRadius: theme.borderRadius.sm,
    border: `2px solid ${checked ? theme.colors.primary.main : theme.colors.border.main}`,
    background: checked ? theme.colors.primary.main : 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `all ${theme.animation.fast} ${theme.easing.default}`,
    boxShadow: checked ? theme.shadows.glow : 'none'
  };

  const labelStyle = {
    color: theme.colors.text.primary,
    fontSize: sizeStyles.fontSize,
    fontWeight: theme.typography.fontWeight.medium
  };

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  };

  return (
    <motion.div
      style={containerStyle}
      onClick={handleClick}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      {...props}
    >
      <motion.div
        style={checkboxStyle}
        animate={{
          scale: checked ? [1, 1.1, 1] : 1
        }}
        transition={{ duration: 0.2 }}
      >
        {checked && (
          <motion.svg
            width={sizeStyles.icon}
            height={sizeStyles.icon}
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.15 }}
          >
            <path
              d="M2 6L5 9L10 3"
              stroke={theme.colors.text.inverse}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        )}
      </motion.div>
      {label && <span style={labelStyle}>{label}</span>}
    </motion.div>
  );
};

export default Checkbox;
