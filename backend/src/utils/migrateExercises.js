import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exercise from '../models/Exercise.js';
import connectDB from '../config/database.js';
import { baseExercises } from './seedData.js';

dotenv.config();

/**
 * Migration script to:
 * 1. Update existing exercises with new muscleGroup structure (preserves IDs!)
 * 2. Add new exercises that don't exist yet
 * 3. Convert 'accessory' type to 'isolation'
 *
 * This preserves all workout/routine references because exercise IDs don't change.
 */
const migrateExercises = async () => {
  try {
    await connectDB();
    console.log('Starting exercise migration...\n');

    // Create a map of exercise names to their new data (lowercase for matching)
    const exerciseDataMap = new Map();
    baseExercises.forEach(ex => {
      exerciseDataMap.set(ex.name.toLowerCase(), ex);
    });

    // Get all existing exercises
    const existingExercises = await Exercise.find({});
    const existingNames = new Set(existingExercises.map(ex => ex.name.toLowerCase()));

    console.log(`Found ${existingExercises.length} existing exercises in database`);
    console.log(`New library has ${baseExercises.length} exercises\n`);

    let updated = 0;
    let added = 0;
    let skipped = 0;

    // ============================================
    // STEP 1: Update existing exercises
    // ============================================
    console.log('--- UPDATING EXISTING EXERCISES ---\n');

    for (const exercise of existingExercises) {
      const newData = exerciseDataMap.get(exercise.name.toLowerCase());

      if (newData) {
        // Update with new precise values (keeps same _id!)
        exercise.muscleGroup = newData.muscleGroup;
        exercise.muscleContribution = newData.muscleContribution;
        exercise.type = newData.type;
        exercise.category = newData.category;
        exercise.equipment = newData.equipment;

        // Remove deprecated baseStimulus field
        exercise.baseStimulus = undefined;

        await exercise.save();
        console.log(`✓ Updated: ${exercise.name}`);
        updated++;
      } else if (!exercise.isCustom) {
        // Exercise not in new library and not custom - migrate structure anyway
        if (exercise.muscleGroup && !exercise.muscleGroup.secondaryStrong) {
          const oldSecondary = exercise.muscleGroup.secondary || [];
          exercise.muscleGroup = {
            primary: exercise.muscleGroup.primary || [],
            secondaryStrong: [],
            secondaryMedium: oldSecondary,
            secondaryLight: []
          };
        }

        // Convert 'accessory' type to 'isolation'
        if (exercise.type === 'accessory') {
          exercise.type = 'isolation';
        }

        exercise.baseStimulus = undefined;
        await exercise.save();
        console.log(`⚠ Migrated structure (not in new library): ${exercise.name}`);
        updated++;
      } else {
        console.log(`- Skipped (custom exercise): ${exercise.name}`);
        skipped++;
      }
    }

    // ============================================
    // STEP 2: Add new exercises that don't exist
    // ============================================
    console.log('\n--- ADDING NEW EXERCISES ---\n');

    const newExercises = [];
    for (const exercise of baseExercises) {
      if (!existingNames.has(exercise.name.toLowerCase())) {
        newExercises.push(exercise);
      }
    }

    if (newExercises.length > 0) {
      const inserted = await Exercise.insertMany(newExercises);
      added = inserted.length;

      for (const ex of newExercises) {
        console.log(`+ Added: ${ex.name}`);
      }
    } else {
      console.log('No new exercises to add.');
    }

    // ============================================
    // STEP 3: Convert any remaining 'accessory' types
    // ============================================
    const accessoryExercises = await Exercise.find({ type: 'accessory' });
    for (const exercise of accessoryExercises) {
      exercise.type = 'isolation';
      await exercise.save();
      console.log(`✓ Converted type: ${exercise.name}`);
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log('\n========================================');
    console.log('Migration completed!');
    console.log('========================================');
    console.log(`Updated existing: ${updated}`);
    console.log(`Added new:        ${added}`);
    console.log(`Skipped (custom): ${skipped}`);
    console.log(`Total in DB:      ${updated + added + skipped}`);
    console.log('========================================');
    console.log('\n✓ All workout/routine references preserved (IDs unchanged)');

    process.exit(0);
  } catch (error) {
    console.error('Error during migration:', error);
    process.exit(1);
  }
};

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateExercises();
}

export { migrateExercises };
