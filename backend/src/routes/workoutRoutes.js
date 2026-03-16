import express from 'express';
import {
  getWorkouts,
  getWorkout,
  startWorkout,
  updateWorkout,
  completeWorkout,
  changeWorkoutDay,
  deleteWorkout,
  getExerciseAnalytics,
  getExerciseProgression,
  getTodayWorkout,
  reopenWorkout,
  cleanupDuplicateSessions,
  getExerciseHistory,
  editHistoryWorkout
} from '../controllers/workoutController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getWorkouts);

router.post('/start', startWorkout);

router.get('/today', getTodayWorkout);
router.post('/cleanup-duplicates', cleanupDuplicateSessions);
router.get('/analytics/:exerciseId', getExerciseAnalytics);
router.get('/progression/:exerciseId', getExerciseProgression);
router.get('/exercise-history/:exerciseId', getExerciseHistory);

router.route('/:id')
  .get(getWorkout)
  .put(updateWorkout)
  .delete(deleteWorkout);

router.put('/:id/complete', completeWorkout);
router.put('/:id/reopen', reopenWorkout);
router.put('/:id/change-day', changeWorkoutDay);
router.put('/:id/edit-history', editHistoryWorkout);

export default router;
