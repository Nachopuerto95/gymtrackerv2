import mongoose from 'mongoose';

// Schema for a completed set
const completedSetSchema = new mongoose.Schema({
  setNumber: {
    type: Number,
    required: true
  },
  reps: {
    type: Number,
    required: true
  },
  weight: {
    type: Number,
    required: true,
    default: 0
  },
  rpe: { // Rate of Perceived Exertion (1-10)
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  isCompleted: {
    type: Boolean,
    default: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: true }); // _id: true para que cada set tenga un ID único y estable para React keys

// Schema for a completed exercise in a workout session
const completedExerciseSchema = new mongoose.Schema({
  exerciseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exercise',
    required: true
  },
  exerciseName: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'other'],
    default: 'other'
  },
  equipment: {
    type: String,
    enum: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'other'],
    default: 'other'
  },
  sets: [completedSetSchema],
  notes: {
    type: String,
    default: ''
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    required: true
  }
}, { _id: true });

// Main Workout Session Schema
const workoutSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  routineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Routine',
    required: true
  },
  workoutDayId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  workoutDayName: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  startTime: {
    type: Date,
    required: true,
    default: Date.now
  },
  endTime: {
    type: Date,
    default: null
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  exercises: [completedExerciseSchema],
  isCompleted: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  },
  // Calculated fields for analytics
  totalVolume: {
    type: Number,
    default: 0 // sum of (weight * reps) for all sets
  },
  totalSets: {
    type: Number,
    default: 0
  },
  totalReps: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for faster queries
workoutSessionSchema.index({ userId: 1, date: -1 });
workoutSessionSchema.index({ userId: 1, routineId: 1 });
workoutSessionSchema.index({ userId: 1, isCompleted: 1 });

// Method to calculate totals before saving
workoutSessionSchema.pre('save', function(next) {
  if (this.exercises && this.exercises.length > 0) {
    let totalVolume = 0;
    let totalSets = 0;
    let totalReps = 0;

    this.exercises.forEach(exercise => {
      exercise.sets.forEach(set => {
        if (set.isCompleted) {
          totalVolume += (set.weight * set.reps);
          totalSets++;
          totalReps += set.reps;
        }
      });
    });

    this.totalVolume = totalVolume;
    this.totalSets = totalSets;
    this.totalReps = totalReps;
  }

  // Calculate duration if endTime is set
  if (this.endTime && this.startTime) {
    this.duration = Math.floor((this.endTime - this.startTime) / 1000);
  }

  next();
});

export default mongoose.model('WorkoutSession', workoutSessionSchema);
