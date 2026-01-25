import express from 'express';
import {
  register,
  login,
  refreshAccessToken,
  getMe,
  updatePreferences,
  updateBodyWeight
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshAccessToken);
router.get('/me', protect, getMe);
router.put('/preferences', protect, updatePreferences);
router.put('/body-weight', protect, updateBodyWeight);

export default router;
