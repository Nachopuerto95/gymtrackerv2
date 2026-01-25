import { useState } from 'react';
import { theme } from '../../styles/theme';

/**
 * Input component for dark mode
 * Types: text, email, password, number
 */
const Input = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  disabled = false,
  required = false,
  leftIcon = null,
  rightIcon = null,
  fullWidth = true,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
    width: fullWidth ? '100%' : 'auto'
  };

  const labelStyles = {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs
  };

  const inputWrapperStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    background: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.lg,
    border: `2px solid ${
      error
        ? theme.colors.error.main
        : isFocused
        ? theme.colors.primary.main
        : theme.colors.border.main
    }`,
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    transition: `all ${theme.animation.normal} ${theme.easing.default}`,
    minHeight: theme.touchTarget.min
  };

  const inputStyles = {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
    fontFamily: theme.typography.fontFamily.primary,
    width: '100%'
  };

  const iconStyles = {
    color: theme.colors.text.tertiary,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.typography.fontSize.lg
  };

  const errorStyles = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error.main,
    marginTop: theme.spacing.xs
  };

  // Prevent form submission on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div style={containerStyles}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={{ color: theme.colors.error.main }}> *</span>}
        </label>
      )}

      <div style={inputWrapperStyles}>
        {leftIcon && <span style={iconStyles}>{leftIcon}</span>}

        <input
          type={type}
          style={inputStyles}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          required={required}
          {...props}
        />

        {rightIcon && <span style={iconStyles}>{rightIcon}</span>}
      </div>

      {error && <span style={errorStyles}>{error}</span>}
    </div>
  );
};

export default Input;
