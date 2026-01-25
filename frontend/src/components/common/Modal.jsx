import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { theme } from '../../styles/theme';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true
}) => {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const sizes = {
    sm: 'min(400px, 92vw)',
    md: 'min(500px, 92vw)',
    lg: 'min(600px, 92vw)',
    xl: 'min(800px, 92vw)',
    full: '95vw'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={styles.backdrop}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: '-50%', y: '-45%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%', y: '-45%' }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              ...styles.modal,
              maxWidth: sizes[size]
            }}
          >
            {/* Header */}
            {(title || showCloseButton) && (
              <div style={styles.header}>
                {title && <h2 style={styles.title}>{title}</h2>}
                {showCloseButton && (
                  <button
                    onClick={onClose}
                    style={styles.closeButton}
                  >
                    <X size={24} />
                  </button>
                )}
              </div>
            )}

            {/* Content */}
            <div style={styles.content}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const styles = {
  backdrop: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: theme.colors.background.overlay,
    zIndex: theme.zIndex.modal,
    backdropFilter: 'blur(4px)'
  },
  modal: {
    position: 'fixed',
    top: '50%',
    left: '50%',
    width: 'calc(100% - 2rem)',
    maxWidth: '90%',
    maxHeight: 'min(85vh, calc(100vh - 3rem))', // Ensure modal fits on screen
    background: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.xl,
    border: `1px solid ${theme.colors.border.main}`,
    boxShadow: theme.shadows.xl,
    zIndex: theme.zIndex.modal + 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem',
    borderBottom: `1px solid ${theme.colors.border.main}`,
    flexShrink: 0
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: theme.colors.text.secondary,
    cursor: 'pointer',
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `all ${theme.animation.fast}`,
    minWidth: '44px', // Apple HIG minimum touch target
    minHeight: '44px'
  },
  content: {
    padding: '1rem',
    overflowY: 'auto',
    overflowX: 'hidden', // Prevent horizontal scroll
    flex: 1,
    minHeight: 0, // Critical for flexbox scrolling
    WebkitOverflowScrolling: 'touch' // Smooth iOS scrolling
  }
};

export default Modal;
