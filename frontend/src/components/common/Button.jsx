import { motion } from 'framer-motion';
import './Button.css';

/**
 * Button component with dark mode styling
 * Variants: primary, secondary, outline, ghost, danger
 * Sizes: sm, md, lg
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon = null,
  rightIcon = null,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full-width',
    className
  ].filter(Boolean).join(' ');

  return (
    <motion.button
      type={type}
      className={classes}
      onClick={!disabled && !loading ? onClick : undefined}
      disabled={disabled || loading}
      whileTap={!disabled && !loading ? { scale: 0.95 } : {}}
      whileHover={!disabled && !loading ? { scale: 1.02 } : {}}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="btn-loading-spinner"
        />
      )}
      {!loading && leftIcon && <span>{leftIcon}</span>}
      {!loading && children}
      {!loading && rightIcon && <span>{rightIcon}</span>}
    </motion.button>
  );
};

export default Button;
