import express from 'express';
import {
  getExercises,
  getExercise,
  createExercise,
  updateExercise,
  deleteExercise,
  searchExercises
} from '../controllers/exerciseController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// Search route (must be before /:id route)
router.get('/search', searchExercises);

// Main routes
router.route('/')
  .get(getExercises)
  .post(createExercise);

router.route('/:id')
  .get(getExercise)
  .put(updateExercise)
  .delete(deleteExercise);

export default router;
