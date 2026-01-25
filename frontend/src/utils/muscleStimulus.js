/**
 * Muscle Stimulus Calculator
 * Calculates muscle activation from workout exercises
 */

// All available muscles in the system (display groups)
export const MUSCLES = [
  'chest',
  'back',
  'lats',
  'delts',  // Combined deltoids
  'biceps',
  'triceps',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'core'
];

// Muscles that should be combined into 'delts'
const DELT_MUSCLES = ['front_delts', 'rear_delts', 'side_delts'];

// Human-readable labels for muscles
export const MUSCLE_LABELS = {
  chest: 'Pecho',
  back: 'Espalda',
  lats: 'Dorsales',
  delts: 'Deltoides',
  biceps: 'Bíceps',
  triceps: 'Tríceps',
  quads: 'Cuádriceps',
  hamstrings: 'Femorales',
  glutes: 'Glúteos',
  calves: 'Gemelos',
  core: 'Core'
};

// Colors for each muscle group
export const MUSCLE_COLORS = {
  chest: '#FF6B9D',
  back: '#4ADE80',
  lats: '#34D399',
  delts: '#FBBF24',
  biceps: '#A78BFA',
  triceps: '#8B5CF6',
  quads: '#F97316',
  hamstrings: '#EA580C',
  glutes: '#FB923C',
  calves: '#FDBA74',
  core: '#06B6D4'
};

/**
 * Calculate stimulus for a single exercise
 * @param {Object} exercise - Exercise with sets data
 * @param {boolean} hasWeight - Whether exercise has actual weight data (completed workout)
 * @returns {number} - Raw stimulus value
 */
const calculateExerciseStimulus = (exercise, hasWeight = true) => {
  const sets = exercise.sets?.length || exercise.sets || 0;

  if (hasWeight && exercise.sets && Array.isArray(exercise.sets)) {
    // For completed workouts: stimulus = sum of (weight × reps) for each set
    return exercise.sets.reduce((total, set) => {
      const weight = set.weight || 0;
      const reps = set.reps || 0;
      return total + (weight * reps);
    }, 0);
  } else {
    // For planned routines: stimulus = sets × avgReps (baseStimulus always 1.0)
    const numSets = typeof sets === 'number' ? sets : (exercise.sets?.length || 0);
    const avgReps = exercise.repsRange
      ? (exercise.repsRange.min + exercise.repsRange.max) / 2
      : 10;

    return numSets * avgReps;
  }
};

/**
 * Calculate muscle stimulus distribution from a list of exercises
 * @param {Array} exercises - List of exercises with their data
 * @param {Object} exerciseDataMap - Map of exerciseId to exercise data (baseStimulus, muscleContribution)
 * @param {boolean} hasWeight - Whether exercises have actual weight data
 * @returns {Object} - { muscleStimulus: {muscle: value}, maxStimulus: number }
 */
export const calculateMuscleStimulus = (exercises, exerciseDataMap = {}, hasWeight = true) => {
  const muscleStimulus = {};

  // Debug
  console.log('calculateMuscleStimulus called');
  console.log('exercises count:', exercises?.length);
  console.log('exerciseDataMap keys:', Object.keys(exerciseDataMap).slice(0, 3));

  // Track individual delt portions for averaging
  const deltPortions = {
    front_delts: 0,
    side_delts: 0,
    rear_delts: 0
  };

  // Initialize all muscles to 0
  MUSCLES.forEach(muscle => {
    muscleStimulus[muscle] = 0;
  });

  exercises.forEach(exercise => {
    // Get exercise ID - could be exerciseId (from workouts) or _id (from routines)
    const exId = exercise.exerciseId || exercise._id;

    // Get exercise metadata (baseStimulus, muscleContribution)
    const exerciseData = exerciseDataMap[exId] ||
                         exerciseDataMap[exId?.toString()] ||
                         exerciseDataMap[exercise.exerciseId] ||
                         exerciseDataMap[exercise.exerciseId?.toString()] ||
                         exercise;

    const muscleContribution = exerciseData.muscleContribution || exercise.muscleContribution || {};

    // Calculate raw stimulus for this exercise
    const rawStimulus = calculateExerciseStimulus(exercise, hasWeight);

    // Debug first exercise
    if (exercises.indexOf(exercise) === 0) {
      console.log('First exercise:', exercise.exerciseName || exercise.name);
      console.log('exId:', exId);
      console.log('Found in map:', !!exerciseDataMap[exId]);
      console.log('muscleContribution:', muscleContribution);
      console.log('rawStimulus:', rawStimulus);
      console.log('exercise.sets:', exercise.sets);
      console.log('hasWeight:', hasWeight);
    }

    // Distribute stimulus to muscles based on contribution
    Object.entries(muscleContribution).forEach(([muscle, contribution]) => {
      // Track deltoid portions separately
      if (DELT_MUSCLES.includes(muscle)) {
        deltPortions[muscle] += rawStimulus * contribution;
      } else if (MUSCLES.includes(muscle)) {
        muscleStimulus[muscle] += rawStimulus * contribution;
      }
    });
  });

  // Calculate delts as the MAX of the three portions (most trained portion)
  // This better represents how balanced the shoulder training is
  const activeDeltPortions = Object.values(deltPortions).filter(v => v > 0);
  if (activeDeltPortions.length > 0) {
    muscleStimulus['delts'] = Math.max(...activeDeltPortions);
  }

  // Find max stimulus for normalization
  const values = Object.values(muscleStimulus);
  const maxStimulus = Math.max(...values, 1); // Avoid division by 0

  // Debug final result
  console.log('Final muscleStimulus:', muscleStimulus);
  console.log('maxStimulus:', maxStimulus);
  console.log('deltPortions:', deltPortions);

  return {
    muscleStimulus,
    maxStimulus
  };
};

/**
 * Normalize muscle stimulus values for radar chart (0-100 scale)
 * @param {Object} muscleStimulus - Raw muscle stimulus values
 * @param {number} maxStimulus - Maximum stimulus value for normalization
 * @returns {Array} - Array of {muscle, label, value, rawValue} for radar chart
 */
export const normalizeForRadar = (muscleStimulus, maxStimulus) => {
  return MUSCLES
    .filter(muscle => muscleStimulus[muscle] > 0) // Only include activated muscles
    .map(muscle => ({
      muscle,
      label: MUSCLE_LABELS[muscle],
      value: Math.round((muscleStimulus[muscle] / maxStimulus) * 100),
      rawValue: Math.round(muscleStimulus[muscle])
    }));
};

/**
 * Format stimulus value for display
 * @param {number} value - Raw stimulus value
 * @param {boolean} hasWeight - Whether the value includes weight
 * @returns {string} - Formatted string
 */
export const formatStimulus = (value, hasWeight = true) => {
  if (hasWeight) {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k kg`;
    }
    return `${Math.round(value)} kg`;
  }
  return Math.round(value).toString();
};

/**
 * Get top N most activated muscles
 * @param {Object} muscleStimulus - Muscle stimulus values
 * @param {number} n - Number of top muscles to return
 * @returns {Array} - Array of {muscle, label, value} sorted by value
 */
export const getTopMuscles = (muscleStimulus, n = 3) => {
  return Object.entries(muscleStimulus)
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, n)
    .map(([muscle, value]) => ({
      muscle,
      label: MUSCLE_LABELS[muscle],
      value: Math.round(value),
      color: MUSCLE_COLORS[muscle]
    }));
};
