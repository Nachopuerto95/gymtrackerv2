import mongoose from 'mongoose';
import dotenv from 'dotenv';
import WorkoutSession from '../models/WorkoutSession.js';

dotenv.config();

const checkWorkout = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected...\n');

    const workout = await WorkoutSession.findOne({}).limit(1);

    if (workout) {
      console.log('Sample Workout:');
      console.log('Workout ID:', workout._id);
      console.log('Workout Day:', workout.workoutDayName);
      console.log('\nExercises:');

      workout.exercises.forEach((ex, idx) => {
        const num = idx + 1;
        console.log(`  ${num}. ${ex.exerciseName}`);
        console.log(`     Category: ${ex.category || 'NOT SET'}`);
      });
    } else {
      console.log('No workouts found');
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

checkWorkout();
