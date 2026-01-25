import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WorkoutSession from '../models/WorkoutSession.js';
import Routine from '../models/Routine.js';
import Exercise from '../models/Exercise.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Main migration function
const addCategoryToWorkouts = async () => {
  try {
    console.log('Starting migration: Adding category to workout exercises...\n');

    // Get all workout sessions
    const workouts = await WorkoutSession.find({});
    console.log(`Found ${workouts.length} workout sessions to migrate.\n`);

    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const workout of workouts) {
      try {
        let hasChanges = false;

        // Get the routine for this workout (if it exists)
        const routine = await Routine.findById(workout.routineId);
        const workoutDay = routine ? routine.workoutDays.id(workout.workoutDayId) : null;

        // Update each exercise with its category
        for (const exercise of workout.exercises) {
          // Skip if category already exists and is NOT 'other'
          if (exercise.category && exercise.category !== 'other') {
            continue;
          }

          let categoryFound = false;

          // Strategy 1: Try to find category from the routine exercise (if routine exists)
          if (workoutDay) {
            const routineExercise = workoutDay.exercises.find(
              ex => ex.exerciseId.toString() === exercise.exerciseId.toString()
            );

            if (routineExercise && routineExercise.category) {
              exercise.category = routineExercise.category;
              hasChanges = true;
              categoryFound = true;
              console.log(`  ✓ Set category "${routineExercise.category}" for exercise "${exercise.exerciseName}" (from routine)`);
            }
          }

          // Strategy 2: If not found in routine or routine doesn't exist, try Exercise model
          if (!categoryFound) {
            const exerciseDoc = await Exercise.findById(exercise.exerciseId);

            if (exerciseDoc && exerciseDoc.category) {
              exercise.category = exerciseDoc.category;
              hasChanges = true;
              categoryFound = true;
              console.log(`  ✓ Set category "${exerciseDoc.category}" for exercise "${exercise.exerciseName}" (from Exercise model)`);
            }
          }

          // Strategy 3: Default to 'other' if not found anywhere
          if (!categoryFound) {
            exercise.category = 'other';
            hasChanges = true;
            console.log(`  ⚠️  Set default category "other" for exercise "${exercise.exerciseName}"`);
          }
        }

        // Save the workout if there are changes
        if (hasChanges) {
          await workout.save();
          updatedCount++;
          console.log(`✅ Updated workout ${workout._id} (${workout.workoutDayName} - ${new Date(workout.date).toLocaleDateString()})\n`);
        } else {
          skippedCount++;
        }
      } catch (err) {
        errorCount++;
        console.error(`❌ Error updating workout ${workout._id}:`, err.message);
      }
    }

    console.log('\n========================================');
    console.log('Migration completed!');
    console.log(`✅ Updated: ${updatedCount} workouts`);
    console.log(`⚠️  Skipped: ${skippedCount} workouts`);
    console.log(`❌ Errors: ${errorCount} workouts`);
    console.log('========================================\n');

  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

// Run the migration
const runMigration = async () => {
  await connectDB();
  await addCategoryToWorkouts();
  await mongoose.connection.close();
  console.log('Database connection closed.');
  process.exit(0);
};

runMigration();
