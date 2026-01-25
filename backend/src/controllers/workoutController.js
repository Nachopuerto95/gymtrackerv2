import WorkoutSession from '../models/WorkoutSession.js';
import Routine from '../models/Routine.js';
import Exercise from '../models/Exercise.js';

// @desc    Get all workout sessions for user
// @route   GET /api/workouts
// @access  Private
export const getWorkouts = async (req, res) => {
  try {
    const { startDate, endDate, routineId, limit = 50 } = req.query;

    const query = { userId: req.user.id };

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Filter by routine
    if (routineId) {
      query.routineId = routineId;
    }

    const workouts = await WorkoutSession.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: workouts.length,
      data: workouts
    });
  } catch (error) {
    console.error('Error getting workouts:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get single workout session
// @route   GET /api/workouts/:id
// @access  Private
export const getWorkout = async (req, res) => {
  try {
    const workout = await WorkoutSession.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Check ownership
    if (workout.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this workout'
      });
    }

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (error) {
    console.error('Error getting workout:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Start new workout session
// @route   POST /api/workouts/start
// @access  Private
export const startWorkout = async (req, res) => {
  try {
    const { routineId, workoutDayId } = req.body;

    // Check if there's already an active (non-completed) session for today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const existingActiveSession = await WorkoutSession.findOne({
      userId: req.user.id,
      date: { $gte: startOfDay, $lte: endOfDay },
      isCompleted: false
    });

    if (existingActiveSession) {
      // Return the existing session instead of creating a new one
      return res.status(200).json({
        success: true,
        data: existingActiveSession,
        message: 'Returning existing active session'
      });
    }

    // Get the routine and workout day
    const routine = await Routine.findById(routineId);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Check ownership
    if (routine.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this routine'
      });
    }

    // Find the workout day
    const workoutDay = routine.workoutDays.id(workoutDayId);

    if (!workoutDay) {
      return res.status(404).json({
        success: false,
        message: 'Workout day not found'
      });
    }

    // Get last workout data for each exercise to provide placeholders
    const lastWorkouts = await WorkoutSession.find({
      userId: req.user.id,
      isCompleted: true
    })
      .sort({ date: -1 })
      .limit(10);

    // Only fetch exercise data from DB if some exercises are missing category or equipment
    const exerciseIdsNeedingData = workoutDay.exercises
      .filter(ex => !ex.category || ex.category === 'other' || !ex.equipment || ex.equipment === 'other')
      .map(ex => ex.exerciseId);

    let exerciseDataMap = {};
    if (exerciseIdsNeedingData.length > 0) {
      const exerciseDataList = await Exercise.find({ _id: { $in: exerciseIdsNeedingData } });
      exerciseDataList.forEach(ex => {
        exerciseDataMap[ex._id.toString()] = {
          category: ex.category,
          equipment: ex.equipment
        };
      });
    }

    // Create workout session with exercises from routine
    const exercises = workoutDay.exercises.map(ex => {
      // Find last time this exercise was done
      let lastWeight = 0;
      let lastReps = 0;

      for (const workout of lastWorkouts) {
        const lastExercise = workout.exercises.find(
          e => e.exerciseId.toString() === ex.exerciseId.toString()
        );
        if (lastExercise && lastExercise.sets.length > 0) {
          // Get average from last completed sets
          const completedSets = lastExercise.sets.filter(s => s.isCompleted);
          if (completedSets.length > 0) {
            lastWeight = Math.round(
              completedSets.reduce((sum, s) => sum + s.weight, 0) / completedSets.length
            );
            lastReps = Math.round(
              completedSets.reduce((sum, s) => sum + s.reps, 0) / completedSets.length
            );
            break;
          }
        }
      }

      // Initialize sets based on the routine's set count
      const sets = Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        reps: 0,
        weight: 0,
        rpe: null,
        isCompleted: false,
        completedAt: null,
        lastWeight,
        lastReps
      }));

      // Use routine data if available, otherwise use enriched data from DB
      const needsEnrichment = !ex.category || ex.category === 'other' || !ex.equipment || ex.equipment === 'other';
      const enrichedData = needsEnrichment ? (exerciseDataMap[ex.exerciseId.toString()] || {}) : {};

      return {
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        category: ex.category && ex.category !== 'other' ? ex.category : (enrichedData.category || 'other'),
        equipment: ex.equipment && ex.equipment !== 'other' ? ex.equipment : (enrichedData.equipment || 'other'),
        sets,
        notes: '',
        isCompleted: false,
        order: ex.order
      };
    });

    const workout = await WorkoutSession.create({
      userId: req.user.id,
      routineId: routine._id,
      workoutDayId: workoutDay._id,
      workoutDayName: workoutDay.name,
      date: new Date(),
      startTime: new Date(),
      exercises,
      isCompleted: false
    });

    res.status(201).json({
      success: true,
      data: workout
    });
  } catch (error) {
    console.error('Error starting workout:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update workout session (add sets, complete exercises, etc.)
// @route   PUT /api/workouts/:id
// @access  Private
export const updateWorkout = async (req, res) => {
  try {
    let workout = await WorkoutSession.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Check ownership
    if (workout.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this workout'
      });
    }

    // Clean up exercises data - remove invalid _id fields that frontend may generate
    if (req.body.exercises) {
      req.body.exercises = req.body.exercises.map(exercise => {
        // Clean sets - remove string _ids that aren't valid ObjectIds
        if (exercise.sets) {
          exercise.sets = exercise.sets.map(set => {
            // If _id is a string that's not a valid ObjectId, remove it
            if (set._id && typeof set._id === 'string' && !set._id.match(/^[0-9a-fA-F]{24}$/)) {
              const { _id, ...setWithoutId } = set;
              return setWithoutId;
            }
            return set;
          });
        }
        // If exercise _id is not a valid ObjectId, remove it
        if (exercise._id && typeof exercise._id === 'string' && !exercise._id.match(/^[0-9a-fA-F]{24}$/)) {
          const { _id, ...exerciseWithoutId } = exercise;
          return exerciseWithoutId;
        }
        return exercise;
      });
    }

    // Update workout
    workout = await WorkoutSession.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (error) {
    console.error('Error updating workout:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Complete workout session
// @route   PUT /api/workouts/:id/complete
// @access  Private
export const completeWorkout = async (req, res) => {
  try {
    const workout = await WorkoutSession.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Check ownership
    if (workout.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this workout'
      });
    }

    // Filter to keep ONLY exercises with at least one completed set
    // An exercise is considered completed if:
    // 1. It's explicitly marked as completed (isCompleted === true), OR
    // 2. It has at least one completed set (user completed it even without marking)
    const completedExercises = workout.exercises
      .filter(ex => {
        const hasCompletedSets = ex.sets.some(set => set.isCompleted);
        return hasCompletedSets; // Only keep exercises with at least one completed set
      })
      .map(ex => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        category: ex.category || 'other', // Preserve category
        sets: ex.sets.filter(set => set.isCompleted), // Only completed sets
        notes: ex.notes,
        isCompleted: true, // Mark as completed in the history
        order: ex.order
      }));

    // Update workout with only completed data
    workout.exercises = completedExercises;
    workout.isCompleted = true;
    workout.endTime = new Date();

    // Normalize date to start of day for easier querying
    const startOfDay = new Date(workout.date);
    startOfDay.setHours(0, 0, 0, 0);
    workout.date = startOfDay;

    await workout.save(); // This will trigger the pre-save hook to calculate totals

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (error) {
    console.error('Error completing workout:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Change workout day (switch to different day's exercises)
// @route   PUT /api/workouts/:id/change-day
// @access  Private
export const changeWorkoutDay = async (req, res) => {
  try {
    const { routineId, workoutDayId } = req.body;

    const workout = await WorkoutSession.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Check ownership
    if (workout.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this workout'
      });
    }

    // Get the routine and new workout day
    const routine = await Routine.findById(routineId);

    if (!routine) {
      return res.status(404).json({
        success: false,
        message: 'Routine not found'
      });
    }

    // Find the new workout day
    const workoutDay = routine.workoutDays.id(workoutDayId);

    if (!workoutDay) {
      return res.status(404).json({
        success: false,
        message: 'Workout day not found'
      });
    }

    // Get last workout data for placeholders
    const lastWorkouts = await WorkoutSession.find({
      userId: req.user.id,
      isCompleted: true
    })
      .sort({ date: -1 })
      .limit(10);

    // Keep completed exercises from current workout
    const completedExercises = workout.exercises.filter(ex => ex.isCompleted);

    // Create new exercises based on the new workout day
    const newExercises = workoutDay.exercises.map(ex => {
      // Check if this exercise already exists and is completed in current workout
      const existingCompleted = completedExercises.find(
        e => e.exerciseId.toString() === ex.exerciseId.toString()
      );

      if (existingCompleted) {
        // Keep the completed exercise as is
        return existingCompleted;
      }

      // Find last time this exercise was done
      let lastWeight = 0;
      let lastReps = 0;

      for (const workout of lastWorkouts) {
        const lastExercise = workout.exercises.find(
          e => e.exerciseId.toString() === ex.exerciseId.toString()
        );
        if (lastExercise && lastExercise.sets.length > 0) {
          const completedSets = lastExercise.sets.filter(s => s.isCompleted);
          if (completedSets.length > 0) {
            lastWeight = Math.round(
              completedSets.reduce((sum, s) => sum + s.weight, 0) / completedSets.length
            );
            lastReps = Math.round(
              completedSets.reduce((sum, s) => sum + s.reps, 0) / completedSets.length
            );
            break;
          }
        }
      }

      // Initialize sets based on the routine's set count
      const sets = Array.from({ length: ex.sets }, (_, i) => ({
        setNumber: i + 1,
        reps: 0,
        weight: 0,
        rpe: null,
        isCompleted: false,
        completedAt: null,
        lastWeight,
        lastReps
      }));

      return {
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        category: ex.category || 'other', // Include category from routine
        sets,
        notes: '',
        isCompleted: false,
        order: ex.order
      };
    });

    // Add any completed exercises that are not in the new day
    const newExerciseIds = new Set(newExercises.map(e => e.exerciseId.toString()));
    const additionalCompleted = completedExercises.filter(
      ex => !newExerciseIds.has(ex.exerciseId.toString())
    );

    // Update workout with new day
    workout.workoutDayId = workoutDay._id;
    workout.workoutDayName = workoutDay.name;
    workout.exercises = [...newExercises, ...additionalCompleted];

    await workout.save();

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (error) {
    console.error('Error changing workout day:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete workout session
// @route   DELETE /api/workouts/:id
// @access  Private
export const deleteWorkout = async (req, res) => {
  try {
    const workout = await WorkoutSession.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Check ownership
    if (workout.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this workout'
      });
    }

    await workout.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting workout:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get workout analytics
// @route   GET /api/workouts/analytics/:exerciseId
// @access  Private
export const getExerciseAnalytics = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { limit = 20 } = req.query;

    // Find all workouts containing this exercise
    const workouts = await WorkoutSession.find({
      userId: req.user.id,
      isCompleted: true,
      'exercises.exerciseId': exerciseId
    })
      .sort({ date: -1 })
      .limit(parseInt(limit));

    // Extract exercise data from each workout
    const progressionData = workouts.map(workout => {
      const exercise = workout.exercises.find(
        ex => ex.exerciseId.toString() === exerciseId
      );

      if (!exercise) return null;

      // Calculate max weight and total volume for this exercise in this workout
      const maxWeight = Math.max(...exercise.sets.map(s => s.weight));
      const totalVolume = exercise.sets.reduce(
        (sum, set) => sum + (set.weight * set.reps),
        0
      );
      const totalReps = exercise.sets.reduce((sum, set) => sum + set.reps, 0);

      return {
        date: workout.date,
        maxWeight,
        totalVolume,
        totalReps,
        sets: exercise.sets.length
      };
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      data: progressionData
    });
  } catch (error) {
    console.error('Error getting exercise analytics:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get exercise progression with 1RM calculation (Epley formula)
// @route   GET /api/workouts/progression/:exerciseId
// @access  Private
export const getExerciseProgression = async (req, res) => {
  try {
    const { exerciseId } = req.params;
    const { limit = 50 } = req.query;

    // Get the exercise to check if it's bodyweight
    const exerciseInfo = await Exercise.findById(exerciseId).select('equipment');
    const isBodyweight = exerciseInfo?.equipment === 'bodyweight';

    // Find all completed workouts containing this exercise
    const workouts = await WorkoutSession.find({
      userId: req.user.id,
      isCompleted: true,
      'exercises.exerciseId': exerciseId
    })
      .sort({ date: 1 }) // Sort ascending by date for chronological order
      .limit(parseInt(limit));

    // Calculate progression data
    const progressionData = workouts.map(workout => {
      const exercise = workout.exercises.find(
        ex => ex.exerciseId.toString() === exerciseId
      );

      if (!exercise || !exercise.sets || exercise.sets.length === 0) return null;

      // Get all valid sets
      const allValidSets = exercise.sets.filter(set => set.reps > 0 && (isBodyweight || set.weight > 0));

      if (allValidSets.length === 0) return null;

      // For bodyweight exercises, track max reps instead of 1RM
      if (isBodyweight) {
        // Find max reps for bodyweight exercises
        const maxRepsSet = allValidSets.reduce((max, set) => {
          const setObj = set.toObject ? set.toObject() : set;
          return setObj.reps > (max?.reps || 0) ? setObj : max;
        }, null);

        // Calculate total reps and average reps
        const totalReps = allValidSets.reduce((sum, set) => {
          const setObj = set.toObject ? set.toObject() : set;
          return sum + setObj.reps;
        }, 0);
        const avgReps = totalReps / allValidSets.length;

        return {
          date: workout.date,
          maxReps: maxRepsSet?.reps || 0,
          avgReps: Math.round(avgReps * 10) / 10,
          totalSets: allValidSets.length,
          totalReps: totalReps,
          bestSet: {
            reps: maxRepsSet?.reps || 0,
            totalReps: totalReps,
            totalSets: allValidSets.length
          }
        };
      }

      // For non-bodyweight exercises, calculate 1RM
      // For 1RM calculation, prefer sets with reps <= 12 (more accurate)
      const setsFor1RM = allValidSets.filter(set => set.reps <= 12);
      const setsToUse = setsFor1RM.length > 0 ? setsFor1RM : allValidSets;

      // Calculate 1RM for each set using Epley formula
      const setsWithRM = setsToUse.map(set => {
        const setObj = set.toObject ? set.toObject() : set;
        return {
          weight: setObj.weight,
          reps: setObj.reps,
          oneRM: setObj.weight * (1 + setObj.reps / 30)
        };
      });

      // Get the set with the highest 1RM (best set of the day)
      const bestSet = setsWithRM.reduce((max, set) =>
        set.oneRM > max.oneRM ? set : max
      );

      // Calculate average weight across all valid sets
      const avgWeight = allValidSets.reduce((sum, set) => {
        const setObj = set.toObject ? set.toObject() : set;
        return sum + setObj.weight;
      }, 0) / allValidSets.length;

      // Calculate average reps across all valid sets
      const avgReps = allValidSets.reduce((sum, set) => {
        const setObj = set.toObject ? set.toObject() : set;
        return sum + setObj.reps;
      }, 0) / allValidSets.length;

      return {
        date: workout.date,
        oneRM: Math.round(bestSet.oneRM * 10) / 10, // Round to 1 decimal
        avgWeight: Math.round(avgWeight * 10) / 10,
        avgReps: Math.round(avgReps * 10) / 10,
        totalSets: allValidSets.length,
        bestSet: {
          weight: Number(bestSet.weight) || 0,
          reps: Number(bestSet.reps) || 0
        }
      };
    }).filter(Boolean);

    res.status(200).json({
      success: true,
      count: progressionData.length,
      isBodyweight,
      data: progressionData
    });
  } catch (error) {
    console.error('Error getting exercise progression:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get today's workout sessions (both active and completed)
// @route   GET /api/workouts/today
// @access  Private
export const getTodayWorkout = async (req, res) => {
  try {
    // Get start and end of today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Find today's active (non-completed) session - should only be one
    const activeSession = await WorkoutSession.findOne({
      userId: req.user.id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      isCompleted: false
    });

    // Find today's completed session (most recent one if multiple exist)
    const completedSession = await WorkoutSession.findOne({
      userId: req.user.id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      },
      isCompleted: true
    }).sort({ endTime: -1 });

    // Return both for the frontend to handle appropriately
    // Priority: active session takes precedence over completed
    res.status(200).json({
      success: true,
      data: activeSession || completedSession,
      activeSession,
      completedSession
    });
  } catch (error) {
    console.error('Error getting today workout:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Reopen completed workout to add more exercises/sets
// @route   PUT /api/workouts/:id/reopen
// @access  Private
export const reopenWorkout = async (req, res) => {
  try {
    const workout = await WorkoutSession.findById(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    // Check ownership
    if (workout.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this workout'
      });
    }

    // Get the routine to load pending exercises
    const routine = await Routine.findById(workout.routineId);

    if (routine) {
      // Find the workout day from the routine
      const workoutDay = routine.workoutDays.id(workout.workoutDayId);

      if (workoutDay && !workoutDay.isRestDay) {
        // Get IDs of already completed exercises
        const completedExerciseIds = new Set(
          workout.exercises.map(ex => ex.exerciseId.toString())
        );

        // Get last workout data for placeholders (for pending exercises)
        const lastWorkouts = await WorkoutSession.find({
          userId: req.user.id,
          isCompleted: true
        })
          .sort({ date: -1 })
          .limit(10);

        // Find exercises from routine that are NOT in the completed workout
        const pendingExercises = workoutDay.exercises
          .filter(routineEx => !completedExerciseIds.has(routineEx.exerciseId.toString()))
          .map(routineEx => {
            // Find last time this exercise was done
            let lastWeight = 0;
            let lastReps = 0;

            for (const lastWorkout of lastWorkouts) {
              const lastExercise = lastWorkout.exercises.find(
                e => e.exerciseId.toString() === routineEx.exerciseId.toString()
              );
              if (lastExercise && lastExercise.sets.length > 0) {
                const completedSets = lastExercise.sets.filter(s => s.isCompleted);
                if (completedSets.length > 0) {
                  lastWeight = Math.round(
                    completedSets.reduce((sum, s) => sum + s.weight, 0) / completedSets.length
                  );
                  lastReps = Math.round(
                    completedSets.reduce((sum, s) => sum + s.reps, 0) / completedSets.length
                  );
                  break;
                }
              }
            }

            // Initialize sets based on the routine's set count
            const sets = Array.from({ length: routineEx.sets }, (_, i) => ({
              setNumber: i + 1,
              reps: 0,
              weight: 0,
              rpe: null,
              isCompleted: false,
              completedAt: null,
              lastWeight,
              lastReps
            }));

            return {
              exerciseId: routineEx.exerciseId,
              exerciseName: routineEx.exerciseName,
              category: routineEx.category || 'other', // Include category from routine
              sets,
              notes: '',
              isCompleted: false,
              order: routineEx.order
            };
          });

        // Add pending exercises to the workout
        workout.exercises = [...workout.exercises, ...pendingExercises];
      }
    }

    // Mark workout as not completed to allow editing
    workout.isCompleted = false;
    workout.endTime = null;

    await workout.save();

    res.status(200).json({
      success: true,
      data: workout
    });
  } catch (error) {
    console.error('Error reopening workout:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Clean up duplicate sessions (keep only one per day)
// @route   POST /api/workouts/cleanup-duplicates
// @access  Private
export const cleanupDuplicateSessions = async (req, res) => {
  try {
    const userId = req.user.id;

    // Find all sessions grouped by date
    const sessions = await WorkoutSession.find({ userId }).sort({ date: 1 });

    // Group sessions by date (YYYY-MM-DD)
    const sessionsByDate = {};
    sessions.forEach(session => {
      const dateKey = new Date(session.date).toISOString().split('T')[0];
      if (!sessionsByDate[dateKey]) {
        sessionsByDate[dateKey] = [];
      }
      sessionsByDate[dateKey].push(session);
    });

    // Find dates with multiple sessions
    const duplicateDates = Object.entries(sessionsByDate)
      .filter(([date, sessions]) => sessions.length > 1);

    let deletedCount = 0;
    const keptSessions = [];
    const deletedSessions = [];

    for (const [date, daySessions] of duplicateDates) {
      // Priority: keep completed session with most sets, or the most recent one
      const sortedSessions = daySessions.sort((a, b) => {
        // Prefer completed sessions
        if (a.isCompleted && !b.isCompleted) return -1;
        if (!a.isCompleted && b.isCompleted) return 1;

        // Then by total completed sets
        const aSets = a.exercises.reduce((sum, ex) =>
          sum + ex.sets.filter(s => s.isCompleted).length, 0);
        const bSets = b.exercises.reduce((sum, ex) =>
          sum + ex.sets.filter(s => s.isCompleted).length, 0);
        if (aSets !== bSets) return bSets - aSets;

        // Finally by most recent creation
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      // Keep the first one (best), delete the rest
      const [toKeep, ...toDelete] = sortedSessions;
      keptSessions.push({
        date,
        id: toKeep._id,
        name: toKeep.workoutDayName,
        isCompleted: toKeep.isCompleted,
        totalSets: toKeep.exercises.reduce((sum, ex) =>
          sum + ex.sets.filter(s => s.isCompleted).length, 0)
      });

      for (const session of toDelete) {
        deletedSessions.push({
          date,
          id: session._id,
          name: session.workoutDayName,
          isCompleted: session.isCompleted
        });
        await WorkoutSession.findByIdAndDelete(session._id);
        deletedCount++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Cleaned up ${deletedCount} duplicate sessions`,
      data: {
        duplicateDatesFound: duplicateDates.length,
        sessionsDeleted: deletedCount,
        keptSessions,
        deletedSessions
      }
    });
  } catch (error) {
    console.error('Error cleaning up duplicates:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get exercise history (last weight and reps) for placeholder suggestions
// @route   GET /api/workouts/exercise-history/:exerciseId
// @access  Private
export const getExerciseHistory = async (req, res) => {
  try {
    const { exerciseId } = req.params;

    // Get last 10 completed workouts that contain this exercise
    const lastWorkouts = await WorkoutSession.find({
      userId: req.user.id,
      isCompleted: true,
      'exercises.exerciseId': exerciseId
    })
      .sort({ date: -1 })
      .limit(10);

    let lastWeight = 0;
    let lastReps = 0;

    for (const workout of lastWorkouts) {
      const exercise = workout.exercises.find(
        e => e.exerciseId.toString() === exerciseId
      );
      if (exercise && exercise.sets.length > 0) {
        const completedSets = exercise.sets.filter(s => s.isCompleted);
        if (completedSets.length > 0) {
          lastWeight = Math.round(
            completedSets.reduce((sum, s) => sum + s.weight, 0) / completedSets.length
          );
          lastReps = Math.round(
            completedSets.reduce((sum, s) => sum + s.reps, 0) / completedSets.length
          );
          break;
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        exerciseId,
        lastWeight,
        lastReps
      }
    });
  } catch (error) {
    console.error('Error getting exercise history:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
