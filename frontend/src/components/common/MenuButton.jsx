import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreVertical, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '../../store/authStore';
import { theme } from '../../styles/theme';
import toast from 'react-hot-toast';

const MenuButton = () => {
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
        <MoreVertical size={20} />
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
  );
};

const styles = {
  menuContainer: {
    position: 'relative',
  },
  menuButton: {
    // Ensure minimum 44x44px touch target (Apple HIG standard)
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
    // Prevent tap highlight on mobile
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
    // Improved shadow for better elevation and depth
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 8px 16px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
    zIndex: theme.zIndex.dropdown,
    // Add backdrop blur for modern glass morphism effect
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
  },
  menuItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    // Increased gap for better icon-text relationship
    gap: '12px',
    // Ensure minimum touch target height of 44px+
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
    // Prevent tap highlight on mobile
    WebkitTapHighlightColor: 'transparent',
  },
};

export default MenuButton;
