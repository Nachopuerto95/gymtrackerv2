import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Dumbbell, Calendar, ListChecks } from 'lucide-react';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/exercises', icon: Dumbbell, label: 'Ejercicios' },
    { path: '/calendar', icon: Calendar, label: 'Historial' },
    { path: '/routines', icon: ListChecks, label: 'Rutinas' }
  ];

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav style={styles.container}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <motion.button
            key={item.path}
            style={{
              ...styles.navItem,
              ...(active ? styles.navItemActive : {})
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              navigate(item.path);
            }}
            whileTap={{ scale: 0.92 }}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
          >
            <Icon
              size={24}
              color={active ? theme.colors.primary.main : theme.colors.text.secondary}
              strokeWidth={active ? 2.5 : 2}
            />
            <span
              style={{
                ...styles.label,
                color: active ? theme.colors.primary.main : theme.colors.text.secondary,
                fontWeight: active ? theme.typography.fontWeight.semibold : theme.typography.fontWeight.normal
              }}
            >
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
};

const styles = {
  container: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'stretch',
    background: theme.colors.background.secondary,
    borderTop: `1px solid ${theme.colors.border.main}`,
    // Enhanced padding for better touch area and safe-area support
    padding: `${theme.spacing.sm} ${theme.spacing.xs}`,
    paddingBottom: `calc(${theme.spacing.sm} + env(safe-area-inset-bottom, 0px))`,
    // Increased z-index to ensure it's always on top
    zIndex: 9999,
    // Improved shadow for depth perception
    boxShadow: '0 -2px 16px rgba(0, 0, 0, 0.4), 0 -1px 4px rgba(0, 0, 0, 0.2)',
    // Add backdrop blur for modern glass effect
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    // Prevent pointer events from passing through to elements below
    pointerEvents: 'auto',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    // Ensure minimum touch target of 44x44px (Apple HIG standard)
    minHeight: '56px',
    minWidth: '72px',
    gap: '6px',
    background: 'transparent',
    border: 'none',
    // Increased padding for better touch targets
    padding: `${theme.spacing.sm} ${theme.spacing.xs}`,
    cursor: 'pointer',
    // Smooth transition for all interactive states
    transition: `all ${theme.animation.normal} ${theme.easing.default}`,
    borderRadius: theme.borderRadius.lg,
    // Prevent text selection on touch
    WebkitTapHighlightColor: 'transparent',
    userSelect: 'none',
  },
  navItemActive: {
    // Enhanced active state with subtle glow
    background: 'rgba(0, 217, 255, 0.12)',
    boxShadow: `0 0 0 1px ${theme.colors.primary.main}20`,
  },
  label: {
    fontSize: theme.typography.fontSize.xs,
    textAlign: 'center',
    // Improved line height for better vertical centering
    lineHeight: '1.2',
    // Prevent text wrap
    whiteSpace: 'nowrap',
    // Smooth transition for color changes
    transition: `color ${theme.animation.normal} ${theme.easing.default}`,
  }
};

export default BottomNav;
