import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import { theme } from '../../styles/theme';
import toast from 'react-hot-toast';

const TopBar = () => {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
    toast.success('Sesión cerrada');
    setIsMenuOpen(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.menuContainer} ref={menuRef}>
        <motion.button
          whileTap={{ scale: 0.92 }}
          whileHover={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderColor: theme.colors.border.strong,
          }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={styles.menuButton}
        >
          <MoreVertical size={24} />
        </motion.button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              style={styles.dropdown}
            >
              <motion.button
                whileTap={{ scale: 0.97 }}
                whileHover={{
                  backgroundColor: theme.colors.error.background,
                  color: theme.colors.error.light,
                }}
                onClick={handleLogout}
                style={styles.menuItem}
              >
                <LogOut size={20} />
                <span>Cerrar sesión</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    // Dynamic height that accounts for safe area
    minHeight: '56px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    // Improved padding with safe area support
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    paddingTop: `calc(${theme.spacing.sm} + env(safe-area-inset-top, 0px))`,
    background: theme.colors.background.primary,
    borderBottom: `1px solid ${theme.colors.border.main}`,
    zIndex: theme.zIndex.sticky,
    // Add backdrop blur for modern glass effect
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    // Improved shadow for depth
    boxShadow: '0 2px 16px rgba(0, 0, 0, 0.3), 0 1px 4px rgba(0, 0, 0, 0.2)',
  },
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    // Ensure minimum 44x44px touch target
    minWidth: '44px',
    minHeight: '44px',
    padding: '10px',
    background: 'transparent',
    color: theme.colors.text.primary,
    border: `1px solid ${theme.colors.border.main}`,
    borderRadius: theme.borderRadius.lg,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `all ${theme.animation.normal} ${theme.easing.default}`,
    // Prevent tap highlight
    WebkitTapHighlightColor: 'transparent',
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 12px)',
    right: 0,
    minWidth: '200px',
    // Enhanced background with better contrast
    background: theme.colors.background.tertiary,
    border: `1px solid ${theme.colors.border.strong}`,
    borderRadius: theme.borderRadius.xl,
    // Improved shadow for better elevation
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    // Add backdrop blur
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  menuItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    // Increased gap for better icon-text spacing
    gap: '12px',
    // Ensure minimum touch target height
    minHeight: '52px',
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    background: 'transparent',
    color: theme.colors.error.main,
    border: 'none',
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.medium,
    transition: `all ${theme.animation.normal} ${theme.easing.default}`,
    textAlign: 'left',
    // Prevent tap highlight
    WebkitTapHighlightColor: 'transparent',
  },
};

export default TopBar;
