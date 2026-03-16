import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Exercise from '../models/Exercise.js';
import Routine from '../models/Routine.js';
import connectDB from '../config/database.js';

dotenv.config();

// ============================================
// COMPLETE EXERCISE LIBRARY WITH PRECISE VALUES
// ============================================

// ============================================
// CHEST EXERCISES (Pecho) - 18 exercises
// ============================================
const chestExercises = [
  // Compound - Barbell
  {
    name: 'Press banca barra',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: ['triceps'],
      secondaryMedium: ['front_delts'],
      secondaryLight: []
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { chest: 1.0, triceps: 0.6, front_delts: 0.4 }
  },
  {
    name: 'Press inclinado barra',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: ['front_delts'],
      secondaryMedium: ['triceps'],
      secondaryLight: []
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { chest: 1.0, front_delts: 0.6, triceps: 0.4 }
  },
  {
    name: 'Press declinado barra',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: ['triceps'],
      secondaryMedium: [],
      secondaryLight: ['front_delts']
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { chest: 1.0, triceps: 0.6, front_delts: 0.2 }
  },
  // Compound - Dumbbell
  {
    name: 'Press banca mancuernas',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: ['triceps'],
      secondaryMedium: ['front_delts'],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'compound',
    muscleContribution: { chest: 1.0, triceps: 0.6, front_delts: 0.4 }
  },
  {
    name: 'Press inclinado mancuernas',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: ['front_delts'],
      secondaryMedium: ['triceps'],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'compound',
    muscleContribution: { chest: 1.0, front_delts: 0.6, triceps: 0.4 }
  },
  {
    name: 'Press declinado mancuernas',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: ['triceps'],
      secondaryMedium: [],
      secondaryLight: ['front_delts']
    },
    equipment: 'dumbbell',
    type: 'compound',
    muscleContribution: { chest: 1.0, triceps: 0.6, front_delts: 0.2 }
  },
  // Compound - Machine
  {
    name: 'Press pecho máquina',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: [],
      secondaryMedium: ['triceps', 'front_delts'],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'compound',
    muscleContribution: { chest: 1.0, triceps: 0.4, front_delts: 0.4 }
  },
  {
    name: 'Press inclinado máquina',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: ['front_delts'],
      secondaryMedium: ['triceps'],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'compound',
    muscleContribution: { chest: 1.0, front_delts: 0.6, triceps: 0.4 }
  },
  // Compound - Bodyweight
  {
    name: 'Fondos',
    category: 'chest',
    muscleGroup: {
      primary: ['chest', 'triceps'],
      secondaryStrong: ['front_delts'],
      secondaryMedium: [],
      secondaryLight: ['core']
    },
    equipment: 'bodyweight',
    type: 'compound',
    muscleContribution: { chest: 1.0, triceps: 1.0, front_delts: 0.6, core: 0.2 }
  },
  {
    name: 'Fondos lastrados',
    category: 'chest',
    muscleGroup: {
      primary: ['chest', 'triceps'],
      secondaryStrong: ['front_delts'],
      secondaryMedium: [],
      secondaryLight: ['core']
    },
    equipment: 'other',
    type: 'compound',
    muscleContribution: { chest: 1.0, triceps: 1.0, front_delts: 0.6, core: 0.2 }
  },
  {
    name: 'Flexiones',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: ['triceps'],
      secondaryMedium: ['front_delts'],
      secondaryLight: ['core']
    },
    equipment: 'bodyweight',
    type: 'compound',
    muscleContribution: { chest: 1.0, triceps: 0.6, front_delts: 0.4, core: 0.2 }
  },
  {
    name: 'Flexiones inclinadas',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: ['front_delts'],
      secondaryMedium: ['triceps'],
      secondaryLight: ['core']
    },
    equipment: 'bodyweight',
    type: 'compound',
    muscleContribution: { chest: 1.0, front_delts: 0.6, triceps: 0.4, core: 0.2 }
  },
  {
    name: 'Flexiones declinadas',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: ['triceps'],
      secondaryMedium: [],
      secondaryLight: ['front_delts', 'core']
    },
    equipment: 'bodyweight',
    type: 'compound',
    muscleContribution: { chest: 1.0, triceps: 0.6, front_delts: 0.2, core: 0.2 }
  },
  // Isolation - Dumbbell
  {
    name: 'Aperturas mancuernas',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: [],
      secondaryMedium: ['front_delts'],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { chest: 1.0, front_delts: 0.4 }
  },
  {
    name: 'Aperturas inclinadas mancuernas',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: [],
      secondaryMedium: ['front_delts'],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { chest: 1.0, front_delts: 0.4 }
  },
  // Isolation - Cable
  {
    name: 'Cruces polea alta',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: [],
      secondaryMedium: ['front_delts'],
      secondaryLight: []
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { chest: 1.0, front_delts: 0.4 }
  },
  {
    name: 'Cruces polea baja',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: [],
      secondaryMedium: ['front_delts'],
      secondaryLight: []
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { chest: 1.0, front_delts: 0.4 }
  },
  {
    name: 'Cruces polea media',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: ['front_delts']
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { chest: 1.0, front_delts: 0.2 }
  },
  // Isolation - Machine
  {
    name: 'Pec deck',
    category: 'chest',
    muscleGroup: {
      primary: ['chest'],
      secondaryStrong: [],
      secondaryMedium: ['front_delts'],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { chest: 1.0, front_delts: 0.4 }
  }
];

// ============================================
// BACK EXERCISES (Espalda) - 22 exercises
// ============================================
const backExercises = [
  // Compound - Barbell
  {
    name: 'Peso muerto convencional',
    category: 'back',
    muscleGroup: {
      primary: ['back', 'hamstrings', 'glutes'],
      secondaryStrong: ['lats'],
      secondaryMedium: ['core'],
      secondaryLight: ['quads']
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { back: 1.0, hamstrings: 1.0, glutes: 1.0, lats: 0.6, core: 0.4, quads: 0.2 }
  },
  {
    name: 'Remo barra',
    category: 'back',
    muscleGroup: {
      primary: ['back', 'lats'],
      secondaryStrong: ['biceps'],
      secondaryMedium: ['rear_delts'],
      secondaryLight: ['core']
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { back: 1.0, lats: 1.0, biceps: 0.6, rear_delts: 0.4, core: 0.2 }
  },
  {
    name: 'Remo Pendlay',
    category: 'back',
    muscleGroup: {
      primary: ['back', 'lats'],
      secondaryStrong: ['biceps'],
      secondaryMedium: ['rear_delts'],
      secondaryLight: ['core']
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { back: 1.0, lats: 1.0, biceps: 0.6, rear_delts: 0.4, core: 0.2 }
  },
  {
    name: 'Remo T-bar',
    category: 'back',
    muscleGroup: {
      primary: ['back', 'lats'],
      secondaryStrong: ['biceps'],
      secondaryMedium: ['rear_delts'],
      secondaryLight: []
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { back: 1.0, lats: 1.0, biceps: 0.6, rear_delts: 0.4 }
  },
  // Compound - Dumbbell
  {
    name: 'Remo mancuerna',
    category: 'back',
    muscleGroup: {
      primary: ['back', 'lats'],
      secondaryStrong: ['biceps'],
      secondaryMedium: ['rear_delts'],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'compound',
    muscleContribution: { back: 1.0, lats: 1.0, biceps: 0.6, rear_delts: 0.4 }
  },
  {
    name: 'Remo mancuerna a dos manos',
    category: 'back',
    muscleGroup: {
      primary: ['back', 'lats'],
      secondaryStrong: ['biceps'],
      secondaryMedium: ['rear_delts'],
      secondaryLight: ['core']
    },
    equipment: 'dumbbell',
    type: 'compound',
    muscleContribution: { back: 1.0, lats: 1.0, biceps: 0.6, rear_delts: 0.4, core: 0.2 }
  },
  // Compound - Cable
  {
    name: 'Jalón',
    category: 'back',
    muscleGroup: {
      primary: ['lats'],
      secondaryStrong: ['back'],
      secondaryMedium: ['biceps'],
      secondaryLight: ['rear_delts']
    },
    equipment: 'cable',
    type: 'compound',
    muscleContribution: { lats: 1.0, back: 0.6, biceps: 0.4, rear_delts: 0.2 }
  },
  {
    name: 'Jalón agarre cerrado',
    category: 'back',
    muscleGroup: {
      primary: ['lats'],
      secondaryStrong: ['back', 'biceps'],
      secondaryMedium: [],
      secondaryLight: ['rear_delts']
    },
    equipment: 'cable',
    type: 'compound',
    muscleContribution: { lats: 1.0, back: 0.6, biceps: 0.6, rear_delts: 0.2 }
  },
  {
    name: 'Jalón agarre neutro',
    category: 'back',
    muscleGroup: {
      primary: ['lats'],
      secondaryStrong: ['back'],
      secondaryMedium: ['biceps'],
      secondaryLight: ['rear_delts']
    },
    equipment: 'cable',
    type: 'compound',
    muscleContribution: { lats: 1.0, back: 0.6, biceps: 0.4, rear_delts: 0.2 }
  },
  {
    name: 'Jalón tras nuca',
    category: 'back',
    muscleGroup: {
      primary: ['lats'],
      secondaryStrong: [],
      secondaryMedium: ['back', 'biceps'],
      secondaryLight: ['rear_delts']
    },
    equipment: 'cable',
    type: 'compound',
    muscleContribution: { lats: 1.0, back: 0.4, biceps: 0.4, rear_delts: 0.2 }
  },
  {
    name: 'Remo polea',
    category: 'back',
    muscleGroup: {
      primary: ['back'],
      secondaryStrong: ['lats'],
      secondaryMedium: ['biceps', 'rear_delts'],
      secondaryLight: []
    },
    equipment: 'cable',
    type: 'compound',
    muscleContribution: { back: 1.0, lats: 0.6, biceps: 0.4, rear_delts: 0.4 }
  },
  {
    name: 'Remo polea agarre ancho',
    category: 'back',
    muscleGroup: {
      primary: ['back'],
      secondaryStrong: ['rear_delts'],
      secondaryMedium: ['lats', 'biceps'],
      secondaryLight: []
    },
    equipment: 'cable',
    type: 'compound',
    muscleContribution: { back: 1.0, rear_delts: 0.6, lats: 0.4, biceps: 0.4 }
  },
  // Compound - Machine
  {
    name: 'Remo máquina',
    category: 'back',
    muscleGroup: {
      primary: ['back'],
      secondaryStrong: ['lats'],
      secondaryMedium: ['biceps'],
      secondaryLight: ['rear_delts']
    },
    equipment: 'machine',
    type: 'compound',
    muscleContribution: { back: 1.0, lats: 0.6, biceps: 0.4, rear_delts: 0.2 }
  },
  {
    name: 'Remo Hammer Strength',
    category: 'back',
    muscleGroup: {
      primary: ['back', 'lats'],
      secondaryStrong: ['biceps'],
      secondaryMedium: ['rear_delts'],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'compound',
    muscleContribution: { back: 1.0, lats: 1.0, biceps: 0.6, rear_delts: 0.4 }
  },
  {
    name: 'Jalón máquina',
    category: 'back',
    muscleGroup: {
      primary: ['lats'],
      secondaryStrong: ['back'],
      secondaryMedium: ['biceps'],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'compound',
    muscleContribution: { lats: 1.0, back: 0.6, biceps: 0.4 }
  },
  // Compound - Bodyweight
  {
    name: 'Dominadas',
    category: 'back',
    muscleGroup: {
      primary: ['lats'],
      secondaryStrong: ['back'],
      secondaryMedium: ['biceps'],
      secondaryLight: ['rear_delts', 'core']
    },
    equipment: 'bodyweight',
    type: 'compound',
    muscleContribution: { lats: 1.0, back: 0.6, biceps: 0.4, rear_delts: 0.2, core: 0.2 }
  },
  {
    name: 'Dominadas lastradas',
    category: 'back',
    muscleGroup: {
      primary: ['lats'],
      secondaryStrong: ['back'],
      secondaryMedium: ['biceps'],
      secondaryLight: ['rear_delts', 'core']
    },
    equipment: 'other',
    type: 'compound',
    muscleContribution: { lats: 1.0, back: 0.6, biceps: 0.4, rear_delts: 0.2, core: 0.2 }
  },
  {
    name: 'Dominadas agarre cerrado',
    category: 'back',
    muscleGroup: {
      primary: ['lats'],
      secondaryStrong: ['biceps'],
      secondaryMedium: ['back'],
      secondaryLight: ['core']
    },
    equipment: 'bodyweight',
    type: 'compound',
    muscleContribution: { lats: 1.0, biceps: 0.6, back: 0.4, core: 0.2 }
  },
  {
    name: 'Dominadas supinas',
    category: 'back',
    muscleGroup: {
      primary: ['lats', 'biceps'],
      secondaryStrong: ['back'],
      secondaryMedium: [],
      secondaryLight: ['core']
    },
    equipment: 'bodyweight',
    type: 'compound',
    muscleContribution: { lats: 1.0, biceps: 1.0, back: 0.6, core: 0.2 }
  },
  {
    name: 'Dominadas neutras',
    category: 'back',
    muscleGroup: {
      primary: ['lats'],
      secondaryStrong: ['back', 'biceps'],
      secondaryMedium: [],
      secondaryLight: ['core']
    },
    equipment: 'bodyweight',
    type: 'compound',
    muscleContribution: { lats: 1.0, back: 0.6, biceps: 0.6, core: 0.2 }
  },
  {
    name: 'Remo invertido',
    category: 'back',
    muscleGroup: {
      primary: ['back'],
      secondaryStrong: ['lats', 'biceps'],
      secondaryMedium: ['rear_delts'],
      secondaryLight: ['core']
    },
    equipment: 'bodyweight',
    type: 'compound',
    muscleContribution: { back: 1.0, lats: 0.6, biceps: 0.6, rear_delts: 0.4, core: 0.2 }
  },
  // Isolation - Cable
  {
    name: 'Pullover polea',
    category: 'back',
    muscleGroup: {
      primary: ['lats'],
      secondaryStrong: [],
      secondaryMedium: ['chest'],
      secondaryLight: ['triceps']
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { lats: 1.0, chest: 0.4, triceps: 0.2 }
  },
  // Isolation - Dumbbell
  {
    name: 'Pullover mancuerna',
    category: 'back',
    muscleGroup: {
      primary: ['lats'],
      secondaryStrong: [],
      secondaryMedium: ['chest'],
      secondaryLight: ['triceps']
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { lats: 1.0, chest: 0.4, triceps: 0.2 }
  }
];

// ============================================
// SHOULDER EXERCISES (Hombros) - 18 exercises
// ============================================
const shoulderExercises = [
  // Compound - Barbell
  {
    name: 'Press militar',
    category: 'shoulders',
    muscleGroup: {
      primary: ['front_delts'],
      secondaryStrong: ['triceps'],
      secondaryMedium: ['side_delts'],
      secondaryLight: ['chest', 'core']
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { front_delts: 1.0, triceps: 0.6, side_delts: 0.4, chest: 0.2, core: 0.2 }
  },
  {
    name: 'Press militar sentado',
    category: 'shoulders',
    muscleGroup: {
      primary: ['front_delts'],
      secondaryStrong: ['triceps'],
      secondaryMedium: ['side_delts'],
      secondaryLight: ['chest']
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { front_delts: 1.0, triceps: 0.6, side_delts: 0.4, chest: 0.2 }
  },
  {
    name: 'Press tras nuca',
    category: 'shoulders',
    muscleGroup: {
      primary: ['front_delts', 'side_delts'],
      secondaryStrong: ['triceps'],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { front_delts: 1.0, side_delts: 1.0, triceps: 0.6 }
  },
  // Compound - Dumbbell
  {
    name: 'Press hombros mancuernas',
    category: 'shoulders',
    muscleGroup: {
      primary: ['front_delts'],
      secondaryStrong: ['side_delts'],
      secondaryMedium: ['triceps'],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'compound',
    muscleContribution: { front_delts: 1.0, side_delts: 0.6, triceps: 0.4 }
  },
  {
    name: 'Press Arnold',
    category: 'shoulders',
    muscleGroup: {
      primary: ['front_delts', 'side_delts'],
      secondaryStrong: ['triceps'],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'compound',
    muscleContribution: { front_delts: 1.0, side_delts: 1.0, triceps: 0.6 }
  },
  // Compound - Machine
  {
    name: 'Press militar máquina',
    category: 'shoulders',
    muscleGroup: {
      primary: ['front_delts'],
      secondaryStrong: [],
      secondaryMedium: ['triceps', 'side_delts'],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'compound',
    muscleContribution: { front_delts: 1.0, triceps: 0.4, side_delts: 0.4 }
  },
  // Isolation - Dumbbell
  {
    name: 'Elevaciones laterales',
    category: 'shoulders',
    muscleGroup: {
      primary: ['side_delts'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: ['front_delts', 'rear_delts']
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { side_delts: 1.0, front_delts: 0.2, rear_delts: 0.2 }
  },
  {
    name: 'Elevaciones frontales',
    category: 'shoulders',
    muscleGroup: {
      primary: ['front_delts'],
      secondaryStrong: [],
      secondaryMedium: ['side_delts'],
      secondaryLight: ['chest']
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { front_delts: 1.0, side_delts: 0.4, chest: 0.2 }
  },
  {
    name: 'Pájaros mancuernas',
    category: 'shoulders',
    muscleGroup: {
      primary: ['rear_delts'],
      secondaryStrong: [],
      secondaryMedium: ['back'],
      secondaryLight: ['side_delts']
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { rear_delts: 1.0, back: 0.4, side_delts: 0.2 }
  },
  {
    name: 'Elevaciones laterales inclinado',
    category: 'shoulders',
    muscleGroup: {
      primary: ['side_delts'],
      secondaryStrong: [],
      secondaryMedium: ['rear_delts'],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { side_delts: 1.0, rear_delts: 0.4 }
  },
  // Isolation - Cable
  {
    name: 'Elevaciones laterales polea',
    category: 'shoulders',
    muscleGroup: {
      primary: ['side_delts'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: ['front_delts']
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { side_delts: 1.0, front_delts: 0.2 }
  },
  {
    name: 'Elevaciones frontales polea',
    category: 'shoulders',
    muscleGroup: {
      primary: ['front_delts'],
      secondaryStrong: [],
      secondaryMedium: ['side_delts'],
      secondaryLight: []
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { front_delts: 1.0, side_delts: 0.4 }
  },
  {
    name: 'Face pull',
    category: 'shoulders',
    muscleGroup: {
      primary: ['rear_delts'],
      secondaryStrong: [],
      secondaryMedium: ['back'],
      secondaryLight: ['side_delts']
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { rear_delts: 1.0, back: 0.4, side_delts: 0.2 }
  },
  {
    name: 'Cruces polea posteriores',
    category: 'shoulders',
    muscleGroup: {
      primary: ['rear_delts'],
      secondaryStrong: [],
      secondaryMedium: ['back'],
      secondaryLight: []
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { rear_delts: 1.0, back: 0.4 }
  },
  // Isolation - Machine
  {
    name: 'Elevaciones laterales máquina',
    category: 'shoulders',
    muscleGroup: {
      primary: ['side_delts'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { side_delts: 1.0 }
  },
  {
    name: 'Pec deck inverso',
    category: 'shoulders',
    muscleGroup: {
      primary: ['rear_delts'],
      secondaryStrong: [],
      secondaryMedium: ['back'],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { rear_delts: 1.0, back: 0.4 }
  },
  // Compound - Barbell (additional)
  {
    name: 'Remo al mentón',
    category: 'shoulders',
    muscleGroup: {
      primary: ['side_delts'],
      secondaryStrong: ['front_delts'],
      secondaryMedium: ['biceps'],
      secondaryLight: ['back']
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { side_delts: 1.0, front_delts: 0.6, biceps: 0.4, back: 0.2 }
  },
  {
    name: 'Remo al mentón mancuernas',
    category: 'shoulders',
    muscleGroup: {
      primary: ['side_delts'],
      secondaryStrong: ['front_delts'],
      secondaryMedium: ['biceps'],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'compound',
    muscleContribution: { side_delts: 1.0, front_delts: 0.6, biceps: 0.4 }
  }
];

// ============================================
// BICEPS EXERCISES - 12 exercises
// ============================================
const bicepsExercises = [
  // Barbell
  {
    name: 'Curl bíceps barra',
    category: 'arms',
    muscleGroup: {
      primary: ['biceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'barbell',
    type: 'isolation',
    muscleContribution: { biceps: 1.0 }
  },
  {
    name: 'Curl bíceps barra Z',
    category: 'arms',
    muscleGroup: {
      primary: ['biceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'barbell',
    type: 'isolation',
    muscleContribution: { biceps: 1.0 }
  },
  {
    name: 'Curl bíceps arrastre',
    category: 'arms',
    muscleGroup: {
      primary: ['biceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: ['front_delts']
    },
    equipment: 'barbell',
    type: 'isolation',
    muscleContribution: { biceps: 1.0, front_delts: 0.2 }
  },
  // Dumbbell
  {
    name: 'Curl bíceps mancuernas',
    category: 'arms',
    muscleGroup: {
      primary: ['biceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { biceps: 1.0 }
  },
  {
    name: 'Curl martillo',
    category: 'arms',
    muscleGroup: {
      primary: ['biceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { biceps: 1.0 }
  },
  {
    name: 'Curl concentrado',
    category: 'arms',
    muscleGroup: {
      primary: ['biceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { biceps: 1.0 }
  },
  {
    name: 'Curl inclinado mancuernas',
    category: 'arms',
    muscleGroup: {
      primary: ['biceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { biceps: 1.0 }
  },
  {
    name: 'Curl araña',
    category: 'arms',
    muscleGroup: {
      primary: ['biceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { biceps: 1.0 }
  },
  // Cable
  {
    name: 'Curl bíceps polea',
    category: 'arms',
    muscleGroup: {
      primary: ['biceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { biceps: 1.0 }
  },
  {
    name: 'Curl bíceps polea alta',
    category: 'arms',
    muscleGroup: {
      primary: ['biceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { biceps: 1.0 }
  },
  // Machine
  {
    name: 'Curl bíceps predicador',
    category: 'arms',
    muscleGroup: {
      primary: ['biceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { biceps: 1.0 }
  },
  {
    name: 'Curl bíceps máquina',
    category: 'arms',
    muscleGroup: {
      primary: ['biceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { biceps: 1.0 }
  }
];

// ============================================
// TRICEPS EXERCISES - 12 exercises
// ============================================
const tricepsExercises = [
  // Barbell
  {
    name: 'Press francés barra',
    category: 'arms',
    muscleGroup: {
      primary: ['triceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'barbell',
    type: 'isolation',
    muscleContribution: { triceps: 1.0 }
  },
  {
    name: 'Press cerrado',
    category: 'arms',
    muscleGroup: {
      primary: ['triceps'],
      secondaryStrong: ['chest'],
      secondaryMedium: ['front_delts'],
      secondaryLight: []
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { triceps: 1.0, chest: 0.6, front_delts: 0.4 }
  },
  // Dumbbell
  {
    name: 'Extensión tríceps mancuerna',
    category: 'arms',
    muscleGroup: {
      primary: ['triceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { triceps: 1.0 }
  },
  {
    name: 'Patada tríceps',
    category: 'arms',
    muscleGroup: {
      primary: ['triceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { triceps: 1.0 }
  },
  {
    name: 'Press francés mancuernas',
    category: 'arms',
    muscleGroup: {
      primary: ['triceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { triceps: 1.0 }
  },
  // Cable
  {
    name: 'Extensión tríceps polea',
    category: 'arms',
    muscleGroup: {
      primary: ['triceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { triceps: 1.0 }
  },
  {
    name: 'Extensión tríceps cuerda',
    category: 'arms',
    muscleGroup: {
      primary: ['triceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { triceps: 1.0 }
  },
  {
    name: 'Extensión tríceps sobre cabeza polea',
    category: 'arms',
    muscleGroup: {
      primary: ['triceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { triceps: 1.0 }
  },
  {
    name: 'Patada tríceps polea',
    category: 'arms',
    muscleGroup: {
      primary: ['triceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { triceps: 1.0 }
  },
  // Machine
  {
    name: 'Extensión tríceps máquina',
    category: 'arms',
    muscleGroup: {
      primary: ['triceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { triceps: 1.0 }
  },
  // Bodyweight
  {
    name: 'Fondos en banco',
    category: 'arms',
    muscleGroup: {
      primary: ['triceps'],
      secondaryStrong: [],
      secondaryMedium: ['chest', 'front_delts'],
      secondaryLight: []
    },
    equipment: 'bodyweight',
    type: 'compound',
    muscleContribution: { triceps: 1.0, chest: 0.4, front_delts: 0.4 }
  },
  {
    name: 'Extensiones tríceps suelo',
    category: 'arms',
    muscleGroup: {
      primary: ['triceps'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: ['core']
    },
    equipment: 'bodyweight',
    type: 'isolation',
    muscleContribution: { triceps: 1.0, core: 0.2 }
  }
];

// ============================================
// QUADRICEPS EXERCISES (Cuádriceps) - 14 exercises
// ============================================
const quadExercises = [
  // Compound - Barbell
  {
    name: 'Sentadilla',
    category: 'legs',
    muscleGroup: {
      primary: ['quads', 'glutes'],
      secondaryStrong: [],
      secondaryMedium: ['hamstrings'],
      secondaryLight: ['core', 'back']
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { quads: 1.0, glutes: 1.0, hamstrings: 0.4, core: 0.2, back: 0.2 }
  },
  {
    name: 'Sentadilla frontal',
    category: 'legs',
    muscleGroup: {
      primary: ['quads'],
      secondaryStrong: ['glutes'],
      secondaryMedium: ['core'],
      secondaryLight: ['hamstrings']
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { quads: 1.0, glutes: 0.6, core: 0.4, hamstrings: 0.2 }
  },
  {
    name: 'Sentadilla hack barra',
    category: 'legs',
    muscleGroup: {
      primary: ['quads'],
      secondaryStrong: ['glutes'],
      secondaryMedium: [],
      secondaryLight: ['hamstrings']
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { quads: 1.0, glutes: 0.6, hamstrings: 0.2 }
  },
  // Compound - Dumbbell
  {
    name: 'Sentadilla goblet',
    category: 'legs',
    muscleGroup: {
      primary: ['quads'],
      secondaryStrong: ['glutes'],
      secondaryMedium: ['core'],
      secondaryLight: ['hamstrings']
    },
    equipment: 'dumbbell',
    type: 'compound',
    muscleContribution: { quads: 1.0, glutes: 0.6, core: 0.4, hamstrings: 0.2 }
  },
  {
    name: 'Zancadas mancuernas',
    category: 'legs',
    muscleGroup: {
      primary: ['quads', 'glutes'],
      secondaryStrong: [],
      secondaryMedium: ['hamstrings'],
      secondaryLight: ['core']
    },
    equipment: 'dumbbell',
    type: 'compound',
    muscleContribution: { quads: 1.0, glutes: 1.0, hamstrings: 0.4, core: 0.2 }
  },
  {
    name: 'Zancadas caminando',
    category: 'legs',
    muscleGroup: {
      primary: ['quads', 'glutes'],
      secondaryStrong: [],
      secondaryMedium: ['hamstrings'],
      secondaryLight: ['core']
    },
    equipment: 'dumbbell',
    type: 'compound',
    muscleContribution: { quads: 1.0, glutes: 1.0, hamstrings: 0.4, core: 0.2 }
  },
  {
    name: 'Sentadilla búlgara',
    category: 'legs',
    muscleGroup: {
      primary: ['quads', 'glutes'],
      secondaryStrong: [],
      secondaryMedium: ['hamstrings'],
      secondaryLight: ['core']
    },
    equipment: 'dumbbell',
    type: 'compound',
    muscleContribution: { quads: 1.0, glutes: 1.0, hamstrings: 0.4, core: 0.2 }
  },
  {
    name: 'Step ups',
    category: 'legs',
    muscleGroup: {
      primary: ['quads', 'glutes'],
      secondaryStrong: [],
      secondaryMedium: ['hamstrings'],
      secondaryLight: ['core']
    },
    equipment: 'dumbbell',
    type: 'compound',
    muscleContribution: { quads: 1.0, glutes: 1.0, hamstrings: 0.4, core: 0.2 }
  },
  // Compound - Machine
  {
    name: 'Prensa',
    category: 'legs',
    muscleGroup: {
      primary: ['quads'],
      secondaryStrong: ['glutes'],
      secondaryMedium: ['hamstrings'],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'compound',
    muscleContribution: { quads: 1.0, glutes: 0.6, hamstrings: 0.4 }
  },
  {
    name: 'Prensa pies juntos',
    category: 'legs',
    muscleGroup: {
      primary: ['quads'],
      secondaryStrong: [],
      secondaryMedium: ['glutes'],
      secondaryLight: ['hamstrings']
    },
    equipment: 'machine',
    type: 'compound',
    muscleContribution: { quads: 1.0, glutes: 0.4, hamstrings: 0.2 }
  },
  {
    name: 'Sentadilla hack máquina',
    category: 'legs',
    muscleGroup: {
      primary: ['quads'],
      secondaryStrong: ['glutes'],
      secondaryMedium: [],
      secondaryLight: ['hamstrings']
    },
    equipment: 'machine',
    type: 'compound',
    muscleContribution: { quads: 1.0, glutes: 0.6, hamstrings: 0.2 }
  },
  {
    name: 'Sentadilla péndulo',
    category: 'legs',
    muscleGroup: {
      primary: ['quads'],
      secondaryStrong: ['glutes'],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'compound',
    muscleContribution: { quads: 1.0, glutes: 0.6 }
  },
  // Isolation - Machine
  {
    name: 'Extensión cuádriceps',
    category: 'legs',
    muscleGroup: {
      primary: ['quads'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { quads: 1.0 }
  },
  // Bodyweight
  {
    name: 'Sentadilla sissy',
    category: 'legs',
    muscleGroup: {
      primary: ['quads'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: ['core']
    },
    equipment: 'bodyweight',
    type: 'isolation',
    muscleContribution: { quads: 1.0, core: 0.2 }
  }
];

// ============================================
// HAMSTRINGS & GLUTES EXERCISES - 14 exercises
// ============================================
const hamstringGluteExercises = [
  // Compound - Barbell
  {
    name: 'Peso muerto rumano',
    category: 'legs',
    muscleGroup: {
      primary: ['hamstrings', 'glutes'],
      secondaryStrong: ['back'],
      secondaryMedium: [],
      secondaryLight: ['core']
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { hamstrings: 1.0, glutes: 1.0, back: 0.6, core: 0.2 }
  },
  {
    name: 'Peso muerto piernas rígidas',
    category: 'legs',
    muscleGroup: {
      primary: ['hamstrings'],
      secondaryStrong: ['glutes', 'back'],
      secondaryMedium: [],
      secondaryLight: ['core']
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { hamstrings: 1.0, glutes: 0.6, back: 0.6, core: 0.2 }
  },
  {
    name: 'Buenos días',
    category: 'legs',
    muscleGroup: {
      primary: ['hamstrings', 'glutes'],
      secondaryStrong: ['back'],
      secondaryMedium: [],
      secondaryLight: ['core']
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { hamstrings: 1.0, glutes: 1.0, back: 0.6, core: 0.2 }
  },
  {
    name: 'Hip thrust',
    category: 'legs',
    muscleGroup: {
      primary: ['glutes'],
      secondaryStrong: [],
      secondaryMedium: ['hamstrings'],
      secondaryLight: ['core']
    },
    equipment: 'barbell',
    type: 'compound',
    muscleContribution: { glutes: 1.0, hamstrings: 0.4, core: 0.2 }
  },
  // Compound - Dumbbell
  {
    name: 'Peso muerto rumano mancuernas',
    category: 'legs',
    muscleGroup: {
      primary: ['hamstrings', 'glutes'],
      secondaryStrong: ['back'],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'compound',
    muscleContribution: { hamstrings: 1.0, glutes: 1.0, back: 0.6 }
  },
  {
    name: 'Peso muerto una pierna',
    category: 'legs',
    muscleGroup: {
      primary: ['hamstrings', 'glutes'],
      secondaryStrong: [],
      secondaryMedium: ['back', 'core'],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'compound',
    muscleContribution: { hamstrings: 1.0, glutes: 1.0, back: 0.4, core: 0.4 }
  },
  // Isolation - Machine
  {
    name: 'Curl femoral',
    category: 'legs',
    muscleGroup: {
      primary: ['hamstrings'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: ['glutes']
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { hamstrings: 1.0, glutes: 0.2 }
  },
  {
    name: 'Curl femoral sentado',
    category: 'legs',
    muscleGroup: {
      primary: ['hamstrings'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { hamstrings: 1.0 }
  },
  {
    name: 'Curl femoral de pie',
    category: 'legs',
    muscleGroup: {
      primary: ['hamstrings'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: ['glutes']
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { hamstrings: 1.0, glutes: 0.2 }
  },
  {
    name: 'Patada glúteo máquina',
    category: 'legs',
    muscleGroup: {
      primary: ['glutes'],
      secondaryStrong: [],
      secondaryMedium: ['hamstrings'],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { glutes: 1.0, hamstrings: 0.4 }
  },
  {
    name: 'Abducción cadera máquina',
    category: 'legs',
    muscleGroup: {
      primary: ['glutes'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { glutes: 1.0 }
  },
  // Cable
  {
    name: 'Patada glúteo polea',
    category: 'legs',
    muscleGroup: {
      primary: ['glutes'],
      secondaryStrong: [],
      secondaryMedium: ['hamstrings'],
      secondaryLight: []
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { glutes: 1.0, hamstrings: 0.4 }
  },
  {
    name: 'Pull through',
    category: 'legs',
    muscleGroup: {
      primary: ['glutes', 'hamstrings'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: ['core']
    },
    equipment: 'cable',
    type: 'compound',
    muscleContribution: { glutes: 1.0, hamstrings: 1.0, core: 0.2 }
  },
  // Bodyweight
  {
    name: 'Curl nórdico',
    category: 'legs',
    muscleGroup: {
      primary: ['hamstrings'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: ['glutes']
    },
    equipment: 'bodyweight',
    type: 'isolation',
    muscleContribution: { hamstrings: 1.0, glutes: 0.2 }
  }
];

// ============================================
// CALVES EXERCISES (Gemelos) - 6 exercises
// ============================================
const calvesExercises = [
  // Machine
  {
    name: 'Gemelos de pie',
    category: 'legs',
    muscleGroup: {
      primary: ['calves'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { calves: 1.0 }
  },
  {
    name: 'Gemelos sentado',
    category: 'legs',
    muscleGroup: {
      primary: ['calves'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { calves: 1.0 }
  },
  {
    name: 'Gemelos prensa',
    category: 'legs',
    muscleGroup: {
      primary: ['calves'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { calves: 1.0 }
  },
  {
    name: 'Gemelos hack',
    category: 'legs',
    muscleGroup: {
      primary: ['calves'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'machine',
    type: 'isolation',
    muscleContribution: { calves: 1.0 }
  },
  // Dumbbell
  {
    name: 'Gemelos mancuerna',
    category: 'legs',
    muscleGroup: {
      primary: ['calves'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'dumbbell',
    type: 'isolation',
    muscleContribution: { calves: 1.0 }
  },
  // Bodyweight
  {
    name: 'Gemelos una pierna',
    category: 'legs',
    muscleGroup: {
      primary: ['calves'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: ['core']
    },
    equipment: 'bodyweight',
    type: 'isolation',
    muscleContribution: { calves: 1.0, core: 0.2 }
  }
];

// ============================================
// CORE EXERCISES - 8 exercises
// ============================================
const coreExercises = [
  {
    name: 'Plancha',
    category: 'core',
    muscleGroup: {
      primary: ['core'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: ['glutes']
    },
    equipment: 'bodyweight',
    type: 'isolation',
    muscleContribution: { core: 1.0, glutes: 0.2 }
  },
  {
    name: 'Plancha lateral',
    category: 'core',
    muscleGroup: {
      primary: ['core'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'bodyweight',
    type: 'isolation',
    muscleContribution: { core: 1.0 }
  },
  {
    name: 'Crunch',
    category: 'core',
    muscleGroup: {
      primary: ['core'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'bodyweight',
    type: 'isolation',
    muscleContribution: { core: 1.0 }
  },
  {
    name: 'Crunch polea',
    category: 'core',
    muscleGroup: {
      primary: ['core'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { core: 1.0 }
  },
  {
    name: 'Elevación piernas',
    category: 'core',
    muscleGroup: {
      primary: ['core'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'bodyweight',
    type: 'isolation',
    muscleContribution: { core: 1.0 }
  },
  {
    name: 'Rueda abdominal',
    category: 'core',
    muscleGroup: {
      primary: ['core'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: ['lats']
    },
    equipment: 'other',
    type: 'isolation',
    muscleContribution: { core: 1.0, lats: 0.2 }
  },
  {
    name: 'Leñador polea',
    category: 'core',
    muscleGroup: {
      primary: ['core'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: ['front_delts']
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { core: 1.0, front_delts: 0.2 }
  },
  {
    name: 'Pallof press',
    category: 'core',
    muscleGroup: {
      primary: ['core'],
      secondaryStrong: [],
      secondaryMedium: [],
      secondaryLight: []
    },
    equipment: 'cable',
    type: 'isolation',
    muscleContribution: { core: 1.0 }
  }
];

// ============================================
// COMBINE ALL EXERCISES
// ============================================
const baseExercises = [
  ...chestExercises,
  ...backExercises,
  ...shoulderExercises,
  ...bicepsExercises,
  ...tricepsExercises,
  ...quadExercises,
  ...hamstringGluteExercises,
  ...calvesExercises,
  ...coreExercises
];

// Create the routine template based on the xlsx file
const createRoutineTemplate = async (exercises) => {
  // Helper to find exercise by name
  const findExercise = (name) => {
    return exercises.find(ex =>
      ex.name.toLowerCase().includes(name.toLowerCase()) ||
      name.toLowerCase().includes(ex.name.toLowerCase())
    );
  };

  const workoutDays = [
    {
      name: 'Lunes - Push',
      dayOfWeek: 0, // Monday
      isRestDay: false,
      exercises: [
        { exerciseName: 'Press militar', sets: 4, repsRange: { min: 6, max: 10 }, order: 1 },
        { exerciseName: 'Press inclinado mancuernas', sets: 4, repsRange: { min: 6, max: 10 }, order: 2 },
        { exerciseName: 'Fondos', sets: 3, repsRange: { min: 8, max: 12 }, order: 3 },
        { exerciseName: 'Pec deck', sets: 3, repsRange: { min: 12, max: 15 }, order: 4 },
        { exerciseName: 'Elevaciones laterales', sets: 3, repsRange: { min: 12, max: 20 }, order: 5 },
        { exerciseName: 'Extensión tríceps polea', sets: 3, repsRange: { min: 12, max: 15 }, order: 6 }
      ]
    },
    {
      name: 'Martes - Pull',
      dayOfWeek: 1, // Tuesday
      isRestDay: false,
      exercises: [
        { exerciseName: 'Dominadas', sets: 4, repsRange: { min: 6, max: 10 }, order: 1 },
        { exerciseName: 'Remo barra', sets: 3, repsRange: { min: 8, max: 12 }, order: 2 },
        { exerciseName: 'Jalón', sets: 3, repsRange: { min: 8, max: 12 }, order: 3 },
        { exerciseName: 'Face pull', sets: 3, repsRange: { min: 12, max: 20 }, order: 4 },
        { exerciseName: 'Curl bíceps barra', sets: 3, repsRange: { min: 10, max: 12 }, order: 5 },
        { exerciseName: 'Curl martillo', sets: 2, repsRange: { min: 12, max: 15 }, order: 6 }
      ]
    },
    {
      name: 'Miércoles - Descanso',
      dayOfWeek: 2, // Wednesday
      isRestDay: true,
      exercises: []
    },
    {
      name: 'Jueves - Legs 1 (Cuádriceps)',
      dayOfWeek: 3, // Thursday
      isRestDay: false,
      exercises: [
        { exerciseName: 'Sentadilla', sets: 4, repsRange: { min: 6, max: 10 }, order: 1 },
        { exerciseName: 'Prensa', sets: 3, repsRange: { min: 8, max: 12 }, order: 2 },
        { exerciseName: 'Extensión cuádriceps', sets: 3, repsRange: { min: 12, max: 15 }, order: 3 },
        { exerciseName: 'Gemelos de pie', sets: 4, repsRange: { min: 12, max: 20 }, order: 4 }
      ]
    },
    {
      name: 'Viernes - Mix Push/Pull',
      dayOfWeek: 4, // Friday
      isRestDay: false,
      exercises: [
        { exerciseName: 'Press banca mancuernas', sets: 3, repsRange: { min: 8, max: 12 }, order: 1 },
        { exerciseName: 'Press militar máquina', sets: 3, repsRange: { min: 8, max: 12 }, order: 2 },
        { exerciseName: 'Dominadas', sets: 3, repsRange: { min: 8, max: 12 }, order: 3 },
        { exerciseName: 'Remo mancuerna', sets: 3, repsRange: { min: 8, max: 12 }, order: 4 },
        { exerciseName: 'Elevaciones laterales', sets: 3, repsRange: { min: 12, max: 20 }, order: 5 },
        { exerciseName: 'Curl bíceps predicador', sets: 3, repsRange: { min: 10, max: 12 }, order: 6 },
        { exerciseName: 'Extensión tríceps polea', sets: 3, repsRange: { min: 12, max: 15 }, order: 7 }
      ]
    },
    {
      name: 'Sábado - Legs 2 (Femoral/Glúteo)',
      dayOfWeek: 5, // Saturday
      isRestDay: false,
      exercises: [
        { exerciseName: 'Peso muerto rumano', sets: 4, repsRange: { min: 6, max: 10 }, order: 1 },
        { exerciseName: 'Curl femoral', sets: 3, repsRange: { min: 10, max: 12 }, order: 2 },
        { exerciseName: 'Hip thrust', sets: 3, repsRange: { min: 10, max: 12 }, order: 3 },
        { exerciseName: 'Gemelos sentado', sets: 3, repsRange: { min: 12, max: 20 }, order: 4 }
      ]
    },
    {
      name: 'Domingo - Descanso',
      dayOfWeek: 6, // Sunday
      isRestDay: true,
      exercises: []
    }
  ];

  // Map exercise names to IDs
  for (const day of workoutDays) {
    for (const exercise of day.exercises) {
      const foundExercise = findExercise(exercise.exerciseName);
      if (foundExercise) {
        exercise.exerciseId = foundExercise._id;
        // Create set templates
        exercise.setTemplates = Array.from({ length: exercise.sets }, (_, i) => ({
          targetReps: exercise.repsRange,
          targetWeight: 0,
          type: 'normal'
        }));
      }
    }
  }

  return {
    name: 'Rutina Hipertrofia Estética',
    description: 'Rutina de 6 días enfocada en hipertrofia y estética muscular con división Push/Pull/Legs',
    workoutDays,
    isTemplate: true,
    isActive: false
  };
};

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing exercises...');
    await Exercise.deleteMany({ isCustom: false });

    // Insert base exercises
    console.log('Inserting base exercises...');
    const exercises = await Exercise.insertMany(baseExercises);
    console.log(`${exercises.length} exercises inserted`);

    // Create routine template
    console.log('Creating routine template...');
    const routineData = await createRoutineTemplate(exercises);

    // This would normally need a userId, but for a template we can leave it null
    // or create a system user. For now, we'll skip creating the routine in seed
    // and let users create it from the template data.

    console.log('Seed data created successfully!');
    console.log('\nRoutine template data:');
    console.log(JSON.stringify(routineData, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run seed if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export { baseExercises, createRoutineTemplate };
