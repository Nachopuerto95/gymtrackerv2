import Exercise from '../models/Exercise.js';
import Routine from '../models/Routine.js';

/**
 * Creates the default "Rutina Hipertrofia Estética" for a new user
 * This routine is automatically assigned when a user registers
 */
export const createDefaultRoutine = async (userId) => {
  try {
    // Find all base exercises (not custom)
    const exercises = await Exercise.find({ isCustom: false, userId: null });

    if (exercises.length === 0) {
      console.log('Warning: No base exercises found. Default routine not created.');
      return null;
    }

    // Helper to find exercise by name
    const findExercise = (name) => {
      return exercises.find(ex =>
        ex.name.toLowerCase().includes(name.toLowerCase())
      );
    };

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

    // Build workout days
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
        const exercise = findExercise(ex.name);
        if (!exercise) {
          console.warn(`Warning: Exercise "${ex.name}" not found, skipping...`);
          return null;
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
          category: exercise.category || 'other',
          sets: ex.sets,
          repsRange: ex.reps,
          restTime: ex.rest || 90,
          notes: '',
          order: index + 1,
          setTemplates
        };
      }).filter(ex => ex !== null); // Remove null exercises

      return {
        name: day.name,
        dayOfWeek: day.dayOfWeek,
        isRestDay: false,
        exercises
      };
    });

    // Create the routine
    const routine = await Routine.create({
      userId,
      name: 'Rutina Hipertrofia Estética',
      description: 'Rutina de 6 días enfocada en hipertrofia y estética muscular. División Push/Pull/Legs con énfasis en volumen y frecuencia óptima para máximo crecimiento muscular.',
      workoutDays,
      isActive: true,
      isTemplate: false,
      startDate: new Date()
    });

    console.log(`✓ Default routine created for user ${userId}`);
    return routine;

  } catch (error) {
    console.error('Error creating default routine:', error);
    return null;
  }
};
