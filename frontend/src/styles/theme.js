/**
 * Dark Mode Design System for Gym Tracker
 *
 * Color palette optimized for comfortable viewing in low-light conditions
 * Following modern fitness app aesthetics (Strong, Hevy, JEFIT)
 */

export const theme = {
  // Dark mode colors (primary theme)
  colors: {
    // Background hierarchy
    background: {
      primary: '#0A0E12',      // Deepest black for main background
      secondary: '#12161C',    // Slightly lighter for cards
      tertiary: '#1A1F27',     // Elevated surfaces
      overlay: 'rgba(10, 14, 18, 0.95)' // Modal overlays
    },

    // Primary brand colors - Energetic cyan/blue
    primary: {
      main: '#00D9FF',         // Vibrant cyan - main actions
      light: '#4DE5FF',        // Lighter variant
      dark: '#00A8CC',         // Darker variant
      gradient: 'linear-gradient(135deg, #00D9FF 0%, #0099FF 100%)',
      glow: 'rgba(0, 217, 255, 0.2)' // Glow effect
    },

    // Secondary accent - Energetic purple
    secondary: {
      main: '#8B5CF6',         // Vibrant purple
      light: '#A78BFA',
      dark: '#7C3AED'
    },

    // Success states - Green
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
      background: 'rgba(16, 185, 129, 0.1)'
    },

    // Warning states - Orange
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
      background: 'rgba(245, 158, 11, 0.1)'
    },

    // Error/Danger states - Red
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
      background: 'rgba(239, 68, 68, 0.1)'
    },

    // Text hierarchy
    text: {
      primary: '#FFFFFF',      // Main text
      secondary: '#A0AEC0',    // Secondary text
      tertiary: '#718096',     // Disabled/tertiary text
      inverse: '#0A0E12'       // Text on light backgrounds
    },

    // Border colors
    border: {
      light: 'rgba(255, 255, 255, 0.05)',
      main: 'rgba(255, 255, 255, 0.1)',
      strong: 'rgba(255, 255, 255, 0.2)',
      focus: '#00D9FF'
    },

    // Exercise category colors
    exercise: {
      chest: '#FF6B9D',
      back: '#4ADE80',
      shoulders: '#FBBF24',
      arms: '#A78BFA',
      legs: '#F97316',
      core: '#06B6D4',
      cardio: '#EF4444'
    }
  },

  // Typography
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace'
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
      '5xl': '3rem'      // 48px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75
    }
  },

  // Spacing scale (based on 4px grid)
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem'    // 64px
  },

  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.375rem',   // 6px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px'
  },

  // Shadows (subtle for dark mode)
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.6)',
    glow: '0 0 20px rgba(0, 217, 255, 0.3)',
    glowStrong: '0 0 40px rgba(0, 217, 255, 0.5)'
  },

  // Z-index scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1300,
    popover: 1400,
    toast: 1500
  },

  // Animation durations
  animation: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms'
  },

  // Easing functions
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },

  // Breakpoints (mobile-first)
  breakpoints: {
    xs: '0px',
    sm: '640px',   // Large phones
    md: '768px',   // Tablets
    lg: '1024px',  // Small laptops
    xl: '1280px',  // Desktops
    '2xl': '1536px'
  },

  // iPhone 16 specific (393x852 logical pixels)
  device: {
    iphone16: {
      width: 393,
      height: 852,
      safeAreaTop: 59,
      safeAreaBottom: 34
    }
  },

  // Touch targets (minimum 44x44 for accessibility)
  touchTarget: {
    min: '44px'
  }
};

// CSS custom properties for easy theme switching
export const getCSSVariables = (theme) => {
  return `
    --color-bg-primary: ${theme.colors.background.primary};
    --color-bg-secondary: ${theme.colors.background.secondary};
    --color-bg-tertiary: ${theme.colors.background.tertiary};

    --color-primary: ${theme.colors.primary.main};
    --color-primary-light: ${theme.colors.primary.light};
    --color-primary-dark: ${theme.colors.primary.dark};

    --color-text-primary: ${theme.colors.text.primary};
    --color-text-secondary: ${theme.colors.text.secondary};
    --color-text-tertiary: ${theme.colors.text.tertiary};

    --color-border: ${theme.colors.border.main};
    --color-border-focus: ${theme.colors.border.focus};

    --spacing-md: ${theme.spacing.md};
    --border-radius-md: ${theme.borderRadius.md};

    --animation-normal: ${theme.animation.normal};
    --easing-default: ${theme.easing.default};
  `;
};

export default theme;
