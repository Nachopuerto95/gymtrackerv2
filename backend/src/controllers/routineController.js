import Routine from '../models/Routine.js';
import User from '../models/User.js';
import Exercise from '../models/Exercise.js';

// Helper function to enrich exercises with actual data from Exercise collection
// Only fetches from DB if exercises are missing category or equipment
const enrichExercisesWithData = async (workoutDays) => {
  if (!workoutDays) return workoutDays;

  // Collect exercise IDs that are missing category or equipment
  const exerciseIdsNeedingData = [];
  workoutDays.forEach(day => {
    if (day.exercises) {
      day.exercises.forEach(ex => {
        if (ex.exerciseId && (!ex.category || ex.category === 'other' || !ex.equipment || ex.equipment === 'other')) {
          exerciseIdsNeedingData.push(ex.exerciseId);
        }
      });
    }
  });

  // If all exercises already have data, return as-is (no DB query)
  if (exerciseIdsNeedingData.length === 0) return workoutDays;

  // Fetch only exercises that need data
  const exerciseDataList = await Exercise.find({ _id: { $in: exerciseIdsNeedingData } });
  const exerciseDataMap = {};
  exerciseDataList.forEach(ex => {
    exerciseDataMap[ex._id.toString()] = {
      category: ex.category,
      equipment: ex.equipment
    };
  });

  // Enrich workout days with exercise data only where needed
  return workoutDays.map(day => {
    const enrichedDay = { ...day };
    if (enrichedDay.exercises) {
      enrichedDay.exercises = enrichedDay.exercises.map(exercise => {
        // Only enrich if data was missing
        if (!exercise.category || exercise.category === 'other' || !exercise.equipment || exercise.equipment === 'other') {
          const exerciseData = exerciseDataMap[exercise.exerciseId?.toString()] || {};
          return {
            ...exercise,
            category: exerciseData.category || exercise.category || 'other',
            equipment: exerciseData.equipment || exercise.equipment || 'other'
          };
        }
        return exercise;
      });
    }
    return enrichedDay;
  });
};

// @desc    Get all routines for user (own + public routines)
// @route   GET /api/routines
// @access  Private
export const getRoutines = async (req, res) => {
  try {
    const { isPublic } = req.query;

    let query;

    if (isPublic === 'true') {
      // Only public routines from other users
      query = {
        isPrivate: false,
        userId: { $ne: req.user.id }
      };
    } else {
      // User's own routines OR public routines from others
      query = {
        $or: [
          { userId: req.user.id },
          { isPrivate: false }
        ]
      };
    }

    const routines = await Routine.find(query)
      .populate('createdBy', 'username name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: routines.length,
      data: routines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single routine
// @route   GET /api/routines/:id
// @access  Private
export const getRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id)
      .populate('createdBy', 'username name');

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Check if user is owner OR routine is public
    if (routine.userId.toString() !== req.user.id && routine.isPrivate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this routine'
      });
    }

    res.status(200).json({
      success: true,
      data: routine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new routine
// @route   POST /api/routines
// @access  Private
export const createRoutine = async (req, res) => {
  try {
    const routineData = {
      ...req.body,
      userId: req.user.id,
      createdBy: req.user.id
    };

    // Clean temporary IDs from workout days and exercises
    if (routineData.workoutDays) {
      routineData.workoutDays = routineData.workoutDays.map(day => {
        const cleanDay = { ...day };

        // Remove temp ID if present
        if (cleanDay._id && cleanDay._id.toString().startsWith('temp_')) {
          delete cleanDay._id;
        }

        // Clean exercises
        if (cleanDay.exercises) {
          cleanDay.exercises = cleanDay.exercises.map(exercise => {
            const cleanExercise = { ...exercise };

            // Remove temp ID if present
            if (cleanExercise._id && cleanExercise._id.toString().startsWith('temp_')) {
              delete cleanExercise._id;
            }

            return cleanExercise;
          });
        }

        return cleanDay;
      });

      // Enrich exercises with actual category and equipment from Exercise collection
      routineData.workoutDays = await enrichExercisesWithData(routineData.workoutDays);
    }

    const routine = await Routine.create(routineData);

    res.status(201).json({
      success: true,
      data: routine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update routine
// @route   PUT /api/routines/:id
// @access  Private
export const updateRoutine = async (req, res) => {
  try {
    let routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Check ownership (allow if user is creator or owner)
    const isOwner = routine.userId.toString() === req.user.id;
    const isCreator = routine.createdBy && routine.createdBy.toString() === req.user.id;

    if (!isOwner && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this routine'
      });
    }

    // Clean temporary IDs from workout days and exercises
    const updateData = { ...req.body };
    if (updateData.workoutDays) {
      updateData.workoutDays = updateData.workoutDays.map(day => {
        const cleanDay = { ...day };

        // Remove temp ID if present
        if (cleanDay._id && cleanDay._id.toString().startsWith('temp_')) {
          delete cleanDay._id;
        }

        // Clean exercises
        if (cleanDay.exercises) {
          cleanDay.exercises = cleanDay.exercises.map(exercise => {
            const cleanExercise = { ...exercise };

            // Remove temp ID if present
            if (cleanExercise._id && cleanExercise._id.toString().startsWith('temp_')) {
              delete cleanExercise._id;
            }

            return cleanExercise;
          });
        }

        return cleanDay;
      });

      // Enrich exercises with actual category and equipment from Exercise collection
      updateData.workoutDays = await enrichExercisesWithData(updateData.workoutDays);
    }

    routine = await Routine.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: routine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete routine
// @route   DELETE /api/routines/:id
// @access  Private
export const deleteRoutine = async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Check ownership (allow if user is creator or owner)
    const isOwner = routine.userId.toString() === req.user.id;
    const isCreator = routine.createdBy && routine.createdBy.toString() === req.user.id;

    if (!isOwner && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this routine'
      });
    }

    await routine.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Set active routine
// @route   PUT /api/routines/:id/activate
// @access  Private
export const activateRoutine = async (req, res) => {
  try {
    let routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Check ownership (allow if user is creator or owner)
    const isOwner = routine.userId.toString() === req.user.id;
    const isCreator = routine.createdBy && routine.createdBy.toString() === req.user.id;

    // If it's a public routine that doesn't belong to the user, copy it first
    if (!isOwner && !isCreator) {
      // Check if it's public
      if (routine.isPrivate) {
        return res.status(403).json({
          success: false,
          message: 'Cannot activate private routine from another user'
        });
      }

      // Create a copy for the user
      const routineData = routine.toObject();
      delete routineData._id;
      delete routineData.createdAt;
      delete routineData.updatedAt;
      routineData.userId = req.user.id;
      routineData.createdBy = req.user.id;
      routineData.name = routine.name; // Keep original name (no "Copia de" prefix)
      routineData.isActive = false;
      routineData.startDate = null;
      routineData.endDate = null;

      // Clean up workout days
      routineData.workoutDays = routineData.workoutDays.map(day => {
        const dayData = { ...day };
        delete dayData._id;

        dayData.exercises = dayData.exercises.map(exercise => {
          const exerciseData = { ...exercise };
          delete exerciseData._id;

          // Ensure category and equipment are preserved
          if (!exerciseData.category) {
            exerciseData.category = 'other';
          }
          if (!exerciseData.equipment) {
            exerciseData.equipment = 'other';
          }

          // Clean up set templates
          if (exerciseData.setTemplates) {
            exerciseData.setTemplates = exerciseData.setTemplates.map(template => {
              const templateData = { ...template };
              delete templateData._id;
              return templateData;
            });
          }

          return exerciseData;
        });

        return dayData;
      });

      // Create the copy
      routine = await Routine.create(routineData);
    }

    // Deactivate all other routines for this user
    await Routine.updateMany(
      { userId: req.user.id },
      { isActive: false }
    );

    // Activate this routine
    routine.isActive = true;
    routine.startDate = new Date();
    await routine.save();

    // Update user's active routine
    await User.findByIdAndUpdate(req.user.id, {
      activeRoutineId: routine._id
    });

    res.status(200).json({
      success: true,
      data: routine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Deactivate current active routine
// @route   PUT /api/routines/deactivate
// @access  Private
export const deactivateRoutine = async (req, res) => {
  try {
    // Deactivate all routines for this user
    await Routine.updateMany(
      { userId: req.user.id },
      { isActive: false }
    );

    // Clear user's active routine
    await User.findByIdAndUpdate(req.user.id, {
      activeRoutineId: null
    });

    res.status(200).json({
      success: true,
      data: null
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get active routine
// @route   GET /api/routines/active
// @access  Private
export const getActiveRoutine = async (req, res) => {
  try {
    const routine = await Routine.findOne({
      userId: req.user.id,
      isActive: true
    });

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'No active routine found'
      });
    }

    res.status(200).json({
      success: true,
      data: routine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Copy routine
// @route   POST /api/routines/:id/copy
// @access  Private
export const copyRoutine = async (req, res) => {
  try {
    const originalRoutine = await Routine.findById(req.params.id);

    if (!originalRoutine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Check if routine is public or user is owner
    if (originalRoutine.isPrivate && originalRoutine.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Cannot copy private routine'
      });
    }

    // Create deep copy
    const routineData = originalRoutine.toObject();

    // Remove _id fields and update ownership
    delete routineData._id;
    delete routineData.createdAt;
    delete routineData.updatedAt;
    routineData.userId = req.user.id;
    routineData.createdBy = req.user.id;
    routineData.name = `Copia de ${originalRoutine.name}`;
    routineData.isActive = false;
    routineData.startDate = null;
    routineData.endDate = null;

    // Clean up workout days
    routineData.workoutDays = routineData.workoutDays.map(day => {
      const dayData = { ...day };
      delete dayData._id;

      dayData.exercises = dayData.exercises.map(exercise => {
        const exerciseData = { ...exercise };
        delete exerciseData._id;

        // Ensure category and equipment are preserved
        if (!exerciseData.category) {
          exerciseData.category = 'other';
        }
        if (!exerciseData.equipment) {
          exerciseData.equipment = 'other';
        }

        // Clean up set templates
        if (exerciseData.setTemplates) {
          exerciseData.setTemplates = exerciseData.setTemplates.map(template => {
            const templateData = { ...template };
            delete templateData._id;
            return templateData;
          });
        }

        return exerciseData;
      });

      return dayData;
    });

    const copiedRoutine = await Routine.create(routineData);

    res.status(201).json({
      success: true,
      data: copiedRoutine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reorder exercises within a workout day
// @route   PUT /api/routines/:id/days/:dayId/reorder
// @access  Private
export const reorderExercises = async (req, res) => {
  try {
    const { exercises } = req.body; // Array of exercise IDs in new order

    if (!exercises || !Array.isArray(exercises)) {
      return res.status(400).json({
        success: false,
        message: 'Exercises array is required'
      });
    }

    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Check ownership (allow if user is creator or owner)
    const isOwner = routine.userId.toString() === req.user.id;
    const isCreator = routine.createdBy && routine.createdBy.toString() === req.user.id;

    if (!isOwner && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this routine'
      });
    }

    // Find the workout day
    const workoutDay = routine.workoutDays.id(req.params.dayId);

    if (!workoutDay) {
      return res.status(404).json({
        success: false,
        message: 'Workout day not found'
      });
    }

    // Update order for each exercise
    exercises.forEach((exerciseId, index) => {
      const exercise = workoutDay.exercises.id(exerciseId);
      if (exercise) {
        exercise.order = index + 1;
      }
    });

    await routine.save();

    res.status(200).json({
      success: true,
      data: routine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reorder workout days in routine
// @route   PUT /api/routines/:id/reorder-days
// @access  Private
export const reorderDays = async (req, res) => {
  try {
    const { days } = req.body; // Array of { _id, dayOfWeek }

    if (!days || !Array.isArray(days)) {
      return res.status(400).json({
        success: false,
        message: 'Days array is required'
      });
    }

    const routine = await Routine.findById(req.params.id);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Check ownership (allow if user is creator or owner)
    const isOwner = routine.userId.toString() === req.user.id;
    const isCreator = routine.createdBy && routine.createdBy.toString() === req.user.id;

    if (!isOwner && !isCreator) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this routine'
      });
    }

    // Update dayOfWeek for each day
    days.forEach(({ _id, dayOfWeek }) => {
      const workoutDay = routine.workoutDays.id(_id);
      if (workoutDay) {
        workoutDay.dayOfWeek = dayOfWeek;
      }
    });

    await routine.save();

    res.status(200).json({
      success: true,
      data: routine
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
