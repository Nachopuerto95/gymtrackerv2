/**
 * Centralized constants for exercise categories and equipment
 * Single source of truth to avoid duplication across components
 */

export const CATEGORY_COLORS = {
  chest: '#FF6B9D',
  back: '#4ADE80',
  shoulders: '#FBBF24',
  arms: '#A78BFA',
  legs: '#F97316',
  core: '#06B6D4',
  cardio: '#EF4444',
  other: '#9CA3AF'
};

export const CATEGORY_LABELS = {
  chest: 'Pecho',
  back: 'Espalda',
  shoulders: 'Hombros',
  arms: 'Brazos',
  legs: 'Piernas',
  core: 'Core',
  cardio: 'Cardio',
  other: 'Otro'
};

export const EQUIPMENT_LABELS = {
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  cable: 'Cable',
  machine: 'Máquina',
  bodyweight: 'Peso corporal',
  other: 'Otro'
};

// Helper to get category color with fallback
export const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
};

// Helper to get category label with fallback
export const getCategoryLabel = (category) => {
  return CATEGORY_LABELS[category] || category || 'Otro';
};

// Helper to get equipment label with fallback
export const getEquipmentLabel = (equipment) => {
  return EQUIPMENT_LABELS[equipment] || equipment || 'Otro';
};
