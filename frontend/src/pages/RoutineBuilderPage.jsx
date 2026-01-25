import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { ArrowLeft, Save, Plus, Check, Dumbbell, Flame, Trophy, Target, Zap, Heart, Star, Mountain, Timer, Smile } from 'lucide-react';
import { theme } from '../styles/theme';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import MenuButton from '../components/common/MenuButton';
import Modal from '../components/common/Modal';
import DraggableDay from '../components/routine/DraggableDay';
import DraggableExercise from '../components/routine/DraggableExercise';
import ExercisePicker from '../components/routine/ExercisePicker';
import ExerciseConfig from '../components/routine/ExerciseConfig';
import useRoutineStore from '../store/routineStore';
import toast from 'react-hot-toast';
import './RoutineBuilderPage.css';

const DAY_NAMES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

// Iconos disponibles para rutinas
const ROUTINE_ICONS = [
  { id: 'dumbbell', icon: Dumbbell, label: 'Mancuerna' },
  { id: 'flame', icon: Flame, label: 'Fuego' },
  { id: 'trophy', icon: Trophy, label: 'Trofeo' },
  { id: 'target', icon: Target, label: 'Objetivo' },
  { id: 'zap', icon: Zap, label: 'Rayo' },
  { id: 'heart', icon: Heart, label: 'Corazón' },
  { id: 'star', icon: Star, label: 'Estrella' },
  { id: 'mountain', icon: Mountain, label: 'Montaña' },
  { id: 'timer', icon: Timer, label: 'Cronómetro' },
  { id: 'bicep', icon: Smile, label: 'Fuerza' }
];

const RoutineBuilderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [expandedDays, setExpandedDays] = useState({});

  // Modal states
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [showExerciseConfig, setShowExerciseConfig] = useState(false);
  const [showAddDayModal, setShowAddDayModal] = useState(false);
  const [showDeleteDayConfirm, setShowDeleteDayConfirm] = useState(null);

  // Selected items for modals
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [pendingExercise, setPendingExercise] = useState(null);
  const [newDayName, setNewDayName] = useState('');
  const [newDayOfWeek, setNewDayOfWeek] = useState(0);

  const { fetchRoutines, updateRoutine, reorderDays, reorderExercises } = useRoutineStore();

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  // Fetch routine
  useEffect(() => {
    const loadRoutine = async () => {
      if (isNew) {
        setRoutine({
          name: '',
          icon: 'dumbbell',
          description: '',
          isPrivate: false,
          workoutDays: []
        });
        setLoading(false);
        return;
      }

      try {
        const result = await fetchRoutines();
        if (result.success) {
          const found = result.routines.find(r => r._id === id);
          if (found) {
            setRoutine(found);
            // Expand first day by default
            if (found.workoutDays?.length > 0) {
              setExpandedDays({ [found.workoutDays[0]._id]: true });
            }
          } else {
            toast.error('Rutina no encontrada');
            navigate('/routines');
          }
        }
      } catch (error) {
        toast.error('Error al cargar rutina');
        navigate('/routines');
      } finally {
        setLoading(false);
      }
    };

    loadRoutine();
  }, [id, isNew]);

  // Auto-save disabled - user prefers manual save only
  // Keeping the callback in case we want to re-enable it later
  // const saveRoutine = useCallback(async () => {
  //   if (!routine || !routine._id || !hasChanges) return;

  //   setSaving(true);
  //   try {
  //     const result = await updateRoutine(routine._id, routine);
  //     if (result.success) {
  //       setHasChanges(false);
  //       toast.success('Cambios guardados', { duration: 1500 });
  //     }
  //   } catch (error) {
  //     toast.error('Error al guardar');
  //   } finally {
  //     setSaving(false);
  //   }
  // }, [routine, hasChanges, updateRoutine]);

  // Debounced auto-save - DISABLED
  // useEffect(() => {
  //   if (!hasChanges || !routine?._id) return;

  //   const timer = setTimeout(() => {
  //     saveRoutine();
  //   }, 3000);

  //   return () => clearTimeout(timer);
  // }, [routine, hasChanges, saveRoutine]);

  // Update routine and mark as changed
  const updateRoutineLocal = (updates) => {
    setRoutine(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  // Handle day drag end
  const handleDayDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = routine.workoutDays.findIndex(d => d._id === active.id);
    const newIndex = routine.workoutDays.findIndex(d => d._id === over.id);

    const newDays = arrayMove(routine.workoutDays, oldIndex, newIndex);

    // Update dayOfWeek based on new positions
    const updatedDays = newDays.map((day, index) => ({
      ...day,
      dayOfWeek: index
    }));

    setRoutine(prev => ({ ...prev, workoutDays: updatedDays }));
    setHasChanges(true);

    // Save to backend
    if (routine._id) {
      const dayUpdates = updatedDays.map(d => ({
        _id: d._id,
        dayOfWeek: d.dayOfWeek
      }));
      await reorderDays(routine._id, dayUpdates);
    }
  };

  // Handle exercise drag end
  const handleExerciseDragEnd = async (event, dayId) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const dayIndex = routine.workoutDays.findIndex(d => d._id === dayId);
    const day = routine.workoutDays[dayIndex];

    const oldIndex = day.exercises.findIndex(e => e._id === active.id);
    const newIndex = day.exercises.findIndex(e => e._id === over.id);

    const newExercises = arrayMove(day.exercises, oldIndex, newIndex);

    // Update order
    const updatedExercises = newExercises.map((ex, index) => ({
      ...ex,
      order: index + 1
    }));

    const updatedDays = [...routine.workoutDays];
    updatedDays[dayIndex] = { ...day, exercises: updatedExercises };

    setRoutine(prev => ({ ...prev, workoutDays: updatedDays }));
    setHasChanges(true);

    // Save to backend
    if (routine._id) {
      const exerciseIds = updatedExercises.map(e => e._id);
      await reorderExercises(routine._id, dayId, exerciseIds);
    }
  };

  // Toggle day expanded
  const toggleDayExpanded = (dayId) => {
    setExpandedDays(prev => ({
      ...prev,
      [dayId]: !prev[dayId]
    }));
  };

  // Add new day
  const handleAddDay = () => {
    const usedDays = routine.workoutDays.map(d => d.dayOfWeek);
    const nextDay = [0, 1, 2, 3, 4, 5, 6].find(d => !usedDays.includes(d)) ?? 0;
    setNewDayOfWeek(nextDay);
    setNewDayName(`${DAY_NAMES[nextDay]} - Entrenamiento`);
    setShowAddDayModal(true);
  };

  const confirmAddDay = () => {
    const newDay = {
      _id: `temp_${Date.now()}`,
      name: newDayName || `Día ${routine.workoutDays.length + 1}`,
      dayOfWeek: newDayOfWeek,
      isRestDay: false,
      exercises: []
    };

    const updatedDays = [...routine.workoutDays, newDay].sort(
      (a, b) => a.dayOfWeek - b.dayOfWeek
    );

    updateRoutineLocal({ workoutDays: updatedDays });
    setExpandedDays(prev => ({ ...prev, [newDay._id]: true }));
    setShowAddDayModal(false);
    setNewDayName('');
  };

  // Delete day
  const handleDeleteDay = (day) => {
    setShowDeleteDayConfirm(day);
  };

  const confirmDeleteDay = () => {
    const updatedDays = routine.workoutDays.filter(
      d => d._id !== showDeleteDayConfirm._id
    );
    updateRoutineLocal({ workoutDays: updatedDays });
    setShowDeleteDayConfirm(null);
  };

  // Add exercise to day
  const handleAddExercise = (day) => {
    setSelectedDay(day);
    setShowExercisePicker(true);
  };

  const handleExerciseSelected = (exercise) => {
    setPendingExercise(exercise);
    setShowExercisePicker(false);
    setShowExerciseConfig(true);
  };

  const handleExerciseConfigSave = (config) => {
    const newExercise = {
      _id: `temp_${Date.now()}`,
      exerciseId: pendingExercise?._id || selectedExercise?.exerciseId,
      exerciseName: pendingExercise?.name || selectedExercise?.exerciseName,
      category: pendingExercise?.category || selectedExercise?.category || 'other',
      equipment: pendingExercise?.equipment || selectedExercise?.equipment || 'other',
      sets: config.sets,
      repsRange: config.repsRange,
      restTime: config.restTime,
      notes: config.notes,
      order: selectedDay?.exercises?.length + 1 || 1
    };

    if (selectedExercise) {
      // Editing existing exercise
      const dayIndex = routine.workoutDays.findIndex(d => d._id === selectedDay._id);
      const exerciseIndex = routine.workoutDays[dayIndex].exercises.findIndex(
        e => e._id === selectedExercise._id
      );

      const updatedDays = [...routine.workoutDays];
      updatedDays[dayIndex].exercises[exerciseIndex] = {
        ...selectedExercise,
        ...config,
        repsRange: config.repsRange
      };

      updateRoutineLocal({ workoutDays: updatedDays });
    } else {
      // Adding new exercise
      const dayIndex = routine.workoutDays.findIndex(d => d._id === selectedDay._id);
      const updatedDays = [...routine.workoutDays];
      updatedDays[dayIndex].exercises = [
        ...updatedDays[dayIndex].exercises,
        newExercise
      ];

      updateRoutineLocal({ workoutDays: updatedDays });
    }

    setShowExerciseConfig(false);
    setPendingExercise(null);
    setSelectedExercise(null);
  };

  // Edit exercise
  const handleEditExercise = (day, exercise) => {
    setSelectedDay(day);
    setSelectedExercise(exercise);
    setShowExerciseConfig(true);
  };

  // Delete exercise
  const handleDeleteExercise = (day, exercise) => {
    const dayIndex = routine.workoutDays.findIndex(d => d._id === day._id);
    const updatedDays = [...routine.workoutDays];
    updatedDays[dayIndex].exercises = updatedDays[dayIndex].exercises.filter(
      e => e._id !== exercise._id
    );
    updateRoutineLocal({ workoutDays: updatedDays });
    toast.success('Ejercicio eliminado');
  };

  // Manual save
  const handleSave = async () => {
    if (!routine?._id) {
      toast.error('La rutina no tiene ID');
      return;
    }

    setSaving(true);
    try {
      const result = await updateRoutine(routine._id, routine);
      if (result.success) {
        setHasChanges(false);
        toast.success('Rutina guardada');
      } else {
        toast.error(result.error || 'Error al guardar');
      }
    } catch (error) {
      toast.error('Error al guardar rutina');
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="routinebuilder-loading-container">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!routine) {
    return null;
  }

  return (
    <div className="routinebuilder-container">
      {/* Header */}
      <div className="routinebuilder-header">
        <button className="routinebuilder-back-button" onClick={() => navigate('/routines')}>
          <ArrowLeft size={24} />
        </button>
        <div className="routinebuilder-header-title">
          <input
            type="text"
            value={routine.name || ''}
            onChange={(e) => {
              updateRoutineLocal({ name: e.target.value });
            }}
            placeholder="Nombre de la rutina"
            className="routinebuilder-title-input"
            maxLength={50}
          />
          <div className="routinebuilder-save-status">
            {saving ? (
              <span className="routinebuilder-saving-text">Guardando...</span>
            ) : hasChanges ? (
              <span className="routinebuilder-unsaved-text">Cambios sin guardar</span>
            ) : routine?._id ? (
              <span className="routinebuilder-saved-text">
                <Check size={14} /> Guardado
              </span>
            ) : null}
          </div>
        </div>
        {routine?._id && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving || !hasChanges}
            style={{ padding: '0.5rem', minWidth: 'auto' }}
          >
            <Save size={20} />
          </Button>
        )}
        <MenuButton />
      </div>

      {/* Routine Info */}
      <div className="routinebuilder-info-section">
        {/* Icon Selector */}
        <div className="routinebuilder-field">
          <label className="routinebuilder-label">Icono</label>
          <div className="routinebuilder-icon-grid">
            {ROUTINE_ICONS.map(({ id: iconId, icon: IconComponent, label }) => (
              <button
                key={iconId}
                type="button"
                className={`routinebuilder-icon-option ${routine.icon === iconId ? 'selected' : ''}`}
                onClick={() => updateRoutineLocal({ icon: iconId })}
                title={label}
              >
                <IconComponent size={24} />
              </button>
            ))}
          </div>
        </div>

        <div className="routinebuilder-field">
          <label className="routinebuilder-label">Descripción</label>
          <textarea
            value={routine.description || ''}
            onChange={(e) => updateRoutineLocal({ description: e.target.value })}
            placeholder="Descripción de la rutina..."
            rows={2}
            className="routinebuilder-textarea"
          />
        </div>

        {/* Privacy Toggle */}
        <div className="routinebuilder-privacy-toggle">
          <span className="routinebuilder-privacy-label">Rutina privada</span>
          <button
            type="button"
            className={`routinebuilder-toggle ${routine.isPrivate ? 'active' : ''}`}
            onClick={() => updateRoutineLocal({ isPrivate: !routine.isPrivate })}
            role="switch"
            aria-checked={routine.isPrivate}
          >
            <span className="routinebuilder-toggle-thumb" />
          </button>
        </div>
      </div>

      {/* Workout Days */}
      <div className="routinebuilder-days-section">
        <div className="routinebuilder-days-section-header">
          <h2 className="routinebuilder-section-title">Días de entrenamiento</h2>
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus size={16} />}
            onClick={handleAddDay}
          >
            Agregar día
          </Button>
        </div>

        {routine.workoutDays.length === 0 ? (
          <div className="routinebuilder-empty-days">
            <p className="routinebuilder-empty-text">No hay días de entrenamiento</p>
            <Button
              variant="primary"
              onClick={handleAddDay}
              leftIcon={<Plus size={18} />}
            >
              Agregar primer día
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDayDragEnd}
          >
            <SortableContext
              items={routine.workoutDays.map(d => d._id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="routinebuilder-days-list">
                {routine.workoutDays.map(day => (
                  <DraggableDay
                    key={day._id}
                    day={day}
                    isExpanded={expandedDays[day._id]}
                    onToggleExpand={() => toggleDayExpanded(day._id)}
                    onDelete={handleDeleteDay}
                    onAddExercise={handleAddExercise}
                  >
                    {/* Exercises within the day */}
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(e) => handleExerciseDragEnd(e, day._id)}
                    >
                      <SortableContext
                        items={day.exercises?.map(e => e._id) || []}
                        strategy={verticalListSortingStrategy}
                      >
                        {day.exercises?.map(exercise => (
                          <DraggableExercise
                            key={exercise._id}
                            exercise={exercise}
                            onEdit={() => handleEditExercise(day, exercise)}
                            onDelete={() => handleDeleteExercise(day, exercise)}
                          />
                        ))}
                      </SortableContext>
                    </DndContext>
                  </DraggableDay>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add Day Modal */}
      <Modal
        isOpen={showAddDayModal}
        onClose={() => setShowAddDayModal(false)}
        title="Agregar día"
        size="sm"
      >
        <div className="routinebuilder-add-day-form">
          <div className="routinebuilder-field">
            <label className="routinebuilder-label">Nombre del día</label>
            <input
              type="text"
              value={newDayName}
              onChange={(e) => setNewDayName(e.target.value)}
              placeholder="Ej: Lunes - Push"
              className="routinebuilder-input"
              maxLength={30}
            />
          </div>
          <div className="routinebuilder-field">
            <label className="routinebuilder-label">Día de la semana</label>
            <select
              value={newDayOfWeek}
              onChange={(e) => setNewDayOfWeek(parseInt(e.target.value))}
              className="routinebuilder-select"
            >
              {DAY_NAMES.map((name, index) => (
                <option key={index} value={index}>{name}</option>
              ))}
            </select>
          </div>
          <div className="routinebuilder-modal-actions">
            <Button variant="ghost" onClick={() => setShowAddDayModal(false)}>
              Cancelar
            </Button>
            <Button variant="primary" onClick={confirmAddDay}>
              Agregar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Day Confirmation */}
      <Modal
        isOpen={!!showDeleteDayConfirm}
        onClose={() => setShowDeleteDayConfirm(null)}
        title="Eliminar día"
        size="sm"
      >
        <div className="routinebuilder-delete-confirm">
          <p>¿Eliminar "{showDeleteDayConfirm?.name}"?</p>
          <p className="routinebuilder-delete-warning">
            Se eliminarán todos los ejercicios de este día.
          </p>
          <div className="routinebuilder-modal-actions">
            <Button variant="ghost" onClick={() => setShowDeleteDayConfirm(null)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={confirmDeleteDay}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Exercise Picker */}
      <ExercisePicker
        isOpen={showExercisePicker}
        onClose={() => {
          setShowExercisePicker(false);
          setSelectedDay(null);
        }}
        onSelect={handleExerciseSelected}
      />

      {/* Exercise Config */}
      <ExerciseConfig
        isOpen={showExerciseConfig}
        onClose={() => {
          setShowExerciseConfig(false);
          setPendingExercise(null);
          setSelectedExercise(null);
        }}
        onSave={handleExerciseConfigSave}
        exercise={selectedExercise}
        exerciseName={pendingExercise?.name}
      />
    </div>
  );
};

export default RoutineBuilderPage;
