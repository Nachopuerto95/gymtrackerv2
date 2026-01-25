import mongoose from 'mongoose';

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Exercise name is required'],
    trim: true
  },
  category: {
    type: String,
    enum: ['chest', 'back', 'shoulders', 'arms', 'legs', 'core', 'cardio', 'other'],
    default: 'other'
  },
  type: {
    type: String,
    enum: ['compound', 'isolation'],
    default: 'compound'
  },
  muscleContribution: {
    type: Map,
    of: Number,
    default: {}
  },
  muscleGroup: {
    primary: {
      type: [String],
      default: []
    },
    secondaryStrong: {
      type: [String],
      default: []
    },
    secondaryMedium: {
      type: [String],
      default: []
    },
    secondaryLight: {
      type: [String],
      default: []
    }
  },
  equipment: {
    type: String,
    enum: ['barbell', 'dumbbell', 'cable', 'machine', 'bodyweight', 'other'],
    default: 'other'
  },
  description: {
    type: String,
    default: ''
  },
  videoUrl: {
    type: String,
    default: ''
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Null for default exercises, set for custom user exercises
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      // Convert muscleContribution Map to plain object
      if (ret.muscleContribution instanceof Map) {
        ret.muscleContribution = Object.fromEntries(ret.muscleContribution);
      }
      return ret;
    }
  },
  toObject: {
    transform: function(doc, ret) {
      // Convert muscleContribution Map to plain object
      if (ret.muscleContribution instanceof Map) {
        ret.muscleContribution = Object.fromEntries(ret.muscleContribution);
      }
      return ret;
    }
  }
});

// Index for faster queries
exerciseSchema.index({ name: 1, userId: 1 });
exerciseSchema.index({ category: 1 });

export default mongoose.model('Exercise', exerciseSchema);
