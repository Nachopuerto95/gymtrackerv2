import mongoose from 'mongoose';
import User from '../models/User.js';
import Exercise from '../models/Exercise.js';
import Routine from '../models/Routine.js';
import WorkoutSession from '../models/WorkoutSession.js';

import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Error: MONGODB_URI environment variable is not set');
  process.exit(1);
}

async function addTestWorkouts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('📦 Connected to MongoDB\n');

    // 1. Find user "nachopuerto"
    console.log('=== Finding user "nachopuerto" ===');
    const user = await User.findOne({ username: 'nachopuerto' });

    if (!user) {
      console.log('❌ User "nachopuerto" not found');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.username} (ID: ${user._id})\n`);

    // 2. Find or create "Press Banca" exercise
    console.log('=== Finding or creating "Press Banca" exercise ===');
    let pressBancaExercise = await Exercise.findOne({
      name: { $regex: /^press banca$/i },
      userId: null // Default exercise
    });

    if (!pressBancaExercise) {
      pressBancaExercise = await Exercise.create({
        name: 'Press Banca',
        category: 'chest',
        muscleGroup: {
          primary: ['Pectoral'],
          secondary: ['Tríceps', 'Hombros']
        },
        equipment: 'barbell',
        description: 'Ejercicio fundamental para el desarrollo del pecho',
        isCustom: false,
        userId: null
      });
      console.log(`✅ Created exercise: ${pressBancaExercise.name} (ID: ${pressBancaExercise._id})`);
    } else {
      console.log(`✅ Found exercise: ${pressBancaExercise.name} (ID: ${pressBancaExercise._id})`);
    }
    console.log('');

    // 3. Find or create a routine for the user
    console.log('=== Finding or creating routine ===');
    let routine = await Routine.findOne({ userId: user._id });

    if (!routine) {
      // Create a basic routine
      routine = await Routine.create({
        userId: user._id,
        name: 'Rutina de Prueba',
        icon: 'dumbbell',
        description: 'Rutina de prueba para testing',
        isActive: true,
        isTemplate: false,
        isPrivate: false,
        createdBy: user._id,
        workoutDays: [
          {
            name: 'Pecho y Tríceps',
            dayOfWeek: 0, // Lunes
            isRestDay: false,
            exercises: [
              {
                exerciseId: pressBancaExercise._id,
                exerciseName: pressBancaExercise.name,
                category: pressBancaExercise.category,
                sets: 3,
                repsRange: { min: 8, max: 12 },
                restTime: 90,
                order: 0
              }
            ]
          }
        ]
      });
      console.log(`✅ Created routine: ${routine.name} (ID: ${routine._id})`);

      // Set as active routine for user
      user.activeRoutineId = routine._id;
      await user.save();
      console.log(`✅ Set as active routine for user`);
    } else {
      console.log(`✅ Found routine: ${routine.name} (ID: ${routine._id})`);
    }
    console.log('');

    // 4. Create workout sessions for 3 Mondays in the past
    console.log('=== Creating workout sessions ===');

    const workoutDay = routine.workoutDays.find(day => day.dayOfWeek === 0) || routine.workoutDays[0];

    // Calculate dates for the last 3 Mondays
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToLastMonday = dayOfWeek === 0 ? 7 : dayOfWeek;

    const dates = [];
    for (let i = 3; i >= 1; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - daysToLastMonday - (i - 1) * 7);
      date.setHours(10, 0, 0, 0); // Set to 10:00 AM
      dates.push(date);
    }

    // Workout data with progression from 40kg to 60kg
    const workoutData = [
      {
        date: dates[0],
        sets: [
          { setNumber: 1, reps: 10, weight: 40 },
          { setNumber: 2, reps: 8, weight: 40 },
          { setNumber: 3, reps: 8, weight: 40 }
        ]
      },
      {
        date: dates[1],
        sets: [
          { setNumber: 1, reps: 10, weight: 50 },
          { setNumber: 2, reps: 9, weight: 50 },
          { setNumber: 3, reps: 8, weight: 50 }
        ]
      },
      {
        date: dates[2],
        sets: [
          { setNumber: 1, reps: 10, weight: 60 },
          { setNumber: 2, reps: 10, weight: 60 },
          { setNumber: 3, reps: 9, weight: 60 }
        ]
      }
    ];

    // Check if sessions already exist
    const existingSessions = await WorkoutSession.find({
      userId: user._id,
      'exercises.exerciseId': pressBancaExercise._id,
      date: { $in: dates }
    });

    if (existingSessions.length > 0) {
      console.log(`⚠️  Found ${existingSessions.length} existing sessions. Deleting them first...`);
      await WorkoutSession.deleteMany({
        _id: { $in: existingSessions.map(s => s._id) }
      });
    }

    // Create the sessions
    for (let i = 0; i < workoutData.length; i++) {
      const data = workoutData[i];
      const startTime = new Date(data.date);
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 45); // 45 minutes workout

      const session = await WorkoutSession.create({
        userId: user._id,
        routineId: routine._id,
        workoutDayId: workoutDay._id,
        workoutDayName: workoutDay.name,
        date: data.date,
        startTime: startTime,
        endTime: endTime,
        isCompleted: true,
        exercises: [
          {
            exerciseId: pressBancaExercise._id,
            exerciseName: pressBancaExercise.name,
            category: pressBancaExercise.category,
            sets: data.sets.map(set => ({
              ...set,
              rpe: 7 + Math.floor(Math.random() * 2), // Random RPE between 7-8
              isCompleted: true,
              completedAt: new Date(startTime.getTime() + set.setNumber * 5 * 60 * 1000) // 5 minutes between sets
            })),
            notes: '',
            isCompleted: true,
            order: 0
          }
        ]
      });

      console.log(`✅ Created session ${i + 1}: ${data.date.toLocaleDateString()} - ${data.sets[0].weight}kg`);
      console.log(`   Sets: ${data.sets.map(s => `${s.weight}kg x ${s.reps}`).join(', ')}`);
      console.log(`   Session ID: ${session._id}`);
    }

    console.log('\n✅ All test workouts created successfully!');
    console.log('\nSummary:');
    console.log(`- User: ${user.username}`);
    console.log(`- Exercise: ${pressBancaExercise.name}`);
    console.log(`- Sessions created: ${workoutData.length}`);
    console.log(`- Date range: ${dates[0].toLocaleDateString()} to ${dates[dates.length - 1].toLocaleDateString()}`);
    console.log(`- Weight progression: 40kg → 50kg → 60kg`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addTestWorkouts();
