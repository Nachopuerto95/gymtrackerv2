import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WorkoutSession from '../models/WorkoutSession.js';
import Routine from '../models/Routine.js';
import Exercise from '../models/Exercise.js';

dotenv.config();

const updateActiveWorkoutsCategory = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all active (not completed) workouts
    const activeWorkouts = await WorkoutSession.find({ isCompleted: false });
    console.log(`Found ${activeWorkouts.length} active workouts`);

    for (const workout of activeWorkouts) {
      console.log(`\nProcessing workout: ${workout._id}`);
      let updated = false;

      // Try to get the routine for this workout
      const routine = await Routine.findById(workout.routineId);

      for (const exercise of workout.exercises) {
        if (!exercise.category || exercise.category === 'other') {
          let category = 'other';

          // First try to get category from routine
          if (routine) {
            for (const day of routine.workoutDays) {
              const routineExercise = day.exercises.find(
                ex => ex.exerciseId.toString() === exercise.exerciseId.toString()
              );
              if (routineExercise && routineExercise.category) {
                category = routineExercise.category;
                break;
              }
            }
          }

          // If still 'other', try to get from Exercise model
          if (category === 'other') {
            const exerciseDoc = await Exercise.findById(exercise.exerciseId);
            if (exerciseDoc && exerciseDoc.category) {
              category = exerciseDoc.category;
            }
          }

          if (category !== 'other' || !exercise.category) {
            console.log(`  - ${exercise.exerciseName}: ${exercise.category || 'undefined'} -> ${category}`);
            exercise.category = category;
            updated = true;
          }
        }
      }

      if (updated) {
        await workout.save();
        console.log(`  Workout updated!`);
      } else {
        console.log(`  No updates needed`);
      }
    }

    console.log('\nDone!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

updateActiveWorkoutsCategory();
