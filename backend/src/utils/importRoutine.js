import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exercise from '../models/Exercise.js';
import Routine from '../models/Routine.js';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

/**
 * Script to import the routine from Excel data structure
 * This creates a complete routine from the "Rutina Hipertrofia Estética"
 *
 * Run with: node src/utils/importRoutine.js <username>
 */

// Exercise data from Excel
const exercisesData = [
  // Push exercises
  { name: 'Press militar', category: 'shoulders', muscleGroup: { primary: ['shoulders'], secondary: ['triceps'] }, equipment: 'barbell' },
  { name: 'Press inclinado mancuernas', category: 'chest', muscleGroup: { primary: ['chest'], secondary: ['shoulders', 'triceps'] }, equipment: 'dumbbell' },
  { name: 'Fondos', category: 'chest', muscleGroup: { primary: ['chest', 'triceps'], secondary: ['shoulders'] }, equipment: 'bodyweight' },
  { name: 'Pec deck', category: 'chest', muscleGroup: { primary: ['chest'], secondary: [] }, equipment: 'machine' },
  { name: 'Elevaciones laterales', category: 'shoulders', muscleGroup: { primary: ['shoulders'], secondary: [] }, equipment: 'dumbbell' },
  { name: 'Extensión tríceps polea', category: 'arms', muscleGroup: { primary: ['triceps'], secondary: [] }, equipment: 'cable' },
  { name: 'Press banca mancuernas', category: 'chest', muscleGroup: { primary: ['chest'], secondary: ['shoulders', 'triceps'] }, equipment: 'dumbbell' },
  { name: 'Press militar máquina', category: 'shoulders', muscleGroup: { primary: ['shoulders'], secondary: ['triceps'] }, equipment: 'machine' },

  // Pull exercises
  { name: 'Dominadas', category: 'back', muscleGroup: { primary: ['back'], secondary: ['biceps'] }, equipment: 'bodyweight' },
  { name: 'Remo barra', category: 'back', muscleGroup: { primary: ['back'], secondary: ['biceps'] }, equipment: 'barbell' },
  { name: 'Remo mancuerna', category: 'back', muscleGroup: { primary: ['back'], secondary: ['biceps'] }, equipment: 'dumbbell' },
  { name: 'Jalón', category: 'back', muscleGroup: { primary: ['back'], secondary: ['biceps'] }, equipment: 'cable' },
  { name: 'Remo polea', category: 'back', muscleGroup: { primary: ['back'], secondary: ['biceps'] }, equipment: 'cable' },
  { name: 'Face pull', category: 'shoulders', muscleGroup: { primary: ['shoulders'], secondary: ['back'] }, equipment: 'cable' },
  { name: 'Curl bíceps barra', category: 'arms', muscleGroup: { primary: ['biceps'], secondary: [] }, equipment: 'barbell' },
  { name: 'Curl martillo', category: 'arms', muscleGroup: { primary: ['biceps'], secondary: ['forearms'] }, equipment: 'dumbbell' },
  { name: 'Curl bíceps predicador', category: 'arms', muscleGroup: { primary: ['biceps'], secondary: [] }, equipment: 'machine' },

  // Leg exercises
  { name: 'Sentadilla', category: 'legs', muscleGroup: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings'] }, equipment: 'barbell' },
  { name: 'Prensa', category: 'legs', muscleGroup: { primary: ['quadriceps', 'glutes'], secondary: ['hamstrings'] }, equipment: 'machine' },
  { name: 'Extensión cuádriceps', category: 'legs', muscleGroup: { primary: ['quadriceps'], secondary: [] }, equipment: 'machine' },
  { name: 'Peso muerto rumano', category: 'legs', muscleGroup: { primary: ['hamstrings', 'glutes'], secondary: ['back'] }, equipment: 'barbell' },
  { name: 'Curl femoral', category: 'legs', muscleGroup: { primary: ['hamstrings'], secondary: [] }, equipment: 'machine' },
  { name: 'Hip thrust', category: 'legs', muscleGroup: { primary: ['glutes'], secondary: ['hamstrings'] }, equipment: 'barbell' },
  { name: 'Gemelos de pie', category: 'legs', muscleGroup: { primary: ['calves'], secondary: [] }, equipment: 'machine' },
  { name: 'Gemelos sentado', category: 'legs', muscleGroup: { primary: ['calves'], secondary: [] }, equipment: 'machine' }
];

// Routine structure from Excel
const routineStructure = [
  {
    name: 'Lunes - Push',
    dayOfWeek: 0,
    isRestDay: false,
    exercises: [
      { name: 'Press militar', sets: 4, reps: { min: 6, max: 10 }, rest: 120 },
      { name: 'Press inclinado mancuernas', sets: 4, reps: { min: 6, max: 10 }, rest: 120 },
      { name: 'Fondos', sets: 3, reps: { min: 8, max: 12 }, rest: 90 },
      { name: 'Pec deck', sets: 3, reps: { min: 12, max: 15 }, rest: 60 },
      { name: 'Elevaciones laterales', sets: 3, reps: { min: 12, max: 20 }, rest: 60 },
      { name: 'Extensión tríceps polea', sets: 3, reps: { min: 12, max: 15 }, rest: 60 }
    ]
  },
  {
    name: 'Martes - Pull',
    dayOfWeek: 1,
    isRestDay: false,
    exercises: [
      { name: 'Dominadas', sets: 4, reps: { min: 6, max: 10 }, rest: 120 },
      { name: 'Remo barra', sets: 3, reps: { min: 8, max: 12 }, rest: 90 },
      { name: 'Jalón', sets: 3, reps: { min: 8, max: 12 }, rest: 90 },
      { name: 'Face pull', sets: 3, reps: { min: 12, max: 20 }, rest: 60 },
      { name: 'Curl bíceps barra', sets: 3, reps: { min: 10, max: 12 }, rest: 60 },
      { name: 'Curl martillo', sets: 2, reps: { min: 12, max: 15 }, rest: 60 }
    ]
  },
  {
    name: 'Miércoles - Descanso',
    dayOfWeek: 2,
    isRestDay: true,
    exercises: []
  },
  {
    name: 'Jueves - Legs 1 (Cuádriceps)',
    dayOfWeek: 3,
    isRestDay: false,
    exercises: [
      { name: 'Sentadilla', sets: 4, reps: { min: 6, max: 10 }, rest: 180 },
      { name: 'Prensa', sets: 3, reps: { min: 8, max: 12 }, rest: 120 },
      { name: 'Extensión cuádriceps', sets: 3, reps: { min: 12, max: 15 }, rest: 90 },
      { name: 'Gemelos de pie', sets: 4, reps: { min: 12, max: 20 }, rest: 60 }
    ]
  },
  {
    name: 'Viernes - Mix Push/Pull',
    dayOfWeek: 4,
    isRestDay: false,
    exercises: [
      { name: 'Press banca mancuernas', sets: 3, reps: { min: 8, max: 12 }, rest: 120 },
      { name: 'Press militar máquina', sets: 3, reps: { min: 8, max: 12 }, rest: 90 },
      { name: 'Dominadas', sets: 3, reps: { min: 8, max: 12 }, rest: 120 },
      { name: 'Remo mancuerna', sets: 3, reps: { min: 8, max: 12 }, rest: 90 },
      { name: 'Elevaciones laterales', sets: 3, reps: { min: 12, max: 20 }, rest: 60 },
      { name: 'Curl bíceps predicador', sets: 3, reps: { min: 10, max: 12 }, rest: 60 },
      { name: 'Extensión tríceps polea', sets: 3, reps: { min: 12, max: 15 }, rest: 60 }
    ]
  },
  {
    name: 'Sábado - Legs 2 (Femoral/Glúteo)',
    dayOfWeek: 5,
    isRestDay: false,
    exercises: [
      { name: 'Peso muerto rumano', sets: 4, reps: { min: 6, max: 10 }, rest: 180 },
      { name: 'Curl femoral', sets: 3, reps: { min: 10, max: 12 }, rest: 90 },
      { name: 'Hip thrust', sets: 3, reps: { min: 10, max: 12 }, rest: 90 },
      { name: 'Gemelos sentado', sets: 3, reps: { min: 12, max: 20 }, rest: 60 }
    ]
  },
  {
    name: 'Domingo - Descanso',
    dayOfWeek: 6,
    isRestDay: true,
    exercises: []
  }
];

const importRoutine = async (username) => {
  try {
    await connectDB();

    console.log('\n=== IMPORTANDO RUTINA HIPERTROFIA ESTÉTICA ===\n');

    // 1. Find or create user
    let user = await User.findOne({ username: username.toLowerCase() });
    if (!user) {
      console.error(`Error: Usuario con username ${username} no encontrado`);
      console.log('Por favor crea el usuario primero o proporciona un username válido');
      process.exit(1);
    }

    console.log(`✓ Usuario encontrado: ${user.name} (${user.username})`);

    // 2. Seed exercises (only if they don't exist)
    console.log('\n--- Importando ejercicios ---');
    const exerciseMap = new Map();

    for (const exerciseData of exercisesData) {
      let exercise = await Exercise.findOne({
        name: exerciseData.name,
        isCustom: false,
        userId: null
      });

      if (!exercise) {
        exercise = await Exercise.create({
          ...exerciseData,
          isCustom: false,
          userId: null
        });
        console.log(`  + Creado: ${exercise.name}`);
      } else {
        console.log(`  ✓ Existe: ${exercise.name}`);
      }

      exerciseMap.set(exercise.name, exercise);
    }

    console.log(`\n✓ Total ejercicios: ${exerciseMap.size}`);

    // 3. Create routine with workout days
    console.log('\n--- Creando rutina ---');

    const workoutDays = routineStructure.map(day => {
      if (day.isRestDay) {
        return {
          name: day.name,
          dayOfWeek: day.dayOfWeek,
          isRestDay: true,
          exercises: []
        };
      }

      const exercises = day.exercises.map((ex, index) => {
        const exercise = exerciseMap.get(ex.name);
        if (!exercise) {
          throw new Error(`Ejercicio no encontrado: ${ex.name}`);
        }

        // Create set templates for this exercise
        const setTemplates = Array.from({ length: ex.sets }, () => ({
          targetReps: { min: ex.reps.min, max: ex.reps.max },
          targetWeight: 0,
          type: 'normal'
        }));

        return {
          exerciseId: exercise._id,
          exerciseName: exercise.name,
          sets: ex.sets,
          repsRange: ex.reps,
          restTime: ex.rest || 90,
          notes: '',
          order: index + 1,
          setTemplates
        };
      });

      return {
        name: day.name,
        dayOfWeek: day.dayOfWeek,
        isRestDay: false,
        exercises
      };
    });

    // Check if user already has an active routine
    const existingActive = await Routine.findOne({ userId: user._id, isActive: true });
    if (existingActive) {
      existingActive.isActive = false;
      await existingActive.save();
      console.log(`  Desactivada rutina anterior: ${existingActive.name}`);
    }

    // Create the routine
    const routine = await Routine.create({
      userId: user._id,
      name: 'Rutina Hipertrofia Estética',
      description: 'Rutina de 6 días enfocada en hipertrofia y estética muscular. División Push/Pull/Legs con énfasis en volumen y frecuencia óptima para máximo crecimiento muscular.',
      workoutDays,
      isActive: true,
      isTemplate: false,
      startDate: new Date()
    });

    console.log(`\n✓ Rutina creada: ${routine.name}`);
    console.log(`  - ID: ${routine._id}`);
    console.log(`  - Días de entrenamiento: ${workoutDays.filter(d => !d.isRestDay).length}`);
    console.log(`  - Total ejercicios: ${routine.totalExercises}`);
    console.log(`  - Activa: ${routine.isActive ? 'Sí' : 'No'}`);

    // Update user's active routine
    user.activeRoutineId = routine._id;
    await user.save();

    console.log(`\n✓ Usuario actualizado con rutina activa`);

    console.log('\n=== IMPORTACIÓN COMPLETADA ===\n');

    // Show routine structure
    console.log('ESTRUCTURA DE LA RUTINA:\n');
    routine.workoutDays.forEach(day => {
      console.log(`${day.name}:`);
      if (day.isRestDay) {
        console.log('  - Día de descanso\n');
      } else {
        day.exercises.forEach(ex => {
          console.log(`  - ${ex.exerciseName}: ${ex.sets} series × ${ex.repsRange.min}-${ex.repsRange.max} reps (${ex.restTime}s descanso)`);
        });
        console.log('');
      }
    });

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error en la importación:', error);
    process.exit(1);
  }
};

// Get username from command line args
const username = process.argv[2];

if (!username) {
  console.error('Error: Debes proporcionar un username');
  console.log('\nUso: node src/utils/importRoutine.js <username>');
  console.log('Ejemplo: node src/utils/importRoutine.js nachopuerto');
  process.exit(1);
}

importRoutine(username);
