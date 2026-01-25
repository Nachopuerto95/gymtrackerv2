import Exercise from '../models/Exercise.js';
import Routine from '../models/Routine.js';
import WorkoutSession from '../models/WorkoutSession.js';

// @desc    Get all exercises
// @route   GET /api/exercises
// @access  Private
export const getExercises = async (req, res) => {
  try {
    const { category, search } = req.query;
    const query = {};

    // Filter by category if provided
    if (category) {
      query.category = category;
    }

    // Search by name if provided
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const exercises = await Exercise.find(query).sort({ createdAt: -1 });

    // Get the latest best set for each exercise from completed workouts
    const exercisesWithBestSet = await Promise.all(
      exercises.map(async (exercise) => {
        const exerciseObj = exercise.toObject();

        // Find the most recent completed workout containing this exercise
        const lastWorkout = await WorkoutSession.findOne({
          userId: req.user.id,
          isCompleted: true,
          'exercises.exerciseId': exercise._id
        })
          .sort({ date: -1 })
          .limit(1);

        if (lastWorkout) {
          const exerciseData = lastWorkout.exercises.find(
            ex => ex.exerciseId.toString() === exercise._id.toString()
          );

          if (exerciseData && exerciseData.sets && exerciseData.sets.length > 0) {
            const isBodyweight = exercise.equipment === 'bodyweight';

            if (isBodyweight) {
              // For bodyweight exercises: find best set (max reps) and calculate total reps
              const validSets = exerciseData.sets.filter(set => set.reps > 0);

              if (validSets.length > 0) {
                // Best set is the one with most reps
                const bestSet = validSets.reduce((max, set) =>
                  set.reps > max.reps ? set : max
                );

                // Calculate total reps (sum of all reps across all sets)
                const totalReps = validSets.reduce((sum, set) => sum + set.reps, 0);
                const totalSets = validSets.length;

                exerciseObj.lastBestSet = {
                  reps: bestSet.reps,
                  date: lastWorkout.date,
                  isBodyweight: true,
                  totalReps: totalReps,
                  totalSets: totalSets
                };
              }
            } else {
              // For weighted exercises: use 1RM calculation
              // Filter sets with reps <= 12 and weight > 0
              const validSets = exerciseData.sets.filter(
                set => set.reps <= 12 && set.weight > 0
              );

              if (validSets.length > 0) {
                // Calculate 1RM for each set using Epley formula
                const setsWithRM = validSets.map(set => ({
                  weight: set.weight,
                  reps: set.reps,
                  oneRM: set.weight * (1 + set.reps / 30)
                }));

                // Get the set with the highest 1RM
                const bestSet = setsWithRM.reduce((max, set) =>
                  set.oneRM > max.oneRM ? set : max
                );

                exerciseObj.lastBestSet = {
                  weight: bestSet.weight,
                  reps: bestSet.reps,
                  date: lastWorkout.date
                };
              }
            }
          }
        }

        return exerciseObj;
      })
    );

    res.status(200).json({
      success: true,
      count: exercisesWithBestSet.length,
      data: exercisesWithBestSet
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single exercise
// @route   GET /api/exercises/:id
// @access  Private
export const getExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new exercise
// @route   POST /api/exercises
// @access  Private
export const createExercise = async (req, res) => {
  try {
    const exerciseData = {
      ...req.body,
      userId: req.user.id,
      isCustom: true
    };

    const exercise = await Exercise.create(exerciseData);

    res.status(201).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update exercise
// @route   PUT /api/exercises/:id
// @access  Private
export const updateExercise = async (req, res) => {
  try {
    let exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    // Any authenticated user can update (global shared library)
    exercise = await Exercise.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: exercise
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete exercise
// @route   DELETE /api/exercises/:id
// @access  Private
export const deleteExercise = async (req, res) => {
  try {
    const exercise = await Exercise.findById(req.params.id);

    if (!exercise) {
      return res.status(404).json({
        success: false,
        message: 'Exercise not found'
      });
    }

    // Check if exercise is used in any routines
    const usageCount = await Routine.countDocuments({
      'workoutDays.exercises.exerciseId': req.params.id
    });

    if (usageCount > 0) {
      return res.status(409).json({
        success: false,
        message: `Este ejercicio está en uso en ${usageCount} ${usageCount === 1 ? 'rutina' : 'rutinas'}. Elimínalo de las rutinas primero.`
      });
    }

    // Any authenticated user can delete (global shared library)
    await exercise.deleteOne();

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

// @desc    Search exercises
// @route   GET /api/exercises/search
// @access  Private
export const searchExercises = async (req, res) => {
  try {
    const { q, category, muscleGroup } = req.query;

    const query = {};

    // Build search query
    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ];
    }

    if (category) {
      query.category = category;
    }

    if (muscleGroup) {
      query.$or = [
        { 'muscleGroup.primary': { $in: [muscleGroup] } },
        { 'muscleGroup.secondaryStrong': { $in: [muscleGroup] } },
        { 'muscleGroup.secondaryMedium': { $in: [muscleGroup] } },
        { 'muscleGroup.secondaryLight': { $in: [muscleGroup] } }
      ];
    }

    const exercises = await Exercise.find(query)
      .sort({ name: 1 })
      .limit(50); // Limit to 50 results for performance

    res.status(200).json({
      success: true,
      count: exercises.length,
      data: exercises
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
