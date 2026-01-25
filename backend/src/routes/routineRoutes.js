import express from 'express';
import {
  getRoutines,
  getRoutine,
  createRoutine,
  updateRoutine,
  deleteRoutine,
  activateRoutine,
  deactivateRoutine,
  getActiveRoutine,
  copyRoutine,
  reorderExercises,
  reorderDays
} from '../controllers/routineController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getRoutines)
  .post(createRoutine);

router.get('/active', getActiveRoutine);
router.put('/deactivate', deactivateRoutine);

router.route('/:id')
  .get(getRoutine)
  .put(updateRoutine)
  .delete(deleteRoutine);

router.put('/:id/activate', activateRoutine);
router.post('/:id/copy', copyRoutine);
router.put('/:id/days/:dayId/reorder', reorderExercises);
router.put('/:id/reorder-days', reorderDays);

export default router;
