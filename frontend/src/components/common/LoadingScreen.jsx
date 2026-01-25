import { motion } from 'framer-motion';
import { Dumbbell } from 'lucide-react';
import { theme } from '../../styles/theme';

const LoadingScreen = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: theme.colors.background.primary,
      zIndex: 9999
    }}>
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360]
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <Dumbbell
          size={64}
          style={{
            color: theme.colors.primary.main,
            strokeWidth: 2
          }}
        />
      </motion.div>

      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          marginTop: theme.spacing.xl,
          fontSize: theme.typography.fontSize['2xl'],
          fontWeight: theme.typography.fontWeight.bold,
          background: theme.colors.primary.gradient,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          textAlign: 'center'
        }}
      >
        GymTracker
      </motion.h2>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        style={{
          marginTop: theme.spacing.md,
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary
        }}
      >
        Cargando...
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
