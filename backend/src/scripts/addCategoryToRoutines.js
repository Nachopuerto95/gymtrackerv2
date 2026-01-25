import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Routine from '../models/Routine.js';
import Exercise from '../models/Exercise.js';

// Load environment variables
dotenv.config();

/**
 * Script to add category field to all exercises in existing routines
 * This is a one-time migration script
 */
const addCategoryToRoutines = async () => {
  try {
    console.log('🔄 Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to database');

    // Get all routines
    const routines = await Routine.find({});
    console.log(`\n📋 Found ${routines.length} routines to update`);

    let updatedCount = 0;
    let exerciseNotFoundCount = 0;

    for (const routine of routines) {
      let routineUpdated = false;

      for (const workoutDay of routine.workoutDays) {
        if (workoutDay.isRestDay) continue;

        for (const exercise of workoutDay.exercises) {
          // Find the exercise in the Exercise collection to get its category
          const exerciseDoc = await Exercise.findById(exercise.exerciseId);

          if (exerciseDoc) {
            const newCategory = exerciseDoc.category || 'other';

            // Update if category is missing or is 'other' but DB has a better value
            if (!exercise.category || (exercise.category === 'other' && newCategory !== 'other')) {
              exercise.category = newCategory;
              routineUpdated = true;
              console.log(`  ✅ Updated category to "${exercise.category}" for exercise "${exercise.exerciseName}"`);
            } else if (exercise.category !== newCategory) {
              // Update if different
              exercise.category = newCategory;
              routineUpdated = true;
              console.log(`  ✅ Updated category from "${exercise.category}" to "${newCategory}" for exercise "${exercise.exerciseName}"`);
            } else {
              console.log(`  ⏭️  Exercise "${exercise.exerciseName}" already has correct category: ${exercise.category}`);
            }
          } else {
            if (!exercise.category) {
              exercise.category = 'other';
              routineUpdated = true;
              exerciseNotFoundCount++;
              console.log(`  ⚠️  Exercise "${exercise.exerciseName}" not found in DB, set category to "other"`);
            } else {
              exerciseNotFoundCount++;
              console.log(`  ⚠️  Exercise "${exercise.exerciseName}" not found in DB, keeping current category: ${exercise.category}`);
            }
          }
        }
      }

      // Save the routine if it was updated
      if (routineUpdated) {
        await routine.save();
        updatedCount++;
        console.log(`✅ Updated routine: "${routine.name}"\n`);
      } else {
        console.log(`⏭️  Routine "${routine.name}" already up to date\n`);
      }
    }

    console.log('\n📊 Summary:');
    console.log(`  - Total routines processed: ${routines.length}`);
    console.log(`  - Routines updated: ${updatedCount}`);
    console.log(`  - Exercises with missing category set to "other": ${exerciseNotFoundCount}`);
    console.log('\n✅ Migration completed successfully!');

    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error during migration:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

// Run the migration
addCategoryToRoutines();
