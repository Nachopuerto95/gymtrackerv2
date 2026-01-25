import mongoose from 'mongoose';

// Schema for a single set within an exercise
const setTemplateSchema = new mongoose.Schema({
  targetReps: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  targetWeight: {
    type: Number,
    default: 0 // Will be filled as user progresses
  },
  type: {
    type: String,
    enum: ['normal', 'warmup', 'dropset', 'superset', 'failure'],
    default: 'normal'
  }
}, { _id: false });

// Schema for an exercise within a workout day
const routineExerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  exerciseName: {
    type: String,
    required: true // Denormalized for faster access
  },
  category: {
    type: String,
    enum: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'other'],
    default: 'other' // Denormalized for faster access and consistent UI
  },
  equipment: {
    type: String,
    enum: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'other'],
    default: 'other' // Denormalized for faster access
  },
  sets: {
    type: Number,
    required: true,
    min: 1
  },
  repsRange: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  restTime: {
    type: Number,
    default: 90 // seconds
  },
  notes: {
    type: String,
    default: ''
  },
  order: {
    type: Number,
    required: true // Order of exercise in the day
  },
  setTemplates: [setTemplateSchema]
}, { _id: true });

// Schema for a workout day
const workoutDaySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dayOfWeek: {
    type: Number,
    min: 0,
    max: 6, // 0 = Monday, 6 = Sunday
    required: true
  },
  isRestDay: {
    type: Boolean,
    default: false
  },
  exercises: [routineExerciseSchema]
}, { _id: true });

// Available routine icons
const ROUTINE_ICONS = [
  'dumbbell', 'flame', 'trophy', 'target', 'zap',
  'heart', 'star', 'mountain', 'timer', 'bicep'
];

// Main Routine Schema
const routineSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'Routine name is required'],
    trim: true
  },
  icon: {
    type: String,
    enum: ROUTINE_ICONS,
    default: 'dumbbell'
  },
  description: {
    type: String,
    default: ''
  },
  workoutDays: [workoutDaySchema],
  isActive: {
    type: Boolean,
    default: false
  },
  isTemplate: {
    type: Boolean,
    default: false // Templates can be copied by users
  },
  isPrivate: {
    type: Boolean,
    default: false // Public by default
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for faster queries
routineSchema.index({ userId: 1, isActive: 1 });
routineSchema.index({ isTemplate: 1 });
routineSchema.index({ isPrivate: 1, userId: 1 });
routineSchema.index({ isTemplate: 1, isPrivate: 1 });

// Virtual for total exercises count
routineSchema.virtual('totalExercises').get(function() {
  return this.workoutDays.reduce((total, day) => {
    return total + (day.isRestDay ? 0 : day.exercises.length);
  }, 0);
});

// Ensure virtuals are included in JSON
routineSchema.set('toJSON', { virtuals: true });
routineSchema.set('toObject', { virtuals: true });

export default mongoose.model('Routine', routineSchema);
