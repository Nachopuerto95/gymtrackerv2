import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

/**
 * Animated Spinner component for loading states
 *
 * @param {Object} props
 * @param {string} props.size - sm | md | lg
 * @param {string} props.color - Color of the spinner (defaults to primary)
 * @param {boolean} props.fullScreen - Whether to display as full screen overlay
 */
const Spinner = ({
  size = 'md',
  color = theme.colors.primary.main,
  fullScreen = false,
  ...props
}) => {
  const getSizeValue = () => {
    const sizes = {
      sm: 16,
      md: 24,
      lg: 40
    };
    return sizes[size] || sizes.md;
  };

  const sizeValue = getSizeValue();

  const spinnerStyle = {
    width: sizeValue,
    height: sizeValue,
    display: 'inline-block'
  };

  const containerStyle = fullScreen ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: theme.colors.background.overlay,
    zIndex: theme.zIndex.modal
  } : {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const spinnerContent = (
    <motion.div
      style={spinnerStyle}
      animate={{ rotate: 360 }}
      transition={{
        duration: 1,
        repeat: Infinity,
        ease: 'linear'
      }}
      {...props}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={theme.colors.border.main}
          strokeWidth="3"
        />
        <path
          d="M12 2C6.47715 2 2 6.47715 2 12"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );

  return fullScreen ? (
    <div style={containerStyle}>
      {spinnerContent}
    </div>
  ) : spinnerContent;
};

export default Spinner;
