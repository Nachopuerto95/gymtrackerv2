import { motion } from 'framer-motion';

const Card = ({
  children,
  variant = 'default',
  onClick,
  animated = true,
  style = {},
  ...props
}) => {
  // Get variant styles (always uses individual border properties)
  const variantStyle = getVariantStyle(variant);

  // Build final style - for success variant, use full green border
  // For other variants, allow style.borderLeft to override
  let finalBorderLeft = variantStyle.borderLeft;

  // If not success variant and style has borderLeft, use it
  if (variant !== 'success' && style.borderLeft) {
    finalBorderLeft = style.borderLeft;
  }

  // Remove borderLeft from style to avoid conflicts
  const { borderLeft: _, ...restStyle } = style;

  const baseStyle = {
    borderRadius: '0.75rem',
    overflow: 'hidden',
    padding: '1.5rem',
    backgroundColor: variantStyle.backgroundColor,
    background: variantStyle.background,
    boxShadow: variantStyle.boxShadow,
    borderTop: variantStyle.borderTop,
    borderRight: variantStyle.borderRight,
    borderBottom: variantStyle.borderBottom,
    borderLeft: finalBorderLeft,
    cursor: onClick ? 'pointer' : 'default',
    ...restStyle,
  };

  if (animated) {
    return (
      <motion.div
        style={baseStyle}
        onClick={onClick}
        whileHover={onClick ? { scale: 1.02, y: -2 } : {}}
        whileTap={onClick ? { scale: 0.98 } : {}}
        transition={{
          duration: 0.2,
          ease: 'easeInOut'
        }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div style={baseStyle} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

// Always return individual border properties, never shorthand
const getVariantStyle = (variant) => {
  const variants = {
    default: {
      backgroundColor: '#1A1F2E',
      borderTop: '1px solid #2D3748',
      borderRight: '1px solid #2D3748',
      borderBottom: '1px solid #2D3748',
      borderLeft: '1px solid #2D3748',
    },
    elevated: {
      backgroundColor: '#1A1F2E',
      borderTop: '1px solid #2D3748',
      borderRight: '1px solid #2D3748',
      borderBottom: '1px solid #2D3748',
      borderLeft: '1px solid #2D3748',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    },
    highlighted: {
      backgroundColor: '#1A1F2E',
      borderTop: '1px solid #00E5CC',
      borderRight: '1px solid #00E5CC',
      borderBottom: '1px solid #00E5CC',
      borderLeft: '1px solid #00E5CC',
      boxShadow: '0 0 20px rgba(0, 229, 204, 0.2)',
    },
    success: {
      background: 'linear-gradient(to bottom right, #1A1F2E, rgba(16, 185, 129, 0.1))',
      borderTop: '1px solid #10B981',
      borderRight: '1px solid #10B981',
      borderBottom: '1px solid #10B981',
      borderLeft: '1px solid #10B981', // Full green border when completed
    },
    warning: {
      background: 'linear-gradient(to bottom right, #1A1F2E, rgba(234, 179, 8, 0.1))',
      borderTop: '1px solid #EAB308',
      borderRight: '1px solid #EAB308',
      borderBottom: '1px solid #EAB308',
      borderLeft: '1px solid #EAB308',
    },
  };

  return variants[variant] || variants.default;
};

export default Card;
