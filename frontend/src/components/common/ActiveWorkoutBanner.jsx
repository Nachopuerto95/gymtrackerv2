import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Dumbbell, ArrowRight } from 'lucide-react';
import useWorkoutStore from '../../store/workoutStore';
import { theme } from '../../styles/theme';

const ActiveWorkoutBanner = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeWorkout } = useWorkoutStore();

  // Don't show banner if no active workout or already on workout page
  if (!activeWorkout || location.pathname.startsWith('/workout/')) {
    return null;
  }

  const completedExercises = activeWorkout.exercises.filter(ex => ex.isCompleted).length;
  const totalExercises = activeWorkout.exercises.length;

  return (
    <motion.div
      style={styles.container}
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      onClick={() => navigate(`/workout/${activeWorkout._id}`)}
    >
      <div style={styles.content}>
        <div style={styles.iconContainer}>
          <Dumbbell size={20} color={theme.colors.primary.main} />
        </div>
        <div style={styles.info}>
          <span style={styles.title}>Entrenamiento en curso</span>
          <span style={styles.progress}>
            {completedExercises}/{totalExercises} ejercicios • {activeWorkout.workoutDayName}
          </span>
        </div>
        <ArrowRight size={20} color={theme.colors.primary.main} />
      </div>
    </motion.div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    background: 'linear-gradient(135deg, rgba(0, 229, 204, 0.15), rgba(59, 130, 246, 0.15))',
    backdropFilter: 'blur(10px)',
    borderBottom: `1px solid ${theme.colors.primary.main}`,
    padding: '12px 16px',
    paddingTop: 'calc(12px + env(safe-area-inset-top, 0px))',
    cursor: 'pointer',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  content: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 229, 204, 0.2)',
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  title: {
    fontSize: '14px',
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  progress: {
    fontSize: '12px',
    color: theme.colors.text.secondary,
  },
};

export default ActiveWorkoutBanner;
